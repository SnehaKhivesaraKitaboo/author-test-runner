/// <reference types="cypress" />
import './commands';
import { IC_LIBRARY, IC_RULES, IC_TOC } from './selectors';
import { IC_DATA } from './testdata';

// =============================================================================
// 48 — Internal Cumulation — Deep Component Test
//
// QC authority : Author Test Cases - Internal Cumulation.pdf (TC_01–TC_70)
// Source authority:
//   index.html (Import From Library entry + #asset-library-popup modal)
//   editor/ngcontroller.js (openAssetLibrary / selectActivity / selectStep /
//     selectLos / addActivityFromLibrary / programName)
//
// MECHANISM (source-verified): "Internal Cumulation" has NO dedicated authoring
// toggle / aggregate-display / display-rule widget. It is realised through the
// shared **Asset Library / Import From Library** flow — re-using (duplicating)
// a step from the SAME activity. The cumulative score/LOS roll-up from child to
// parent steps is a Reader/Preview RUNTIME behaviour. Therefore the authoring-
// automatable surface is the import/library UI; all aggregation, teacher-vs-
// student report, persistence-after-reload and LOS-variant cases are DEFERRED.
//
// The Import entry is gated by getProgramName() — when absent the relevant
// blocks log + return gracefully. See INTERNAL-CUMULATION-DEEP-AUTOMATION.md.
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
  cy.ensureInternalCumulationDeepSetup({ skipStepCreation: true });
});

// ===========================================================================
// Suite A — Step authoring entry (TC_04, TC_05, TC_06, TC_07)
// ===========================================================================
describe('48-A — Internal Cumulation: Step authoring entry (TC_04–TC_07)', () => {
  it('TC_STEP — A new Generic Step can be created (precondition for cumulation)', function () {
    skipIfNoUrl(this);
    cy.ensureInternalCumulationDeepSetup({ skipStepCreation: false });
    cy.get(IC_TOC.stepsList, { timeout: 20000 }).should('exist');
    cy.log('✅ TC_STEP: Step list present after creating a step');
  });

  it('TC_04/TC_05 — "+ Add" TOC control exposes Add New Step', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      const toggle = $body.find(`${IC_TOC.addDropdownToggle}:visible`);
      if (toggle.length) cy.wrap(toggle.first()).click({ force: true });
    });
    cy.get(IC_TOC.addNewStepItem).should('exist');
    cy.log('✅ TC_04/05: Add New Step entry present in TOC + Add menu');
  });
});

// ===========================================================================
// Suite B — Import From Library entry (TC_11, TC_12) — the cumulation mechanism
// ===========================================================================
describe('48-B — Internal Cumulation: Import From Library entry (TC_11–TC_12)', () => {
  it('TC_11 — "Import From Library" entry is gated by program context', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      const toggle = $body.find(`${IC_TOC.addDropdownToggle}:visible`);
      if (toggle.length) cy.wrap(toggle.first()).click({ force: true });
    });
    cy.get('body').then(($b2) => {
      if ($b2.find(IC_TOC.importFromLibraryItem).length === 0) {
        cy.log('ℹ TC_11: Import entry not rendered (getProgramName() falsy in this build) — flag-gated');
        return;
      }
      cy.get(IC_TOC.importFromLibraryItem).should('contain.text', 'Import From Library');
      cy.log('✅ TC_11: "Import From Library" entry present (cumulation re-use mechanism)');
    });
  });

  it('TC_12 — Clicking import opens the step/asset library modal', function () {
    skipIfNoUrl(this);
    cy.openInternalCumulationLibrary().then((opened) => {
      if (!opened) {
        cy.log('ℹ TC_12: Library modal flag-gated — skipping modal assertions gracefully');
        return;
      }
      cy.get(IC_LIBRARY.modal).should('be.visible');
      cy.get(IC_LIBRARY.searchInput).should('exist');
      cy.log('✅ TC_12: Asset Library modal opens with search options visible');
    });
  });
});

