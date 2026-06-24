/// <reference types="cypress" />
// =============================================================================
// Right Layout (layout-3) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.captureLiveStep
//
// IMPORTANT — Right is a LAYOUT, not an assessment widget:
//   "layout-3" is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Right'), NOT into a Generic Step column.
// =============================================================================

import { LAYOUT_CANVAS, LAYOUT_SETTINGS, LAYOUT_WIDGET_NAME } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureRightLayoutDeepSetup(options?: {
        through?: 'canvas' | 'dropped';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropRightLayoutIntoCanvas(): Chainable<void>;
      openRightLayoutSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureRightLayoutDeepSetup', (options = {}) => {
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

  cy.dropRightLayoutIntoCanvas();
});

Cypress.Commands.add('dropRightLayoutIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${LAYOUT_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Right layout already present on canvas');
      return;
    }
    cy.dropComponent(LAYOUT_WIDGET_NAME);
  });

  cy.get(LAYOUT_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-right-layout');
});

Cypress.Commands.add('openRightLayoutSettings', () => {
  cy.get(`#desktop_view .sd-item ${LAYOUT_CANVAS.widget}, #desktop_view ${LAYOUT_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(LAYOUT_SETTINGS.panel, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('right-layout-settings-panel-open');
});

export {};
