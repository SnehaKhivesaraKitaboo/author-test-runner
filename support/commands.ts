/// <reference types="cypress" />

import type { ModuleCanvasOptions, ModuleDropOptions } from './module-setup';
import {
  getAuthoringModule,
  getModuleProfile,
  isAssessmentWidget,
  logModuleContext,
  moduleUsesGenericStepForAssessment,
  resolveCanvasSetup,
  resolveDropTarget,
} from './module-setup';
import { clearSessionState, markAutoTestStepCreated } from './session-state';
import {
  fillStepTitle,
  openStepChooserFromToc,
  selectStepTypeCard,
  STEP_SELECTORS,
  submitStepWizard,
  waitForStepSaved,
} from './step-creation';
import {
  assertActiveTocMatches,
  assertSessionActive,
  ensureOnAutoTestGenericStep,
  flattenWidgets,
  isSessionExpiredVisible,
  logStage,
  retryDomAction,
  waitForAngularSettled,
  waitForFibWidgetReady,
  waitForGenericStepCanvasReady,
  waitForLoaderGone,
  waitForTocReady,
  waitForWidgetRegistry,
} from './wait-utils';

declare namespace Cypress {
  interface Chainable<Subject = any> {
    openAuthoringTool(url?: string): Chainable<void>;
    createTestStep(stepType?: string): Chainable<void>;
    setupModuleCanvas(options?: ModuleCanvasOptions): Chainable<void>;
    dropComponentForModule(componentName: string, options?: ModuleDropOptions): Chainable<void>;
    ensureFibDeepSetup(options?: { through?: 'canvas' | 'step' | 'dropped' | 'content' | 'settings'; skipStepCreation?: boolean }): Chainable<void>;
    openDroppedComponentSettings(): Chainable<void>;
    deleteLastDroppedComponent(): Chainable<void>;
    navigateToCanvasPage(): Chainable<void>;
    dropWidgetIntoGenericStep(widgetName: string, columnIndex?: number, dataType?: string, skipLiveCapture?: boolean): Chainable<void>;
    openAddPanel(): Chainable<void>;
    expandSection(sectionName: string): Chainable<void>;
    dropComponent(componentName: string): Chainable<void>;
    openComponentSettings(): Chainable<void>;
    openFibSettings(): Chainable<void>;
    insertFibBlank(): Chainable<void>;
    ensureOnFibGenericStep(): Chainable<void>;
    dropFibIntoGenericStepColumn(): Chainable<void>;
    fillFibDummyContent(): Chainable<void>;
    deleteLastComponent(): Chainable<void>;
    waitForEditorReady(): Chainable<void>;
    waitForLoaderGone(timeout?: number): Chainable<void>;
    waitForWidgetRegistry(timeout?: number): Chainable<void>;
    waitForGenericStepCanvasReady(timeout?: number): Chainable<void>;
    waitForFibWidgetReady(timeout?: number): Chainable<void>;
    captureLiveStep(label: string): Chainable<void>;
    captureFailureDebug(label?: string): Chainable<void>;
    setContentEditableText(selector: string, text: string): Chainable<void>;
    setContentEditableOn(text: string): Chainable<JQuery>;
    resetLiveSteps(): Chainable<void>;
  }
}

let liveStepCounter = 0;
const liveMilestonesCaptured = new Set<string>();

function sanitizeStepName(label: string): string {
  return label.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 50) || 'step';
}

function captureLiveMilestone(label: string): void {
  if (liveMilestonesCaptured.has(label)) return;
  liveMilestonesCaptured.add(label);
  cy.captureLiveStep(label);
}

/** FIB DOM — customClass wrapper + inner .fib template (see templates/fib/fib.html). */
export const FIB_SELECTORS = {
  wrapper: '.customClass[data-type="fill-in-the-blank"], [data-type="fill-in-the-blank"]',
  template: '.customClass[data-type="fill-in-the-blank"] .fib, .generic-step-column-content .fib',
  sdItem: '.generic-step-column-content .sd-item:has(.fib), .generic-step-column-content .sd-item:has([data-type="fill-in-the-blank"])',
  header: '.fib .sc-intro.template-header, [data-type="fill-in-the-blank"] .sc-intro.template-header',
  sentence: '.fib .sc-sentence.sentence-text, [data-type="fill-in-the-blank"] .sc-sentence.sentence-text',
  body: '.fib .fib-body, [data-type="fill-in-the-blank"] .fib-body',
} as const;

/** Apply text to a contenteditable element (shared by commands). */
function applyContentEditable($el: JQuery, text: string): void {
  const el = $el[0] as HTMLElement;
  el.focus();
  el.innerText = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ' }));
}

