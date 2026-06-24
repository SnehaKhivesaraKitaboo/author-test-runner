/// <reference types="cypress" />
// =============================================================================
// Left Layout (layout-1) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.captureLiveStep
//
// IMPORTANT — Left is a LAYOUT, not an assessment widget:
//   "layout-1" is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Left'), which injects the catalog widget
//   { name: "Left", dataType: "layout-1" } onto the unrestricted canvas.
//   It is NOT dropped into a Generic Step column.
// =============================================================================

import { LAYOUT_CANVAS, LAYOUT_SETTINGS, LAYOUT_WIDGET_NAME } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureLeftLayoutDeepSetup(options?: {
        through?: 'canvas' | 'dropped';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropLeftLayoutIntoCanvas(): Chainable<void>;
      openLeftLayoutSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureLeftLayoutDeepSetup', (options = {}) => {
  const through = options.through || 'dropped';
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

  cy.dropLeftLayoutIntoCanvas();
});

Cypress.Commands.add('dropLeftLayoutIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${LAYOUT_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Left layout already present on canvas');
      return;
    }
    // Layout drop → canvas (layout-1 is not an assessment widget).
    cy.dropComponent(LAYOUT_WIDGET_NAME);
  });

  cy.get(LAYOUT_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-left-layout');
});

Cypress.Commands.add('openLeftLayoutSettings', () => {
  cy.get(`#desktop_view .sd-item ${LAYOUT_CANVAS.widget}, #desktop_view ${LAYOUT_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(LAYOUT_SETTINGS.panel, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('left-layout-settings-panel-open');
});

export {};
