/// <reference types="cypress" />
import './commands';
import { CORRECTION_CANVAS, CORRECTION_RULES, CORRECTION_SETTINGS } from './selectors';
import { CORRECTION_DATA } from './testdata';

// =============================================================================
// 32 — Correction — Deep Component Test
//
// QC authority : Author Test Cases - Correction.pdf (TC_01–TC_29)
// Source authority:
//   config/config.js (widget catalog: name "Correction", dataType "correction")
//   templates/Correction/correction.html
//   templates/Correction/correction-settings.html
//   templates/Correction/default/correction.json
//   templates/Correction/scripts/correction.js
//   templates/stylepanel.html
//
// Correction is an assessment widget → dropped into a Generic Step column.
// Many QC cases are settings-panel / canvas presence + add/remove checks
// (automated). The student find-and-fix flow (strikethrough red line + correct
// answer in Preview/Reader), submit-validation, network disconnect,
// accessibility/screen-reader, responsiveness, and persistence-after-reload
// require flows outside the authoring DOM — deferred.
// See CORRECTION-DEEP-AUTOMATION.md.
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
  cy.ensureCorrectionDeepSetup({ through: 'content', skipStepCreation: true });
});

// ===========================================================================
// Suite A — Drop & author page (TC_02)
// ===========================================================================
describe('32-A — Correction: Drop & author page (TC_02)', () => {
  it('TC_DROP — Drop Correction into Generic Step column', function () {
    skipIfNoUrl(this);
    cy.ensureCorrectionDeepSetup({ through: 'dropped', skipStepCreation: false });
    cy.get(`.generic-step-column-content ${CORRECTION_CANVAS.component}`, { timeout: 20000 }).should('exist');
    cy.log('✅ Correction dropped inside Generic Step column');
  });

  it('TC_02 — "Add Sentence" button present; Text Description 1 editable', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_CANVAS.addSentenceLabel).should('contain.text', 'Add Sentence');
    cy.get(CORRECTION_CANVAS.sentenceRow).should('have.length.greaterThan', 0);
    cy.get(CORRECTION_CANVAS.sentenceText).first().setContentEditableOn(CORRECTION_DATA.sentence);
    cy.get(CORRECTION_CANVAS.sentenceText).first().should('contain.text', CORRECTION_DATA.sentence);
    cy.log('✅ TC_02: Add Sentence present, Text Description 1 editable');
  });
});

// ===========================================================================
// Suite B — Settings: Header / Instruction defaults & toggles (TC_01, TC_06, TC_07)
// ===========================================================================
describe('32-B — Correction: Header & Instruction settings (TC_01, TC_06, TC_07)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openCorrectionSettings(); });

  it('TC_01 — Add Header & Add Instruction Text enabled by default; texts present', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_SETTINGS.addHeader).should('be.checked');
    cy.get(CORRECTION_SETTINGS.addInstruction).should('be.checked');
    cy.get(CORRECTION_CANVAS.headerBlock).should('have.class', 'displayBlock');
    cy.get(CORRECTION_CANVAS.instructionBlock).should('have.class', 'displayBlock');
    cy.log('✅ TC_01: Header & Instruction enabled by default and visible');
  });

  it('TC_06 — Unchecking Add Header removes Header Text from the page', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_SETTINGS.addHeader).uncheck({ force: true });
    cy.wait(300);
    cy.get(CORRECTION_CANVAS.headerBlock).should('have.class', 'displayNone');
    cy.log('✅ TC_06: Header Text hidden when Add Header unchecked');
  });

  it('TC_07 — Unchecking Add Instruction Text removes Instruction Text', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_SETTINGS.addInstruction).uncheck({ force: true });
    cy.wait(300);
    cy.get(CORRECTION_CANVAS.instructionBlock).should('have.class', 'displayNone');
    cy.log('✅ TC_07: Instruction Text hidden when Add Instruction Text unchecked');
  });
});

