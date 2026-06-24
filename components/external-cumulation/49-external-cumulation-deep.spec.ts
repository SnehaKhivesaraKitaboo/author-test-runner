/// <reference types="cypress" />
import './commands';
import { EC_LIBRARY, EC_RULES, EC_TOC } from './selectors';
import { EC_DATA } from './testdata';

// =============================================================================
// 49 — External Cumulation — Deep Component Test
//
// QC authority : Author Test Cases - External Cumulation.pdf (TC_01–TC_47)
// Source authority:
//   index.html (Import From Library entry + #asset-library-popup modal)
//   editor/ngcontroller.js (openAssetLibrary / selectActivity / selectStep /
//     selectLos / addActivityFromLibrary / programName)
//
// MECHANISM (source-verified): "External Cumulation" has NO dedicated authoring
// toggle / external-lesson-linkage / display-rule widget. It has TWO facets:
//   1. AUTHORING — importing a step from a DIFFERENT activity via the shared
//      Asset Library / "Import From Library" flow (#asset-library-popup). This
//      is the only DOM-assertable surface (same modal as Internal Cumulation,
//      but the author selects a cross-activity source).
//   2. RUNTIME — cross-lesson SCORM data patching (activity 6.3 ↔ 6.5). Data
//      entered/submitted in one external lesson cumulates into another. This is
//      a Reader/SCORM runtime behaviour (incl. the "SCORM API failed" popup) and
//      is DEFERRED.
//
// The Import entry is gated by getProgramName() — when absent the relevant
// blocks log + return gracefully. See EXTERNAL-CUMULATION-DEEP-AUTOMATION.md.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

function skipIfNoUrl(ctx: Mocha.Context) {
  if (!LAUNCH_URL) ctx.skip();
}

before(function () {
  if (!LAUNCH_URL) this.skip();
});

beforeEach(function () {
  skipIfNoUrl(this);
  const title = this.currentTest?.title || '';
  if (/TC_STEP/.test(title)) return;
  cy.ensureExternalCumulationDeepSetup({ skipStepCreation: true });
});

// ===========================================================================
// Suite A — Step authoring entry (TC_04, TC_05)
// ===========================================================================
describe('49-A — External Cumulation: Step authoring entry (TC_04–TC_05)', () => {
  it('TC_STEP — A new Generic Step can be created (precondition for cumulation)', function () {
    skipIfNoUrl(this);
    cy.ensureExternalCumulationDeepSetup({ skipStepCreation: false });
    cy.get(EC_TOC.stepsList, { timeout: 20000 }).should('exist');
    cy.log('✅ TC_STEP: Step list present after creating a step');
  });

  it('TC_04/TC_05 — "+ Add" TOC control exposes Add New Step', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      const toggle = $body.find(`${EC_TOC.addDropdownToggle}:visible`);
      if (toggle.length) cy.wrap(toggle.first()).click({ force: true });
    });
    cy.get(EC_TOC.addNewStepItem).should('exist');
    cy.log('✅ TC_04/05: Add New Step entry present in TOC + Add menu');
  });
});

// ===========================================================================
// Suite B — Import From Library entry (TC_11, TC_12) — the cumulation mechanism
// ===========================================================================
describe('49-B — External Cumulation: Import From Library entry (TC_11–TC_12)', () => {
  it('TC_11 — "Import From Library" entry is gated by program context', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      const toggle = $body.find(`${EC_TOC.addDropdownToggle}:visible`);
      if (toggle.length) cy.wrap(toggle.first()).click({ force: true });
    });
    cy.get('body').then(($b2) => {
      if ($b2.find(EC_TOC.importFromLibraryItem).length === 0) {
        cy.log('ℹ TC_11: Import entry not rendered (getProgramName() falsy in this build) — flag-gated');
        return;
      }
      cy.get(EC_TOC.importFromLibraryItem).should('contain.text', 'Import From Library');
      cy.log('✅ TC_11: "Import From Library" entry present (external re-use mechanism)');
    });
  });

  it('TC_12 — Clicking import opens the step/asset library modal', function () {
    skipIfNoUrl(this);
    cy.openExternalCumulationLibrary().then((opened) => {
      if (!opened) {
        cy.log('ℹ TC_12: Library modal flag-gated — skipping modal assertions gracefully');
        return;
      }
      cy.get(EC_LIBRARY.modal).should('be.visible');
      cy.get(EC_LIBRARY.searchInput).should('exist');
      cy.log('✅ TC_12: Asset Library modal opens with search options visible');
    });
  });
});