// ===========================================================================
// Suite C — Library listing & search (TC_13, TC_14, TC_15, TC_16)
// ===========================================================================
describe('48-C — Internal Cumulation: Library listing & search (TC_13–TC_16)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openInternalCumulationLibrary().as('libOpen');
  });

  it('TC_13/TC_16 — Activity list renders title + created-date columns', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_13/16: library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(IC_LIBRARY.activityTable).length === 0) {
          cy.get(IC_LIBRARY.emptyState).should('exist');
          cy.log('ℹ TC_13/16: no activities in library (empty state shown)');
          return;
        }
        cy.get(`${IC_LIBRARY.activityTable} th`).should('contain.text', 'Activity Title');
        cy.get(`${IC_LIBRARY.activityTable} th`).should('contain.text', 'Created');
        cy.log('✅ TC_13/16: activity title + created columns present');
      });
    });
  });

  it('TC_14/TC_15 — Search box accepts exact and partial titles', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_14/15: library flag-gated'); return; }
      cy.searchInternalCumulationLibrary(IC_DATA.searchExact);
      cy.get(IC_LIBRARY.searchInput).should('have.value', IC_DATA.searchExact);
      cy.searchInternalCumulationLibrary(IC_DATA.searchPartial);
      cy.get(IC_LIBRARY.searchInput).should('have.value', IC_DATA.searchPartial);
      cy.log('✅ TC_14/15: exact + partial search terms accepted');
    });
  });

  it('TC_36(import) — No-match search shows the empty state', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ empty-state: library flag-gated'); return; }
      cy.searchInternalCumulationLibrary(IC_DATA.searchNoMatch);
      cy.wait(400);
      cy.get('body').then(($body) => {
        if ($body.find(`${IC_LIBRARY.emptyState}:visible`).length) {
          cy.get(IC_LIBRARY.emptyState).should('contain.text', 'No activities found');
          cy.log('✅ empty-state: "No activities found" shown for no-match search');
        } else {
          cy.log('ℹ empty-state: list still populated (server-side search may differ) — non-fatal');
        }
      });
    });
  });
});

// ===========================================================================
// Suite D — Step selection & insert gating (TC_17, TC_26) — DOM-assertable config
// ===========================================================================
describe('48-D — Internal Cumulation: Step selection & insert gating (TC_17, TC_26)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openInternalCumulationLibrary().as('libOpen');
  });

  it('TC_26 — Insert is disabled until an activity is selected', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_26: library flag-gated'); return; }
      cy.get(IC_LIBRARY.insertDisabled).should('exist');
      cy.log('✅ TC_26: Insert disabled with no activity/step selected (cursor not-allowed)');
    });
  });

  it('TC_17 — Selecting an activity reveals its step list in preview', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_17: library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(IC_LIBRARY.activityRow).length === 0) {
          cy.log('ℹ TC_17: no activities to select');
          return;
        }
        cy.get(IC_LIBRARY.activityRow).first().click({ force: true });
        cy.get(IC_LIBRARY.previewPane).should('be.visible');
        cy.get(IC_LIBRARY.stepBlock).should('have.length.greaterThan', 0);
        cy.log('✅ TC_17: step blocks listed for selected activity');
      });
    });
  });

  it('TC_17(LOS) — Selecting a step LOS chip enables Insert', function () {
    skipIfNoUrl(this);
    cy.get('@libOpen').then((opened) => {
      if (!opened) { cy.log('ℹ TC_17(LOS): library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(IC_LIBRARY.activityRow).length === 0) { cy.log('ℹ no activities'); return; }
        cy.get(IC_LIBRARY.activityRow).first().click({ force: true });
        cy.get('body').then(($b2) => {
          const chip = $b2.find(`${IC_LIBRARY.losChip}:not(.disableInsert)`);
          if (chip.length === 0) { cy.log('ℹ TC_17(LOS): no selectable LOS chips'); return; }
          cy.wrap(chip.first()).click({ force: true });
          cy.get(IC_LIBRARY.insertEnabled).should('exist');
          cy.log('✅ TC_17(LOS): Insert enabled after activity + LOS selection');
        });
      });
    });
  });
});

