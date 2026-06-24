/// <reference types="cypress" />
// =============================================================================
// CLIC (Sketchpad) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — CLIC is an ELEMENT, not an assessment widget:
//   `sketchpad` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('CLIC Component'), which injects the catalog widget
//   { name: "CLIC Component", dataType: "sketchpad" } onto the unrestricted
//   canvas. It is NOT dropped into a Generic Step column.
// =============================================================================

import { CLIC_CANVAS, CLIC_SETTINGS, CLIC_WIDGET_NAME } from './selectors';
import { CLIC_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureClicDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropClicIntoCanvas(): Chainable<void>;
      fillClicDummyContent(): Chainable<void>;
      openClicSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureClicDeepSetup', (options = {}) => {
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

  cy.dropClicIntoCanvas();
  if (through === 'dropped') return;

  cy.fillClicDummyContent();
});

Cypress.Commands.add('dropClicIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${CLIC_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ CLIC (Sketchpad) element already present on canvas');
      return;
    }
    // Element drop → canvas (sketchpad is not an assessment widget).
    cy.dropComponent(CLIC_WIDGET_NAME);
  });

  cy.get(CLIC_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-clic');
});

Cypress.Commands.add('fillClicDummyContent', () => {
  cy.get(CLIC_CANVAS.widget, { timeout: 12000 }).first().should('exist');
  cy.get('body').then(($body) => {
    // The CLIC Assignment form only renders while !issubmitted. If a prior
    // submit swapped to the iframe view, log + return gracefully.
    if ($body.find(CLIC_CANVAS.clicIdentifier).length === 0) {
      cy.log('ℹ CLIC form not in input state (submitted/iframe view) — skipping content fill');
      return;
    }
    cy.get(CLIC_CANVAS.clicIdentifier).first().setContentEditableOn(CLIC_DATA.identifier);
    cy.get(CLIC_CANVAS.instanceName).first().setContentEditableOn(CLIC_DATA.instanceName);
  });
  cy.captureLiveStep('clic-dummy-content-entered');
});

Cypress.Commands.add('openClicSettings', () => {
  cy.get(`#desktop_view .sd-item ${CLIC_CANVAS.widget}, #desktop_view ${CLIC_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  // CLIC has no dedicated settings template; clicking runs displaySettingPanel()
  // which mounts the shared .componentSettingPanel. Presence is flag/runtime
  // dependent, so callers should guard with a presence check.
  cy.get('body').then(($body) => {
    if ($body.find(CLIC_SETTINGS.panel).length === 0) {
      cy.log('ℹ CLIC settings: no dedicated settings panel mounted (CLIC has no settings template on disk)');
      return;
    }
    cy.get(CLIC_SETTINGS.panel, { timeout: 8000 }).should('exist');
  });
  cy.captureLiveStep('clic-settings-attempted');
});

export {};
