/// <reference types="cypress" />
// =============================================================================
// Annotation component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Annotation is an ELEMENT, not an assessment widget:
//   `annotationHighlightOutline` is NOT in support/module-setup.ts
//   ASSESSMENT_DATA_TYPES, so the framework routes it to the canvas
//   (resolveDropTarget → 'canvas'). It is dropped onto the
//   Instructions-for-Students page (#desktop_view) via cy.dropComponent('Annotation'),
//   which injects the catalog widget { name: "Annotation",
//   dataType: "annotationHighlightOutline" } onto the unrestricted canvas.
//   It is NOT dropped into a Generic Step column.
// =============================================================================

import { ANNOTATION_CANVAS, ANNOTATION_SETTINGS, ANNOTATION_WIDGET_NAME } from './selectors';
import { ANNOTATION_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureAnnotationDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropAnnotationIntoCanvas(): Chainable<void>;
      fillAnnotationDummyContent(): Chainable<void>;
      openAnnotationSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureAnnotationDeepSetup', (options = {}) => {
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

  cy.dropAnnotationIntoCanvas();
  if (through === 'dropped') return;

  cy.fillAnnotationDummyContent();
});

Cypress.Commands.add('dropAnnotationIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${ANNOTATION_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Annotation element already present on canvas');
      return;
    }
    // Element drop → canvas (annotationHighlightOutline is not an assessment widget).
    cy.dropComponent(ANNOTATION_WIDGET_NAME);
  });

  cy.get(ANNOTATION_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-annotation');
});

Cypress.Commands.add('fillAnnotationDummyContent', () => {
  cy.get(ANNOTATION_CANVAS.component, { timeout: 12000 }).first().should('exist');
  // The default Highlight section is on; set its first label. (Outline is off by
  // default so we only touch the highlight label here.)
  cy.get('body').then(($body) => {
    if ($body.find(ANNOTATION_CANVAS.highlightLabel).length > 0) {
      cy.get(ANNOTATION_CANVAS.highlightLabel).first().setContentEditableOn(ANNOTATION_DATA.highlightLabel);
    } else {
      cy.log('ℹ Highlight label field not rendered (showHighlights off in this build)');
    }
  });
  cy.captureLiveStep('annotation-dummy-content-entered');
});

Cypress.Commands.add('openAnnotationSettings', () => {
  cy.get(`#desktop_view .sd-item ${ANNOTATION_CANVAS.component}, #desktop_view ${ANNOTATION_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(ANNOTATION_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('annotation-settings-panel-open');
});

export {};