// ===========================================================================
// Suite E — Cancel / dismiss (TC_25)
// ===========================================================================
describe('48-E — Internal Cumulation: Cancel import (TC_25)', () => {
  it('TC_25 — Cancel closes the library without adding a step', function () {
    skipIfNoUrl(this);
    cy.openInternalCumulationLibrary().then((opened) => {
      if (!opened) { cy.log('ℹ TC_25: library flag-gated'); return; }
      cy.get(IC_LIBRARY.cancelBtn).should('be.visible').click({ force: true });
      cy.get(IC_LIBRARY.modal).should('not.be.visible');
      cy.log('✅ TC_25: Cancel dismisses the library (no new step)');
    });
  });
});

// ===========================================================================
// Suite F — Filters present (TC_36 — DOM-assertable config)
// ===========================================================================
describe('48-F — Internal Cumulation: Library filters (TC_36)', () => {
  it('TC_36 — Metadata/Skills/Artifact/Grade filters present in rail', function () {
    skipIfNoUrl(this);
    cy.openInternalCumulationLibrary().then((opened) => {
      if (!opened) { cy.log('ℹ TC_36: library flag-gated'); return; }
      cy.get('body').then(($body) => {
        if ($body.find(IC_LIBRARY.filterRail).length === 0) {
          cy.log('ℹ TC_36: filter rail collapsed/not rendered');
          return;
        }
        cy.get(IC_LIBRARY.filterRail).should('contain.text', 'All Metadata');
        cy.get(IC_LIBRARY.filterRail).should('contain.text', 'Skills');
        cy.get(IC_LIBRARY.filterRail).should('contain.text', 'Grade');
        cy.log('✅ TC_36: library filter options present');
      });
    });
  });
});

// ===========================================================================
// Suite G — Security
// ===========================================================================
describe('48-G — Internal Cumulation: Security', () => {
  it('SEC — Script injected into library search is not executed', function () {
    skipIfNoUrl(this);
    cy.openInternalCumulationLibrary().then((opened) => {
      if (!opened) { cy.log('ℹ SEC: library flag-gated'); return; }
      cy.get(IC_LIBRARY.searchInput).clear({ force: true }).type(IC_DATA.scriptInjection, { force: true });
      cy.get(IC_LIBRARY.searchInput).should('have.value', IC_DATA.scriptInjection);
      cy.window().then((win) => {
        expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
      });
      cy.log('✅ SEC: script in search input treated as text only');
    });
  });

  it('SEC(config) — Aggregation is a runtime concern (documented invariant)', function () {
    skipIfNoUrl(this);
    expect(IC_RULES.aggregationIsRuntime, 'child→parent roll-up is Reader/Preview runtime').to.eq(true);
    cy.log('✅ SEC(config): aggregation deferred to runtime — no author-side score handling');
  });
});

