/// <reference types="cypress" />
// =============================================================================
// 07 — Element Components
// Component list: fixtures/test-registry.json (primary) + assertion overrides below
// =============================================================================

import { loadComponentsForSpec } from '../support/component-registry';

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

interface ElementComponent {
  name: string;
  dataType: string;
  settingsChecks?: Array<{ label: string; selector: string }>;
  featureInteraction?: () => void;
}

const ELEMENT_OVERRIDES: Record<string, Partial<ElementComponent>> = {
  'Title': {
    settingsChecks: [
      { label: 'Background radio buttons', selector: 'input[name="chapter_radio"]' },
      { label: 'Image background option',  selector: 'input[value="bg-image"]' },
      { label: 'Solid background option',  selector: 'input[value="bg-color"]' },
    ],
    featureInteraction: () => {
      cy.log('🎨 Selecting "Solid Color" background style for Title');
      cy.get('.componentSettingPanel input[value="bg-color"]', { timeout: 6000 })
        .click({ force: true });
      cy.wait(500);
      cy.get('.componentSettingPanel input[value="bg-color"]').should('be.checked');
    },
  },
  'Header': {
    settingsChecks: [
      { label: 'H2 style card',   selector: '.h2-style-holder' },
      { label: 'H3 style card',   selector: '.h3-style-holder' },
      { label: 'Color picker',    selector: '.colorPickerContainer' },
      { label: 'Apply to all',    selector: '.applyToAllButton' },
    ],
    featureInteraction: () => {
      cy.log('🎨 Selecting H3 style for Header');
      cy.get('.componentSettingPanel .h3-style-holder', { timeout: 8000 })
        .scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('.componentSettingPanel .h3-style-holder')
        .should('have.class', 'header-comp-bgColr');
    },
  },
  'Text': {
    settingsChecks: [
      { label: 'Settings section heading', selector: '.Setting-Panel-setting-name' },
      { label: 'Label type checkbox',      selector: 'input[ng-model="currSettings.isLabelTypeParagraph"]' },
    ],
    featureInteraction: () => {
      cy.log('✏️ Clicking inside the Text component and typing content');
      cy.get('#desktop_view .sd-item').last()
        .find('[contenteditable="true"], .paragraph-template, .paragraph-text-div, p[contenteditable]', { timeout: 8000 })
        .first().click({ force: true });
      cy.wait(400);
      cy.get('#desktop_view .sd-item').last()
        .find('[contenteditable="true"]').first()
        .type('{selectall}Automated test: This is a sample paragraph.', { delay: 40 });
      cy.wait(600);
      cy.log('🔘 Toggling "Show Label" setting in settings panel');
      cy.get('.componentSettingPanel input[ng-model="currSettings.isLabelTypeParagraph"]', { timeout: 6000 })
        .check({ force: true });
      cy.wait(400);
    },
  },
  'Image': {
    settingsChecks: [
      { label: 'Upload image box', selector: '#upload-comp-img, .upload-img-btn, [class*="upload"]' },
    ],
  },
  'Video': {
    settingsChecks: [
      { label: 'Settings panel visible',  selector: '.componentSettingPanel' },
      { label: 'Settings has content',    selector: '.componentSettingPanel > *' },
    ],
  },
  'Audio': {
    settingsChecks: [
      { label: 'Settings panel visible',  selector: '.componentSettingPanel' },
      { label: 'Settings has content',    selector: '.componentSettingPanel > *' },
    ],
  },
  'Table': {
    settingsChecks: [
      { label: 'Settings panel visible',  selector: '.componentSettingPanel' },
      { label: 'Settings has content',    selector: '.componentSettingPanel > *' },
    ],
  },
  'Callout Box': {
    settingsChecks: [
      { label: 'Settings panel visible',  selector: '.componentSettingPanel' },
      { label: 'Settings has content',    selector: '.componentSettingPanel > *' },
    ],
  },
  'Situation Header': {
    settingsChecks: [
      { label: 'Settings panel visible',  selector: '.componentSettingPanel' },
      { label: 'Settings has content',    selector: '.componentSettingPanel > *' },
    ],
  },
};

