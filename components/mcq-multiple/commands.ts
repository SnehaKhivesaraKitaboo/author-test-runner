/// <reference types="cypress" />
// =============================================================================
// MCQ Multiple component commands — reusable workflows.
//
// MCQ Multiple === multiple-choice-template in "multiple" answer mode.
// We REUSE the MCQ (single) commands wholesale (ensureMcqDeepSetup,
// dropMcqIntoGenericStepColumn, fillMcqDummyContent, openMcqSettings,
// setMcqAnswerType, ensureMcqShowmeOn) by importing the MCQ commands module,
// then add a thin wrapper that guarantees the component is in MULTIPLE mode.
// =============================================================================

import '../mcq/commands';
import { MCQ_MULTI_CANVAS, MCQ_MULTI_SETTINGS } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Full prerequisite for MCQ Multiple: launch → Generic Step → drop MCQ →
       * fill content → switch answer type to MULTIPLE (so options are checkboxes).
       */
      ensureMcqMultipleDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content' | 'multiple';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      /** Open settings and set the answer type to multiple (checkboxes). */
      ensureMcqMultipleMode(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('ensureMcqMultipleDeepSetup', (options = {}) => {
  const through = options.through || 'multiple';
  const skipStepCreation = options.skipStepCreation ?? true;

  const innerThrough = through === 'multiple' ? 'content' : through;
  cy.ensureMcqDeepSetup({ through: innerThrough, skipStepCreation });

  if (through === 'multiple') {
    cy.ensureMcqMultipleMode();
  }
});

Cypress.Commands.add('ensureMcqMultipleMode', () => {
  cy.get(
    `.generic-step-column-content ${MCQ_MULTI_CANVAS.widget}, #desktop_view ${MCQ_MULTI_CANVAS.widget}`,
    { timeout: 12000 },
  )
    .first()
    .click({ force: true });
  cy.get(MCQ_MULTI_SETTINGS.panel, { timeout: 15000 }).should('be.visible');

  cy.get(MCQ_MULTI_SETTINGS.answerMultiple, { timeout: 8000 }).then(($el) => {
    if (!$el.is(':checked')) cy.wrap($el).check({ force: true });
  });
  cy.wait(400);
  // Verify the canvas now renders checkbox inputs.
  cy.get(MCQ_MULTI_CANVAS.optionInput, { timeout: 8000 }).should('exist');
  cy.captureLiveStep('mcq-multiple-mode-enabled');
});

export {};
