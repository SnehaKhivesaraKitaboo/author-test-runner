/// <reference types="cypress" />
// =============================================================================
// FIB Media component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// FIB Media uses the same Generic Step column drop as FIB; the drop target for
// dataType "fib-media" is registered as an assessment widget in
// support/module-setup.ts.
// =============================================================================

import { FIB_MEDIA_CANVAS, FIB_MEDIA_DATA_TYPE, FIB_MEDIA_SETTINGS } from './selectors';
import { FIB_MEDIA_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      /** Full FIB-Media prerequisite: launch → Generic Step → drop → fill content. */
      ensureFibMediaDeepSetup(options?: {
        through?: 'step' | 'dropped' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      /** Drop the FIB-with-Image widget into the active Generic Step column. */
      dropFibMediaIntoGenericStepColumn(): Chainable<void>;
      /** Enter header + statement text on the dropped FIB-Media. */
      fillFibMediaDummyContent(): Chainable<void>;
      /** Click the FIB-Media component and open #fib-settings-panel. */
      openFibMediaSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureFibMediaDeepSetup', (options = {}) => {
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

  cy.dropFibMediaIntoGenericStepColumn();
  if (through === 'dropped') return;

  cy.fillFibMediaDummyContent();
});

Cypress.Commands.add('dropFibMediaIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${FIB_MEDIA_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ FIB Media already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule('FIB Media', {
      dataType: FIB_MEDIA_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(FIB_MEDIA_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-fib-media');
});

Cypress.Commands.add('fillFibMediaDummyContent', () => {
  cy.get(FIB_MEDIA_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(FIB_MEDIA_CANVAS.header).first().setContentEditableOn(FIB_MEDIA_DATA.header);
  cy.get(FIB_MEDIA_CANVAS.sentence).first().setContentEditableOn(FIB_MEDIA_DATA.sentence);
  cy.captureLiveStep('fib-media-dummy-content-entered');
});

Cypress.Commands.add('openFibMediaSettings', () => {
  cy.get(`.generic-step-column-content ${FIB_MEDIA_CANVAS.component}, #desktop_view ${FIB_MEDIA_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(FIB_MEDIA_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('fib-media-settings-panel-open');
});

export {};
