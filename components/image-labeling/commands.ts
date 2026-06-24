/// <reference types="cypress" />
// =============================================================================
// Image Labeling (imagelabelling) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Image Labeling is an ELEMENT, not an assessment widget:
//   `imagelabelling` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so
//   the framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Image Labeling'), which injects the catalog widget
//   { name: "Image Labeling", dataType: "imagelabelling" } onto the unrestricted
//   canvas. It is NOT dropped into a Generic Step column.
//
//   Mirrors the Text sibling's setup contract (cy.ensureTextDeepSetup) using the
//   canvas drop primitive.
// =============================================================================

import { IL_CANVAS, IL_SETTINGS, IL_WIDGET_NAME } from './selectors';
import { IL_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureImageLabelingDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropImageLabelingIntoCanvas(): Chainable<void>;
      fillImageLabelingDummyContent(): Chainable<void>;
      openImageLabelingSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureImageLabelingDeepSetup', (options = {}) => {
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

  cy.dropImageLabelingIntoCanvas();
  if (through === 'dropped') return;

  cy.fillImageLabelingDummyContent();
});

Cypress.Commands.add('dropImageLabelingIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${IL_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Image Labeling element already present on canvas');
      return;
    }
    // Element drop → canvas (imagelabelling is not an assessment widget).
    cy.dropComponent(IL_WIDGET_NAME);
  });

  cy.get(IL_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-image-labeling');
});

Cypress.Commands.add('fillImageLabelingDummyContent', () => {
  cy.get(IL_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(IL_CANVAS.question, { timeout: 12000 }).first().setContentEditableOn(IL_DATA.question);
  cy.captureLiveStep('image-labeling-dummy-content-entered');
});

Cypress.Commands.add('openImageLabelingSettings', () => {
  cy.get(`#desktop_view .sd-item ${IL_CANVAS.component}, #desktop_view ${IL_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(IL_SETTINGS.body, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('image-labeling-settings-panel-open');
});

export {};
