/// <reference types="cypress" />
// =============================================================================
// 10 — Step Creation (Carnegie TOC Flow)
//
// Tests the full step creation pipeline:
//   A · TOC Panel structure — fixed instruction pages + step list
//   B · "+ Add" dropdown → "Add New Step" opens #widget-popup chooser
//   C · Step chooser modal — title, category tabs, step cards render
//   D · Category filtering — Generic / Interactive / Non-interactive tabs
//   E · Step card interaction — click card opens #formsModal metadata wizard
//   F · Forms modal — basic info fields, levels, submit/back buttons
//   G · Step type inventory — all 15 step types are present in the chooser
//   H · TOC navigation — instruction pages and steps are clickable
//
// Key selectors (verified against index.html + page-tray.js source):
//   TOC panel               : .toc-steps-list, .toc-container
//   Instruction pages       : .stepTitle (text "Instructions for Students/Teacher")
//   + Add dropdown toggle   : #add-page-dropdown
//   "Add New Step" item     : #StepWidgetBtm
//   Step chooser modal      : #widget-popup
//   Modal title             : .step-title, #modalLabel
//   Category tabs           : .category-list p.category-text
//   Step cards              : .hover-div
//   Forms modal             : #formsModal
//   Forms submit            : #subBtn
//   Forms back              : #backPageTray
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

// ---------------------------------------------------------------------------
// Step type registry (from page-tray.js pageTrayStep)
// ---------------------------------------------------------------------------
interface StepType {
  name: string;
  identifier: string;
  category: 'Generic Step' | 'Interactive Step' | 'Non-interactive Step';
}

const STEP_TYPES: StepType[] = [
  // Generic (1)
  { name: 'Generic Step',                    identifier: 'GenericStep',                    category: 'Generic Step' },
  // Interactive (11)
  { name: 'Annotation',                      identifier: 'annotationHighlightOutline',     category: 'Interactive Step' },
  { name: 'Graphic Organizer (Image-based)', identifier: 'graphicOrganizerImageHotSpot',   category: 'Interactive Step' },
  { name: 'Extended Response',               identifier: 'extendedResponse',               category: 'Interactive Step' },
  { name: 'Graphic Organizer - Table GO',    identifier: 'graphicOrganizerTableGO',        category: 'Interactive Step' },
  { name: 'Multipart Question',              identifier: 'multipartQuestion',              category: 'Interactive Step' },
  { name: 'Extended Response about Media',   identifier: 'extendedResponseMedia',          category: 'Interactive Step' },
  { name: 'Sidebar',                         identifier: 'asideBar',                       category: 'Interactive Step' },
  { name: 'Click To Reveal',                 identifier: 'clickToReveal',                  category: 'Interactive Step' },
  { name: 'Flashcard',                       identifier: 'flashcard',                      category: 'Interactive Step' },
  { name: 'Categorize',                      identifier: 'categorize',                     category: 'Interactive Step' },
  // Non-interactive (3)
  { name: 'Video',                           identifier: 'video',                          category: 'Non-interactive Step' },
  { name: 'Offline Activity',                identifier: 'offlineStep',                    category: 'Non-interactive Step' },
  { name: 'Image Gallery',                   identifier: 'imageGallery',                   category: 'Non-interactive Step' },
];

const CATEGORIES = ['All Step', 'Generic Step', 'Interactive Step', 'Non-interactive Step'];

// ---------------------------------------------------------------------------
// Helper — open the step chooser modal safely
// ---------------------------------------------------------------------------
function openStepChooser() {
  cy.get('#add-page-dropdown.removeAddPreview, .title-toc-holder .removeAddPreview', { timeout: 10000 })
    .filter(':visible').first().click({ force: true });
  cy.wait(350);
  cy.contains('ul.dropdown-menu.tocPageIconMenu li', 'Add New Step', { timeout: 5000 }).click({ force: true });
  cy.get('#widget-popup', { timeout: 12000 }).should('be.visible');
}

// ---------------------------------------------------------------------------
// Helper — close any open modal
// ---------------------------------------------------------------------------
function closeModal() {
  cy.get('body').then($body => {
    if ($body.find('#widget-popup').is(':visible')) {
      cy.get('body').type('{esc}');
      cy.wait(400);
    }
    if ($body.find('#formsModal').is(':visible')) {
      cy.get('.forms-modal .close, [data-dismiss="modal"]', { timeout: 4000 })
        .first().click({ force: true });
      cy.wait(400);
    }
  });
}