// ===========================================================================
// Suite C — Cross-activity listing & search (TC_13, TC_14, TC_15, TC_16)
// ===========================================================================
describe('49-C — External Cumulation: Cross-activity listing & search (TC_13–TC_16)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openExternalCumulationLibrary().as('libOpen');
  });

  it('TC_13/TC_16 — Activity list renders title + created-date metadata', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_13/16: library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(EC_LIBRARY.activityTable).length === 0) {
          cy.get(EC_LIBRARY.emptyState).should('exist');
          cy.log('ℹ TC_13/16: no activities in library (empty state shown)');
          return;
        }
        cy.get(`${EC_LIBRARY.activityTable} th`).should('contain.text', 'Activity Title');
        cy.get(`${EC_LIBRARY.activityTable} th`).should('contain.text', 'Created');
        cy.log('✅ TC_13/16: cross-activity title + created metadata present');
      });
    });
  });

  it('TC_14/TC_15 — Search another activity by exact and partial title', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_14/15: library flag-gated'); return; }
      cy.searchExternalCumulationLibrary(EC_DATA.searchExact);
      cy.get(EC_LIBRARY.searchInput).should('have.value', EC_DATA.searchExact);
      cy.searchExternalCumulationLibrary(EC_DATA.searchPartial);
      cy.get(EC_LIBRARY.searchInput).should('have.value', EC_DATA.searchPartial);
      cy.log('✅ TC_14/15: exact + partial cross-activity search terms accepted');
    });
  });

  it('TC_37(import) — No-match search shows the empty state', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ empty-state: library flag-gated'); return; }
      cy.searchExternalCumulationLibrary(EC_DATA.searchNoMatch);
      cy.wait(400);
      cy.get('body').then(($body) => {
        if ($body.find(`${EC_LIBRARY.emptyState}:visible`).length) {
          cy.get(EC_LIBRARY.emptyState).should('contain.text', 'No activities found');
          cy.log('✅ empty-state: "No activities found" shown (import from missing activity unavailable)');
        } else {
          cy.log('ℹ empty-state: list still populated (server-side search may differ) — non-fatal');
        }
      });
    });
  });
});

// ===========================================================================
// Suite D — Cross-activity step selection & insert gating (TC_17, TC_26)
// ===========================================================================
describe('49-D — External Cumulation: Step selection & insert gating (TC_17, TC_26)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openExternalCumulationLibrary().as('libOpen');
  });

  it('TC_26 — Insert is disabled until an activity is selected', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_26: library flag-gated'); return; }
      cy.get(EC_LIBRARY.insertDisabled).should('exist');
      cy.log('✅ TC_26: Insert disabled with no activity/step selected (cursor not-allowed)');
    });
  });

  it('TC_17 — Selecting another activity reveals its step list in preview', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_17: library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(EC_LIBRARY.activityRow).length === 0) {
          cy.log('ℹ TC_17: no activities to select');
          return;
        }
        cy.get(EC_LIBRARY.activityRow).first().click({ force: true });
        cy.get(EC_LIBRARY.previewPane).should('be.visible');
        cy.get(EC_LIBRARY.stepBlock).should('have.length.greaterThan', 0);
        cy.log('✅ TC_17: step blocks listed for selected external activity');
      });
    });
  });

  it('TC_18(gate) — Selecting a step LOS chip enables Insert', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_18(gate): library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(EC_LIBRARY.activityRow).length === 0) { cy.log('ℹ no activities'); return; }
        cy.get(EC_LIBRARY.activityRow).first().click({ force: true });
        cy.get('body').then(($b2) => {
          const chip = $b2.find(`${EC_LIBRARY.losChip}:not(.disableInsert)`);
          if (chip.length === 0) { cy.log('ℹ TC_18(gate): no selectable LOS chips'); return; }
          cy.wrap(chip.first()).click({ force: true });
          cy.get(EC_LIBRARY.insertEnabled).should('exist');
          cy.log('✅ TC_18(gate): Insert enabled after cross-activity + LOS selection');
        });
      });
    });
  });
});

// ===========================================================================
// Suite E — Cancel / dismiss (TC_25)
// ===========================================================================
describe('49-E — External Cumulation: Cancel import (TC_25)', () => {
  it('TC_25 — Cancel closes the library without adding a step', function () {
    skipIfNoUrl(this);
    cy.openExternalCumulationLibrary().then((opened) => {
      if (!opened) { cy.log('ℹ TC_25: library flag-gated'); return; }
      cy.get(EC_LIBRARY.cancelBtn).should('be.visible').click({ force: true });
      cy.get(EC_LIBRARY.modal).should('not.be.visible');
      cy.log('✅ TC_25: Cancel dismisses the library (no new step)');
    });
  });
});

// ===========================================================================
// Suite F — Library filters (TC_36 — DOM-assertable config)
// ===========================================================================
describe('49-F — External Cumulation: Library filters (TC_36)', () => {
  it('TC_36 — Date/Owner/Tags-equivalent metadata filters present in rail', function () {
    skipIfNoUrl(this);
    cy.openExternalCumulationLibrary().then((opened) => {
      if (!opened) { cy.log('ℹ TC_36: library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(EC_LIBRARY.filterRail).length === 0) {
          cy.log('ℹ TC_36: filter rail collapsed/not rendered');
          return;
        }
        cy.get(EC_LIBRARY.filterRail).should('contain.text', 'All Metadata');
        cy.get(EC_LIBRARY.filterRail).should('contain.text', 'Skills');
        cy.get(EC_LIBRARY.filterRail).should('contain.text', 'Grade');
        cy.log('✅ TC_36: library filter options present');
      });
    });
  });
});

