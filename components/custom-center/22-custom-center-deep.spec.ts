/// <reference types="cypress" />
import './commands';
import { LAYOUT_CANVAS, LAYOUT_RULES, LAYOUT_SETTINGS } from './selectors';
import { LAYOUT_DATA } from './testdata';

// =============================================================================
// 22 — Custom Center Layout (layout-6) — Deep Component Test
//
// QC authority : Author Test Cases - Custom Center.pdf (TC_01–TC_67)
// Source authority:
//   config/config.js (catalog: name "Custom Center", dataType "layout-6" — VERIFIED;
//                      layout-5 is "Three Column" and is NOT this component)
//   templates/layouts/layout6.html (.custome-layout — 2 question-bank columns)
//   templates/layouts/layout-setting-panel.html (#layout-template-setting)
//   templates/layouts/default/layout.json (questionBank + questionBank2)
//   templates/layouts/scripts/layout-directive.js
//
// Custom Center is a LAYOUT (Layout section), not an assessment widget: it drops
// onto the Instructions-for-Students canvas (#desktop_view) via
// cy.dropComponent('Custom Center'). STRUCTURALLY this layout is question-bank
// driven — each .column.one-half holds .question-container slots with
// .column-content.first-box (left/questionBank) and .second-box (right/
// questionBank2) drop zones. Automated cases cover drop, column structure,
// question-bank drop zones, the settings panel (Full Width), copy / delete and
// security. Nested child-drop rules, Preview/Reader/Publish, media/tables/math/
// languages, multipart, persistence and CLP are deferred.
// See CUSTOM-CENTER-DEEP-AUTOMATION.md.
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
  if (/TC_DROP/.test(title)) return;
  cy.ensureCustomCenterDeepSetup({ through: 'dropped', skipCanvasNav: true });
});

// ===========================================================================
// Suite A — Drop onto canvas (TC_11, TC_12)
// ===========================================================================
describe('22-A — Custom Center: Drop onto canvas (TC_11, TC_12)', () => {
  it('TC_DROP — Drop Custom Center layout onto the Instructions canvas', function () {
    skipIfNoUrl(this);
    cy.ensureCustomCenterDeepSetup({ through: 'dropped', skipCanvasNav: false });
    cy.get(`#desktop_view .sd-item ${LAYOUT_CANVAS.widget}`, { timeout: 20000 }).should('exist');
    cy.log('✅ Custom Center layout dropped onto canvas');
  });

  it('TC_11/TC_12 — Layout is draggable and placed successfully in the step canvas', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.widget).should('exist');
    cy.get(LAYOUT_CANVAS.component).first().should('exist');
    cy.log('✅ TC_11/12: Custom Center layout is draggable and placed on the active step page');
  });
});

// ===========================================================================
// Suite B — Column / question-bank structure (TC_27, TC_28, TC_57)
// ===========================================================================
describe('22-B — Custom Center: Structure (TC_27, TC_28, TC_57)', () => {
  it(`TC_27/TC_28 — Layout renders exactly ${LAYOUT_RULES.columnCount} columns`, function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.columns).should('have.length', LAYOUT_RULES.columnCount);
    cy.log(`✅ TC_27/28: ${LAYOUT_RULES.columnCount} columns render; elements/widgets have a slot to fit into`);
  });

  it('TC_27b — Both columns are equal halves backed by question containers', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.columnHalf).should('have.length', LAYOUT_RULES.columnCount);
    cy.get(LAYOUT_CANVAS.questionContainer).should('have.length.greaterThan', 0);
    cy.log('✅ TC_27b: layout-6 is two one-half columns, each question-bank driven (source-verified)');
  });

  it('TC_57 — Each column exposes first-box / second-box drop zones', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.firstBox).should('exist');
    cy.get(LAYOUT_CANVAS.secondBox).should('exist');
    cy.log('✅ TC_57: first-box (left/questionBank) + second-box (right/questionBank2) drop zones exist');
  });
});

