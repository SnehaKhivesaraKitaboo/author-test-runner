/// <reference types="cypress" />
import './commands';
import { CLIC_CANVAS, CLIC_RULES } from './selectors';
import { CLIC_DATA } from './testdata';

// =============================================================================
// 31 — CLIC (Sketchpad) — Deep Component Test
//
// QC authority : Author Test Cases - CLIC.pdf (TC_01–TC_33)
// Source authority:
//   config/config.js (widget catalog: name "CLIC Component", dataType "sketchpad")
//   templates/sketch-pad/sketchpad.html
//   templates/sketch-pad/styles/sketchpad.css
//   templates/sketch-pad/default/sketchpad.json
//   templates/sketch-pad/scripts/sketchpad-directive.js
//
// CLIC is an ELEMENT (not an assessment widget): it drops onto the
// Instructions-for-Students canvas (#desktop_view), NOT a Generic Step column.
//
// The dropped component is a CLIC Assignment FORM (matching the QC pop-up:
// CLIC Identifier / Instance Name / Submit). It is NOT a drawing canvas — the
// real source has no pen/colour/clear tools, so QC "drawing tools/colours/clear"
// expectations do not apply; those would-be cases map to the actual form fields.
// Submit save logic, validation messages, persistence-after-reload, Preview/
// Reader/CLP, and the post-submit CLIC iframe are runtime/iframe-bound —
// deferred. See CLIC-DEEP-AUTOMATION.md.
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
  cy.ensureClicDeepSetup({ through: 'dropped', skipCanvasNav: true });
});

// ===========================================================================
// Suite A — Drop & pop-up (TC_04, TC_05, TC_06, TC_08)
// ===========================================================================
describe('31-A — CLIC: Drop & pop-up (TC_04, TC_05, TC_06, TC_08)', () => {
  it('TC_DROP — Drop CLIC component onto the Instructions canvas', function () {
    skipIfNoUrl(this);
    cy.ensureClicDeepSetup({ through: 'dropped', skipCanvasNav: false });
    cy.get(`#desktop_view .sd-item ${CLIC_CANVAS.widget}`, { timeout: 20000 }).should('exist');
    cy.log('✅ CLIC (Sketchpad) component dropped onto canvas');
  });

  it('TC_05/TC_06 — CLIC component is placed and its pop-up form is displayed', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.widget).should('exist');
    cy.get(CLIC_CANVAS.component).should('exist');
    cy.get(CLIC_CANVAS.formContainer).should('exist');
    cy.get(CLIC_CANVAS.formBox).should('exist');
    cy.log('✅ TC_05/06: CLIC pop-up form displayed after drop (inside the Instructions canvas section)');
  });

  it('TC_04 — CLIC pop-up shows the "CLIC Assignment" title (icon-clic catalog widget)', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.formTitle)
      .should('exist')
      .and('contain.text', CLIC_RULES.formTitleText);
    cy.get(CLIC_CANVAS.formIcon).should('exist');
    cy.log('✅ TC_04: CLIC Assignment title + form icon present (widget catalog iconClass icon-clic)');
  });

  it('TC_08 — Pop-up exposes CLIC Identifier, Instance Name, and Submit button', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.clicIdentifier).should('exist');
    cy.get(CLIC_CANVAS.clicIdentifierLabel).should('contain.text', CLIC_RULES.identifierLabelText);
    cy.get(CLIC_CANVAS.instanceName).should('exist');
    cy.get(CLIC_CANVAS.instanceNameLabel).should('contain.text', CLIC_RULES.instanceNameLabelText);
    cy.get(CLIC_CANVAS.submitButton).should('exist').and('contain.text', 'Submit');
    cy.log('✅ TC_08: Identifier, Instance Name fields + Submit button all present');
  });
});

// ===========================================================================
// Suite B — Field input (TC_12, TC_15, TC_16)
// ===========================================================================
describe('31-B — CLIC: Field input (TC_12, TC_15, TC_16)', () => {
  it('TC_12 — Both fields accept valid alphanumeric input', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.clicIdentifier).first().setContentEditableOn(CLIC_DATA.identifier);
    cy.get(CLIC_CANVAS.clicIdentifier).first().should('contain.text', CLIC_DATA.identifier);
    cy.get(CLIC_CANVAS.instanceName).first().setContentEditableOn(CLIC_DATA.instanceName);
    cy.get(CLIC_CANVAS.instanceName).first().should('contain.text', CLIC_DATA.instanceName);
    cy.log('✅ TC_12: Identifier + Instance Name accept valid input');
  });

  it('TC_15 — Fields accept special characters (no client-side block in author DOM)', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.clicIdentifier).first().setContentEditableOn(CLIC_DATA.specialChars);
    cy.get(CLIC_CANVAS.clicIdentifier).first().should('contain.text', CLIC_DATA.specialChars);
    cy.log('ℹ TC_15: Special characters accepted by the contenteditable field; server-side validation is a runtime/save check (deferred)');
  });

  it('TC_16 — Long (100+ char) input is accepted by the Identifier field', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.clicIdentifier).first().setContentEditableOn(CLIC_DATA.longText);
    cy.get(CLIC_CANVAS.clicIdentifier).first().invoke('text').then((txt) => {
      expect(String(txt).length, 'long text retained in field').to.be.greaterThan(100);
    });
    cy.log('ℹ TC_16: Long text retained; CSS truncation/wrapping (overflow:hidden, white-space:nowrap) is a visual check (deferred)');
  });
});

