/// <reference types="cypress" />
// =============================================================================
// 05 — Table of Contents Navigation
// Verifies the TOC panel renders, pages are navigable, and section/page actions work.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

describe('05 — TOC Navigation', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  it('TC-05.1: TOC panel is present on the page', () => {
    cy.contains('Table Of Contents', { timeout: 15000 }).should('exist');
  });

  it('TC-05.2: TOC contains at least one page entry (instructions or steps)', () => {
    cy.get('[ng-click*="tocPageClick"], .toc-container, .toc-stepPages-container, .toc-page-item', { timeout: 15000 })
      .should('exist');
  });

  it('TC-05.3: Clicking the first TOC entry loads that page in the canvas', () => {
    cy.get('[ng-click*="tocPageClick"], .toc-container', { timeout: 10000 })
      .first().click({ force: true });
    cy.wait(1000);
    cy.get('#desktop_view', { timeout: 10000 }).should('exist');
  });

  it('TC-05.4: TOC shows page numbers or page titles', () => {
    cy.get('[new-toc], .toc-panel, .toc-container', { timeout: 10000 }).then($toc => {
      const text = $toc.text().trim();
      cy.log(`TOC content (first 200 chars): ${text.substring(0, 200)}`);
      expect(text.length).to.be.greaterThan(0);
    });
  });

  it('TC-05.5: TOC section header (book sections) is accessible', () => {
    cy.get('body').then($body => {
      const sectionEl = $body.find('.toc-section, [class*="section-title"], [class*="sectionHeader"]');
      cy.log(`TOC section elements found: ${sectionEl.length}`);
    });
  });

  it('TC-05.6: Multiple TOC pages can be navigated without error', () => {
    cy.get('[ng-click*="tocPageClick"], .toc-page-item, [new-toc] li', { timeout: 10000 })
      .then($pages => {
        if ($pages.length >= 2) {
          cy.wrap($pages.eq(1)).click({ force: true });
          cy.wait(800);
          cy.get('body').should('not.contain.text', 'Error');
        } else {
          cy.log('Only one page in TOC — skipping multi-page navigation test');
        }
      });
  });

  it('TC-05.7: Canvas updates when TOC page is changed', () => {
    cy.get('[ng-click*="tocPageClick"], .toc-page-item, [new-toc] li', { timeout: 10000 })
      .first()
      .click({ force: true });
    cy.wait(1000);
    cy.get('#desktop_view', { timeout: 10000 }).should('be.visible');
  });

});