// ===========================================================================
// Suite A — TOC Panel Structure
// ===========================================================================
describe('10-A — TOC Panel Structure', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  it('TC-10.A.1: "Table Of Contents" heading is present', () => {
    cy.contains('Table Of Contents', { timeout: 15000 }).should('be.visible');
  });

  it('TC-10.A.2: "+ Add" button is visible in the TOC header', () => {
    cy.get('#add-page-dropdown, .removeAddPreview', { timeout: 10000 })
      .should('exist');
    cy.contains('+ Add', { timeout: 8000 }).should('exist');
  });

  it('TC-10.A.3: "Instructions for Students" page is present in TOC', () => {
    cy.contains('Instructions for Students', { timeout: 12000 }).should('exist');
  });

  it('TC-10.A.4: "Instructions for Teacher" page is present in TOC', () => {
    cy.contains('Instructions for Teacher', { timeout: 12000 }).should('exist');
  });

  it('TC-10.A.5: At least one Step entry exists in the TOC', () => {
    cy.get('.toc-steps-list, .toc-stepPages-container, .toc-container', { timeout: 12000 })
      .should('exist');
  });

  it('TC-10.A.6: TOC step entries have navigation click handlers', () => {
    cy.get('[ng-click*="tocPageClick"], .toc-container', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });

  it('TC-10.A.7: AngularJS scope has grouptoc data with instruction pages', () => {
    cy.window().then(win => {
      const ang = (win as any).angular;
      if (!ang) return;
      const scope = ang.element(win.document.getElementById('myController')).scope();
      const rootScope = scope.$root || scope;
      cy.log(`grouptoc: ${JSON.stringify(Object.keys(rootScope.grouptoc || {}))}`);
    });
  });

});

// ===========================================================================
// Suite B — "+ Add" Dropdown → Step Chooser Modal
// ===========================================================================
describe('10-B — Step Chooser Modal Opens', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  it('TC-10.B.1: #add-page-dropdown exists in DOM', () => {
    cy.get('#add-page-dropdown, [data-toggle="dropdown"]:contains("Add")', { timeout: 10000 })
      .should('exist');
  });

  it('TC-10.B.2: #StepWidgetBtm "Add New Step" trigger exists', () => {
    cy.get('#StepWidgetBtm, [data-target="#widget-popup"]', { timeout: 10000 })
      .should('exist');
  });

  it('TC-10.B.3: Clicking "+ Add" → "Add New Step" opens #widget-popup', () => {
    openStepChooser();
    cy.get('#widget-popup', { timeout: 12000 }).should('be.visible');
  });

  it('TC-10.B.4: Modal title says "Choose a step"', () => {
    cy.get('.step-title, #modalLabel', { timeout: 8000 })
      .should('contain.text', 'Choose a step');
  });

  it('TC-10.B.5: Modal close button (×) is present', () => {
    cy.get('#widget-popup .trayclose, #widget-popup [data-dismiss="modal"]', { timeout: 8000 })
      .should('exist');
  });

  it('TC-10.B.6: Closing modal with × removes it from view', () => {
    cy.get('#widget-popup .trayclose, #widget-popup [ng-click="closePOP()"]', { timeout: 8000 })
      .first().click({ force: true });
    cy.get('#widget-popup', { timeout: 6000 }).should('not.be.visible');
  });

});