// ===========================================================================
// Suite C — Submit control presence (supports deferred TC_09 / TC_13)
//
// These are author-DOM PRESENCE probes only. The QC behaviors they relate to
// (disabled-when-empty validation / save-on-submit) are runtime-bound and are
// the deferred TC_09 / TC_13 entries below — not satisfied here.
// ===========================================================================
describe('31-C — CLIC: Submit control presence', () => {
  it('SUBMIT-PRESENT — Submit button is present and enabled (no author-DOM disabled binding)', function () {
    skipIfNoUrl(this);
    // Source: the Submit button has no ng-disabled binding — it is always
    // present/enabled in the author DOM. The QC "disabled when empty" / required
    // validation is enforced at submit runtime, so we assert presence only.
    cy.get(CLIC_CANVAS.submitButton).should('exist').and('not.be.disabled');
    cy.log('ℹ SUBMIT-PRESENT: Submit present/enabled; empty-field validation enforced at submit runtime (deferred TC_09)');
  });

  it('SUBMIT-WIRED — Submit button is a wired submit control when both fields are filled', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.clicIdentifier).first().setContentEditableOn(CLIC_DATA.identifier);
    cy.get(CLIC_CANVAS.instanceName).first().setContentEditableOn(CLIC_DATA.instanceName);
    cy.get(CLIC_CANVAS.submitButton).should('exist').and('have.attr', 'type', 'submit');
    cy.log('ℹ SUBMIT-WIRED: Submit present + type=submit (submitCLIC); actual save + iframe swap is runtime (deferred TC_13)');
  });
});

// ===========================================================================
// Suite D — Settings (CLIC has no dedicated settings template)
// ===========================================================================
describe('31-D — CLIC: Settings (no dedicated panel)', () => {
  it('SETTINGS — Clicking the component does not crash; settings panel is generic/flag-gated', function () {
    skipIfNoUrl(this);
    cy.openClicSettings();
    cy.get(CLIC_CANVAS.component).should('exist');
    cy.log('ℹ CLIC has no settings template on disk (config references a missing sketchpad-settings.html); handled gracefully');
  });
});

// ===========================================================================
// Suite E — Security
// ===========================================================================
describe('31-E — CLIC: Security', () => {
  it('SEC — Script tags in the Identifier field are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get(CLIC_CANVAS.clicIdentifier).first().setContentEditableOn(CLIC_DATA.scriptInjection);
    cy.get(CLIC_CANVAS.clicIdentifier).first().should('not.contain.html', '<script>');
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ SEC: Script injection into the CLIC Identifier is not executed');
  });
});

// ===========================================================================
// DEFERRED — login/activity/step bootstrap, validation messages, submit save,
// post-submit iframe, persistence-after-reload, edit-after-reopen, Preview/
// Reader/CLP, responsive, multi-instance, copy/delete lifecycle.
// ===========================================================================
describe('31-Z — CLIC: Deferred (Bootstrap / Submit / Persistence / Preview / Reader / CLP)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Launch Studio URL + listing page — environment bootstrap handled by cy.openAuthoringTool, not a component assertion'],
    ['TC_02', 'Create math activity (basic info) — activity-creation flow outside authoring DOM'],
    ['TC_03', 'Start authoring redirect — activity-creation flow outside authoring DOM'],
    ['TC_07', 'CLIC blocked in non-generic step types — step-type provisioning + negative drop flow (not provisioned in this harness)'],
    ['TC_09', 'Submit disabled / validation when both fields empty — enforced at submit runtime (required), not author DOM'],
    ['TC_10', 'Validation message "CLIC Identifier is required" — runtime submit validation'],
    ['TC_11', 'Validation message "Instance Name is required" — runtime submit validation'],
    ['TC_13', 'Submit saves data + pop-up closes — runtime submit + iframe swap (submitCLIC → issubmitted)'],
    ['TC_14', 'UI spacing/alignment/padding vs Figma — visual design assertion'],
    ['TC_17', 'Submit triggers backend/save request — network/save flow (runtime)'],
    ['TC_18', 'Edit values after re-opening component — persistence + re-open flow'],
    ['TC_19', 'CLIC retained after save/preview/re-edit — save + Preview flow'],
    ['TC_20', 'Activity with CLIC can be published — Publish flow outside authoring DOM'],
    ['TC_21', 'Responsive pop-up behavior across screen sizes — responsive/visual flow'],
    ['TC_22', 'Max-allowed CLIC instances limit enforced (if any) — multi-instance + runtime limit'],
    ['TC_23', 'Clicking outside the pop-up closes/ignores gracefully — runtime usability behavior'],
    ['TC_24', 'CLIC Identifier retained after activity save — persistence/save flow'],
    ['TC_25', 'CLIC auto-launches on activity re-open — re-open + iframe auto-launch'],
    ['TC_26', 'No prompt again after relaunch unless edited — re-open state flow'],
    ['TC_27', 'CLIC persists after logout/login — session + persistence flow'],
    ['TC_28', 'Editing Identifier persists across relaunch — persistence + re-open flow'],
    ['TC_29', 'CLIC auto-launches in Preview with saved Identifier — Preview/iframe flow'],
    ['TC_30', 'CLIC inactive/prompts if Identifier not entered before save — runtime save-state flow'],
    ['TC_31', 'Multiple CLIC instances with distinct Identifiers across relaunches — multi-instance + persistence'],
    ['TC_32', 'No data loss on relaunch with CLIC + extra content — persistence-after-reload'],
    ['TC_33', 'Saved CLIC launches in CLP with correct Identifier — CLP/Reader flow'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
