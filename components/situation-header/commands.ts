/// <reference types="cypress" />
// =============================================================================
// Situation Header component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Situation Header is an ELEMENT, not an assessment widget:
//   `situationbox` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so
//   the framework routes it to the canvas (resolveDropTarget → 'canvas').
//   config/config.js lists "Situation Header" (dataType "situationbox") in the
//   same general elements catalog group as Text/Image/Video/Callout Box. It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Situation Header'), NOT into a Generic Step column.
// =============================================================================

import { SH_CANVAS, SH_SETTINGS, SH_WIDGET_NAME } from './selectors';
import { SH_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureSituationHeaderDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropSituationHeaderIntoCanvas(): Chainable<void>;
      fillSituationHeaderDummyContent(): Chainable<void>;
      openSituationHeaderSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureSituationHeaderDeepSetup', (options = {}) => {
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

  cy.dropSituationHeaderIntoCanvas();
  if (through === 'dropped') return;

  cy.fillSituationHeaderDummyContent();
});

Cypress.Commands.add('dropSituationHeaderIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${SH_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Situation Header element already present on canvas');
      return;
    }
    // Element drop → canvas (situationbox is not an assessment widget).
    cy.dropComponent(SH_WIDGET_NAME);
  });

  cy.get(SH_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-situation-header');
});

Cypress.Commands.add('fillSituationHeaderDummyContent', () => {
  cy.get(SH_CANVAS.widget, { timeout: 12000 }).first().should('exist');
  cy.get(SH_CANVAS.textEditor, { timeout: 12000 }).first().setContentEditableOn(SH_DATA.headerText);
  cy.captureLiveStep('situation-header-dummy-content-entered');
});

Cypress.Commands.add('openSituationHeaderSettings', () => {
  cy.get(`#desktop_view .sd-item ${SH_CANVAS.widget}, #desktop_view ${SH_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(SH_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.get(SH_SETTINGS.title, { timeout: 12000 }).should('contain.text', 'Situation Header');
  cy.captureLiveStep('situation-header-settings-panel-open');
});

export {};