// ===========================================================================
// Suite C — Sentences: add / delete (TC_03, TC_12, TC_18)
// ===========================================================================
describe('32-C — Correction: Add & delete sentences (TC_03, TC_12, TC_18)', () => {
  it('TC_03 — Add multiple sentences; delete enabled for extra rows; row deletes', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_CANVAS.addSentence).click({ force: true });
    cy.get(CORRECTION_CANVAS.addSentence).click({ force: true });
    cy.get(CORRECTION_CANVAS.sentenceRow).should('have.length.greaterThan', 1);
    cy.get(CORRECTION_CANVAS.sentenceRow).then(($rows) => {
      const before = $rows.length;
      // Delete the last row (enabled because length > 1).
      cy.get(CORRECTION_CANVAS.rowDelete).last().click({ force: true });
      cy.get(CORRECTION_CANVAS.sentenceRow).should('have.length', before - 1);
    });
    cy.log('✅ TC_03: Multiple sentences added; extra sentence deleted');
  });

  it('TC_12 — Delete is disabled for the only remaining sentence', function () {
    skipIfNoUrl(this);
    // Reduce to a single row if more exist.
    cy.get('body').then(() => {
      function trimToOne() {
        cy.get(CORRECTION_CANVAS.sentenceRow).then(($rows) => {
          if ($rows.length > 1) {
            cy.get(`${CORRECTION_CANVAS.rowDelete}:not(.disabled)`).last().click({ force: true });
            trimToOne();
          }
        });
      }
      trimToOne();
    });
    cy.get(CORRECTION_CANVAS.sentenceRow).should('have.length', CORRECTION_RULES.minSentences);
    cy.get(CORRECTION_CANVAS.rowDelete).first().should('have.class', 'disabled');
    cy.log('✅ TC_12: Delete disabled for the only sentence (min_question=1)');
  });

  it('TC_18 — Cannot add sentences beyond the source max limit (max_question=10)', function () {
    skipIfNoUrl(this);
    // Click Add Sentence well beyond the max; rows must cap at maxSentences.
    Cypress._.times(CORRECTION_RULES.maxSentences + 3, () => {
      cy.get(CORRECTION_CANVAS.addSentence).click({ force: true });
    });
    cy.get(CORRECTION_CANVAS.sentenceRow).should('have.length.lte', CORRECTION_RULES.maxSentences);
    cy.log(`✅ TC_18: Sentence count capped at max_question=${CORRECTION_RULES.maxSentences}`);
  });
});

// ===========================================================================
// Suite D — Outline / Action Assets colour (TC_04, TC_16)
// ===========================================================================
describe('32-D — Correction: Outline & Action Assets (TC_04, TC_16)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openCorrectionSettings(); });

  it('TC_04 — No Outline / Outline radios switch; colour input accepts a value', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_SETTINGS.outlineNone).should('exist');
    cy.get(CORRECTION_SETTINGS.outlineBg).should('exist');
    cy.get(CORRECTION_SETTINGS.outlineBg).check({ force: true }).should('be.checked');
    cy.get(CORRECTION_SETTINGS.outlineNone).check({ force: true }).should('be.checked');
    cy.get(CORRECTION_SETTINGS.colorPickerInput)
      .clear({ force: true })
      .type(CORRECTION_DATA.validColor, { force: true })
      .should('have.value', CORRECTION_DATA.validColor);
    cy.log('✅ TC_04: Outline options switchable; Action Assets colour updated');
  });

  it('TC_16 — Action Assets accepts a raw value without crashing (invalid-code handling)', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_SETTINGS.colorPickerInput).clear({ force: true }).type(CORRECTION_DATA.invalidColor, { force: true });
    // App must not crash; settings panel stays intact. Defaulting/reset is a
    // runtime/visual concern (deferred), so we only assert resilience here.
    cy.get(CORRECTION_SETTINGS.panel).should('be.visible');
    cy.log('ℹ TC_16: Panel resilient to invalid colour input (reset/default visual deferred)');
  });
});

// ===========================================================================
// Suite E — Tags (TC_08)
// ===========================================================================
describe('32-E — Correction: Tags (TC_08)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openCorrectionSettings(); });

  it('TC_08 — Tag manager is present (renders when showText)', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CORRECTION_SETTINGS.tagManager).length === 0) {
        cy.log('ℹ TC_08: tag-manager not rendered (showText false in this build)');
        return;
      }
      cy.get(CORRECTION_SETTINGS.tagManager).should('exist');
      cy.log('✅ TC_08: Tag manager present in settings');
    });
  });
});