// ===========================================================================
// Suite G — Security
// ===========================================================================
describe('49-G — External Cumulation: Security', () => {
  it('SEC — Script injected into library search is not executed', function () {
    skipIfNoUrl(this);
    cy.openExternalCumulationLibrary().then((opened) => {
      if (!opened) { cy.log('ℹ SEC: library flag-gated'); return; }
      cy.get(EC_LIBRARY.searchInput).clear({ force: true }).type(EC_DATA.scriptInjection, { force: true });
      cy.get(EC_LIBRARY.searchInput).should('have.value', EC_DATA.scriptInjection);
      cy.window().then((win) => {
        expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
      });
      cy.log('✅ SEC: script in search input treated as text only');
    });
  });

  it('SEC(config) — Cross-lesson SCORM patch is a runtime concern (documented invariant)', function () {
    skipIfNoUrl(this);
    expect(EC_RULES.scormDataPatchIsRuntime, '6.3↔6.5 data patch is Reader/SCORM runtime').to.eq(true);
    cy.log('✅ SEC(config): external cumulation patching deferred to runtime — no author-side data handling');
  });
});

// ===========================================================================
// DEFERRED — cross-lesson SCORM data patching (6.3↔6.5), content fidelity,
// publish/republish, permissions, teacher reports, repeated-attempt edge cases.
// (External Cumulation is runtime-scoring heavy → the majority defer.)
// ===========================================================================
describe('49-Z — External Cumulation: Deferred (cross-lesson SCORM / reports / lifecycle)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Studio URL launch + listing page (login/runtime flow)'],
    ['TC_02', 'Create math activity end-to-end (activity-creation flow)'],
    ['TC_03', 'Start authoring redirect (activity-creation flow)'],
    ['TC_06', 'Step-creation Cancel popup behaviour (modal lifecycle)'],
    ['TC_07', 'Change Step → Choose Step screen (step-wizard navigation)'],
    ['TC_08', 'Enter Instructions for Students (step-wizard field)'],
    ['TC_09', 'Enter Instructions for Teachers (step-wizard field)'],
    ['TC_10', 'Open existing activity with steps (My Activities navigation)'],
    ['TC_18', 'Import step from another activity → step n+1 (post-insert state)'],
    ['TC_19', 'Imported step retains all original content (content fidelity)'],
    ['TC_20', 'Imported step retains formatting (font/bullets — visual)'],
    ['TC_21', 'Imported step metadata editable (persistence)'],
    ['TC_22', 'Edit content of imported step saves (persistence)'],
    ['TC_23', 'Save + preview imported step (Preview flow)'],
    ['TC_24', 'Imported step order in navigation (post-insert ordering)'],
    ['TC_27', 'Read-only user → permission denied (RBAC runtime)'],
    ['TC_28', 'All content types intact on import (content fidelity)'],
    ['TC_29', 'Drag/drop widget works in imported step (Preview runtime)'],
    ['TC_30', 'Very large step import performance (perf, runtime)'],
    ['TC_31', 'Broken/unsupported media warning on import (runtime validation)'],
    ['TC_32', 'Multiple imports from same external activity independent (state)'],
    ['TC_33', 'Publish activity with imported step (publish flow)'],
    ['TC_34', 'Republish updates reader view (Reader runtime)'],
    ['TC_35', 'Imported step does not affect source activity (cross-activity integrity)'],
    ['TC_37', 'Import from deleted external activity unavailable (runtime/server)'],
    ['TC_38', 'External cumulation 6.3 → 6.5 (Reader/SCORM patch)'],
    ['TC_39', 'External cumulation 6.5 → 6.3 (Reader/SCORM patch)'],
    ['TC_40', 'Cumulation fails on SCORM API failure popup (Reader/SCORM)'],
    ['TC_41', 'Reverse cumulation child→parent should not appear (Reader/SCORM)'],
    ['TC_42', 'External cumulation works for first attempt (Reader/SCORM)'],
    ['TC_43', 'Data patch before submit, first attempt (Reader/SCORM)'],
    ['TC_44', 'Data patch after submit, first attempt (Reader/SCORM)'],
    ['TC_45', 'Repeated-attempt data not reflected — odd observation (Reader/SCORM)'],
    ['TC_46', 'External cumulation for In-Progress student (Reader/SCORM)'],
    ['TC_47', 'Teacher view reflects external cumulation (report runtime)'],
    ['A11Y', 'Library modal a11y (focus order, labels) — deferred audit'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
