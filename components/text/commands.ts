/// <reference types="cypress" />
// =============================================================================
// Text (paragraph) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Text is an ELEMENT, not an assessment widget:
//   `paragraph` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Text'), which injects the catalog widget
//   { name: "Text", dataType: "paragraph" } onto the unrestricted canvas.
//   It is NOT dropped into a Generic Step column.
// =============================================================================

import { TEXT_CANVAS, TEXT_SETTINGS, TEXT_WIDGET_NAME } from './selectors';
import { TEXT_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureTextDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropTextIntoCanvas(): Chainable<void>;
      fillTextDummyContent(): Chainable<void>;
      openTextSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureTextDeepSetup', (options = {}) => {
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

  cy.dropTextIntoCanvas();
  if (through === 'dropped') return;

  cy.fillTextDummyContent();
});

Cypress.Commands.add('dropTextIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${TEXT_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Text element already present on canvas');
      return;
    }
    // Element drop → canvas (paragraph is not an assessment widget).
    cy.dropComponent(TEXT_WIDGET_NAME);
  });

  cy.get(TEXT_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-text');
});

Cypress.Commands.add('fillTextDummyContent', () => {
  cy.get(TEXT_CANVAS.widget, { timeout: 12000 }).first().should('exist');
  cy.get(TEXT_CANVAS.body, { timeout: 12000 }).first().setContentEditableOn(TEXT_DATA.body);
  cy.captureLiveStep('text-dummy-content-entered');
});

Cypress.Commands.add('openTextSettings', () => {
  cy.get(`#desktop_view .sd-item ${TEXT_CANVAS.widget}, #desktop_view ${TEXT_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(TEXT_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('text-settings-panel-open');
});

export {};
