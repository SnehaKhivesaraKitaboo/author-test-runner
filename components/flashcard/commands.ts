/// <reference types="cypress" />
// =============================================================================
// Flashcard component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Flashcard is a CONTENT widget, not an assessment widget:
//   `flashcard` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Flashcard'), which injects the catalog widget
//   { name: "Flashcard", dataType: "flashcard" } onto the unrestricted canvas.
//   It is NOT dropped into a Generic Step column.
// =============================================================================

import { FC_CANVAS, FC_SETTINGS, FC_WIDGET_NAME } from './selectors';
import { FC_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureFlashcardDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropFlashcardIntoCanvas(): Chainable<void>;
      fillFlashcardDummyContent(): Chainable<void>;
      addFlashcardCard(): Chainable<void>;
      openFlashcardSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureFlashcardDeepSetup', (options = {}) => {
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

  cy.dropFlashcardIntoCanvas();
  if (through === 'dropped') return;

  cy.fillFlashcardDummyContent();
});

Cypress.Commands.add('dropFlashcardIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${FC_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Flashcard already present on canvas');
      return;
    }
    // Content widget drop → canvas (flashcard is not an assessment widget).
    cy.dropComponent(FC_WIDGET_NAME);
  });

  cy.get(FC_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-flashcard');
});

Cypress.Commands.add('fillFlashcardDummyContent', () => {
  cy.get(FC_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(FC_CANVAS.frontText, { timeout: 12000 }).first().setContentEditableOn(FC_DATA.frontText);
  cy.captureLiveStep('flashcard-dummy-content-entered');
});

Cypress.Commands.add('addFlashcardCard', () => {
  cy.get(FC_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(FC_CANVAS.slide).then(($slides) => {
    const before = $slides.length;
    cy.get(FC_CANVAS.addCard).first().click({ force: true });
    cy.get(FC_CANVAS.slide, { timeout: 12000 }).should('have.length.greaterThan', before);
  });
  cy.captureLiveStep('flashcard-card-added');
});

Cypress.Commands.add('openFlashcardSettings', () => {
  cy.get(`#desktop_view .sd-item ${FC_CANVAS.component}, #desktop_view ${FC_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(FC_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('flashcard-settings-panel-open');
});

export {};
