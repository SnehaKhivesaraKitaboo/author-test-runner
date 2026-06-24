/// <reference types="cypress" />
// =============================================================================
// Click to Reveal component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Click to Reveal is an ELEMENT, not an assessment widget:
//   `clickToReveal` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so
//   the framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Click to Reveal'), which injects the catalog widget
//   { name: "Click to Reveal", dataType: "clickToReveal" } onto the unrestricted
//   canvas. It is NOT dropped into a Generic Step column.
//
//   The component is a SINGLE card. There is no per-card "add reveal panel"
//   control in the authoring DOM; "add another panel" = dropping another Click
//   to Reveal component (addClickToRevealPanel). This keeps the add/remove of
//   reveal panels DOM-assertable.
// =============================================================================

import { CTR_CANVAS, CTR_SETTINGS, CTR_WIDGET_NAME } from './selectors';
import { CTR_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureClickToRevealDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropClickToRevealIntoCanvas(): Chainable<void>;
      addClickToRevealPanel(): Chainable<void>;
      fillClickToRevealDummyContent(): Chainable<void>;
      openClickToRevealSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureClickToRevealDeepSetup', (options = {}) => {
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

  cy.dropClickToRevealIntoCanvas();
  if (through === 'dropped') return;

  cy.fillClickToRevealDummyContent();
});

Cypress.Commands.add('dropClickToRevealIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item .clickToReveal`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Click to Reveal element already present on canvas');
      return;
    }
    // Element drop → canvas (clickToReveal is not an assessment widget).
    cy.dropComponent(CTR_WIDGET_NAME);
  });

  cy.get(CTR_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-click-to-reveal');
});

Cypress.Commands.add('addClickToRevealPanel', () => {
  // A "reveal panel" is one Click to Reveal card. Adding another panel = drop
  // another card onto the canvas (DOM-assertable via increased card count).
  cy.navigateToCanvasPage();
  cy.dropComponent(CTR_WIDGET_NAME);
  cy.get(CTR_CANVAS.component, { timeout: 20000 }).should('have.length.greaterThan', 1);
  cy.captureLiveStep('click-to-reveal-panel-added');
});

Cypress.Commands.add('fillClickToRevealDummyContent', () => {
  cy.get(CTR_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(CTR_CANVAS.header, { timeout: 12000 }).first().setContentEditableOn(CTR_DATA.header);
  cy.get(CTR_CANVAS.description).first().setContentEditableOn(CTR_DATA.description);
  cy.captureLiveStep('click-to-reveal-dummy-content-entered');
});

Cypress.Commands.add('openClickToRevealSettings', () => {
  cy.get(`#desktop_view .sd-item ${CTR_CANVAS.component}, #desktop_view ${CTR_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(CTR_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('click-to-reveal-settings-panel-open');
});

export {};
