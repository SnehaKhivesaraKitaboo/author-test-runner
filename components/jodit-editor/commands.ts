/// <reference types="cypress" />
// =============================================================================
// Jodit Editor component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.createTestStep, cy.ensureOnFibGenericStep,
//   cy.waitForGenericStepCanvasReady, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// HOST: the Jodit editor is a PLATFORM rich-text editor that has no widget of
// its own — it is mounted by the Extended Response (shortLongAns) assessment
// widget when Answer Type = RTE and Keyboard Type = Advance(JODIT). This file
// therefore exercises Jodit by:
//   1. dropping Extended Response into a Generic Step column,
//   2. opening its settings panel,
//   3. selecting RTE + Advance(JODIT) (both gated by TOCFlag),
//   4. clicking the component so the directive runs `Jodit.make(textareaId, …)`.
//
// All editor formatting is done through Jodit's own toolbar / editable area;
// the editable region is contenteditable, so we use cy.setContentEditableOn or
// the editor's native input — never plain cy.type() on contenteditable.
//
// Flag-gated: if the RTE / Advance(JODIT) radios are absent (TOCFlag off in the
// build) the editor cannot mount → ensureJoditEditorDeepSetup logs + returns
// gracefully, and each it() degrades (log + return) when `.jodit-container`
// is not present.
// =============================================================================

import { JODIT, JODIT_HOST, JODIT_HOST_DATA_TYPE, JODIT_HOST_SETTINGS, JODIT_HOST_WIDGET_NAME } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureJoditEditorDeepSetup(options?: {
        through?: 'host' | 'dropped' | 'mounted';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      dropJoditHostIntoGenericStepColumn(): Chainable<void>;
      openJoditHostSettings(): Chainable<void>;
      selectJoditAdvancedRte(): Chainable<void>;
      mountJoditEditor(): Chainable<void>;
      /** Resolves whether the Jodit container is actually mounted in the DOM. */
      withJoditMounted(fn: (mounted: boolean) => void): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureJoditEditorDeepSetup', (options = {}) => {
  const through = options.through || 'mounted';
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

  cy.dropJoditHostIntoGenericStepColumn();
  if (through === 'host') return;

  // Seed a question so the host renders fully before switching to RTE/JODIT.
  cy.get(JODIT_HOST.component, { timeout: 12000 }).first().should('exist');

  cy.selectJoditAdvancedRte();
  if (through === 'dropped') return;

  cy.mountJoditEditor();
});

Cypress.Commands.add('dropJoditHostIntoGenericStepColumn', () => {
  cy.ensureOnFibGenericStep();
  cy.waitForGenericStepCanvasReady();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.generic-step-column-content ${JODIT_HOST.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Jodit host (Extended Response) already present in Generic Step column');
      return;
    }
    cy.dropComponentForModule(JODIT_HOST_WIDGET_NAME, {
      dataType: JODIT_HOST_DATA_TYPE,
      skipLiveCapture: true,
    });
  });

  cy.get(JODIT_HOST.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-jodit-host');
});

Cypress.Commands.add('openJoditHostSettings', () => {
  cy.get(`.generic-step-column-content ${JODIT_HOST.component}, #desktop_view ${JODIT_HOST.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(JODIT_HOST_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('jodit-host-settings-panel-open');
});

/**
 * Selects Answer Type = RTE and Keyboard Type = Advance(JODIT) so the directive
 * will mount Jodit on the next component click. Both radios are gated by
 * TOCFlag — if absent, log + return so the suite degrades gracefully.
 */
Cypress.Commands.add('selectJoditAdvancedRte', () => {
  cy.openJoditHostSettings();
  cy.get('body').then(($body) => {
    const hasRte = $body.find(JODIT_HOST_SETTINGS.answerRte).length > 0;
    const hasJodit = $body.find(JODIT_HOST_SETTINGS.keyboardAdvance).length > 0;
    if (!hasRte || !hasJodit) {
      cy.log('ℹ RTE / Advance(JODIT) radios are TOCFlag-gated and absent in this build — Jodit cannot mount here');
      return;
    }
    cy.get(JODIT_HOST_SETTINGS.answerRte).check({ force: true });
    cy.get(JODIT_HOST_SETTINGS.keyboardAdvance).check({ force: true });
    cy.captureLiveStep('jodit-rte-advance-selected');
  });
});

/** Clicks the host component to trigger `Jodit.make(textareaId, …)` in the directive. */
Cypress.Commands.add('mountJoditEditor', () => {
  cy.get(`.generic-step-column-content ${JODIT_HOST.component}, #desktop_view ${JODIT_HOST.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  // Jodit mounts asynchronously after the click handler runs.
  cy.wait(600);
  cy.captureLiveStep('jodit-editor-mount-attempt');
});

Cypress.Commands.add('withJoditMounted', (fn: (mounted: boolean) => void) => {
  cy.get('body').then(($body) => {
    const mounted = $body.find(JODIT.container).length > 0;
    fn(mounted);
  });
});

export {};