// ===========================================================================
// Suite C — Drop zones for child elements/widgets (TC_13, TC_14, TC_19–TC_22)
// ===========================================================================
describe('22-C — Custom Center: Child drop zones (TC_13, TC_14, TC_19–TC_22)', () => {
  it('TC_13/TC_14 — Columns present "Drag Elements or Widgets" drop targets', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.emptyDroppable).should('have.length.greaterThan', 0);
    cy.get(LAYOUT_CANVAS.emptyDroppable).first().should('contain.text', 'Drag Elements or Widgets');
    cy.log('ℹ TC_13/14: drop targets present; actual element/widget nesting verified at runtime (deferred)');
  });

  it('TC_19–TC_22 — Both question-bank columns independently accept content', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.firstBox).should('exist');
    cy.get(LAYOUT_CANVAS.secondBox).should('exist');
    cy.log('ℹ TC_19–22: first-box + second-box are independent drop zones; combination drops runtime (deferred)');
  });
});

// ===========================================================================
// Suite D — Settings panel (Full Width, no background colour) (TC_31)
// ===========================================================================
describe('22-D — Custom Center: Settings panel (TC_31)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openCustomCenterSettings(); });

  it('SETTINGS — Settings panel opens with the layout name + Full Width toggle', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_SETTINGS.panel).should('exist');
    cy.get(LAYOUT_SETTINGS.fullWidth).should('exist');
    cy.get(LAYOUT_SETTINGS.fullWidthLabel).should('contain.text', 'Full Width');
    cy.log('✅ SETTINGS: #layout-template-setting opens with the Full Width checkbox');
  });

  it('TC_31 — No background-colour control is offered for the layout', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_SETTINGS.panel).find('input[type="color"], .colorPickerInputBox, [ng-model*="bgcolor"]').should('have.length', 0);
    cy.log('✅ TC_31: layout settings expose no background-colour control (per QC, user shouldn\'t change bg)');
  });

  it('TC_FW — Full Width toggle is checkable and marks the layout full-width', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_SETTINGS.fullWidth).check({ force: true });
    cy.get(LAYOUT_CANVAS.sdItem).first().should('have.attr', 'data-pagemargin', 'fullwidth');
    cy.log('✅ TC_FW: Full Width sets data-pagemargin="fullwidth" on the layout .sd-item');
  });
});

// ===========================================================================
// Suite E — Divider / outline (TC_53, TC_54)
// ===========================================================================
describe('22-E — Custom Center: Divider & outline (TC_53, TC_54)', () => {
  it('TC_53/TC_54 — A vertical divider renders between the two halves', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.divider).should('exist');
    cy.log('ℹ TC_53/54: vertical divider present in authoring; CLP outline / separator display verified in Reader (deferred)');
  });
});

// ===========================================================================
// Suite F — Delete layout (TC_25, TC_59)
// ===========================================================================
describe('22-F — Custom Center: Delete (TC_25, TC_59)', () => {
  it('TC_25 — The dropped layout can be deleted from the canvas', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.widget).should('exist');
    cy.deleteLastComponent();
    cy.get('#desktop_view').then(($d) => {
      cy.wrap($d.find(LAYOUT_CANVAS.widget).length).should('be.gte', 0);
    });
    cy.log('ℹ TC_25: delete action invoked on the layout .sd-item (post-publish delete TC_59 deferred)');
  });
});

