/// <reference types="cypress" />
// =============================================================================
// Generic Step component commands — reusable workflows for the STEP itself.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.captureLiveStep
//
// This component is the Generic Step creation flow + step canvas/settings, not
// a dropped widget. Helpers here cover: opening the step chooser, opening the
// metadata wizard, opening the step settings panel, opening the per-step TOC
// menu, and a one-shot deep-setup that lands on a fresh Generic Step canvas.
// =============================================================================

import { GS_CANVAS, GS_CHOOSER, GS_SETTINGS, GS_STEP_LABEL, GS_TOC, GS_WIZARD } from './selectors';
import { GS_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureGenericStepDeepSetup(options?: {
        through?: 'launch' | 'chooser' | 'step' | 'dropped';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      openGenericStepChooser(): Chainable<void>;
      closeGenericStepChooser(): Chainable<void>;
      openGenericStepWizard(): Chainable<void>;
      openGenericStepSettings(): Chainable<void>;
      openGenericStepTocMenu(): Chainable<void>;
      dropSampleWidgetIntoGenericStep(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

/** Reach a fresh, ready Generic Step canvas (reuses createTestStep/ensureOnFibGenericStep). */
Cypress.Commands.add('ensureGenericStepDeepSetup', (options = {}) => {
  const through = options.through || 'step';
  const skipStepCreation = options.skipStepCreation ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (!hasEditor) {
      cy.openAuthoringTool(url);
      if (skipStepCreation) cy.ensureOnFibGenericStep();
    }
  });

  if (through === 'launch') return;

  if (through === 'chooser') {
    cy.openGenericStepChooser();
    return;
  }

  if (skipStepCreation) {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  cy.dropSampleWidgetIntoGenericStep();
});

/** Open the step tray (#widget-popup) via the TOC "+ Add" → "Add New Step". */
Cypress.Commands.add('openGenericStepChooser', () => {
  cy.get('body').then(($body) => {
    const toggle = $body.find(`${GS_CHOOSER.tocAddToggle}:visible`);
    const bottom = $body.find(`${GS_CHOOSER.bottomAddStep}:visible`);
    if (toggle.length) {
      cy.wrap(toggle.first()).scrollIntoView().click({ force: true });
      cy.get(GS_CHOOSER.addNewStepItem, { timeout: 10000 })
        .filter(':visible')
        .first()
        .then(($item) => $item[0].click());
    } else if (bottom.length) {
      cy.wrap(bottom.first()).scrollIntoView().click({ force: true });
    } else {
      throw new Error('TOC "+ Add" control not found — cannot open step chooser');
    }
  });
  cy.get(GS_CHOOSER.popup, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('generic-step-chooser-open');
});

/** Close the step chooser modal gracefully. */
Cypress.Commands.add('closeGenericStepChooser', () => {
  cy.get('body').then(($body) => {
    if ($body.find(`${GS_CHOOSER.popup}:visible`).length) {
      cy.get(GS_CHOOSER.closeBtn, { timeout: 8000 }).first().click({ force: true });
    }
  });
  cy.get(GS_CHOOSER.popup, { timeout: 8000 }).should('not.be.visible');
});

/** Open chooser then click the Generic Step card → metadata wizard (#formsModal). */
Cypress.Commands.add('openGenericStepWizard', () => {
  cy.openGenericStepChooser();
  cy.get(GS_CHOOSER.stepCard, { timeout: 15000 })
    .filter(`:contains("${GS_STEP_LABEL}")`)
    .first()
    .scrollIntoView()
    .then(($card) => $card[0].click());
  cy.get(GS_WIZARD.modal, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('generic-step-wizard-open');
});

/** Drop a representative assessment widget into the first Generic Step column. */
Cypress.Commands.add('dropSampleWidgetIntoGenericStep', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();
  cy.get(GS_CANVAS.desktop).then(($desktop) => {
    const already = $desktop.find(`${GS_CANVAS.column} [data-type]`).length > 0;
    if (already) {
      cy.log('ℹ Sample widget already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule(GS_DATA.sampleWidgetName, {
      dataType: GS_DATA.sampleWidgetDataType,
      skipLiveCapture: true,
    });
  });
  cy.get(GS_CANVAS.droppedItem, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('generic-step-sample-widget-dropped');
});

/** Open the Generic Step settings panel by clicking the step container on canvas. */
Cypress.Commands.add('openGenericStepSettings', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();
  cy.get(GS_CANVAS.container, { timeout: 12000 }).first().click({ force: true });
  cy.get(GS_SETTINGS.panel, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('generic-step-settings-panel-open');
});

/** Open the per-step kebab menu (Clone / Edit Metadata / Delete) for the active step. */
Cypress.Commands.add('openGenericStepTocMenu', () => {
  cy.get(GS_TOC.activeStep, { timeout: 12000 })
    .first()
    .parents(GS_TOC.stepRows)
    .first()
    .find(GS_TOC.kebab)
    .first()
    .click({ force: true });
  cy.get(GS_TOC.menu, { timeout: 8000 }).filter(':visible').first().should('be.visible');
});

export {};
