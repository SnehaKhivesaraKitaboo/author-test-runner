/// <reference types="cypress" />
// =============================================================================
// Wordsearch component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Wordsearch is an ELEMENT, not an assessment widget:
//   `wordsearch` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Word Search'), which matches the catalog widget
//   { name: "Word Search", dataType: "wordsearch" } by name. It is NOT dropped
//   into a Generic Step column (mirrors the Text element sibling).
//
//   Adding a word: the Hidden Word field (#hiddenWordInput) is contenteditable
//   bound to ng-model `textData`; the ADD button reads scope.textData. We set
//   scope.textData on the wordsearch-template scope and invoke onAddButtonClick,
//   which is the same path the real ADD button triggers (DOM-assertable result
//   in .wordListRepeat). Words are stored UPPERCASE and de-duplicated.
// =============================================================================

import { WS_CANVAS, WS_SETTINGS, WS_WIDGET_NAME } from './selectors';
import { WS_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureWordsearchDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropWordsearchIntoCanvas(): Chainable<void>;
      fillWordsearchDummyContent(): Chainable<void>;
      openWordsearchSettings(): Chainable<void>;
      /** Add a word via the directive scope (mirrors the ADD button path). */
      addWordsearchWord(word: string): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureWordsearchDeepSetup', (options = {}) => {
  const through = options.through || 'content';
  const skipCanvasNav = options.skipCanvasNav ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (hasEditor) return;
    cy.openAuthoringTool(url);
  });

  if (!skipCanvasNav) {
    cy.navigateToCanvasPage();
  }

  if (through === 'canvas') return;

  cy.dropWordsearchIntoCanvas();
  if (through === 'dropped') return;

  cy.fillWordsearchDummyContent();
});

Cypress.Commands.add('dropWordsearchIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${WS_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Wordsearch element already present on canvas');
      return;
    }
    // Element drop → canvas (wordsearch is not an assessment widget).
    cy.dropComponent(WS_WIDGET_NAME);
  });

  cy.get(WS_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-wordsearch');
});

Cypress.Commands.add('fillWordsearchDummyContent', () => {
  cy.get(WS_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get('body').then(($body) => {
    if ($body.find(WS_CANVAS.question).length) {
      cy.get(WS_CANVAS.question).first().setContentEditableOn(WS_DATA.question);
    }
  });
  cy.captureLiveStep('wordsearch-dummy-content-entered');
});

Cypress.Commands.add('openWordsearchSettings', () => {
  cy.get(`#desktop_view .sd-item ${WS_CANVAS.component}, #desktop_view ${WS_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(WS_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('wordsearch-settings-panel-open');
});

Cypress.Commands.add('addWordsearchWord', (word: string) => {
  // Set scope.textData on the wordsearch-template scope and invoke the same
  // handler the real ADD button calls. This is the source-true add path
  // (onAddButtonClick reads scope.textData), and yields a DOM-assertable row.
  cy.window().then((win) => {
    const ang = (win as any).angular;
    const $ = (win as any).$;
    const $tpl = $('[wordsearch-template]').first();
    if (!$tpl.length) throw new Error('wordsearch-template element not found on canvas');
    const scope = ang.element($tpl[0]).scope();
    if (!scope || typeof scope.onAddButtonClick !== 'function') {
      throw new Error('wordsearch scope.onAddButtonClick not available');
    }
    scope.textData = word;
    scope.onAddButtonClick({ preventDefault() {}, stopPropagation() {} });
    if (typeof scope.$apply === 'function' && !scope.$$phase) {
      scope.$apply();
    }
  });
});

export {};
