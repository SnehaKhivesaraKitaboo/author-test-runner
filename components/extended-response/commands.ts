/// <reference types="cypress" />
// =============================================================================
// Extended Response component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// Extended Response (shortLongAns) is an assessment widget dropped into a
// Generic Step column (registered in support/module-setup.ts).
// =============================================================================

import { ER_CANVAS, ER_DATA_TYPE, ER_SETTINGS } from './selectors';
import { ER_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureErDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropErIntoGenericStepColumn(): Chainable<void>;
      fillErDummyContent(): Chainable<void>;
      openErSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureErDeepSetup', (options = {}) => {
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

  cy.dropErIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillErDummyContent();
});

Cypress.Commands.add('dropErIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${ER_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Extended Response already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule('Extended Response', {
      dataType: ER_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(ER_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-extended-response');
});

Cypress.Commands.add('fillErDummyContent', () => {
  cy.get(ER_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(ER_CANVAS.question).first().setContentEditableOn(ER_DATA.question);
  cy.captureLiveStep('extended-response-dummy-content-entered');
});

Cypress.Commands.add('openErSettings', () => {
  cy.get(`.generic-step-column-content ${ER_CANVAS.component}, #desktop_view ${ER_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(ER_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('extended-response-settings-panel-open');
});

export {};