/** Set text on contenteditable fields — cy.type() does not sync Angular ng-model reliably. */
function setContentEditableText(selector: string, text: string): void {
  cy.get(selector, { timeout: 10000 }).first().scrollIntoView().click({ force: true }).then($el => {
    applyContentEditable($el, text);
  });
  cy.window().then(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => { $apply?: () => void } } } }).angular;
    const ctrl = win.document.getElementById('myController');
    if (ang && ctrl) ang.element(ctrl).scope()?.$apply?.();
  });
}

/** Open FIB settings via Angular (setSettingsValues) + jQuery sd-item click fallback. */
function openFibSettingsPanel(): void {
  cy.window().then(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => Record<string, unknown> } } }).angular;
    const $ = (win as { $?: (sel: string | Element) => JQuery }).$;
    const ctrlEl = win.document.getElementById('myController');
    if (!ang || !ctrlEl || !$) throw new Error('Angular/jQuery/controller missing on page');

    const con = ang.element(ctrlEl).scope() as Record<string, any>;

    const $target = $(
      '.generic-step-column-content [data-type="fill-in-the-blank"], #desktop_view [data-type="fill-in-the-blank"]',
    ).first();
    if (!$target.length) throw new Error('FIB widget not found on canvas');

    const $fibItem = $target.closest('.sd-item');
    const pageNo = $target.attr('page-no') || $fibItem.find('[page-no]').first().attr('page-no');
    const uniqueId = $target.attr('saved-index') || $fibItem.find('[saved-index]').first().attr('saved-index');
    const settingsPath = $target.attr('settings-path') || $fibItem.find('[settings-path]').first().attr('settings-path');

    if (!pageNo || !uniqueId) {
      throw new Error(`FIB missing page-no/saved-index (pageNo=${pageNo}, uniqueId=${uniqueId})`);
    }

    if ($fibItem.length) {
      $fibItem.trigger('click');
    }

    if (typeof con.setSettingsValues === 'function' && settingsPath) {
      con.setSettingsValues($target, 'settings', settingsPath);
    } else {
      if (typeof con.changeStyleSetting === 'function') {
        con.changeStyleSetting('switchSettings');
      }
      con.commonrightpanel = 'switchSettings';
      if (settingsPath) con.settingsUrl = settingsPath;
      if (con.savedJson?.[pageNo]?.[uniqueId]) {
        con.currSettings = con.savedJson[pageNo][uniqueId].settings;
      }
      con.displaySettingPanel?.();
      con.$apply?.();
    }
  });
}

/** Click FIB sd-item so fib-template-directive opens #fib-settings-panel (switchSettings). */
function selectFibSdItem(): void {
  openFibSettingsPanel();
}

// ---------------------------------------------------------------------------
// Retrieve the launch URL from env or fixture
// ---------------------------------------------------------------------------
function getLaunchUrl(): string {
  return Cypress.env('AUTHORING_LAUNCH_URL') || '';
}

// ---------------------------------------------------------------------------
// Visit the authoring URL and wait until the editor shell is ready.
// ---------------------------------------------------------------------------
Cypress.Commands.add('resetLiveSteps', () => {
  liveStepCounter = 0;
  liveMilestonesCaptured.clear();
});

Cypress.Commands.add('captureLiveStep', (label: string) => {
  liveStepCounter += 1;
  const name = `${String(liveStepCounter).padStart(2, '0')}-${sanitizeStepName(label)}`;
  cy.log(`📸 LIVE STEP: ${label}`);
  cy.screenshot(name, { capture: 'viewport' });
});

Cypress.Commands.add('openAuthoringTool', (url?: string) => {
  const target = url || getLaunchUrl();
  if (!target) throw new Error('AUTHORING_LAUNCH_URL is not configured.');
  cy.resetLiveSteps();
  cy.visit(target, { timeout: 90000 });
  cy.get('body', { timeout: 20000 }).should('be.visible');
  assertSessionActive();
  cy.waitForEditorReady();
  waitForLoaderGone();
  waitForWidgetRegistry();
  cy.window().then(win => clearSessionState(win));
  cy.captureLiveStep('authoring-tool-loaded');
  logModuleContext('Module');
});

Cypress.Commands.add('waitForLoaderGone', (timeout?: number) => {
  waitForLoaderGone(timeout);
});

Cypress.Commands.add('waitForWidgetRegistry', (timeout?: number) => {
  waitForWidgetRegistry(timeout);
});

Cypress.Commands.add('waitForGenericStepCanvasReady', (timeout?: number) => {
  waitForGenericStepCanvasReady(timeout);
});

Cypress.Commands.add('waitForFibWidgetReady', (timeout?: number) => {
  waitForFibWidgetReady(timeout);
});