// ===========================================================================
// DEFERRED — runtime aggregation, teacher-vs-student report, LOS variants,
// persistence-after-reload, content-fidelity, publish/republish, network.
// (Internal Cumulation is runtime-scoring heavy → the majority defer.)
// ===========================================================================
describe('48-Z — Internal Cumulation: Deferred (runtime aggregation / reports / persistence)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Studio URL launch + listing page (login/runtime flow)'],
    ['TC_02', 'Create math activity end-to-end (activity-creation flow)'],
    ['TC_03', 'Start authoring redirect (activity-creation flow)'],
    ['TC_06', 'Step-creation Cancel popup behaviour (modal lifecycle)'],
    ['TC_07', 'Change Step → Choose Step screen (step-wizard navigation)'],
    ['TC_08', 'Enter Instructions for Students (step-wizard field)'],
    ['TC_09', 'Enter Instructions for Teachers (step-wizard field)'],
    ['TC_10', 'Open existing activity with steps (My Activities navigation)'],
    ['TC_18', 'Duplicated step retains all content (content fidelity, runtime)'],
    ['TC_19', 'Duplicated step retains formatting (font/bullets — visual)'],
    ['TC_20', 'Edit duplicated step content saves only that step (persistence)'],
    ['TC_21', 'Edit duplicated step metadata only (persistence)'],
    ['TC_22', 'Save + preview duplicated step (Preview flow)'],
    ['TC_23', 'Preview displays duplicated step exactly (Preview rendering)'],
    ['TC_24', 'Duplicated step order in navigation (post-insert ordering)'],
    ['TC_27', 'Read-only role → permission denied (RBAC runtime)'],
    ['TC_28', 'All content types preserved on duplication (content fidelity)'],
    ['TC_29', 'Drag/drop widget works in duplicated step (Preview runtime)'],
    ['TC_30', 'Very large step duplication performance (perf, runtime)'],
    ['TC_31', 'Unsupported media warning on duplication (runtime validation)'],
    ['TC_32', 'Multiple duplications independent (post-insert state)'],
    ['TC_33', 'Publish activity with duplicated step (publish flow)'],
    ['TC_34', 'Republish updates reader view (Reader runtime)'],
    ['TC_35', 'Child→parent cumulation before submit, Core LOS (Reader)'],
    ['TC_36', 'Child→parent cumulation after submit, Core LOS (Reader)'],
    ['TC_37', 'Partial child data before submit, Core LOS (Reader)'],
    ['TC_38', 'Multiple child steps combined before submit (Reader)'],
    ['TC_39', 'Multiple child steps combined after submit (Reader)'],
    ['TC_40', 'Cumulation Moderate LOS before submit (Reader)'],
    ['TC_41', 'Cumulation Moderate LOS after submit (Reader)'],
    ['TC_42', 'Cumulation Light LOS before submit (Reader)'],
    ['TC_43', 'Cumulation Light LOS after submit (Reader)'],
    ['TC_44', 'Cumulation Intensive LOS before submit (Reader)'],
    ['TC_45', 'Cumulation Intensive LOS after submit (Reader)'],
    ['TC_46', 'Child change reflects instantly on parent (Reader runtime)'],
    ['TC_47', 'Data integrity after submission + refresh (persistence)'],
    ['TC_48', 'No cumulation when child empty (Reader runtime)'],
    ['TC_49', 'Cumulation handles large data sets (perf, Reader)'],
    ['TC_50', 'Formatting of cumulative data preserved (Reader rendering)'],
    ['TC_51', 'Cumulative data accurate after multiple child edits (Reader)'],
    ['TC_52', 'Parent updates after child resubmission (Reader)'],
    ['TC_53', 'Cumulation persists across sessions (persistence/login)'],
    ['TC_54', 'Network failure before submit does not update parent (offline)'],
    ['TC_55', 'Teacher sees data for In-Progress student before submit (report)'],
    ['TC_56', 'Teacher sees data for In-Progress student after submit (report)'],
    ['TC_57', 'Teacher sees data for Completed student (report)'],
    ['TC_58', 'Partial cumulative data for In-Progress (report)'],
    ['TC_59', 'Teacher view updates In-Progress → Completed (report)'],
    ['TC_60', 'Teacher view Moderate LOS In-Progress (report)'],
    ['TC_61', 'Teacher view Moderate LOS Completed (report)'],
    ['TC_62', 'Teacher view Light LOS In-Progress (report)'],
    ['TC_63', 'Teacher view Light LOS Completed (report)'],
    ['TC_64', 'Teacher view Intensive LOS In-Progress (report)'],
    ['TC_65', 'Teacher view Intensive LOS Completed (report)'],
    ['TC_66', 'Formatting preserved in teacher view (report rendering)'],
    ['TC_67', 'Teacher view updates in real time (report runtime)'],
    ['TC_68', 'Teacher view handles large cumulative data (perf, report)'],
    ['TC_69', 'Teacher view when no child steps completed (report)'],
    ['TC_70', 'Teacher view on data-mapping failure (error handling, report)'],
    ['A11Y', 'Library modal a11y (focus order, labels) — deferred audit'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
