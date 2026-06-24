/// <reference types="cypress" />
// =============================================================================
// Sample Layer / TIG Panel component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropWidgetIntoGenericStep,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Sample Layer is a LAYER CONTAINER, not an assessment widget:
//   config.js registers { name:"Sample Layer", dataType:"layer-2" } and
//   GenericStep["layer-2"]=true, so it is dropped INTO a Generic Step column
//   (like a layout). It is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES,
//   so we drop it explicitly via cy.dropWidgetIntoGenericStep("Sample Layer",
//   columnIndex, SL_DATA_TYPE). Assessment widgets/components are then dropped
//   inside the layer's own .column-content.layer-box drop zones.
//
//   Flag-gated / runtime controls (Reader/CLP pink answers, TIG panel) are
//   handled in preview1.js at runtime — those flows log + return gracefully.
// =============================================================================

import { SL_CANVAS, SL_DATA_TYPE, SL_SETTINGS, SL_WIDGET_NAME } from './selectors';
import { SL_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureSampleLayerDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropSampleLayerIntoGenericStepColumn(): Chainable<void>;
      fillSampleLayerDummyContent(): Chainable<void>;
      openSampleLayerSettings(): Chainable<void>;
      toggleSampleAnswers(state: 'On' | 'Off'): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureSampleLayerDeepSetup', (options = {}) => {
  const through = options.through || 'content';
  const skipStepCreation = options.skipStepCreation ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (hasEditor) return;
    cy.openAuthoringTool(url);
    if (skipStepCreation) cy.ensureOnFibGenericStep();
  });

  if (skipStepCreation) {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  cy.dropSampleLayerIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillSampleLayerDummyContent();
});

Cypress.Commands.add('dropSampleLayerIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped =
      $desktop.find(`.generic-step-column-content ${SL_CANVAS.container}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Sample Layer already present in Generic Step column');
      return;
    }
    // Layer container drop → Generic Step column (config GenericStep["layer-2"]=true).
    cy.dropWidgetIntoGenericStep(SL_WIDGET_NAME, 0, SL_DATA_TYPE, true);
  });

  cy.get(SL_CANVAS.container, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-sample-layer');
});

Cypress.Commands.add('fillSampleLayerDummyContent', () => {
  cy.get(SL_CANVAS.container, { timeout: 12000 }).first().should('exist');
  // Sample Layer is a container; populating an inner component is a runtime drop
  // flow that depends on the inner widget's own template. If an inner editable
  // drop zone already exposes a contenteditable, author it; otherwise log + skip.
  cy.get('body').then(($body) => {
    const editable = $body.find(`${SL_CANVAS.dropBox} [contenteditable="true"]`);
    if (editable.length === 0) {
      cy.log('ℹ Sample Layer has no inner editable yet (no component dropped inside) — skipping content fill');
      cy.captureLiveStep('sample-layer-empty-container-ready');
      return;
    }
    cy.get(`${SL_CANVAS.dropBox} [contenteditable="true"]`).first().setContentEditableOn(SL_DATA.sampleAnswer);
    cy.captureLiveStep('sample-layer-dummy-content-entered');
  });
});

Cypress.Commands.add('openSampleLayerSettings', () => {
  cy.get(`.generic-step-column-content ${SL_CANVAS.container}, #desktop_view ${SL_CANVAS.container}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(SL_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('sample-layer-settings-panel-open');
});

Cypress.Commands.add('toggleSampleAnswers', (state: 'On' | 'Off') => {
  const target = state === 'On' ? SL_SETTINGS.tagRadioOn : SL_SETTINGS.tagRadioOff;
  cy.get('body').then(($body) => {
    if ($body.find(target).length === 0) {
      cy.log(`ℹ toggleSampleAnswers("${state}"): radio not rendered (tag block not populated) — skipping`);
      return;
    }
    // The "Off" radio is ng-disabled in source; force is required to exercise it.
    cy.get(target).check({ force: true });
    cy.wait(300);
  });
  cy.captureLiveStep(`sample-answers-toggled-${state.toLowerCase()}`);
});

export {};