Cypress.Commands.add('captureFailureDebug', (label = 'failure-debug') => {
  logStage('DEBUG', `Capturing failure state: ${label}`);
  cy.window().then(win => {
    const activeToc = win.document.querySelector('.subTocName.activeTocItem, li.activeTocItem');
    const fibCount = win.document.querySelectorAll(
      '#desktop_view .generic-step-column-content [data-type="fill-in-the-blank"]',
    ).length;
    cy.log(`   active TOC: ${(activeToc?.textContent || '').trim() || '(none)'}`);
    cy.log(`   FIB in column: ${fibCount}`);
  });
  cy.captureLiveStep(label);
});

// ---------------------------------------------------------------------------
// setupModuleCanvas — Module-aware canvas preparation (ELA / WL / Math).
//
// WL  → Instructions for Students (single unrestricted page for all components)
// ELA → Instructions page for layouts/elements; Generic Step for assessment widgets
// Math → same split as ELA (Generic Step for assessment, canvas for CLIC/layouts)
// ---------------------------------------------------------------------------
Cypress.Commands.add('setupModuleCanvas', (options: ModuleCanvasOptions = {}) => {
  const mod = getAuthoringModule();
  const profile = getModuleProfile(mod);
  const setup = options.setup ?? resolveCanvasSetup(options.dataType, options.componentName, mod);

  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  cy.log(`📦 MODULE CANVAS SETUP — ${profile.label}`);
  cy.log(`   Strategy: ${setup}${profile.singlePageMode ? ' (WL single-page)' : ''}`);
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (setup === 'generic-step') {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.navigateToCanvasPage();
  }
});

// ---------------------------------------------------------------------------
// dropComponentForModule — Drop onto canvas or Generic Step based on module + widget type
// ---------------------------------------------------------------------------
Cypress.Commands.add('dropComponentForModule', (componentName: string, options: ModuleDropOptions = {}) => {
  const target = resolveDropTarget(options.dataType, componentName);
  cy.log(`🎯 dropComponentForModule("${componentName}") → ${target} [${getAuthoringModule()}]`);

  if (target === 'generic-step-column') {
    cy.ensureOnFibGenericStep();
    cy.dropWidgetIntoGenericStep(
      componentName,
      options.columnIndex ?? 0,
      options.dataType,
      options.skipLiveCapture,
    );
  } else {
    cy.dropComponent(componentName);
  }
});

// ---------------------------------------------------------------------------
// ensureFibDeepSetup — FIB deep-test prerequisite (ELA Generic Step flow).
//
// Order: 1) launch  2) create Generic Step (unless skipStepCreation)  3) drop FIB  4) content
// TC_02a calls createTestStep explicitly; later tests pass skipStepCreation: true.
// ---------------------------------------------------------------------------
Cypress.Commands.add('ensureFibDeepSetup', (options: {
  through?: 'canvas' | 'step' | 'dropped' | 'content' | 'settings';
  skipStepCreation?: boolean;
} = {}) => {
  const through = options.through || 'content';
  const skipStepCreation = options.skipStepCreation ?? false;
  const url = getLaunchUrl();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.log(`🔁 ensureFibDeepSetup → through "${through}"${skipStepCreation ? ' (skip step creation)' : ''} [${getAuthoringModule()}]`);

  const useGenericStep = moduleUsesGenericStepForAssessment();

  cy.document().then(doc => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    const expired = isSessionExpiredVisible(doc);
    if (expired || !hasEditor) {
      logStage('SETUP', 'Editor not ready — re-launching authoring URL');
      cy.openAuthoringTool(url);
      if (skipStepCreation && useGenericStep) {
        cy.ensureOnFibGenericStep();
      }
    }
  });

  if (useGenericStep && !skipStepCreation) {
    logStage('SETUP', 'Phase 1 — Create fresh Generic Step');
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  } else if (useGenericStep && skipStepCreation) {
    logStage('SETUP', 'Phase 1 — Navigate to Generic Step from TC_02a');
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
    captureLiveMilestone('generic-step-canvas-ready');
  } else if (!useGenericStep) {
    cy.navigateToCanvasPage();
  }

  if (through === 'canvas' || through === 'step') return;

  logStage('SETUP', 'Phase 2 — Drop FIB into Generic Step column');
  cy.dropFibIntoGenericStepColumn();

  if (through === 'dropped') return;

  logStage('SETUP', 'Phase 3 — Enter FIB header + sentence dummy content');
  cy.fillFibDummyContent();
});

// ---------------------------------------------------------------------------
// openDroppedComponentSettings — last dropped item (canvas or Generic Step column)
// ---------------------------------------------------------------------------
Cypress.Commands.add('openDroppedComponentSettings', () => {
  cy.get(
    '.generic-step-column-content .sd-item, #desktop_view .sd-item',
    { timeout: 15000 },
  ).last().scrollIntoView().click({ force: true });
  cy.get('.componentSettingPanel, #fib-settings-panel, #mcq-settings-panel', { timeout: 15000 })
    .filter(':visible')
    .first()
    .should('be.visible');
});