const ELEMENT_FALLBACK: ElementComponent[] = [
  { name: 'Title', dataType: 'chapter-headingNew-h1' },
  { name: 'Header', dataType: 'header' },
  { name: 'Text', dataType: 'paragraph' },
  { name: 'Image', dataType: 'image' },
  { name: 'Video', dataType: 'video' },
  { name: 'Audio', dataType: 'audio' },
  { name: 'Table', dataType: 'tablesNew' },
  { name: 'Callout Box', dataType: 'sidebarComponent' },
  { name: 'Situation Header', dataType: 'situationbox' },
];

const ELEMENTS: ElementComponent[] = loadComponentsForSpec(
  '07-element-components.spec.ts',
  ELEMENT_FALLBACK,
).map(base => ({
  ...base,
  ...(ELEMENT_OVERRIDES[base.name] || {}),
}));

const GENERIC_CHECKS = [
  { label: 'Settings panel is visible',   selector: '.componentSettingPanel'     },
  { label: 'Settings panel has content',  selector: '.componentSettingPanel > *' },
];

function getChecks(el: ElementComponent) {
  return el.settingsChecks && el.settingsChecks.length ? el.settingsChecks : GENERIC_CHECKS;
}

describe('07 — Element Components', () => {

  before(function () {
    if (!LAUNCH_URL) this.skip();
  });

  // ── STEP 0 ─────────────────────────────────────────────────────────────────
  // Explicit it() — shows in video timeline and PDF/HTML report as a named step.
  // Creates a fresh Generic Step so all elements have a blank canvas to test on.
  // ───────────────────────────────────────────────────────────────────────────
  it('SETUP · Step 0 — Module-aware canvas setup before element testing', function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    cy.setupModuleCanvas();
    cy.openAddPanel();
    cy.expandSection('Elements');
  });

  // ── Element component tests (use canvas state from Step 0) ─────────────────
  ELEMENTS.forEach((el, idx) => {
    const tcBase = `TC-07.${(idx * 4) + 1}`;

    it(`${tcBase}a — [Element] ${el.name}: visible in Elements section of the Add panel`, () => {
      cy.log(`🔍 Looking for "${el.name}" in Elements accordion`);
      cy.get('#lbl-add-content li.activeDrags .widget-name', { timeout: 10000 })
        .filter(`:contains("${el.name}")`).scrollIntoView()
        .should('exist').and('be.visible');
      cy.wait(300);
    });

    it(`${tcBase}b — [Element] ${el.name}: drops onto canvas`, () => {
      cy.log(`🖱 Dropping "${el.name}" onto canvas`);
      cy.dropComponent(el.name);
      cy.wait(700);
      cy.get('#desktop_view .sd-item', { timeout: 15000 })
        .last().scrollIntoView().should('be.visible');
      cy.wait(400);
    });

    it(`${tcBase}c — [Element] ${el.name}: settings panel opens when component is clicked`, () => {
      cy.log(`⚙️ Opening settings panel for "${el.name}"`);
      cy.openComponentSettings();
      cy.get('.componentSettingPanel', { timeout: 12000 }).should('be.visible');
      cy.wait(500);
    });

    it(`${tcBase}d — [Element] ${el.name}: settings panel contains expected controls`, () => {
      const checks = getChecks(el);
      checks.forEach(({ label, selector }) => {
        cy.log(`✅ Verifying settings control: "${label}"`);
        cy.get('.componentSettingPanel', { timeout: 5000 })
          .find(selector, { timeout: 8000 }).scrollIntoView()
          .should('exist');
        cy.wait(200);
      });

      // Run feature-specific interaction if defined (shows rich behaviour in video)
      if (el.featureInteraction) {
        cy.log(`🧪 Running feature interaction test for "${el.name}"`);
        el.featureInteraction();
        cy.wait(400);
      }

      cy.log(`🗑 Cleaning up "${el.name}" from canvas`);
      cy.deleteLastComponent();
      cy.wait(400);
    });
  });

});
