/// <reference types="cypress" />
// =============================================================================
// HTML Interactivity (html-interactivity) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — HTML Interactivity is an ELEMENT, not an assessment widget:
//   `html-interactivity` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES,
//   so the framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('HTML Interactivity'), which injects the catalog widget
//   { name: "HTML Interactivity", dataType: "html-interactivity" } onto the
//   unrestricted canvas. It is NOT dropped into a Generic Step column.
// =============================================================================

import { HI_CANVAS, HI_SETTINGS, HI_WIDGET_NAME } from './selectors';
import { HI_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureHtmlInteractivityDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropHtmlInteractivityIntoCanvas(): Chainable<void>;
      fillHtmlInteractivityDummyContent(): Chainable<void>;
      openHtmlInteractivitySettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureHtmlInteractivityDeepSetup', (options = {}) => {
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

  cy.dropHtmlInteractivityIntoCanvas();
  if (through === 'dropped') return;

  cy.fillHtmlInteractivityDummyContent();
});

Cypress.Commands.add('dropHtmlInteractivityIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${HI_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ HTML Interactivity element already present on canvas');
      return;
    }
    // Element drop → canvas (html-interactivity is not an assessment widget).
    cy.dropComponent(HI_WIDGET_NAME);
  });

  cy.get(HI_CANVAS.styleSet, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-html-interactivity');
});

Cypress.Commands.add('fillHtmlInteractivityDummyContent', () => {
  cy.get(HI_CANVAS.styleSet, { timeout: 12000 }).first().should('exist');
  // Header is gated by settings.isHeaderText (default true). Degrade gracefully
  // if the contenteditable header is not rendered in this build/context.
  cy.get('body').then(($body) => {
    if ($body.find(HI_CANVAS.header).length === 0) {
      cy.log('ℹ Header field not rendered (isHeaderText off in this build) — skipping content fill');
      return;
    }
    cy.get(HI_CANVAS.header).first().setContentEditableOn(HI_DATA.header);
  });
  cy.captureLiveStep('html-interactivity-dummy-content-entered');
});

Cypress.Commands.add('openHtmlInteractivitySettings', () => {
  cy.get(`#desktop_view .sd-item ${HI_CANVAS.styleSet}, #desktop_view ${HI_CANVAS.styleSet}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(HI_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('html-interactivity-settings-panel-open');
});

export {};
