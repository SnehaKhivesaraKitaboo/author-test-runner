/// <reference types="cypress" />
// =============================================================================
// Carousel (slideshow) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Carousel is an ELEMENT, not an assessment widget:
//   `slideshow` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Carousel'), which injects the catalog widget
//   { name: "Carousel"/"Slideshow", dataType: "slideshow" } onto the unrestricted
//   canvas. It is NOT dropped into a Generic Step column.
// =============================================================================

import { CAROUSEL_CANVAS, CAROUSEL_DATA_TYPE, CAROUSEL_SETTINGS } from './selectors';
import { CAROUSEL_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureCarouselDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropCarouselIntoCanvas(): Chainable<void>;
      fillCarouselDummyContent(): Chainable<void>;
      openCarouselSettings(): Chainable<void>;
      addCarouselSlide(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureCarouselDeepSetup', (options = {}) => {
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

  cy.dropCarouselIntoCanvas();
  if (through === 'dropped') return;

  cy.fillCarouselDummyContent();
});

Cypress.Commands.add('dropCarouselIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${CAROUSEL_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Carousel element already present on canvas');
      return;
    }
    // Element drop → canvas (slideshow is not an assessment widget). The catalog
    // exposes both "Carousel" and "Slideshow" but they share dataType "slideshow";
    // cy.dropComponent matches by name OR dataType, so drop by the stable dataType.
    cy.dropComponent(CAROUSEL_DATA_TYPE);
  });

  cy.get(CAROUSEL_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-carousel');
});

Cypress.Commands.add('fillCarouselDummyContent', () => {
  cy.get(CAROUSEL_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get('body').then(($body) => {
    if ($body.find(CAROUSEL_CANVAS.slideTitle).length > 0) {
      cy.get(CAROUSEL_CANVAS.slideTitle).first().setContentEditableOn(CAROUSEL_DATA.slideTitle);
    }
  });
  cy.captureLiveStep('carousel-dummy-content-entered');
});

Cypress.Commands.add('openCarouselSettings', () => {
  cy.get(`#desktop_view .sd-item ${CAROUSEL_CANVAS.component}, #desktop_view ${CAROUSEL_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(CAROUSEL_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('carousel-settings-panel-open');
});

/** Click "+ Add Slide" once (no-op assertion left to caller). */
Cypress.Commands.add('addCarouselSlide', () => {
  cy.get(CAROUSEL_CANVAS.addSlide, { timeout: 12000 }).first().click({ force: true });
  cy.captureLiveStep('carousel-slide-added');
});

export {};
