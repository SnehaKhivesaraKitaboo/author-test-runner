/// <reference types="cypress" />
// =============================================================================
// Extended Response about Media component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// Extended Response about Media (identify-the-clip) is an assessment widget
// dropped into a Generic Step column (registered in support/module-setup.ts).
// =============================================================================

import { ERM_CANVAS, ERM_DATA_TYPE, ERM_SETTINGS } from './selectors';
import { ERM_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureErmDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropErmIntoGenericStepColumn(): Chainable<void>;
      fillErmDummyContent(): Chainable<void>;
      openErmSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureErmDeepSetup', (options = {}) => {
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

  cy.dropErmIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillErmDummyContent();
});

Cypress.Commands.add('dropErmIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${ERM_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Extended Response about Media already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule('Extended Response about Media', {
      dataType: ERM_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(ERM_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-extended-response-media');
});

Cypress.Commands.add('fillErmDummyContent', () => {
  cy.get(ERM_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(ERM_CANVAS.question).first().setContentEditableOn(ERM_DATA.question);
  cy.captureLiveStep('extended-response-media-dummy-content-entered');
});

Cypress.Commands.add('openErmSettings', () => {
  cy.get(`.generic-step-column-content ${ERM_CANVAS.component}, #desktop_view ${ERM_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(ERM_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('extended-response-media-settings-panel-open');
});

export {};
