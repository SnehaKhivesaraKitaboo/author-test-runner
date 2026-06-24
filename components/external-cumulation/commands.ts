/// <reference types="cypress" />
// =============================================================================
// External Cumulation component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.captureLiveStep
//
// External Cumulation is NOT a dropped widget — it is the shared Asset Library /
// "Import From Library" re-use flow targeting a DIFFERENT activity (cross-
// activity import). The cross-lesson SCORM data patch (6.3 ↔ 6.5) is runtime and
// not authorable. The Import entry is gated by getProgramName(); these helpers
// degrade gracefully (log + return) when the entry/modal is not rendered.
// =============================================================================

import { EC_LIBRARY, EC_TOC } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureExternalCumulationDeepSetup(options?: {
        skipStepCreation?: boolean;
      }): Chainable<void>;
      openExternalCumulationLibrary(): Chainable<boolean>;
      searchExternalCumulationLibrary(term: string): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureExternalCumulationDeepSetup', (options = {}) => {
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
});

/**
 * Open the "Import From Library" / Asset Library modal.
 * Yields `true` when the modal opened, `false` when the feature is flag-gated
 * (Import entry not rendered because getProgramName() is falsy in this build).
 */
Cypress.Commands.add('openExternalCumulationLibrary', () => {
  return cy.get('body').then(($body) => {
    if ($body.find(EC_TOC.importFromLibraryItem).length === 0) {
      const toggle = $body.find(`${EC_TOC.addDropdownToggle}:visible`);
      if (toggle.length) {
        cy.wrap(toggle.first()).click({ force: true });
      }
    }

    return cy.get('body').then(($b2) => {
      if ($b2.find(EC_TOC.importFromLibraryItem).length === 0) {
        cy.log('ℹ External Cumulation: "Import From Library" not rendered (getProgramName() falsy / flag-gated)');
        return cy.wrap(false);
      }
      cy.get(EC_TOC.importFromLibraryItem).filter(':visible').first().click({ force: true });
      return cy.get('body').then(($b3) => {
        if ($b3.find(`${EC_LIBRARY.modal}:visible`).length === 0) {
          cy.log('ℹ External Cumulation: Asset Library modal did not open (flag-gated)');
          return cy.wrap(false);
        }
        cy.captureLiveStep('external-cumulation-library-open');
        return cy.wrap(true);
      });
    });
  });
});

Cypress.Commands.add('searchExternalCumulationLibrary', (term: string) => {
  cy.get(EC_LIBRARY.searchInput, { timeout: 10000 })
    .should('be.visible')
    .clear({ force: true })
    .type(term, { force: true });
  cy.captureLiveStep('external-cumulation-library-search');
});

export {};
