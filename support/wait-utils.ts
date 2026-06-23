/// <reference types="cypress" />

import { getSessionState } from './session-state';

const LOADER_SELECTORS = [
  '#loader',
  '#loaderForPreviewAndEdit',
  '[class*="loading-overlay"]:visible',
  '.loader:visible',
].join(', ');

const AUTO_TEST_STEP_PATTERN = /Auto Test — Generic Step/i;

/** True only when #Session-Expired-Modal is actually shown (not hidden template text in DOM). */
export function isSessionExpiredVisible(doc: Document): boolean {
  const modal = doc.querySelector('#Session-Expired-Modal');
  if (!modal) return false;
  const el = modal as HTMLElement;
  if (el.classList.contains('in') || el.classList.contains('show')) return true;
  const style = doc.defaultView?.getComputedStyle(el);
  return Boolean(style && style.display !== 'none' && style.visibility !== 'hidden');
}

/** Fail fast when session modal is visible; ignore hidden modal markup in index.html. */
export function assertSessionActive(timeout = 20000): void {
  cy.get('#Session-Expired-Modal', { timeout }).should($modal => {
    const visible = $modal.hasClass('in') || $modal.hasClass('show') || $modal.is(':visible');
    if (visible) {
      throw new Error(
        'Session Expired — paste a fresh launch URL with a new userToken in the dashboard and run again.',
      );
    }
  });
}

/** Structured stage logging for live preview + debugging. */
export function logStage(phase: string, detail?: string): void {
  const msg = detail ? `[${phase}] ${detail}` : `[${phase}]`;
  cy.log(msg);
}

/** Flatten scope.widgets (array or category map) into widget objects. */
export function flattenWidgets(raw: unknown): Array<{ name?: string; dataType?: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap(g => (Array.isArray((g as { widget?: unknown[] }).widget) ? (g as { widget: unknown[] }).widget : [])) as Array<{ name?: string; dataType?: string }>;
  }
  if (typeof raw === 'object') {
    const out: Array<{ name?: string; dataType?: string }> = [];
    Object.values(raw as Record<string, unknown>).forEach(g => {
      if (Array.isArray(g)) out.push(...(g as Array<{ name?: string; dataType?: string }>));
      else if (g && typeof g === 'object' && Array.isArray((g as { widget?: unknown[] }).widget)) {
        out.push(...((g as { widget: unknown[] }).widget as Array<{ name?: string; dataType?: string }>));
      }
    });
    return out;
  }
  return [];
}

function isLoaderVisible($el: JQuery): boolean {
  if (!$el.length) return false;
  const display = $el.css('display');
  const visibility = $el.css('visibility');
  const opacity = parseFloat($el.css('opacity') || '1');
  return display !== 'none' && visibility !== 'hidden' && opacity > 0.05;
}

/** Wait until global loaders/spinners are not blocking the UI. */
export function waitForLoaderGone(timeout = 30000): void {
  logStage('WAIT', 'Loader / spinner dismissed');
  cy.get('body', { timeout }).should($body => {
    const loaders = $body.find(LOADER_SELECTORS);
    loaders.each((_i, el) => {
      expect(isLoaderVisible(Cypress.$(el)), `Loader still visible: ${el.id || el.className}`).to.be.false;
    });
  });
}

/** Wait until Angular controller scope is present and widgets registry is populated. */
export function waitForWidgetRegistry(timeout = 30000): void {
  logStage('WAIT', 'Widget registry loaded');
  cy.window({ timeout }).should(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => { widgets?: unknown } } } }).angular;
    const ctrl = win.document.getElementById('myController');
    expect(ctrl, '#myController present').to.exist;
    expect(ang, 'AngularJS present').to.exist;
    const scope = ang!.element(ctrl!).scope();
    const widgets = flattenWidgets(scope.widgets);
    expect(widgets.length, 'scope.widgets populated').to.be.greaterThan(0);
  });
}

/** Flush pending Angular digests ($evalAsync). */
export function waitForAngularSettled(): void {
  cy.window().then(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => { $evalAsync?: (fn: () => void) => void } } } }).angular;
    const ctrl = win.document.getElementById('myController');
    if (!ang || !ctrl) return;
    return new Cypress.Promise<void>(resolve => {
      ang.element(ctrl).scope().$evalAsync?.(() => resolve());
      // Fallback if $evalAsync unavailable
      win.setTimeout(() => resolve(), 0);
    });
  });
}

/** TOC ready — session active, TOC loader hidden, add controls visible. */
export function waitForTocReady(timeout = 60000): void {
  logStage('WAIT', 'TOC ready for step creation');
  assertSessionActive(timeout);
  // .toc-loader-msg uses ng-show="!tocInfo" — text stays in DOM when hidden; check visibility only
  cy.get('.toc-loader-msg', { timeout }).should($loader => {
    expect($loader.is(':visible'), 'TOC loader dismissed').to.be.false;
  });
  cy.get('.toc-container, .subTocName, .toc-outer-container', { timeout: 30000 }).should('exist');
  cy.get('#add-page-dropdown, .removeAddPreview, .addStepBtn', { timeout: 30000 }).should('exist');
  cy.get('#desktop_view', { timeout: 30000 }).should('exist');
  waitForLoaderGone(timeout);
}