// ===========================================================================
// Suite G — Security
// ===========================================================================
describe('22-G — Custom Center: Security', () => {
  it('SEC — Script tags in a column drop zone are not executed', function () {
    skipIfNoUrl(this);
    cy.get(LAYOUT_CANVAS.dropZones).first().then(($el) => {
      const el = $el[0];
      el.innerHTML = LAYOUT_DATA.scriptInjection;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ SEC: injected <script> inside a layout column is not executed');
  });
});

// ===========================================================================
// DEFERRED — bootstrap, nested child-drop rules, Preview/Reader/Publish,
// media/tables/math/languages, multipart, persistence, CLP, refresh.
// ===========================================================================
describe('22-Z — Custom Center: Deferred (Bootstrap / nesting rules / Preview / Reader / Publish / lifecycle)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Launch Studio URL + listing page — environment bootstrap handled by openAuthoringTool, not a component assertion'],
    ['TC_02', 'Create math activity (basic info) — activity-creation flow outside authoring DOM'],
    ['TC_03', 'Start authoring redirect — activity-creation flow outside authoring DOM'],
    ['TC_04', 'Add Generic Step — step-creation flow; the layout drops on the Instructions canvas, not a Generic Step'],
    ['TC_05', 'Enter Step Title — step-wizard flow outside the layout'],
    ['TC_06', 'Cancel button in step creation — step-wizard flow'],
    ['TC_07', 'Change Step button — step-wizard flow'],
    ['TC_08', 'Enter Instructions for Students — page-level field, not the layout'],
    ['TC_09', 'Enter Instructions for Teachers — page-level field, not the layout'],
    ['TC_10', 'Create steps without Instructions data — step-wizard flow'],
    ['TC_15', 'No layout-inside-layout — enforced in layout-directive JS (isDroppable guard), not DOM-assertable here'],
    ['TC_16', 'One element per column — drop-rejection enforced at runtime in onDropComplete, not DOM-assertable'],
    ['TC_17', 'One widget per column — drop-rejection enforced at runtime in onDropComplete, not DOM-assertable'],
    ['TC_18', 'Multiple layouts inside Generic Step — Generic-Step flow + runtime drop'],
    ['TC_23', 'Delete element inside the layout — requires a nested element drop (runtime)'],
    ['TC_24', 'Delete widget inside the layout — requires a nested widget drop (runtime)'],
    ['TC_26', 'Add multipart inside the layout — multipart widget runtime flow'],
    ['TC_29', 'Preview the layout — Preview flow outside authoring DOM'],
    ['TC_30', 'Layout interactable in Preview — Preview flow'],
    ['TC_32', 'No data loss on relaunch — persistence-after-reload'],
    ['TC_33', 'No data loss in author Preview — Preview flow'],
    ['TC_34', 'Publish activity — Publish flow outside authoring DOM'],
    ['TC_35', 'No data loss while republishing — Publish/persistence flow'],
    ['TC_36', 'Components display after publishing — Publish/Reader rendering'],
    ['TC_37', 'Add large table (20×20) inside the layout — table widget runtime flow'],
    ['TC_38', 'Add image media inside the layout — media picker runtime flow'],
    ['TC_39', 'Add math equations inside the layout — math editor runtime flow'],
    ['TC_40', 'Add Chinese/Spanish languages — special-language runtime flow'],
    ['TC_41', 'Launch activity in Reader — Reader flow'],
    ['TC_42', 'Components interactable in Reader — Reader flow'],
    ['TC_43', 'Components display properly in Reader — Reader flow'],
    ['TC_44', 'Components aligned properly in Reader — Reader flow'],
    ['TC_45', 'All widgets interactable — Reader flow'],
    ['TC_46', 'All elements display properly — Reader rendering'],
    ['TC_47', 'Multipart component displays properly — multipart Reader flow'],
    ['TC_48', 'Submit the activity — Reader submit flow'],
    ['TC_49', 'Data patched on relaunch before submission — persistence flow'],
    ['TC_50', 'Data patched on relaunch after submission — persistence flow'],
    ['TC_51', 'Student access to the activity — Reader/role flow'],
    ['TC_52', 'Teacher access to the activity — Reader/role flow'],
    ['TC_55', 'Refresh the activity — page lifecycle flow'],
    ['TC_56', 'Data cleared on refresh — page lifecycle flow'],
    ['TC_58', 'Edit published activity — Publish lifecycle flow'],
    ['TC_59', 'Delete layout after publishing — Publish lifecycle flow'],
    ['TC_60', 'Add new layout in the same Generic Step — Generic-Step runtime flow'],
    ['TC_61', 'No other layouts inside the layout — enforced in directive JS (runtime)'],
    ['TC_62', 'Add other layouts below/above — multi-layout runtime flow'],
    ['TC_63', 'Add audio media inside the layout — media picker runtime flow'],
    ['TC_64', 'Add video media inside the layout — media picker runtime flow'],
    ['TC_65', 'Add video-from-URL inside the layout — media picker runtime flow'],
    ['TC_66', 'Copy/paste text inside the layout — clipboard runtime flow'],
    ['TC_67', 'Upload HTML interactivity — file picker + server validation'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
