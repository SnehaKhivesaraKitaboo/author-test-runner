/// <reference types="cypress" />
// =============================================================================
// Table (tablesNew) component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Table is an ELEMENT, not an assessment widget:
//   `tablesNew` is NOT in support/module-setup.ts ASSESSMENT_DATA_TYPES, so the
//   framework routes it to the canvas (resolveDropTarget → 'canvas'). It is
//   dropped onto the Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Table'), which injects the catalog widget
//   { name: "Table", dataType: "tablesNew" } onto the unrestricted canvas.
//   It is NOT dropped into a Generic Step column.
//
//   On first drop a jQuery-UI "Create Table" dialog (.rows-columns-dialog)
//   opens with rows (#table-rows-input, default 8) and cols (#table-cols-input,
//   default 4). Confirming the dialog (.table-ok-button "Create") sets
//   fieldData.isTableCreated and renders the grid into table.tableNew.
// =============================================================================

import {
  TABLE_CANVAS,
  TABLE_CREATE_DIALOG,
  TABLE_SETTINGS,
  TABLE_WIDGET_NAME,
} from './selectors';
import { TABLE_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureTableDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'created' | 'content';
        skipCanvasNav?: boolean;
        rows?: number;
        cols?: number;
      }): Chainable<void>;
      dropTableIntoCanvas(): Chainable<void>;
      createTableGrid(rows?: number, cols?: number): Chainable<void>;
      fillTableDummyContent(): Chainable<void>;
      openTableSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureTableDeepSetup', (options = {}) => {
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

  cy.dropTableIntoCanvas();
  if (through === 'dropped') return;

  cy.createTableGrid(options.rows, options.cols);
  if (through === 'created') return;

  cy.fillTableDummyContent();
});

Cypress.Commands.add('dropTableIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${TABLE_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Table element already present on canvas');
      return;
    }
    // Element drop → canvas (tablesNew is not an assessment widget).
    cy.dropComponent(TABLE_WIDGET_NAME);
  });

  cy.get(TABLE_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-table');
});

/**
 * Confirm the "Create Table" dialog (renders the grid). When rows/cols are
 * provided, the inputs are updated first (ng-change sets isNoOfRowColChangedFlag
 * so the grid is rebuilt at that size). Degrades gracefully if the dialog has
 * already been confirmed (table.tableNew already populated).
 */
Cypress.Commands.add('createTableGrid', (rows?: number, cols?: number) => {
  cy.get('body').then(($body) => {
    const grid = $body.find(`${TABLE_CANVAS.table} td`);
    const dialogOpen = $body.find(`${TABLE_CREATE_DIALOG.dialog}:visible`).length > 0;

    if (grid.length > 0 && !dialogOpen) {
      cy.log('ℹ Table grid already created');
      return;
    }

    if (typeof rows === 'number') {
      cy.get(TABLE_CREATE_DIALOG.rowsInput, { timeout: 12000 })
        .clear({ force: true })
        .type(String(rows), { force: true })
        .trigger('change', { force: true });
    }
    if (typeof cols === 'number') {
      cy.get(TABLE_CREATE_DIALOG.colsInput, { timeout: 12000 })
        .clear({ force: true })
        .type(String(cols), { force: true })
        .trigger('change', { force: true });
    }

    // jQuery-UI dialog "Create" button (.table-ok-button). Fall back to the
    // generic dialog button if the class is not yet mounted.
    cy.get('body').then(($b) => {
      if ($b.find('.table-ok-button').length > 0) {
        cy.get('.table-ok-button', { timeout: 12000 }).first().click({ force: true });
      } else {
        cy.contains('.tableDialog button, .ui-dialog-buttonset button', 'Create', { timeout: 12000 })
          .first()
          .click({ force: true });
      }
    });
  });

  cy.get(`${TABLE_CANVAS.table} td`, { timeout: 20000 }).should('have.length.greaterThan', 0);
  cy.captureLiveStep('table-grid-created');
});

Cypress.Commands.add('fillTableDummyContent', () => {
  cy.get(TABLE_CANVAS.table, { timeout: 12000 }).first().should('exist');
  cy.get(TABLE_CANVAS.cells, { timeout: 12000 }).first().setContentEditableOn(TABLE_DATA.cell);
  cy.captureLiveStep('table-dummy-content-entered');
});

Cypress.Commands.add('openTableSettings', () => {
  cy.get(`#desktop_view .sd-item ${TABLE_CANVAS.component}, #desktop_view ${TABLE_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(TABLE_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('table-settings-panel-open');
});

export {};
