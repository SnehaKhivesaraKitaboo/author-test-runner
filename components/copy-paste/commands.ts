/// <reference types="cypress" />
// =============================================================================
// Copy and Paste component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropFibIntoGenericStepColumn,
//   cy.fillFibDummyContent, cy.dropComponentForModule, cy.captureLiveStep
//
// Copy/Paste is a cross-component platform feature (NOT its own widget). The
// helpers below drive the source-verified controller hooks:
//   • componentCopy($event)      via .copy-widget-icon.icon-Copy-Icon
//   • componentDuplicate($event) via .duplicate-widget-icon.icon-Page-duplication-01
//   • componentPaste/pastecomp   via the empty Generic Step slot ("Paste Here")
// The clipboard is localStorage-backed (copiedComponent / targetDataType), so a
// copy → paste round trip is fully driveable from Cypress.
// =============================================================================

import { CP_CLIPBOARD_KEYS, CP_PASTE, CP_TOOLBAR } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureCopyPasteDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      /** Click the per-component copy icon if present; returns whether it fired. */
      copyFirstComponent(): Chainable<boolean>;
      /** Click the per-component duplicate icon (always present on dropped items). */
      duplicateFirstComponent(): Chainable<void>;
      /** Count component instances currently rendered in the Generic Step column. */
      countComponentInstances(): Chainable<number>;
      /** Click an empty Generic Step slot to paste the copied component. */
      pasteIntoEmptySlot(): Chainable<boolean>;
      /** Read the localStorage clipboard payload written by componentCopy. */
      readCopyClipboard(): Chainable<{ copiedComponent: string | null; targetDataType: string | null }>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureCopyPasteDeepSetup', (options = {}) => {
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

  // The copy/paste source is an existing assessment widget (FIB) in a column.
  cy.dropFibIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillFibDummyContent();
  cy.captureLiveStep('copy-paste-source-component-ready');
});

Cypress.Commands.add('copyFirstComponent', () => {
  return cy.get('body').then(($body) => {
    if ($body.find(CP_TOOLBAR.copyIcon).length === 0) {
      cy.log('ℹ Copy icon (.copy-widget-icon) not rendered on this component build — copy via icon unavailable');
      return cy.wrap(false, { log: false });
    }
    cy.get(CP_TOOLBAR.copyIcon).first().scrollIntoView().click({ force: true });
    cy.captureLiveStep('copy-paste-component-copied');
    return cy.wrap(true, { log: false });
  });
});

Cypress.Commands.add('duplicateFirstComponent', () => {
  cy.get(CP_TOOLBAR.duplicateIcon, { timeout: 12000 }).first().scrollIntoView().click({ force: true });
  cy.captureLiveStep('copy-paste-component-duplicated');
});

Cypress.Commands.add('countComponentInstances', () => {
  return cy.get('body').then(($body) =>
    cy.wrap($body.find(`${CP_PASTE.columnContent} .sd-item`).length, { log: false }),
  );
});

Cypress.Commands.add('pasteIntoEmptySlot', () => {
  return cy.get('body').then(($body) => {
    const $slots = $body.find(CP_PASTE.emptySlot);
    if ($slots.length === 0) {
      cy.log('ℹ No empty Generic Step slot available to paste into');
      return cy.wrap(false, { log: false });
    }
    cy.get(CP_PASTE.emptySlot).first().scrollIntoView()
      .trigger('mouseenter', { force: true })
      .click({ force: true });
    cy.captureLiveStep('copy-paste-pasted-into-slot');
    return cy.wrap(true, { log: false });
  });
});

Cypress.Commands.add('readCopyClipboard', () => {
  return cy.window().then((win) => ({
    copiedComponent: win.localStorage.getItem(CP_CLIPBOARD_KEYS.copiedComponent),
    targetDataType: win.localStorage.getItem(CP_CLIPBOARD_KEYS.targetDataType),
  }));
});

export {};