// ---------------------------------------------------------------------------
// deleteLastDroppedComponent — remove last item from canvas or Generic Step
// ---------------------------------------------------------------------------
Cypress.Commands.add('deleteLastDroppedComponent', () => {
  cy.get(
    '.generic-step-column-content .sd-item, #desktop_view .sd-item',
    { timeout: 8000 },
  ).last().then($item => {
    cy.wrap($item)
      .find('.icon-Delete, .dlet_icon, [class*="delete"]', { timeout: 5000 })
      .first()
      .click({ force: true });
  });
  cy.get('body').then($body => {
    if ($body.find('.modal.in, [class*="confirm"]').length > 0) {
      cy.get('button:contains("Delete"), button:contains("OK"), button:contains("Yes")', { timeout: 5000 })
        .first()
        .click({ force: true });
    }
  });
  cy.wait(500);
});

// ---------------------------------------------------------------------------
// createTestStep — Mirrors Selenium ClosifyAuthoringPage.createStep() flow.
// ---------------------------------------------------------------------------
Cypress.Commands.add('createTestStep', (stepType = 'GenericStep') => {
  const stepLabel = stepType === 'GenericStep' ? 'Generic Step' : stepType;
  const stepTitle = `Auto Test — ${stepLabel} — ${new Date().toLocaleTimeString('en-IN')}`;

  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  cy.log(`📋 STEP CREATION START — Creating "${stepLabel}"`);
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  waitForTocReady();
  waitForWidgetRegistry();
  openStepChooserFromToc();
  selectStepTypeCard(stepLabel);
  cy.captureLiveStep(`step-type-${stepType}-selected`);

  fillStepTitle(stepTitle);
  submitStepWizard();
  waitForStepSaved();

  if (stepType === 'GenericStep') {
    waitForGenericStepCanvasReady();
    cy.captureLiveStep('generic-step-canvas-ready');
    assertActiveTocMatches(/Generic Step/i);
    cy.get(STEP_SELECTORS.activeToc, { timeout: 10000 })
      .invoke('text')
      .should('include', 'Auto Test');
    cy.window().then(win => markAutoTestStepCreated(win, stepTitle));
  }

  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  cy.log('✅ STEP CREATION COMPLETE — Canvas ready for testing');
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ---------------------------------------------------------------------------
// navigateToCanvasPage — Navigate to a page that supports unrestricted drops.
//
// WHY THIS EXISTS:
//   Generic Step pages have onDropComplete() that checks for
//   `.sd-item section[data-type="GenericStep"]` and RETURNS FALSE immediately,
//   blocking ALL layout/element/widget drops on the main canvas.
//   Generic Steps are designed for assessment widgets dropped inside their own
//   internal drop zone, not the main #desktop_view.
//
//   "Instructions for Students" is a standard content page with no such block —
//   ALL component types (Layout, Text, Image, MCQ, etc.) can be dropped there.
//
// Also verifies that [new-toc] attributes (pagesequence, pagedbid) are set
// so that onDropComplete doesn't trigger an unwanted savePhysicalPage() call.
// ---------------------------------------------------------------------------
Cypress.Commands.add('navigateToCanvasPage', () => {
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  cy.log('📄 CANVAS SETUP — Navigating to Instructions for Students page');
  cy.log('   (This page has an unrestricted canvas — all component drops work)');
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Click the "Instructions for Students" TOC entry
  cy.contains('Instructions for Students', { timeout: 15000 })
    .parents('.toc-container, [ng-click*="tocPageClick"], li')
    .first().click({ force: true });

  logStage('CANVAS', 'Waiting for Instructions page canvas');
  cy.get('#desktop_view', { timeout: 15000 }).should('exist');
  waitForLoaderGone();

  cy.log('2️⃣  Verifying no Generic Step section on canvas (would block drops)');
  cy.get('#desktop_view').then($canvas => {
    const blocked = $canvas.find('section[data-type="GenericStep"]').length;
    if (blocked > 0) {
      cy.log('⚠️  GenericStep found — falling back to Instructions for Teacher');
      cy.contains('Instructions for Teacher', { timeout: 8000 })
        .parents('.toc-container, [ng-click*="tocPageClick"], li')
        .first().click({ force: true });
      cy.get('#desktop_view', { timeout: 10000 }).should('exist');
      waitForLoaderGone();
    }
  });

  cy.log('3️⃣  Verifying [new-toc] page attributes are set (required for drops)');
  cy.get('[new-toc]', { timeout: 10000 }).should('have.attr', 'pagesequence');

  cy.log('✅ CANVAS SETUP COMPLETE — ready for component testing');
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ---------------------------------------------------------------------------
// Wait until the authoring editor is fully interactive.
// ---------------------------------------------------------------------------
Cypress.Commands.add('waitForEditorReady', () => {
  cy.get('button.btn', { timeout: 50000 }).filter(':contains("Save")').should('be.visible');
  cy.get('#desktop_view', { timeout: 30000 }).should('exist');
  waitForLoaderGone();
});

/** generic-step-directive.js stores dropElement on the template directive scope, not ng-repeat child scope. */
function resolveGenericStepDropScope(ang: any, targetColumn: Element): any {
  const container = targetColumn.closest('.generic-step-container');
  if (container) {
    let scope = ang.element(container).scope();
    while (scope) {
      if (typeof scope.onDropComplete === 'function') return scope;
      scope = scope.$parent;
    }
  }

  let scope = ang.element(targetColumn).scope();
  while (scope) {
    if (typeof scope.onDropComplete === 'function') return scope;
    scope = scope.$parent;
  }
  return null;
}

/** Resolve question slot index from DOM or fall back to columnIndex. */
function resolveQuestionIndex($: any, dropElement: Element, columnIndex: number): number {
  const attr = $(dropElement).closest('[question-index]').attr('question-index');
  if (attr != null && attr !== '') {
    const parsed = parseInt(attr, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return columnIndex;
}

// ---------------------------------------------------------------------------
// dropWidgetIntoGenericStep — Drop an assessment widget into a Generic Step.
//
// WHY: The main canvas onDropComplete() blocks drops when a GenericStep section
// exists. Assessment widgets (MCQ, FIB, Sorting, etc.) must be dropped into
// the Generic Step template's own internal drop zone (.generic-step-column-content)
// which has its own onDropComplete() defined in generic-step-directive.js.
//
// Flow:
//   1. Find the target .generic-step-column-content element (by columnIndex)
//   2. Look up the widget object by name or dataType in scope.widgets
//   3. Set dropElement on the generic-step-template directive scope (NOT ng-repeat scope)
//   4. Call the directive scope's onDropComplete(index, widget, evt)
//   5. Wait for the widget to render inside the column
//
// @param widgetName  - widget name or dataType (e.g. "Multiple Choice")
// @param columnIndex - which question slot to use (default: 0)
// ---------------------------------------------------------------------------
Cypress.Commands.add('dropWidgetIntoGenericStep', (
  widgetName: string,
  columnIndex = 0,
  dataType?: string,
  skipLiveCapture?: boolean,
) => {
  cy.log(`🎯 dropWidgetIntoGenericStep: "${widgetName}" → column ${columnIndex}`);

  const resolvedDataType = dataType || 'fill-in-the-blank';

  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();
  waitForWidgetRegistry();

  retryDomAction('dropWidgetIntoGenericStep', () => {
    cy.window().then(win => {
      const ang = (win as { angular?: { element: (el: Element) => { scope: () => Record<string, unknown> } } }).angular;
      if (!ang) throw new Error('AngularJS not found on window');
      const $ = (win as { $?: (sel: string | Element) => JQuery }).$;
      if (!$) throw new Error('jQuery not found on window');

      const ctrlEl = win.document.getElementById('myController');
      if (!ctrlEl) throw new Error('#myController not found');
      const ctrlScope = ang.element(ctrlEl).scope() as Record<string, unknown>;

      const allWidgets = flattenWidgets(ctrlScope.widgets);
      const nameLower = widgetName.toLowerCase();
      const widget =
        allWidgets.find(w => w.name === widgetName) ||
        allWidgets.find(w => String(w.name || '').toLowerCase() === nameLower) ||
        (dataType ? allWidgets.find(w => w.dataType === dataType) : undefined) ||
        allWidgets.find(w => w.dataType === widgetName) ||
        allWidgets.find(w => /fill.?in.?the.?blank/i.test(String(w.name || '')) && nameLower.includes('fill'));
      if (!widget) {
        const avail = allWidgets.map(w => `${w.name} (${w.dataType})`).join(', ');
        throw new Error(`Widget "${widgetName}" not found. Available: ${avail}`);
      }
      cy.log(`   Widget resolved: name="${widget.name}" dataType="${widget.dataType}"`);

      const desktop = win.document.getElementById('desktop_view');
      if (!desktop) throw new Error('#desktop_view not found');

      const genericStepOnCanvas = desktop.querySelector('.generic-step-container, section[data-type="GenericStep"]');
      if (!genericStepOnCanvas) {
        throw new Error(
          'No Generic Step on canvas — assessment widgets cannot drop on Instructions for Students. ' +
          'Run cy.createTestStep("GenericStep") then cy.ensureOnFibGenericStep() first.',
        );
      }

      const columns = desktop.querySelectorAll('.generic-step-column-content');
      if (!columns.length) {
        throw new Error('.generic-step-column-content not found on active canvas — is Generic Step selected in TOC?');
      }
      const targetColumn = columns[columnIndex] || columns[0];
      const $column = $(targetColumn);

      const dropScope = resolveGenericStepDropScope(ang, targetColumn);
      if (!dropScope || typeof dropScope.onDropComplete !== 'function') {
        throw new Error('Generic Step directive scope or onDropComplete not found on .generic-step-column-content');
      }

      const existingWidget = $column.find('[data-type]').length > 0 || $column.children().length > 0;
      if (existingWidget) {
        cy.log('   Column already contains a widget — skipping drop');
        cy.wrap(widget.dataType || resolvedDataType).as('lastDroppedWidgetType');
        setLastDroppedWidgetType(win, String(widget.dataType || resolvedDataType));
        return;
      }

      dropScope.dropElement = targetColumn;

      const questionIndex = resolveQuestionIndex($, targetColumn, columnIndex);
      const bank = dropScope.fieldData?.settings?.questionBank;
      if (!Array.isArray(bank) || bank.length === 0) {
        throw new Error('Generic Step questionBank not initialized on directive scope');
      }
      while (bank.length <= questionIndex) {
        bank.push({ questionType: 'Widget Type', questionTemplate: '' });
      }

      dropScope.onDropComplete(questionIndex, widget, { element: $column });
      if (typeof dropScope.$apply === 'function') {
        dropScope.$apply();
      } else if (typeof ctrlScope.$apply === 'function') {
        (ctrlScope.$apply as () => void)();
      }
      cy.log(`   onDropComplete called on directive scope (questionIndex=${questionIndex})`);
      setLastDroppedWidgetType(win, String(widget.dataType || resolvedDataType));
      cy.wrap(widget.dataType || resolvedDataType).as('lastDroppedWidgetType');
    });

    cy.get('#desktop_view .generic-step-column-content .sd-item, #desktop_view .generic-step-column-content [data-type]', { timeout: 25000 })
      .should('exist');
    waitForAngularSettled();
    return cy.wrap(null);
  });

  if (!skipLiveCapture) {
    cy.get('@lastDroppedWidgetType').then(dt => {
      cy.captureLiveStep(`widget-dropped-${dt}`);
    });
  }
  cy.log(`✅ Widget "${widgetName}" dropped into Generic Step`);
});

// ---------------------------------------------------------------------------
// Open the Components panel (right rail — Carnegie / flat TOC UI).
// Left #lbl-add / #lbl-add-content is display:none; widgets live under .components.
// ---------------------------------------------------------------------------
Cypress.Commands.add('openAddPanel', () => {
  cy.log('Opening Components panel (right rail .components)');
  cy.get('.components', { timeout: 15000 }).should('be.visible');

  cy.get('.components .header-component', { timeout: 10000 })
    .filter(':visible')
    .first()
    .click({ force: true });

  cy.window().then(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => { changeStyleSetting?: (p: string) => void; $apply?: () => void; commonrightpanel?: string } } } }).angular;
    const ctrl = win.document.getElementById('myController');
    if (ang && ctrl) {
      const scope = ang.element(ctrl).scope();
      if (scope.commonrightpanel !== 'switchComponents' && typeof scope.changeStyleSetting === 'function') {
        scope.changeStyleSetting('switchComponents');
        scope.$apply?.();
      }
    }
  });

  cy.get('.components #lbl-add-content, .components .header-styles-panel', { timeout: 15000 })
    .filter(':visible')
    .first()
    .should('be.visible');
});

// ---------------------------------------------------------------------------
// Expand an accordion section in the Components panel (right rail).
// ---------------------------------------------------------------------------
Cypress.Commands.add('expandSection', (sectionName: string) => {
  cy.get('.components #lbl-add-content .accordion-toggle, .components .header-styles-panel .accordion-toggle', { timeout: 10000 })
    .filter(`:contains("${sectionName}")`)
    .then($toggle => {
      if ($toggle.hasClass('collapsed')) cy.wrap($toggle).click({ force: true });
    });
  cy.get('.components #lbl-add-content .accordion-toggle, .components .header-styles-panel .accordion-toggle', { timeout: 8000 })
    .filter(`:contains("${sectionName}")`)
    .parents('.panel-default')
    .find('.panel-collapse')
    .should('have.class', 'in');
});

// ---------------------------------------------------------------------------
// Drop a component onto the canvas via AngularJS scope injection.
//
// IMPORTANT: This only works on pages WITHOUT a section[data-type="GenericStep"]
// on the canvas. Use cy.navigateToCanvasPage() before calling this.
//
// scope.widgets may be an Array (loaded) or {} (initial empty object).
// We handle both. The widget is matched by name (primary) or dataType (fallback).
// After injection, waits for the .sd-item to appear and for the template's
// first-time-load initialization to complete before returning.
// ---------------------------------------------------------------------------
Cypress.Commands.add('dropComponent', (componentName: string) => {
  cy.log(`🖱 dropComponent: injecting "${componentName}" onto canvas`);

  cy.window().then(win => {
    const ang = (win as any).angular;
    if (!ang) throw new Error('AngularJS not found on window');
    const ctrlEl = win.document.getElementById('myController');
    if (!ctrlEl) throw new Error('#myController not found');
    const scope = ang.element(ctrlEl).scope();

    const mod = getAuthoringModule();
    if (mod !== 'wl' && isAssessmentWidget(undefined, componentName)) {
      throw new Error(
        `Cannot drop assessment widget "${componentName}" on Instructions canvas in ${mod.toUpperCase()} module. ` +
        'Use cy.createTestStep("GenericStep") and cy.dropComponentForModule() instead.',
      );
    }

    // scope.widgets may be [] or {} — flatten both forms
    const allWidgets = flattenWidgets(scope.widgets);

    // Guard: block drop if GenericStep is on the canvas
    const desktop = win.document.getElementById('desktop_view');
    if (desktop && desktop.querySelector('section[data-type="GenericStep"]')) {
      throw new Error(
        `Cannot drop "${componentName}": the canvas has a GenericStep section which blocks all drops.\n` +
        `Call cy.navigateToCanvasPage() before cy.dropComponent().`
      );
    }

    const widget =
      allWidgets.find((w: any) => w.name === componentName) ||
      allWidgets.find((w: any) => w.dataType === componentName);

    if (!widget) {
      const available = allWidgets.map((w: any) => `${w.name} (${w.dataType})`).join(', ');
      throw new Error(
        `Widget "${componentName}" not found in scope.widgets.\nAvailable: ${available || '(empty — widgets not loaded yet?)'}`
      );
    }

    cy.log(`   Found widget: name="${widget.name}" dataType="${widget.dataType}"`);
    scope.onDropComplete(0, widget, { target: win.document.getElementById('desktop_view') });
    scope.$apply();
  });

  // Wait for sd-item to appear and template initialization
  cy.get('#desktop_view .sd-item', { timeout: 25000 })
    .should('have.length.greaterThan', 0);
  cy.get('#desktop_view .sd-item').last()
    .find('.template-main-body, [class*="template"]', { timeout: 12000 })
    .should('exist');
  waitForAngularSettled();
});

// ---------------------------------------------------------------------------
// Click the last dropped component to open its settings panel.
// ---------------------------------------------------------------------------
Cypress.Commands.add('openComponentSettings', () => {
  cy.get('#desktop_view .sd-item', { timeout: 10000 })
    .last()
    .click({ force: true });
  cy.get('.componentSettingPanel', { timeout: 15000 })
    .should('be.visible')
    .and('not.be.empty');
});

// ---------------------------------------------------------------------------
// Open Fill in the Blank settings panel (FIB inside Generic Step column).
// ---------------------------------------------------------------------------
Cypress.Commands.add('setContentEditableText', (selector: string, text: string) => {
  setContentEditableText(selector, text);
});

Cypress.Commands.add('setContentEditableOn', { prevSubject: true }, (subject, text: string) => {
  applyContentEditable(Cypress.$(subject as unknown as Element), text);
  cy.window().then(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => { $apply?: () => void } } } }).angular;
    const ctrl = win.document.getElementById('myController');
    if (ang && ctrl) ang.element(ctrl).scope()?.$apply?.();
  });
  return cy.wrap(subject, { log: false });
});

