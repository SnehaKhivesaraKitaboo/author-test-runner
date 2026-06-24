/// <reference types="cypress" />
// =============================================================================
// MCQ component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// MCQ uses the same Generic Step column drop mechanism as FIB; the drop target
// for dataType "multiple-choice-template" is already registered as an
// assessment widget in support/module-setup.ts.
// =============================================================================

import { MCQ_CANVAS, MCQ_DATA_TYPE, MCQ_SETTINGS } from './selectors';
import { MCQ_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      /** Full MCQ prerequisite: launch → Generic Step → drop MCQ → fill content. */
      ensureMcqDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      /** Drop the MCQ widget into the active Generic Step column. */
      dropMcqIntoGenericStepColumn(): Chainable<void>;
      /** Enter header + instruction + question + option text on the dropped MCQ. */
      fillMcqDummyContent(): Chainable<void>;
      /** Click the MCQ component and open #mcq-settings-panel. */
      openMcqSettings(): Chainable<void>;
      /** Switch answer type to 'single' or 'multiple'. */
      setMcqAnswerType(type: 'single' | 'multiple'): Chainable<void>;
      /** Enable Show Me so Label Types + Feedback sections render (ng-if isShowme). */
      ensureMcqShowmeOn(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureMcqDeepSetup', (options = {}) => {
  const through = options.through || 'content';
  const skipStepCreation = options.skipStepCreation ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (!hasEditor) {
      cy.openAuthoringTool(url);
      if (skipStepCreation) cy.ensureOnFibGenericStep();
    }
  });

  if (!skipStepCreation) {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  cy.dropMcqIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillMcqDummyContent();
});

Cypress.Commands.add('dropMcqIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${MCQ_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ MCQ already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule('Multiple Choice', {
      dataType: MCQ_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(`.generic-step-column-content ${MCQ_CANVAS.widget}, #desktop_view ${MCQ_CANVAS.widget}`, {
    timeout: 20000,
  }).should('exist');
  cy.captureLiveStep('widget-dropped-multiple-choice-template');
});

Cypress.Commands.add('fillMcqDummyContent', () => {
  cy.get(MCQ_CANVAS.component, { timeout: 12000 }).first().should('exist');

  cy.get(MCQ_CANVAS.header).first().setContentEditableOn(MCQ_DATA.header);
  cy.get(MCQ_CANVAS.question).first().setContentEditableOn(MCQ_DATA.question);

  cy.get(MCQ_CANVAS.optionText).then(($opts) => {
    const count = Math.min($opts.length, MCQ_DATA.options.length);
    for (let i = 0; i < count; i++) {
      cy.get(MCQ_CANVAS.optionText).eq(i).setContentEditableOn(MCQ_DATA.options[i]);
    }
  });

  cy.captureLiveStep('mcq-dummy-content-entered');
});

Cypress.Commands.add('openMcqSettings', () => {
  cy.get(`.generic-step-column-content ${MCQ_CANVAS.widget}, #desktop_view ${MCQ_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(MCQ_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('mcq-settings-panel-open');
});

Cypress.Commands.add('setMcqAnswerType', (type: 'single' | 'multiple') => {
  const target = type === 'single' ? MCQ_SETTINGS.answerSingle : MCQ_SETTINGS.answerMultiple;
  cy.get(target, { timeout: 8000 }).check({ force: true });
  cy.wait(400);
});

Cypress.Commands.add('ensureMcqShowmeOn', () => {
  cy.get(MCQ_SETTINGS.showMe, { timeout: 8000 }).then(($el) => {
    if (!$el.is(':checked')) cy.wrap($el).check({ force: true });
  });
  cy.wait(400);
});

export {};
