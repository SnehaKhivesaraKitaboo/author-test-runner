/// <reference types="cypress" />
// =============================================================================
// Correction component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// Correction (dataType "correction") is an assessment widget dropped into a
// Generic Step column (registered in support/module-setup.ts ASSESSMENT_DATA_TYPES).
// Mirrors the Extended Response (shortLongAns) sibling drop flow.
// =============================================================================

import { CORRECTION_CANVAS, CORRECTION_DATA_TYPE, CORRECTION_SETTINGS, CORRECTION_WIDGET_NAME } from './selectors';
import { CORRECTION_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureCorrectionDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropCorrectionIntoGenericStepColumn(): Chainable<void>;
      fillCorrectionDummyContent(): Chainable<void>;
      openCorrectionSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureCorrectionDeepSetup', (options = {}) => {
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

  cy.dropCorrectionIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillCorrectionDummyContent();
});

Cypress.Commands.add('dropCorrectionIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${CORRECTION_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Correction already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule(CORRECTION_WIDGET_NAME, {
      dataType: CORRECTION_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(CORRECTION_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-correction');
});

Cypress.Commands.add('fillCorrectionDummyContent', () => {
  cy.get(CORRECTION_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(CORRECTION_CANVAS.sentenceText, { timeout: 12000 }).first().setContentEditableOn(CORRECTION_DATA.sentence);
  cy.captureLiveStep('correction-dummy-content-entered');
});

Cypress.Commands.add('openCorrectionSettings', () => {
  cy.get(`.generic-step-column-content ${CORRECTION_CANVAS.component}, #desktop_view ${CORRECTION_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(CORRECTION_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('correction-settings-panel-open');
});

export {};