Cypress.Commands.add('openFibSettings', () => {
  cy.waitForFibWidgetReady();
  openFibSettingsPanel();
  cy.get('#fib-settings-panel', { timeout: 20000 }).should('exist');
  cy.get('#fib-settings-panel .fib-settings-panel', { timeout: 20000 }).should('exist');
  cy.get('#fib-settings-panel #with-option', { timeout: 20000 }).should('exist');
  cy.captureLiveStep('fib-settings-panel-open');
});

/** Focus FIB sentence (#target) and invoke insertBlank on fib-template scope. */
Cypress.Commands.add('insertFibBlank', () => {
  cy.window().then(win => {
    const ang = (win as any).angular;
    const $ = (win as any).$;
    const $sentence = $(
      '.generic-step-column-content .fib .sc-sentence.sentence-text, #desktop_view .fib .sc-sentence.sentence-text',
    ).first();
    if (!$sentence.length) throw new Error('FIB sentence field not found');

    $sentence.trigger('click');

    const $fibRoot = $sentence.closest('[fib-template]').length
      ? $sentence.closest('[fib-template]')
      : $sentence.closest('.fib');
    const fibScope = ang.element($fibRoot[0]).scope();
    if (fibScope && typeof fibScope.insertBlank === 'function') {
      const mockEvent = {
        stopImmediatePropagation: () => undefined,
        preventDefault: () => undefined,
        currentTarget: $sentence[0],
        target: $sentence[0],
      };
      fibScope.insertBlank(mockEvent);
      fibScope.$apply?.();
    } else {
      $sentence.parents('.form-row').find('.insert-blank span').filter((_i: number, el: Element) =>
        $(el).text().includes('Insert Blank'),
      ).first().trigger('click');
    }
  });
  waitForAngularSettled();
});