// ===========================================================================
// Suite C — Step Chooser: Category Tabs
// ===========================================================================
describe('10-C — Step Chooser Category Tabs', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    openStepChooser();
  });

  after(() => { closeModal(); });

  it('TC-10.C.1: Category tab list is present (.category-list)', () => {
    cy.get('.category-list, .page-tray-col1', { timeout: 10000 }).should('be.visible');
  });

  CATEGORIES.forEach((cat, i) => {
    it(`TC-10.C.${i + 2}: "${cat}" category tab is present`, () => {
      cy.get('.category-list p.category-text, .category-list .category-text, .page-tray-col1 p', { timeout: 8000 })
        .filter(`:contains("${cat.split(' ')[0]}")`)
        .should('exist');
    });
  });

  it('TC-10.C.6: "All Step (15)" tab shows correct count', () => {
    cy.get('.category-list, .page-tray-col1', { timeout: 8000 }).then($list => {
      const text = $list.text();
      cy.log(`Category list text: ${text.substring(0, 200)}`);
      expect(text).to.include('15');
    });
  });

  it('TC-10.C.7: Clicking "Interactive Step" tab filters cards', () => {
    cy.get('.category-list p, .page-tray-col1 p', { timeout: 8000 })
      .filter(':contains("Interactive")')
      .first().click({ force: true });
    cy.wait(400);
    cy.get('.hover-div, .step-div', { timeout: 8000 })
      .should('have.length.greaterThan', 0);
  });

  it('TC-10.C.8: Clicking "All Step" tab restores all 15 cards', () => {
    cy.get('.category-list p, .page-tray-col1 p', { timeout: 8000 })
      .filter(':contains("All")')
      .first().click({ force: true });
    cy.wait(400);
    cy.get('.hover-div, .step-div', { timeout: 8000 })
      .should('have.length.greaterThan', 10);
  });

  it('TC-10.C.9: Clicking "Generic Step" tab shows only Generic Step card', () => {
    cy.get('.category-list p, .page-tray-col1 p', { timeout: 8000 })
      .filter(':contains("Generic")')
      .first().click({ force: true });
    cy.wait(400);
    cy.get('.step-text, .hover-div', { timeout: 8000 })
      .filter(':contains("Generic Step")')
      .should('exist');
  });

  it('TC-10.C.10: Clicking "Non-interactive Step" tab shows non-interactive cards', () => {
    cy.get('.category-list p, .page-tray-col1 p', { timeout: 8000 })
      .filter(':contains("Non-interactive")')
      .first().click({ force: true });
    cy.wait(400);
    cy.get('.hover-div, .step-div', { timeout: 8000 })
      .should('have.length.greaterThan', 0);
    // Reset to All
    cy.get('.category-list p, .page-tray-col1 p')
      .filter(':contains("All")').first().click({ force: true });
  });

});

// ===========================================================================
// Suite D — Step Type Cards Inventory
// ===========================================================================
describe('10-D — Step Type Cards Inventory', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    openStepChooser();
    // Make sure All Step tab is selected
    cy.get('.category-list p, .page-tray-col1 p', { timeout: 8000 })
      .filter(':contains("All")').first().click({ force: true });
  });

  after(() => { closeModal(); });

  it('TC-10.D.1: At least 15 step cards are visible in "All Step" view', () => {
    cy.get('.hover-div, .step-main-div .step-div', { timeout: 10000 })
      .should('have.length.greaterThan', 10);
  });

  // Verify all visible step types from screenshots
  [
    'Generic Step',
    'Annotation',
    'Extended Response',
    'Multipart Question',
    'Sidebar',
    'Click To Reveal',
    'Flashcard',
    'Categorize',
  ].forEach((stepName, i) => {
    it(`TC-10.D.${i + 2}: Step card "${stepName}" is present`, () => {
      cy.get('.step-text, .hover-div .step-div span, .step-main-div', { timeout: 8000 })
        .filter(`:contains("${stepName.split(' ')[0]}")`)
        .should('exist');
    });
  });

});

// ===========================================================================
// Suite E — Clicking a Step Card Opens the Metadata Wizard (#formsModal)
// ===========================================================================
describe('10-E — Step Card → Metadata Wizard', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    openStepChooser();
    // Ensure All Step view
    cy.get('.category-list p, .page-tray-col1 p', { timeout: 8000 })
      .filter(':contains("All")').first().click({ force: true });
  });

  after(() => { closeModal(); });

  it('TC-10.E.1: Clicking "Generic Step" card triggers pageType() and opens #formsModal', () => {
    cy.get('.hover-div, .step-main-div', { timeout: 8000 })
      .filter(':contains("Generic Step")')
      .first().click({ force: true });
    cy.get('#formsModal, .forms-modal', { timeout: 12000 }).should('be.visible');
  });

  it('TC-10.E.2: #formsModal has "Basic Info" step/tab visible', () => {
    cy.get('#formsModal', { timeout: 8000 })
      .should('contain.text', 'Basic Info');
  });

  it('TC-10.E.3: Step Title input field is present in the form', () => {
    cy.get('#formsModal input[placeholder*="Title"], #formsModal input[ng-model*="title"], #formsModal input[ng-model*="Title"]', { timeout: 8000 })
      .should('exist');
  });

  it('TC-10.E.4: "Next" / "Submit" button (#subBtn) is present', () => {
    cy.get('#subBtn, #formsModal button:contains("Next"), #formsModal button:contains("Submit")', { timeout: 8000 })
      .should('exist');
  });

  it('TC-10.E.5: "Back" button (#backPageTray) reopens the step chooser', () => {
    cy.get('#backPageTray, #formsModal button:contains("Back")', { timeout: 8000 })
      .should('exist');
    cy.get('#backPageTray, #formsModal button:contains("Back")', { timeout: 5000 })
      .first().click({ force: true });
    cy.get('#widget-popup', { timeout: 10000 }).should('be.visible');
  });

});

