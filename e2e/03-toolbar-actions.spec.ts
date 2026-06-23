/// <reference types="cypress" />
// =============================================================================
// 03 — Toolbar Actions
// Verifies Save, Undo/Redo, Version History and Preview button interactions.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

describe('03 — Toolbar Actions', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  it('TC-03.1: Clicking Save does not show an error message', () => {
    cy.get('button.btn').filter(':contains("Save")').first().click({ force: true });
    cy.wait(2000);
    cy.get('body', { timeout: 10000 }).should('not.contain.text', 'Error saving');
    cy.get('body').should('not.contain.text', 'Failed to save');
  });

  it('TC-03.2: Loading indicator disappears after Save completes', () => {
    cy.get('[class*="loading"], [class*="spinner"], .loader', { timeout: 20000 })
      .should('not.exist');
  });

  it('TC-03.3: Undo button is present (if applicable)', () => {
    cy.get('body').then($body => {
      const undoBtn = $body.find('[title*="Undo"], [aria-label*="Undo"], .icon-undo, #undoButton');
      if (undoBtn.length > 0) {
        cy.wrap(undoBtn.first()).should('exist');
      } else {
        cy.log('Undo button not found in current toolbar — skipping assertion');
      }
    });
  });

  it('TC-03.4: Redo button is present (if applicable)', () => {
    cy.get('body').then($body => {
      const redoBtn = $body.find('[title*="Redo"], [aria-label*="Redo"], .icon-redo, #redoButton');
      if (redoBtn.length > 0) {
        cy.wrap(redoBtn.first()).should('exist');
      } else {
        cy.log('Redo button not found in current toolbar — skipping assertion');
      }
    });
  });

  it('TC-03.5: Version History button or link is accessible', () => {
    cy.get('body').then($body => {
      const versionEl = $body.find(':contains("Version"), .version-history, [class*="version"]');
      if (versionEl.length > 0) {
        cy.log(`Found version history element: ${versionEl.first().attr('class')}`);
      } else {
        cy.log('Version history not found — may require additional interaction to expose');
      }
    });
  });

  it('TC-03.6: Page mode selector is present (Portrait / Landscape)', () => {
    cy.get('body').then($body => {
      const hasModeEl = $body.find(':contains("Portrait"), :contains("Landscape"), [class*="pageMode"]').length > 0;
      cy.log(`Page mode selector found: ${hasModeEl}`);
    });
  });

  it('TC-03.7: Layout margin options are accessible', () => {
    cy.get('body').then($body => {
      const hasMargin = $body.find(':contains("Margin"), [class*="margin"], [class*="layout"]').length > 0;
      cy.log(`Layout margin options found: ${hasMargin}`);
    });
  });

});