/** Navigate to the Generic Step created in TC_02a (latest Auto Test entry in TOC). */
Cypress.Commands.add('ensureOnFibGenericStep', () => {
  ensureOnAutoTestGenericStep();
});

/** Drop FIB into Generic Step column with live-preview screenshots (flow steps 5–6). */
Cypress.Commands.add('dropFibIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();
  logStage('FIB', 'Prepare Generic Step column for drop');

  cy.get('#desktop_view .generic-step-column-content, #desktop_view .generic-step-empty-droppable-text', { timeout: 15000 })
    .first()
    .scrollIntoView();

  cy.captureLiveStep('fib-drop-prepare-generic-step-column');

  cy.get('#desktop_view').then($desktop => {
    const hasFibInGenericStep = $desktop
      .find('.generic-step-column-content [data-type="fill-in-the-blank"]')
      .length > 0;
    if (hasFibInGenericStep) {
      cy.log('ℹ FIB already in Generic Step column — verifying render state');
      cy.waitForFibWidgetReady();
      cy.captureLiveStep('widget-dropped-fill-in-the-blank');
      return;
    }
    logStage('FIB', 'Drop Fill in the Blank into Generic Step column');
    cy.dropComponentForModule('Fill in the Blank', {
      dataType: 'fill-in-the-blank',
      skipLiveCapture: true,
    });
    cy.waitForFibWidgetReady();
    cy.captureLiveStep('widget-dropped-fill-in-the-blank');
  });
  cy.log('✅ Widget "Fill in the Blank" dropped into Generic Step');
});

