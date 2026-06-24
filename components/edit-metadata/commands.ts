/// <reference types="cypress" />
// =============================================================================
// Edit Metadata component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.captureLiveStep
//
// Edit Metadata is the per-step metadata wizard (#formsModal) re-opened in
// `editingStepData` mode via the TOC kebab menu → "Edit Metadata". It is not a
// dropped widget, so setup only needs a created step + an active TOC row.
// =============================================================================

import { EM_TOC, EM_WIZARD } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureEditMetadataDeepSetup(options?: {
        through?: 'step' | 'menu' | 'wizard';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      openStepKebabMenu(): Chainable<void>;
      openEditMetadataWizard(): Chainable<void>;
      editStepTitle(title: string): Chainable<void>;
      addKeywordTag(tag: string): Chainable<void>;
      saveEditMetadata(): Chainable<void>;
      cancelEditMetadata(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

/** Reach an editable step (created + active in TOC) and optionally open the wizard. */
Cypress.Commands.add('ensureEditMetadataDeepSetup', (options = {}) => {
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

  if (skipStepCreation) {
    cy.ensureOnFibGenericStep();
    cy.waitForGenericStepCanvasReady();
  } else {
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
  }

  if (through === 'step') return;

  cy.openStepKebabMenu();
  if (through === 'menu') return;

  cy.openEditMetadataWizard();
});

/** Open the per-step kebab menu (Clone / Edit Metadata / Delete) for the active step. */
Cypress.Commands.add('openStepKebabMenu', () => {
  cy.get(EM_TOC.activeStep, { timeout: 12000 })
    .first()
    .parents(EM_TOC.stepRows)
    .first()
    .find(EM_TOC.kebab)
    .first()
    .click({ force: true });
  cy.get(EM_TOC.menu, { timeout: 8000 }).filter(':visible').first().should('be.visible');
  cy.captureLiveStep('edit-metadata-kebab-menu-open');
});

/** Click "Edit Metadata" in the kebab menu → wait for the wizard (#formsModal). */
Cypress.Commands.add('openEditMetadataWizard', () => {
  cy.get('body').then(($body) => {
    if ($body.find(`${EM_TOC.menu}:visible`).length === 0) {
      cy.openStepKebabMenu();
    }
  });
  cy.get(EM_TOC.menuEdit, { timeout: 8000 })
    .filter(':visible')
    .first()
    .then(($li) => $li[0].click());
  cy.get(EM_WIZARD.modal, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('edit-metadata-wizard-open');
});

/** Replace the Step Title in the open wizard. */
Cypress.Commands.add('editStepTitle', (title: string) => {
  cy.get(EM_WIZARD.titleInput, { timeout: 8000 })
    .filter(':visible')
    .first()
    .should('not.have.class', 'disabledInput')
    .clear({ force: true })
    .type(title, { delay: 25, force: true });
  cy.captureLiveStep('edit-metadata-title-typed');
});

/** Type a keyword tag and commit it with Enter (Press Enter to separate). */
Cypress.Commands.add('addKeywordTag', (tag: string) => {
  cy.get(EM_WIZARD.tagsInput, { timeout: 8000 })
    .filter(':visible')
    .first()
    .type(`${tag}{enter}`, { force: true });
  cy.captureLiveStep('edit-metadata-tag-added');
});

/** Save metadata: advance to a tab where Submit is visible, then infoEdit(). */
Cypress.Commands.add('saveEditMetadata', () => {
  // #subBtn is hidden on the Basic Info tab (currentTab==0). Advance once so
  // the Submit button becomes visible, then click it.
  cy.get('body').then(($body) => {
    if ($body.find(EM_WIZARD.submitBtn).length === 0) {
      cy.get(EM_WIZARD.nextBtn, { timeout: 8000 })
        .should('not.have.class', 'disabledBtn')
        .then(($btn) => $btn[0].click());
    }
  });
  cy.get(EM_WIZARD.submitBtn, { timeout: 12000 })
    .first()
    .then(($btn) => $btn[0].click());
  cy.get(EM_WIZARD.modal, { timeout: 20000 }).should('not.be.visible');
  cy.captureLiveStep('edit-metadata-saved');
});

/** Cancel without saving (cancelAndReset()). */
Cypress.Commands.add('cancelEditMetadata', () => {
  cy.get(EM_WIZARD.cancelBtn, { timeout: 8000 })
    .filter(':visible')
    .first()
    .then(($btn) => $btn[0].click());
  cy.get(EM_WIZARD.modal, { timeout: 15000 }).should('not.be.visible');
  cy.captureLiveStep('edit-metadata-cancelled');
});

export {};
