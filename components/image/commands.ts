/// <reference types="cypress" />
// =============================================================================
// Image component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponentForModule,
//   cy.openComponentSettings, cy.setContentEditableOn, cy.captureLiveStep
//
// Image is an ELEMENT (dataType "image") — it is dropped on the Instructions
// canvas (#desktop_view), NOT into a Generic Step column. resolveDropTarget()
// in support/module-setup.ts routes "image" → 'canvas' (it is not in
// ASSESSMENT_DATA_TYPES), so cy.dropComponentForModule('Image', { dataType:
// 'image' }) delegates to cy.dropComponent() on the Instructions page.
//
// ASSUMPTION (documented): the Components-panel widget name for the Image
// element is "Image" with dataType "image". dropComponentForModule matches by
// name first, then dataType, so passing both makes the resolution robust even
// if the display name differs slightly in a given build.
// =============================================================================

import { IMAGE_CANVAS, IMAGE_DATA_TYPE, IMAGE_SETTINGS } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureImageDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'settings';
      }): Chainable<void>;
      dropImageOntoCanvas(): Chainable<void>;
      openImageSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureImageDeepSetup', (options = {}) => {
  const through = options.through || 'dropped';
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (!hasEditor) cy.openAuthoringTool(url);
  });

  // Image is an element → unrestricted Instructions canvas (no Generic Step).
  cy.navigateToCanvasPage();

  if (through === 'canvas') return;

  cy.dropImageOntoCanvas();
  if (through === 'dropped') return;

  cy.openImageSettings();
});

Cypress.Commands.add('dropImageOntoCanvas', () => {
  cy.get('#desktop_view', { timeout: 15000 }).should('exist');

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped =
      $desktop.find(IMAGE_CANVAS.component).length > 0 ||
      $desktop.find(`[data-type="${IMAGE_DATA_TYPE}"]`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Image element already present on canvas');
      return;
    }
    cy.dropComponentForModule('Image', { dataType: IMAGE_DATA_TYPE });
  });

  cy.get(IMAGE_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-image');
});

Cypress.Commands.add('openImageSettings', () => {
  cy.get(`#desktop_view ${IMAGE_CANVAS.component}, ${IMAGE_CANVAS.sdItem}`, { timeout: 12000 })
    .last()
    .scrollIntoView()
    .click({ force: true });
  cy.get(IMAGE_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.get(IMAGE_SETTINGS.body, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('image-settings-panel-open');
});

export {};