/** Enter FIB header + sentence with live-preview screenshot (flow step 7). */
Cypress.Commands.add('fillFibDummyContent', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForFibWidgetReady();
  logStage('FIB', 'Enter header + sentence dummy content');
  selectFibSdItem();
  cy.get(FIB_SELECTORS.template, { timeout: 10000 }).first().should('exist').then($fib => {
    cy.get('body').then($body => {
      if ($body.find(FIB_SELECTORS.header).length === 0) {
        cy.captureLiveStep('fib-dummy-content-entered');
        return;
      }
      const text = $fib.text();
      if (!/FIB Automation Header/i.test(text)) {
        setContentEditableText(FIB_SELECTORS.header, 'FIB Automation Header');
        setContentEditableText(FIB_SELECTORS.sentence, 'The capital of France is ');
        cy.get(FIB_SELECTORS.header).first().should('contain.text', 'FIB Automation Header');
      }
      cy.captureLiveStep('fib-dummy-content-entered');
    });
  });
});

Cypress.Commands.add('pasteFibIntoNextGenericStepSlot', () => {
  cy.get('.generic-step-column-content').then($cols => {
    const emptyIndex = [...$cols].findIndex(col => (col as HTMLElement).children.length === 0);
    if (emptyIndex < 0) {
      cy.get('[data-type="fill-in-the-blank"]').first().parents('.sd-item').first().within(() => {
        cy.get('.duplicate-widget-icon, .icon-Page-duplication-01').first().click({ force: true });
      });
      return;
    }
    cy.get('.generic-step-question-container').eq(emptyIndex).find('.generic-step-empty-droppable-text')
      .click({ force: true });
  });
  cy.wait(800);
});

// ---------------------------------------------------------------------------
// Delete the last component on the canvas and handle any confirmation.
// ---------------------------------------------------------------------------
Cypress.Commands.add('deleteLastComponent', () => {
  cy.get('#desktop_view .sd-item', { timeout: 8000 }).last().then($item => {
    cy.wrap($item)
      .find('.icon-Delete, .dlet_icon, [class*="delete"]', { timeout: 5000 })
      .first()
      .click({ force: true });
  });
  cy.get('body').then($body => {
    if ($body.find('.modal.in, [class*="confirm"]').length > 0) {
      cy.get('button:contains("Delete"), button:contains("OK"), button:contains("Yes")', { timeout: 5000 })
        .first()
        .click({ force: true });
    }
  });
  cy.wait(500);
});
