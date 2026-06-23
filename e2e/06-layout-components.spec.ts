/// <reference types="cypress" />
// =============================================================================
// 06 — Layout Components
// Component list: fixtures/test-registry.json (primary) + local fallback
// =============================================================================

import { loadComponentsForSpec } from '../support/component-registry';

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

interface LayoutComponent {
  name: string;
  dataType: string;
}

const LAYOUT_FALLBACK: LayoutComponent[] = [
  { name: 'Left',          dataType: 'layout-1' },
  { name: 'Center',        dataType: 'layout-2' },
  { name: 'Right',         dataType: 'layout-3' },
  { name: 'Four Column',   dataType: 'layout-4' },
  { name: 'Three Column',  dataType: 'layout-5' },
  { name: 'Custom Center', dataType: 'layout-6' },
  { name: 'Flexi',         dataType: 'layout-7' },
];

const LAYOUTS: LayoutComponent[] = loadComponentsForSpec(
  '06-layout-components.spec.ts',
  LAYOUT_FALLBACK,
);

describe('06 — Layout Components', () => {

  before(function () {
    if (!LAUNCH_URL) this.skip();
  });

  // ── STEP 0 ─────────────────────────────────────────────────────────────────
  // Explicit it() so this step APPEARS in the test report and the video clearly
  // shows the step creation flow before any component testing begins.
  // ───────────────────────────────────────────────────────────────────────────
  it('SETUP · Step 0 — Module-aware canvas setup before layout testing', function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    cy.setupModuleCanvas();
    cy.openAddPanel();
    cy.expandSection('Layout');
  });

  // ── Layout component tests (use canvas state from Step 0) ──────────────────
  LAYOUTS.forEach((layout, idx) => {
    const tc = `TC-06.${(idx * 3) + 1}`;

    it(`${tc}a — [Layout] ${layout.name}: visible in the Layout section of the Add panel`, () => {
      cy.log(`🔍 Checking "${layout.name}" exists in Layout accordion`);
      cy.get('#lbl-add-content li.activeDrags .widget-name', { timeout: 10000 })
        .filter(`:contains("${layout.name}")`).scrollIntoView()
        .should('exist').and('be.visible');
      cy.wait(300);
    });

    it(`${tc}b — [Layout] ${layout.name}: drops onto canvas via scope injection`, () => {
      cy.log(`🖱 Dropping "${layout.name}" onto canvas`);
      cy.dropComponent(layout.name);
      cy.wait(600);
      cy.get('#desktop_view .sd-item', { timeout: 15000 })
        .last().scrollIntoView().should('be.visible');
      cy.wait(400);
    });

    it(`${tc}c — [Layout] ${layout.name}: settings panel opens on click, then cleanup`, () => {
      cy.log(`⚙️ Opening settings panel for "${layout.name}"`);
      cy.openComponentSettings();
      cy.get('.componentSettingPanel', { timeout: 12000 }).should('be.visible');
      cy.wait(600);
      cy.log(`🗑 Cleaning up "${layout.name}" from canvas`);
      cy.deleteLastComponent();
      cy.wait(400);
    });
  });

});
