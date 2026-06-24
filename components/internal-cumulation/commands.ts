/// <reference types="cypress" />
// =============================================================================
// Internal Cumulation component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.captureLiveStep
//
// Internal Cumulation is NOT a dropped widget — it is the shared Asset Library /
// "Import From Library" re-use flow (duplicate a step within the same activity).
// The Import entry is gated by getProgramName(); these helpers degrade
// gracefully (log + return) when the entry/modal is not rendered.
// =============================================================================

import { IC_LIBRARY, IC_TOC } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureInternalCumulationDeepSetup(options?: {
        skipStepCreation?: boolean;
      }): Chainable<void>;
      openInternalCumulationLibrary(): Chainable<boolean>;
      searchInternalCumulationLibrary(term: string): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureInternalCumulationDeepSetup', (options = {}) => {
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
Cypress.Commands.add('openInternalCumulationLibrary', () => {
  return cy.get('body').then(($body) => {
    if ($body.find(IC_TOC.importFromLibraryItem).length === 0) {
      // The "+ Add" dropdown may need to be opened first.
      const toggle = $body.find(`${IC_TOC.addDropdownToggle}:visible`);
      if (toggle.length) {
        cy.wrap(toggle.first()).click({ force: true });
      }
    }

    return cy.get('body').then(($b2) => {
      if ($b2.find(IC_TOC.importFromLibraryItem).length === 0) {
        cy.log('ℹ Internal Cumulation: "Import From Library" not rendered (getProgramName() falsy / flag-gated)');
        return cy.wrap(false);
      }
      cy.get(IC_TOC.importFromLibraryItem).filter(':visible').first().click({ force: true });
      return cy.get('body').then(($b3) => {
        if ($b3.find(`${IC_LIBRARY.modal}:visible`).length === 0) {
          cy.log('ℹ Internal Cumulation: Asset Library modal did not open (flag-gated)');
          return cy.wrap(false);
        }
        cy.captureLiveStep('internal-cumulation-library-open');
        return cy.wrap(true);
      });
    });
  });
});

Cypress.Commands.add('searchInternalCumulationLibrary', (term: string) => {
  cy.get(IC_LIBRARY.searchInput, { timeout: 10000 })
    .should('be.visible')
    .clear({ force: true })
    .type(term, { force: true });
  cy.captureLiveStep('internal-cumulation-library-search');
});

export {};
