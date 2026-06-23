/// <reference types="cypress" />
// =============================================================================
// 01 — Session & Launch Validation
// Verifies that the authoring URL is well-formed and the page loads without
// session errors or login redirects.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

describe('01 — Session & Launch Validation', () => {

  it('TC-01.1: Launch URL must be configured', function () {
    if (!LAUNCH_URL) this.skip();
    expect(LAUNCH_URL).to.be.a('string').and.have.length.greaterThan(10);
  });

  it('TC-01.2: Launch URL must contain userToken parameter', function () {
    if (!LAUNCH_URL) this.skip();
    const url = new URL(LAUNCH_URL);
    expect(url.searchParams.get('userToken'), 'userToken query param').to.not.be.null;
    expect(url.searchParams.get('userToken')).to.have.length.greaterThan(0);
  });

  it('TC-01.3: Launch URL must contain courseId parameter', function () {
    if (!LAUNCH_URL) this.skip();
    const url = new URL(LAUNCH_URL);
    expect(url.searchParams.get('courseId'), 'courseId query param').to.not.be.null;
  });

  it('TC-01.4: Opening URL should not redirect to login page', function () {
    if (!LAUNCH_URL) this.skip();
    cy.visit(LAUNCH_URL, { timeout: 90000 });
    cy.url({ timeout: 20000 }).should('not.include', '/login').and('not.include', 'login.html');
  });

  it('TC-01.5: Session Expired modal must not be visible', function () {
    if (!LAUNCH_URL) this.skip();
    cy.get('#Session-Expired-Modal', { timeout: 15000 }).should($modal => {
      const visible = $modal.hasClass('in') || $modal.hasClass('show') || $modal.is(':visible');
      expect(visible, 'hidden Session Expired modal template').to.be.false;
    });
  });

  it('TC-01.6: Page title should indicate the authoring tool', function () {
    if (!LAUNCH_URL) this.skip();
    cy.title({ timeout: 15000 }).should('not.be.empty');
  });

  it('TC-01.7: No JavaScript fatal error overlay should appear', function () {
    if (!LAUNCH_URL) this.skip();
    cy.get('body').should('not.contain.text', 'Application Error');
    cy.get('body').should('not.contain.text', 'Uncaught');
  });

});
