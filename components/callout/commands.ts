/// <reference types="cypress" />
// =============================================================================
// Callout Box (sidebarComponent) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Callout Box is an ELEMENT, not an assessment widget:
//   `sidebarComponent` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES,
//   so the framework routes it to the canvas (resolveDropTarget → 'canvas'). It
//   is dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Callout Box'), which injects the catalog widget
//   { name: "Callout Box", dataType: "sidebarComponent" } onto the unrestricted
//   canvas. It is NOT dropped into a Generic Step column.
//
//   Default layout is style3 ("Take Note" card) per sidebar.json — style3/style4
//   render the body (.sidebarCaption) but NOT the header (.sc-intro), so dummy
//   content is written into the body field.
// =============================================================================

import { CALLOUT_CANVAS, CALLOUT_SETTINGS, CALLOUT_WIDGET_NAME } from './selectors';
import { CALLOUT_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureCalloutDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropCalloutIntoCanvas(): Chainable<void>;
      fillCalloutDummyContent(): Chainable<void>;
      openCalloutSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureCalloutDeepSetup', (options = {}) => {
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

  cy.dropCalloutIntoCanvas();
  if (through === 'dropped') return;

  cy.fillCalloutDummyContent();
});

Cypress.Commands.add('dropCalloutIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${CALLOUT_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Callout Box element already present on canvas');
      return;
    }
    // Element drop → canvas (sidebarComponent is not an assessment widget).
    cy.dropComponent(CALLOUT_WIDGET_NAME);
  });

  cy.get(CALLOUT_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-callout');
});

Cypress.Commands.add('fillCalloutDummyContent', () => {
  cy.get(CALLOUT_CANVAS.widget, { timeout: 12000 }).first().should('exist');
  // Default layout (style3/style4) renders the body field, not the header field.
  cy.get(CALLOUT_CANVAS.body, { timeout: 12000 }).first().setContentEditableOn(CALLOUT_DATA.body);
  cy.captureLiveStep('callout-dummy-content-entered');
});

Cypress.Commands.add('openCalloutSettings', () => {
  cy.get(`#desktop_view .sd-item ${CALLOUT_CANVAS.widget}, #desktop_view ${CALLOUT_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(CALLOUT_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.get(CALLOUT_SETTINGS.title, { timeout: 10000 }).should('contain.text', 'Callout Box');
  cy.captureLiveStep('callout-settings-panel-open');
});

export {};
