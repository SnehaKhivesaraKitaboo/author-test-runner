/// <reference types="cypress" />
// =============================================================================
// Graphic Organizer (Image-based) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Image GO is an ELEMENT, not an assessment widget:
//   `graphicOrganizerImageHotSpot` is NOT in support/module-setup.ts
//   ASSESSMENT_DATA_TYPES, so the framework routes it to the canvas
//   (resolveDropTarget → 'canvas'). It is dropped onto the
//   Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('graphicOrganizerImageHotSpot') — NOT a Generic Step column.
//   (dropComponent matches the catalog widget by name OR dataType.)
// =============================================================================

import { GO_CANVAS, GO_DATA_TYPE, GO_SETTINGS } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureGraphicOrganizerDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'hotspot';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropGraphicOrganizerIntoCanvas(): Chainable<void>;
      addGraphicOrganizerHotspot(): Chainable<void>;
      openGraphicOrganizerSettings(): Chainable<void>;
      openGraphicOrganizerHotspotSettings(index?: number): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureGraphicOrganizerDeepSetup', (options = {}) => {
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

  cy.dropGraphicOrganizerIntoCanvas();
  if (through === 'dropped') return;

  cy.addGraphicOrganizerHotspot();
});

Cypress.Commands.add('dropGraphicOrganizerIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${GO_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Graphic Organizer already present on canvas');
      return;
    }
    // Element drop → canvas (graphicOrganizerImageHotSpot is not an assessment widget).
    cy.dropComponent(GO_DATA_TYPE);
  });

  cy.get(GO_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-graphic-organizer');
});

Cypress.Commands.add('addGraphicOrganizerHotspot', () => {
  cy.get(GO_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(GO_CANVAS.hotspotContainer).then(($container) => {
    const before = $container.find('.inputDiv').length;
    cy.get(GO_CANVAS.addHotspotBtn).first().click({ force: true });
    cy.get(GO_CANVAS.hotspot, { timeout: 10000 }).should('have.length.greaterThan', before);
  });
  cy.captureLiveStep('graphic-organizer-hotspot-added');
});

Cypress.Commands.add('openGraphicOrganizerSettings', () => {
  cy.get(`#desktop_view .sd-item ${GO_CANVAS.component}, #desktop_view ${GO_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(GO_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('graphic-organizer-settings-panel-open');
});

Cypress.Commands.add('openGraphicOrganizerHotspotSettings', (index = 0) => {
  // Clicking a hotspot textarea fires scope.showSetting → reveals the per-hotspot
  // "Text Input" form (showTextSetting) inside the settings panel.
  cy.get(GO_CANVAS.hotspotTextarea, { timeout: 12000 }).eq(index).click({ force: true });
  cy.get(GO_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('graphic-organizer-hotspot-settings-open');
});

export {};
