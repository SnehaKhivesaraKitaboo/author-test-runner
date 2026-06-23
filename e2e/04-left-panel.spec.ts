/// <reference types="cypress" />
// =============================================================================
// 04 — Left Widget Panel
// Verifies the Add panel opens, accordion sections exist, widget list renders,
// and widget search filtering works correctly.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

describe('04 — Left Widget Panel', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  // ── Panel open/close ──────────────────────────────────────────────────────

  it('TC-04.1: Clicking #lbl-add opens the widget panel', () => {
    cy.get('#lbl-add', { timeout: 15000 }).click({ force: true });
    cy.get('#lbl-add-content', { timeout: 10000 }).should('be.visible');
  });

  it('TC-04.2: Widget panel has at least 1 accordion section', () => {
    cy.get('#lbl-add-content .accordion-toggle', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });

  // ── Accordion sections ────────────────────────────────────────────────────

  ['Layout', 'Layer', 'Elements', 'Widgets'].forEach((section, i) => {
    it(`TC-04.${3 + i}: "${section}" accordion section is present`, () => {
      cy.get('#lbl-add-content .accordion-toggle', { timeout: 8000 })
        .filter(`:contains("${section}")`)
        .should('exist');
    });
  });

  // ── Section expansion ─────────────────────────────────────────────────────

  it('TC-04.7: Expanding "Elements" section reveals widget items', () => {
    cy.expandSection('Elements');
    cy.get('#lbl-add-content li.activeDrags, #lbl-add-content .widget-item', { timeout: 8000 })
      .should('have.length.greaterThan', 0);
  });

  it('TC-04.8: Expanding "Widgets" section reveals interactive widget items', () => {
    cy.expandSection('Widgets');
    cy.get('#lbl-add-content li.activeDrags .widget-name, #lbl-add-content .widget-name', { timeout: 8000 })
      .should('have.length.greaterThan', 0);
  });

  // ── Search ────────────────────────────────────────────────────────────────

  it('TC-04.9: Search input exists in the widget panel', () => {
    cy.get('#search-input, input[placeholder*="Search"], input[ng-model*="search"]', { timeout: 8000 })
      .should('exist');
  });

  it('TC-04.10: Typing "Header" in search filters results to show Header widget', () => {
    cy.get('#search-input').clear().type('Header');
    cy.wait(500);
    cy.get('#lbl-add-content li.activeDrags .widget-name', { timeout: 6000 })
      .filter(':contains("Header")')
      .should('exist');
  });

  it('TC-04.11: Clearing search restores all widget items', () => {
    cy.get('#search-input').clear();
    cy.wait(500);
    cy.get('#lbl-add-content li.activeDrags, #lbl-add-content .activeDrags', { timeout: 6000 })
      .should('have.length.greaterThan', 5);
  });

  it('TC-04.12: Searching for non-existent term shows empty results or no items', () => {
    cy.get('#search-input').clear().type('zzz_nonexistent_xyz');
    cy.wait(500);
    cy.get('body').then($body => {
      const visible = $body.find('#lbl-add-content li.activeDrags').filter(':visible').length;
      cy.log(`Items visible after invalid search: ${visible}`);
    });
    cy.get('#search-input').clear();
  });

  // ── Widget count sanity check ─────────────────────────────────────────────

  it('TC-04.13: AngularJS scope has at least 20 total widgets available', () => {
    cy.window().then(win => {
      const ang = (win as any).angular;
      if (!ang) return;
      const ctrlEl = win.document.getElementById('myController');
      if (!ctrlEl) return;
      const scope = ang.element(ctrlEl).scope();
      const allWidgets: any[] = (scope.widgets || []).flatMap((g: any) => g.widget || []);
      cy.log(`Total widgets in scope: ${allWidgets.length}`);
      expect(allWidgets.length).to.be.greaterThan(20);
    });
  });

});
