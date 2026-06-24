/// <reference types="cypress" />
// =============================================================================
// Flexi Layout (layout-7) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.captureLiveStep
//
// IMPORTANT — Flexi is a LAYOUT, not an assessment widget:
//   "layout-7" is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Flexi'), NOT into a Generic Step column.
//
// Flexi is DYNAMIC: after the drop, a separator-count dialog
// (.tableGO-rows-columns-dialog) appears when flexiData is empty. The
// createFlexiColumns helper steps the separator count up and clicks "Create" so
// the dynamic columns render. If the build auto-creates columns, the helper
// no-ops gracefully.
// =============================================================================

import { FLEXI_SEPARATOR_DIALOG, LAYOUT_CANVAS, LAYOUT_SETTINGS, LAYOUT_WIDGET_NAME } from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureFlexiLayoutDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'columns';
        skipCanvasNav?: boolean;
        separators?: number;
      }): Chainable<void>;
      dropFlexiLayoutIntoCanvas(): Chainable<void>;
      createFlexiColumns(separators?: number): Chainable<void>;
      openFlexiLayoutSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureFlexiLayoutDeepSetup', (options = {}) => {
  const through = options.through || 'columns';
  const skipCanvasNav = options.skipCanvasNav ?? false;
  const separators = options.separators ?? 1;
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

  cy.dropFlexiLayoutIntoCanvas();
  if (through === 'dropped') return;

  cy.createFlexiColumns(separators);
});

Cypress.Commands.add('dropFlexiLayoutIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${LAYOUT_CANVAS.widget}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Flexi layout already present on canvas');
      return;
    }
    cy.dropComponent(LAYOUT_WIDGET_NAME);
  });

  cy.get(LAYOUT_CANVAS.widget, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-flexi-layout');
});

/**
 * Create dynamic flexi columns from the separator dialog. `separators` is the
 * number of vertical separators (1 → 2 columns). Steps the count up to the
 * requested value, then clicks Create. No-ops if columns already exist or the
 * dialog is not shown (auto-created build).
 */
Cypress.Commands.add('createFlexiColumns', (separators = 1) => {
  cy.get('#desktop_view').then(($desktop) => {
    const hasColumns = $desktop.find(LAYOUT_CANVAS.columns).length > 0;
    const hasDialog = $desktop.find(FLEXI_SEPARATOR_DIALOG.dialog).length > 0;
    if (hasColumns && !hasDialog) {
      cy.log('ℹ Flexi columns already present');
      return;
    }
    if (!hasDialog) {
      cy.log('ℹ Separator dialog not shown — build may auto-create columns');
      return;
    }
    // Default readout is 1; step up to reach `separators`.
    const steps = Math.max(0, separators - 1);
    for (let i = 0; i < steps; i += 1) {
      cy.get(FLEXI_SEPARATOR_DIALOG.stepUp).first().click({ force: true });
    }
    cy.get(FLEXI_SEPARATOR_DIALOG.createButton).first().click({ force: true });
  });

  cy.get(LAYOUT_CANVAS.columns, { timeout: 15000 }).should('have.length.greaterThan', 0);
  cy.captureLiveStep('flexi-columns-created');
});

Cypress.Commands.add('openFlexiLayoutSettings', () => {
  cy.get(`#desktop_view .sd-item ${LAYOUT_CANVAS.widget}, #desktop_view ${LAYOUT_CANVAS.widget}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(LAYOUT_SETTINGS.panel, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('flexi-layout-settings-panel-open');
});

export {};