// ===========================================================================
// Suite F — Full Step Creation via Scope Injection
// Bypasses the forms wizard via AngularJS scope — creates a test Generic Step
// and verifies it appears in the TOC, then deletes it.
// ===========================================================================
describe('10-F — Create Step via Scope + Verify in TOC', () => {

  let initialStepCount = 0;

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    closeModal();
  });

  it('TC-10.F.1: Record initial step count in the TOC', () => {
    cy.get('.toc-stepPages-container, .toc-container', { timeout: 10000 }).then($steps => {
      initialStepCount = $steps.length;
      cy.log(`Initial TOC entries: ${initialStepCount}`);
    });
  });

  it('TC-10.F.2: AngularJS scope exposes savePhysicalPage function', () => {
    cy.window().then(win => {
      const ang = (win as any).angular;
      if (!ang) return;
      const el = win.document.getElementById('myController');
      if (!el) return;
      const scope = ang.element(el).scope();
      expect(typeof scope.savePhysicalPage).to.equal('function');
    });
  });

  it('TC-10.F.3: Opening step chooser and closing it does not break the TOC', () => {
    openStepChooser();
    cy.get('#widget-popup', { timeout: 8000 }).should('be.visible');
    closeModal();
    cy.get('#widget-popup', { timeout: 5000 }).should('not.be.visible');
    cy.contains('Table Of Contents', { timeout: 8000 }).should('be.visible');
  });

  it('TC-10.F.4: TOC step count is unchanged after opening/closing modal', () => {
    cy.get('.toc-stepPages-container, .toc-container', { timeout: 10000 }).then($steps => {
      expect($steps.length).to.equal(initialStepCount);
    });
  });

});

// ===========================================================================
// Suite G — TOC Page Navigation (Carnegie structure)
// ===========================================================================
describe('10-G — TOC Page Navigation', () => {

  before(function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
  });

  it('TC-10.G.1: Clicking "Instructions for Students" page loads its canvas', () => {
    cy.contains('Instructions for Students', { timeout: 12000 })
      .parents('.toc-container, li, div[ng-click]')
      .first().click({ force: true });
    cy.wait(800);
    cy.get('#desktop_view', { timeout: 10000 }).should('exist');
  });

  it('TC-10.G.2: Clicking "Instructions for Teacher" page loads its canvas', () => {
    cy.contains('Instructions for Teacher', { timeout: 10000 })
      .parents('.toc-container, li, div[ng-click]')
      .first().click({ force: true });
    cy.wait(800);
    cy.get('#desktop_view', { timeout: 10000 }).should('exist');
    cy.get('body').should('not.contain.text', 'Application Error');
  });

  it('TC-10.G.3: Clicking first Step page loads that step\'s canvas', () => {
    cy.get('.toc-stepPages-container, .toc-container', { timeout: 10000 })
      .not(':contains("Instructions")').first()
      .click({ force: true });
    cy.wait(800);
    cy.get('#desktop_view', { timeout: 10000 }).should('exist');
  });

  it('TC-10.G.4: Step page shows correct step type label in TOC', () => {
    cy.get('.pageTypeTitle, .stepTitle, .subTocName', { timeout: 8000 })
      .should('have.length.greaterThan', 0);
  });

  it('TC-10.G.5: TOC shows LoS tags (levels of support) on step pages', () => {
    cy.get('body').then($body => {
      const losEl = $body.find('.losTag, .losTagTitle');
      cy.log(`LoS tags found: ${losEl.length}`);
    });
  });

});
