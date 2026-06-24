/// <reference types="cypress" />
// =============================================================================
// True or False component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// True/False uses the same Generic Step column drop mechanism as FIB/MCQ; the
// drop target for dataType "true-false-template" is already registered as an
// assessment widget in support/module-setup.ts.
// =============================================================================

import { TF_CANVAS, TF_DATA_TYPE, TF_SETTINGS } from './selectors';
import { TF_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      /** Full TF prerequisite: launch → Generic Step → drop TF → fill content. */
      ensureTfDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      /** Drop the True/False widget into the active Generic Step column. */
      dropTfIntoGenericStepColumn(): Chainable<void>;
      /** Enter header + instruction + question + option text on the dropped TF. */
      fillTfDummyContent(): Chainable<void>;
      /** Click the TF component and open #mcq-settings-panel. */
      openTfSettings(): Chainable<void>;
      /** Enable Show Me so Feedback section renders (ng-if isShowme). */
      ensureTfShowmeOn(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureTfDeepSetup', (options = {}) => {
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

  if (!skipStepCreation) {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  cy.dropTfIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillTfDummyContent();
});

Cypress.Commands.add('dropTfIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${TF_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ True/False already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule('True or False', {
      dataType: TF_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(`.generic-step-column-content ${TF_CANVAS.widget}, #desktop_view ${TF_CANVAS.widget}`, {
    timeout: 20000,
  }).should('exist');
  cy.captureLiveStep('widget-dropped-true-false-template');
});

Cypress.Commands.add('fillTfDummyContent', () => {
  cy.get(TF_CANVAS.component, { timeout: 12000 }).first().should('exist');

  cy.get(TF_CANVAS.header).first().setContentEditableOn(TF_DATA.header);
  cy.get(TF_CANVAS.question).first().setContentEditableOn(TF_DATA.question);

  cy.get(TF_CANVAS.optionText).then(($opts) => {
    const count = Math.min($opts.length, TF_DATA.options.length);
    for (let i = 0; i < count; i++) {
      cy.get(TF_CANVAS.optionText).eq(i).setContentEditableOn(TF_DATA.options[i]);
    }
  });

  cy.captureLiveStep('tf-dummy-content-entered');
});

Cypress.Commands.add('openTfSettings', () => {
  cy.get(`.generic-step-column-content ${TF_CANVAS.widget}, #desktop_view ${TF_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(TF_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('tf-settings-panel-open');
});

Cypress.Commands.add('ensureTfShowmeOn', () => {
  cy.get(TF_SETTINGS.showMe, { timeout: 8000 }).then(($el) => {
    if (!$el.is(':checked')) cy.wrap($el).check({ force: true });
  });
  cy.wait(400);
});

export {};