/** Active Generic Step canvas — column drop zone + question bank initialized. */
export function waitForGenericStepCanvasReady(timeout = 25000): void {
  logStage('WAIT', 'Generic Step canvas ready');
  waitForLoaderGone(timeout);
  cy.get('#desktop_view .generic-step-column-content, #desktop_view .generic-step-empty-droppable-text', { timeout })
    .should('be.visible');
  cy.get(
    '#desktop_view .generic-step-container, #desktop_view section[data-type="GenericStep"]',
    { timeout },
  ).should('exist');
  cy.window().then(win => {
    const ang = (win as { angular?: { element: (el: Element) => { scope: () => Record<string, unknown> } } }).angular;
    const desktop = win.document.getElementById('desktop_view');
    if (!ang || !desktop) return;
    const column = desktop.querySelector('.generic-step-column-content');
    if (!column) throw new Error('Generic Step column not found on canvas');
    let scope = ang.element(column).scope() as Record<string, unknown>;
    while (scope) {
      const bank = (scope.fieldData as { settings?: { questionBank?: unknown[] } } | undefined)?.settings?.questionBank;
      if (Array.isArray(bank) && bank.length > 0) return;
      scope = scope.$parent as Record<string, unknown>;
    }
    throw new Error('Generic Step questionBank not initialized on directive scope');
  });
  waitForAngularSettled();
}

/** FIB widget fully rendered inside Generic Step column. */
export function waitForFibWidgetReady(timeout = 25000): void {
  logStage('WAIT', 'FIB widget rendered in Generic Step column');
  cy.get(
    '#desktop_view .generic-step-column-content [data-type="fill-in-the-blank"]',
    { timeout },
  )
    .should('exist')
    .and('be.visible');
  cy.get(
    '#desktop_view .generic-step-column-content .fib, #desktop_view .generic-step-column-content [data-type="fill-in-the-blank"] .fib',
    { timeout },
  ).should('exist');
  waitForAngularSettled();
}

/** Assert active TOC item text matches pattern (retry-friendly). */
export function assertActiveTocMatches(pattern: RegExp, timeout = 15000): void {
  cy.get('.subTocName.activeTocItem, li.activeTocItem', { timeout })
    .should('exist')
    .invoke('text')
    .should('match', pattern);
}

/** True when #desktop_view shows an active Generic Step (not Instructions pages). */
export function isGenericStepCanvasActive(doc: Document): boolean {
  const desktop = doc.getElementById('desktop_view');
  if (!desktop) return false;

  const hasColumn = Boolean(desktop.querySelector('.generic-step-column-content'));
  const hasContainer = Boolean(
    desktop.querySelector('.generic-step-container') ||
    desktop.querySelector('section[data-type="GenericStep"]'),
  );
  if (!hasColumn || !hasContainer) return false;

  const activeToc = doc.querySelector('.subTocName.activeTocItem, li.activeTocItem');
  const activeText = (activeToc?.textContent || '').trim();
  if (/Instructions for Students|Instructions for Teacher/i.test(activeText)) return false;
  if (!/Generic Step/i.test(activeText)) return false;

  return true;
}

/** Whether active canvas matches the automation-created Generic Step. */
export function isAutoTestGenericStepActive(doc: Document, win: Window): boolean {
  if (!isGenericStepCanvasActive(doc)) return false;
  const state = getSessionState(win);
  const activeToc = doc.querySelector('.subTocName.activeTocItem, li.activeTocItem');
  const activeText = (activeToc?.textContent || '').trim();
  if (state.lastAutoTestStepTitle) {
    return activeText.includes(state.lastAutoTestStepTitle) || AUTO_TEST_STEP_PATTERN.test(activeText);
  }
  return AUTO_TEST_STEP_PATTERN.test(activeText);
}

/** Navigate to latest Auto Test Generic Step in TOC with readiness checks. */
export function navigateToAutoTestGenericStep(): void {
  logStage('NAV', 'Auto Test Generic Step in TOC');
  cy.get('body', { timeout: 20000 }).then($body => {
    const matches = $body.find('.subTocName, .toc-container li, li').filter((_i, el) =>
      AUTO_TEST_STEP_PATTERN.test(el.textContent || ''),
    );
    if (matches.length === 0) {
      throw new Error(
        'No "Auto Test — Generic Step" in TOC. Run cy.createTestStep("GenericStep") in TC_02a first.',
      );
    }
  });
  cy.contains('.subTocName, .toc-container li, li', AUTO_TEST_STEP_PATTERN, { timeout: 20000 })
    .last()
    .scrollIntoView()
    .click({ force: true });

  waitForLoaderGone();
  waitForGenericStepCanvasReady();
  assertActiveTocMatches(/Generic Step/i);
  assertActiveTocMatches(AUTO_TEST_STEP_PATTERN);
  cy.get('.subTocName.activeTocItem, li.activeTocItem')
    .invoke('text')
    .should('not.match', /Instructions for Students|Instructions for Teacher/i);
}

/** Ensure we are on the automation Generic Step — navigate only when needed. */
export function ensureOnAutoTestGenericStep(): void {
  cy.window().then(win => {
    const doc = win.document;
    if (isAutoTestGenericStepActive(doc, win)) {
      logStage('NAV', 'Generic Step canvas already active');
      waitForGenericStepCanvasReady();
      return;
    }
    if (isGenericStepCanvasActive(doc) && getSessionState(win).fibAssessmentStepCreated) {
      logStage('NAV', 'Generic Step active but not Auto Test — re-selecting from TOC');
    }
    navigateToAutoTestGenericStep();
  });
}

/** Retry wrapper for flaky DOM operations (stale elements / re-render). */
export function retryDomAction<T>(
  label: string,
  fn: () => Cypress.Chainable<T>,
  attempts = 3,
): Cypress.Chainable<T> {
  const run = (remaining: number): Cypress.Chainable<T> => {
    return fn().then(result => cy.wrap(result), err => {
      if (remaining <= 1) throw err;
      logStage('RETRY', `${label} (${attempts - remaining + 1}/${attempts})`);
      waitForLoaderGone(15000);
      waitForAngularSettled();
      return run(remaining - 1);
    });
  };
  return run(attempts);
}
