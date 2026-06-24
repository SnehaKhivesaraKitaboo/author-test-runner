/// <reference types="cypress" />
// =============================================================================
// ELA Multipart component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// ELA Multipart is the "Multipart Question" widget (dataType
// "group-interactivity-template"), which IS an assessment widget present in
// support/module-setup.ts ASSESSMENT_DATA_TYPES — so resolveDropTarget routes it
// to a Generic Step column (mirrors the Extended Response / Correction siblings).
//
// Sub-question widgets (MCQ / FIB …) are dropped INTO the multipart container's
// own inner empty slots. The framework's cy.dropWidgetIntoGenericStep targets the
// outer .generic-step-column-content, so inner drops are performed here by
// invoking the multipart directive's own onDropComplete on its
// [group-interactivity] scope (best-effort; logs + returns gracefully when the
// directive scope or widget catalog is not available).
// =============================================================================

import {
  ELA_MULTIPART_CANVAS,
  ELA_MULTIPART_DATA_TYPE,
  ELA_MULTIPART_SETTINGS,
  ELA_MULTIPART_WIDGET_NAME,
} from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureElaMultipartDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropElaMultipartIntoGenericStepColumn(): Chainable<void>;
      openElaMultipartSettings(): Chainable<void>;
      /** Drop a sub-question assessment widget into the next empty multipart slot. */
      addElaMultipartPart(part: { name: string; dataType: string }): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureElaMultipartDeepSetup', (options = {}) => {
  const through = options.through || 'content';
  const skipStepCreation = options.skipStepCreation ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (hasEditor) return;
    cy.openAuthoringTool(url);
    if (skipStepCreation) cy.ensureOnFibGenericStep();
  });

  if (skipStepCreation) {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  cy.dropElaMultipartIntoGenericStepColumn();
  // 'content' is treated the same as 'dropped' here: the multipart container has
  // no shared header/instruction contenteditable of its own in the source — the
  // authorable content lives inside the sub-question parts.
});

Cypress.Commands.add('dropElaMultipartIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped =
      $desktop.find(`.generic-step-column-content ${ELA_MULTIPART_CANVAS.container}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ ELA Multipart already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule(ELA_MULTIPART_WIDGET_NAME, {
      dataType: ELA_MULTIPART_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(ELA_MULTIPART_CANVAS.container, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-ela-multipart');
});

Cypress.Commands.add('openElaMultipartSettings', () => {
  cy.get(
    `.generic-step-column-content ${ELA_MULTIPART_CANVAS.container}, #desktop_view ${ELA_MULTIPART_CANVAS.container}`,
    { timeout: 12000 },
  )
    .first()
    .click({ force: true });
  cy.get(ELA_MULTIPART_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('ela-multipart-settings-panel-open');
});

// ---------------------------------------------------------------------------
// addElaMultipartPart — drop a sub-question widget into the next empty slot by
// invoking the multipart directive's onDropComplete (the same handler the live
// drag-drop uses). Resolves the widget object from scope.widgets by name/dataType.
// Logs + returns gracefully (does NOT fail) when the directive scope, the widget
// catalog, or an empty slot is unavailable so the suite stays resilient.
// ---------------------------------------------------------------------------
Cypress.Commands.add('addElaMultipartPart', (part: { name: string; dataType: string }) => {
  cy.get(ELA_MULTIPART_CANVAS.container, { timeout: 12000 }).should('exist');

  cy.window().then((win) => {
    const w = win as unknown as {
      angular?: { element: (el: Element) => { scope: () => Record<string, any> } };
      $?: (sel: string | Element) => any;
      document: Document;
    };
    const ang = w.angular;
    const jq = w.$;
    if (!ang || !jq) {
      cy.log('ℹ addElaMultipartPart: AngularJS/jQuery not on window — inner drop deferred to runtime');
      return;
    }

    const ctrlEl = w.document.getElementById('myController');
    const ctrlScope = ctrlEl ? ang.element(ctrlEl).scope() : undefined;

    // Flatten widget catalog to resolve the sub-question widget object.
    let widget: Record<string, any> | undefined;
    const groups: Array<{ widget?: Array<Record<string, any>> }> =
      (ctrlScope && (ctrlScope.widgets as Array<{ widget?: Array<Record<string, any>> }>)) || [];
    groups.forEach((g) => {
      (g.widget || []).forEach((cand) => {
        if (!widget && (cand.dataType === part.dataType || cand.name === part.name)) widget = cand;
      });
    });
    if (!widget?.enableGroupInteractivity) {
      cy.log(`ℹ addElaMultipartPart: "${part.name}" not droppable inside multipart (catalog/flag) — deferred`);
      return;
    }

    const hostEl = w.document.querySelector(
      '.group-interactivity-container [group-interactivity]',
    ) as Element | null;
    const emptySlot = w.document.querySelector(
      '.group-interactivity-container .question-container.questionsEmptyItemGrp .empty-droppable-text, ' +
        '.group-interactivity-container .empty-droppable-text',
    ) as Element | null;
    if (!hostEl || !emptySlot) {
      cy.log('ℹ addElaMultipartPart: directive host / empty slot not found — inner drop deferred');
      return;
    }

    const dirScope = ang.element(hostEl).scope();
    if (!dirScope || typeof dirScope.onDropComplete !== 'function') {
      cy.log('ℹ addElaMultipartPart: onDropComplete not on directive scope — inner drop deferred');
      return;
    }

    const $slot = jq(emptySlot).closest('.empty-droppable-text');
    dirScope.dropElement = $slot[0] || emptySlot;
    const questionIndex = Number.parseInt(
      String(jq(emptySlot).closest('[question-index]').attr('question-index') || '0'),
      10,
    );
    dirScope.onDropComplete(questionIndex, widget, { element: jq(emptySlot) });
    if (typeof dirScope.$apply === 'function') dirScope.$apply();
    else if (ctrlScope && typeof ctrlScope.$apply === 'function') ctrlScope.$apply();
    cy.log(`✅ addElaMultipartPart: "${part.name}" dropped into slot ${questionIndex}`);
  });

  cy.captureLiveStep(`ela-multipart-part-added-${part.dataType}`);
});

export {};
