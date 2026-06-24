/// <reference types="cypress" />
// =============================================================================
// Offline Step component commands — reusable workflows for the STEP itself.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.captureLiveStep,
//   cy.waitForEditorReady, cy.waitForLoaderGone
//
// Offline Step is a STEP TYPE created from the step chooser ("Non-interactive
// Step" category). It has NO dedicated canvas template (ngcontroller case
// "offlineStep" resolve()s with no JSON) — it reuses the standard #desktop_view
// editor. Its identity is the config gating: printable content only, NO
// interactive assessment widgets, NO multi-column layouts. Helpers here cover:
// opening the step chooser, locating the Offline Step card, opening the shared
// metadata wizard, reaching an Offline Step canvas, and reading the step's
// keyword/TOC menu.
// =============================================================================

import {
  OS_CANVAS,
  OS_CHOOSER,
  OS_STEP_LABEL,
  OS_TOC,
  OS_WIZARD,
} from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureOfflineStepDeepSetup(options?: {
        through?: 'launch' | 'chooser' | 'wizard' | 'step';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      openOfflineStepChooser(): Chainable<void>;
      closeOfflineStepChooser(): Chainable<void>;
      findOfflineStepCard(): Chainable<JQuery>;
      openOfflineStepWizard(): Chainable<void>;
      cancelOfflineStepWizard(): Chainable<void>;
      createOfflineStep(): Chainable<void>;
      openOfflineStepTocMenu(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

/** Reach a ready Offline Step authoring context (reuses createTestStep). */
Cypress.Commands.add('ensureOfflineStepDeepSetup', (options = {}) => {
  const through = options.through || 'step';
  const skipStepCreation = options.skipStepCreation ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (!hasEditor) {
      cy.openAuthoringTool(url);
    }
  });

  if (through === 'launch') return;

  if (through === 'chooser') {
    cy.openOfflineStepChooser();
    return;
  }

  if (through === 'wizard') {
    cy.openOfflineStepWizard();
    return;
  }

  if (!skipStepCreation) {
    cy.createOfflineStep();
  }
});

/** Open the step tray (#widget-popup) via the TOC "+ Add" → "Add New Step". */
Cypress.Commands.add('openOfflineStepChooser', () => {
  cy.get('body').then(($body) => {
    const toggle = $body.find(`${OS_CHOOSER.tocAddToggle}:visible`);
    const bottom = $body.find(`${OS_CHOOSER.bottomAddStep}:visible`);
    if (toggle.length) {
      cy.wrap(toggle.first()).scrollIntoView().click({ force: true });
      cy.get(OS_CHOOSER.addNewStepItem, { timeout: 10000 })
        .filter(':visible')
        .first()
        .then(($item) => $item[0].click());
    } else if (bottom.length) {
      cy.wrap(bottom.first()).scrollIntoView().click({ force: true });
    } else {
      throw new Error('TOC "+ Add" control not found — cannot open step chooser');
    }
  });
  cy.get(OS_CHOOSER.popup, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('offline-step-chooser-open');
});

/** Close the step chooser modal gracefully. */
Cypress.Commands.add('closeOfflineStepChooser', () => {
  cy.get('body').then(($body) => {
    if ($body.find(`${OS_CHOOSER.popup}:visible`).length) {
      cy.get(OS_CHOOSER.closeBtn, { timeout: 8000 }).filter(':visible').first().click({ force: true });
    }
  });
  cy.get(OS_CHOOSER.popup, { timeout: 8000 }).should('not.be.visible');
});

/** Locate the Offline Step card in the open chooser (by its .step-text label). */
Cypress.Commands.add('findOfflineStepCard', () => {
  return cy
    .get(OS_CHOOSER.stepCard, { timeout: 15000 })
    .filter((_i, el) => new RegExp(String.raw`^\s*${OS_STEP_LABEL}\s*$`, 'i').test(el.textContent || ''))
    .first();
});

/** Open chooser then click the Offline Step card → metadata wizard (#formsModal). */
Cypress.Commands.add('openOfflineStepWizard', () => {
  cy.openOfflineStepChooser();
  cy.findOfflineStepCard()
    .scrollIntoView()
    .then(($card) => $card[0].click());
  cy.get(OS_WIZARD.modal, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('offline-step-wizard-open');
});

/** Close the wizard without saving (Cancel button → esc fallback). */
Cypress.Commands.add('cancelOfflineStepWizard', () => {
  cy.get('body').then(($b) => {
    if ($b.find(`${OS_WIZARD.cancelBtn}:visible`).length) {
      cy.get(OS_WIZARD.cancelBtn).filter(':visible').first().click({ force: true });
    } else {
      cy.get('body').type('{esc}');
    }
  });
  cy.get(OS_WIZARD.modal, { timeout: 10000 }).should('not.be.visible');
});

/**
 * Create an Offline Step end-to-end via the shared createTestStep pipeline.
 * createTestStep selects the chooser card by visible label and submits the
 * wizard; for non-GenericStep types it skips the Generic-Step-specific canvas
 * assertions, landing on the standard editor canvas for the new step.
 */
Cypress.Commands.add('createOfflineStep', () => {
  cy.createTestStep(OS_STEP_LABEL);
  cy.waitForLoaderGone();
  cy.get(OS_CANVAS.desktop, { timeout: 25000 }).should('exist');
  cy.captureLiveStep('offline-step-canvas-ready');
});

/** Open the per-step kebab menu (Clone / Edit Metadata / Delete) for the active step. */
Cypress.Commands.add('openOfflineStepTocMenu', () => {
  cy.get(OS_TOC.activeStep, { timeout: 12000 })
    .first()
    .parents(OS_TOC.stepRows)
    .first()
    .find(OS_TOC.kebab)
    .first()
    .click({ force: true });
  cy.get(OS_TOC.menu, { timeout: 8000 }).filter(':visible').first().should('be.visible');
});

export {};
