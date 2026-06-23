/// <reference types="cypress" />
// =============================================================================
// 02 — Editor Shell
// Verifies the core authoring chrome: toolbar buttons, canvas, panels.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

describe('02 — Editor Shell', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  it('TC-02.1: "Save" button is visible in toolbar', () => {
    cy.get('button.btn', { timeout: 20000 })
      .filter(':contains("Save")')
      .should('be.visible');
  });

  it('TC-02.2: "Preview" button is visible in toolbar', () => {
    cy.contains('button', /Preview/i, { timeout: 15000 })
      .should('be.visible');
  });

  it('TC-02.3: "Publish" button is visible in toolbar', () => {
    cy.contains('button', /Publish/i, { timeout: 15000 })
      .should('exist');
  });

  it('TC-02.4: Canvas drop zone (#desktop_view) is present', () => {
    cy.get('#desktop_view', { timeout: 15000 }).should('exist');
  });

  it('TC-02.5: Left "Add" panel toggle (#lbl-add) is present', () => {
    cy.get('#lbl-add', { timeout: 15000 }).should('exist');
  });

  it('TC-02.6: Table of Contents panel is present', () => {
    cy.contains('Table Of Contents', { timeout: 15000 }).should('exist');
  });

  it('TC-02.7: Component settings panel area exists in DOM', () => {
    cy.get('.componentSettingPanel, [class*="settingPanel"], [class*="setting-panel"]', { timeout: 10000 })
      .should('exist');
  });

  it('TC-02.8: Header/toolbar container is present', () => {
    cy.get('header, .header-container, .toolbar, [class*="header"]', { timeout: 10000 })
      .should('exist');
  });

  it('TC-02.9: Right panel / settings area exists', () => {
    cy.get('[class*="rightPanel"], [class*="right-panel"], .settings-panel, #right_panel', { timeout: 10000 })
      .should('exist');
  });

  it('TC-02.10: AngularJS controller is attached to #myController', () => {
    cy.window().then(win => {
      const ang = (win as any).angular;
      expect(ang, 'AngularJS').to.exist;
      const ctrlEl = win.document.getElementById('myController');
      expect(ctrlEl, '#myController element').to.exist;
      const scope = ang.element(ctrlEl).scope();
      expect(scope, 'Angular scope').to.exist;
    });
  });

});
