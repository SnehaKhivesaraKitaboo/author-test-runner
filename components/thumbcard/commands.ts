/// <reference types="cypress" />
// =============================================================================
// Thumbs Card Header (thumbcard) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Thumbs Card Header is an ELEMENT, not an assessment widget:
//   "thumbs-card-header" is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES,
//   so the framework routes it to the canvas (resolveDropTarget -> 'canvas'). It
//   is dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Thumbs Card Header'), which injects the catalog widget
//   { name: "Thumbs Card Header", dataType: "thumbs-card-header" } onto the
//   unrestricted canvas. It is NOT dropped into a Generic Step column.
//
// FLAG-GATED: config.js sets "thumbs-card-header": false for most subjects and
//   true only for a few. When the widget is not offered in the active catalog,
//   dropThumbcardIntoCanvas logs + returns gracefully (no hard failure), and the
//   dependent tests then short-circuit on the missing widget assertion.
//
// SINGLE-HEADER source: the component is one icon + one editable heading. There
//   is no "add card" action in the source DOM, so addThumbcardCard documents
//   that fact (log + return) rather than inventing a non-existent control.
// =============================================================================

import { THUMBCARD_CANVAS, THUMBCARD_SETTINGS, THUMBCARD_WIDGET_NAME } from './selectors';
import { THUMBCARD_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureThumbcardDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropThumbcardIntoCanvas(): Chainable<void>;
      fillThumbcardDummyContent(): Chainable<void>;
      addThumbcardCard(): Chainable<void>;
      openThumbcardSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureThumbcardDeepSetup', (options = {}) => {
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

  cy.dropThumbcardIntoCanvas();
  if (through === 'dropped') return;

  cy.fillThumbcardDummyContent();
});

Cypress.Commands.add('dropThumbcardIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${THUMBCARD_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Thumbs Card Header element already present on canvas');
      return;
    }
    // Element drop -> canvas (thumbs-card-header is not an assessment widget).
    // FLAG-GATED: if the catalog does not offer the widget, log + return.
    cy.dropComponent(THUMBCARD_WIDGET_NAME);
  });

  cy.captureLiveStep('widget-dropped-thumbcard');
});

Cypress.Commands.add('fillThumbcardDummyContent', () => {
  cy.get('body').then(($body) => {
    if ($body.find(THUMBCARD_CANVAS.widget).length === 0) {
      cy.log('ℹ Thumbs Card Header not present (flag-gated / not offered) — skipping content fill');
      return;
    }
    cy.get(THUMBCARD_CANVAS.heading, { timeout: 12000 }).first().setContentEditableOn(THUMBCARD_DATA.heading);
    cy.captureLiveStep('thumbcard-dummy-content-entered');
  });
});

// The source DOM is a SINGLE header (icon + one heading); there is no "add card"
// control. This command documents that fact rather than inventing a selector.
Cypress.Commands.add('addThumbcardCard', () => {
  cy.log(
    'ℹ Thumbs Card Header is a single-header element in the source DOM — no "add card" action exists; ' +
      'multi-card "add/remove" QC wording does not map to this component (see THUMBCARD-DEEP-AUTOMATION.md)',
  );
});

Cypress.Commands.add('openThumbcardSettings', () => {
  cy.get(`#desktop_view .sd-item ${THUMBCARD_CANVAS.widget}, #desktop_view ${THUMBCARD_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(THUMBCARD_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('thumbcard-settings-panel-open');
});

export {};
