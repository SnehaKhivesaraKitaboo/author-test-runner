/// <reference types="cypress" />
// =============================================================================
// Steps Cloning component commands — reusable workflows for the clone flow.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// Cloning is a STEP-level lifecycle action ("Clone New Level") exposed only in
// the per-step TOC kebab menu (.tocPageIconMenu → tocSectionClonePopup). It
// reuses the step metadata wizard (#formsModal) in clone mode. These helpers
// reach a ready Generic Step (the source) and drive the kebab → clone wizard.
// =============================================================================

import { SC_CANVAS, SC_TOC, SC_WIZARD } from './selectors';
import { SC_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureStepsCloningDeepSetup(options?: {
        through?: 'step' | 'content';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      openStepCloneTocMenu(): Chainable<void>;
      openCloneWizard(): Chainable<void>;
      cancelCloneWizard(): Chainable<void>;
      countTocStepRows(): Chainable<number>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

/** Reach a ready Generic Step that acts as the clone SOURCE. */
Cypress.Commands.add('ensureStepsCloningDeepSetup', (options = {}) => {
  const through = options.through || 'content';
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

  if (skipStepCreation) {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  // Drop a widget + author a marker so clone-integrity has DOM to assert on.
  cy.get(SC_CANVAS.desktop).then(($desktop) => {
    const already = $desktop.find(`${SC_CANVAS.column} [data-type]`).length > 0;
    if (already) {
      cy.log('ℹ Sample widget already present in source step column');
      return;
    }
    cy.dropComponentForModule(SC_DATA.sampleWidgetName, {
      dataType: SC_DATA.sampleWidgetDataType,
      skipLiveCapture: true,
    });
  });
  cy.get(SC_CANVAS.droppedItem, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('steps-cloning-source-step-ready');
});

/** Open the per-step kebab menu (Clone New Level / Edit Metadata / Delete) for the active step. */
Cypress.Commands.add('openStepCloneTocMenu', () => {
  cy.get(SC_TOC.activeStep, { timeout: 12000 })
    .first()
    .parents(SC_TOC.stepRows)
    .first()
    .find(SC_TOC.kebab)
    .first()
    .click({ force: true });
  cy.get(SC_TOC.menu, { timeout: 8000 }).filter(':visible').first().should('be.visible');
});

/** Open the kebab menu then click "Clone New Level" → the clone wizard (#formsModal). */
Cypress.Commands.add('openCloneWizard', () => {
  cy.openStepCloneTocMenu();
  cy.get(SC_TOC.menuClone, { timeout: 8000 }).filter(':visible').first().click({ force: true });
  cy.get(SC_WIZARD.modal, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('steps-cloning-wizard-open');
});

/** Close the clone wizard without saving (Cancel button or Escape). */
Cypress.Commands.add('cancelCloneWizard', () => {
  cy.get('body').then(($b) => {
    if ($b.find(`${SC_WIZARD.cancelBtn}:visible`).length) {
      cy.get(SC_WIZARD.cancelBtn).filter(':visible').first().click({ force: true });
    } else if ($b.find(`${SC_WIZARD.prevBtn}:visible`).length) {
      cy.get(SC_WIZARD.prevBtn).filter(':visible').first().click({ force: true });
    } else {
      cy.get('body').type('{esc}');
    }
  });
  cy.get(SC_WIZARD.modal, { timeout: 8000 }).should('not.be.visible');
});

/** Resolve the current number of step/page rows in the TOC. */
Cypress.Commands.add('countTocStepRows', () => {
  return cy.get('body').then(($b) => $b.find(SC_TOC.stepRows).length);
});

export {};