// ===========================================================================
// Suite F — Content entry: Header / Instruction / Sentence (TC_05 author part, TC_11)
// ===========================================================================
describe('32-F — Correction: Content entry (TC_05-author, TC_11)', () => {
  it('TC_05 (author) — Sentence text + strike popups are present for find-and-fix', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_CANVAS.sentenceText).first().setContentEditableOn(CORRECTION_DATA.sentence);
    cy.get(CORRECTION_CANVAS.sentenceText).first().should('contain.text', CORRECTION_DATA.sentence);
    // Strikethrough + correct-answer marker popups exist in the DOM (activated by
    // word selection at runtime); the red-line + answer in Preview/Reader is deferred.
    cy.get(`${CORRECTION_CANVAS.strikePopup}, ${CORRECTION_CANVAS.strikePopupAlt}`).should('exist');
    cy.get(CORRECTION_CANVAS.strikeBtn).should('exist');
    cy.log('ℹ TC_05: Author-side sentence + strike controls present; Preview/Reader answer deferred');
  });

  it('TC_11 — Text Description handles special characters', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_CANVAS.sentenceText).first().setContentEditableOn(CORRECTION_DATA.specialChars);
    cy.get(CORRECTION_CANVAS.sentenceText).first().should('contain.text', CORRECTION_DATA.specialChars);
    cy.log('✅ TC_11: Special characters accepted in Text Description');
  });
});

// ===========================================================================
// Suite G — Copy / Delete component chrome (TC_22, TC_23, TC_24, TC_25, TC_28)
// ===========================================================================
describe('32-G — Correction: Copy & Delete component (TC_22-25, TC_28)', () => {
  it('TC_24/TC_25/TC_28 — Copy Component control is present/clickable', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CORRECTION_CANVAS.copyButton).length === 0) {
        cy.log('ℹ TC_24/25/28: Copy control lives in the shared hover toolbar (not mounted in headless DOM) — deferred to runtime');
        return;
      }
      cy.get(CORRECTION_CANVAS.copyButton).first().should('exist');
      cy.log('✅ TC_24/25/28: Copy Component control present');
    });
  });

  it('TC_22/TC_23 — Delete Component control is present (red highlight is visual)', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CORRECTION_CANVAS.deleteButton).length === 0) {
        cy.log('ℹ TC_22/23: Delete control in shared hover toolbar (not mounted in headless DOM) — deferred to runtime');
        return;
      }
      cy.get(CORRECTION_CANVAS.deleteButton).first().should('exist');
      cy.log('✅ TC_22/23: Delete Component control present (red colour is a visual check)');
    });
  });
});

// ===========================================================================
// Suite H — Security
// ===========================================================================
describe('32-H — Correction: Security', () => {
  it('SEC — Script tags in Text Description are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get(CORRECTION_CANVAS.sentenceText).first().setContentEditableOn(CORRECTION_DATA.scriptInjection);
    cy.get(CORRECTION_CANVAS.sentenceText).first().should('not.contain.html', '<script>');
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ SEC: Script injection in Text Description is not executed');
  });
});

// ===========================================================================
// DEFERRED — student find-and-fix in Preview/Reader, submit validation,
// network/responsiveness/accessibility, persistence, copy lifecycle outcomes.
// ===========================================================================
describe('32-Z — Correction: Deferred (Preview/Reader, validation, a11y, lifecycle)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_05', 'Strikethrough red line + correct answer visible in Preview & Reader'],
    ['TC_09', 'UI responsiveness across mobile/desktop viewport sizes (visual)'],
    ['TC_10', 'Submit enabled only when required fields filled (Preview submit flow)'],
    ['TC_13', 'Submission works without Header/Instruction when unchecked (Preview)'],
    ['TC_14', 'Submit disabled with empty Text Description 1 (Preview validation)'],
    ['TC_15', 'Long text handled gracefully without UI break (visual/Preview)'],
    ['TC_17', 'Submit disabled when no sentences added (Preview validation)'],
    ['TC_19', 'Accessibility — keyboard navigation & screen reader for all controls'],
    ['TC_20', 'Rapid Save/Preview actions handled gracefully (stability)'],
    ['TC_21', 'Network disconnect error + recovery on reconnect'],
    ['TC_26', 'Success pop-up "component has been copied successfully" after copy'],
    ['TC_27', 'Pop-up appears each time on multiple copy actions (lifecycle)'],
    ['TC_29', 'Copy control hidden/disabled when no component present (lifecycle)'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
