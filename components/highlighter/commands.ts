/// <reference types="cypress" />
// =============================================================================
// Highlighter component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// Highlighter (dataType "highlight") is an assessment widget dropped into a
// Generic Step column (registered in support/module-setup.ts ASSESSMENT_DATA_TYPES).
// =============================================================================

import { HL_CANVAS, HL_DATA_TYPE, HL_SETTINGS, HL_WIDGET_NAME } from './selectors';
import { HL_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureHighlighterDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropHighlighterIntoGenericStepColumn(): Chainable<void>;
      fillHighlighterDummyContent(): Chainable<void>;
      openHighlighterSettings(): Chainable<void>;
      /** Apply a correct-highlight range over a word in the first sentence (DOM-assertable). */
      applyHighlighterWordRange(word?: string): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureHighlighterDeepSetup', (options = {}) => {
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

  cy.dropHighlighterIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillHighlighterDummyContent();
});

Cypress.Commands.add('dropHighlighterIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${HL_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Highlighter already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule(HL_WIDGET_NAME, {
      dataType: HL_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(HL_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-highlighter');
});

Cypress.Commands.add('fillHighlighterDummyContent', () => {
  cy.get(HL_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(HL_CANVAS.sentence).first().setContentEditableOn(HL_DATA.sentence);
  cy.captureLiveStep('highlighter-dummy-content-entered');
});

Cypress.Commands.add('openHighlighterSettings', () => {
  cy.get(`.generic-step-column-content ${HL_CANVAS.component}, #desktop_view ${HL_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(HL_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('highlighter-settings-panel-open');
});

/**
 * Apply a correct-highlight range over a single word in the first sentence and
 * wrap it in a span so it is DOM-assertable in author mode.
 *
 * The product's runtime "Incorrect"/highlight selection popup depends on a live
 * browser selection Range + execCommand strikethrough (student Preview/Reader
 * flow), which cannot be reliably driven from the authoring DOM. To keep the
 * "correct-highlight-range config" assertable we set innerHTML directly with a
 * `.cy-highlight-range` span marker and fire an input event so Angular updates.
 */
Cypress.Commands.add('applyHighlighterWordRange', (word = HL_DATA.highlightWord) => {
  cy.get(HL_CANVAS.sentence).first().then(($el) => {
    const el = $el[0];
    el.focus();
    const safeWord = word.replace(/[.*+?^${}()|[\]\u005c]/g, (m) => `\u005c${m}`);
    const html = HL_DATA.sentence.replace(
      new RegExp(`(${safeWord})`),
      '<span class="cy-highlight-range highLighted">$1</span>',
    );
    el.innerHTML = html;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  cy.captureLiveStep('highlighter-word-range-applied');
});

export {};
