/// <reference types="cypress" />
// =============================================================================
// Video (media element) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Video is an ELEMENT, not an assessment widget:
//   `video` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so
//   resolveDropTarget() returns 'canvas'. It is dropped onto the
//   Instructions-for-Students page (#desktop_view) via
//   cy.dropComponentForModule('Video', { dataType: 'video' }), which matches the
//   catalog widget { name: "Video", dataType: "video" } and injects it onto the
//   unrestricted canvas. It is NOT dropped into a Generic Step column.
// =============================================================================

import { VIDEO_CANVAS, VIDEO_DATA_TYPE, VIDEO_SETTINGS, VIDEO_WIDGET_NAME } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureVideoDeepSetup(options?: {
        through?: 'canvas' | 'dropped';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropVideoIntoCanvas(): Chainable<void>;
      openVideoSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureVideoDeepSetup', (options = {}) => {
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

  cy.dropVideoIntoCanvas();
});

Cypress.Commands.add('dropVideoIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${VIDEO_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Video element already present on canvas');
      return;
    }
    // Element drop → canvas (video is not an assessment widget).
    cy.dropComponentForModule(VIDEO_WIDGET_NAME, { dataType: VIDEO_DATA_TYPE });
  });

  cy.get(VIDEO_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-video');
});

Cypress.Commands.add('openVideoSettings', () => {
  cy.get(`#desktop_view .sd-item ${VIDEO_CANVAS.widget}, #desktop_view ${VIDEO_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(VIDEO_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.get(VIDEO_SETTINGS.root, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('video-settings-panel-open');
});

export {};
