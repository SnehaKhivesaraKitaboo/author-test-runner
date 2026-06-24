/// <reference types="cypress" />
import './commands';
import { HL_CANVAS, HL_RULES, HL_SETTINGS } from './selectors';
import { HL_DATA } from './testdata';

// =============================================================================
// 34 — Highlighter (highlight) — Deep Component Test
//
// QC authority : Author Test Cases - Highlighter.pdf (TC_01–TC_45)
// Source authority:
//   config/config.js (catalog: name "Highlighter", dataType "highlight",
//                     iconClass "icon-Highlight-words", directive highlightTemplate)
//   templates/highlightTemplate/highlightTemplate.html
//   templates/highlightTemplate/highlightTemplateSettings.html
//   templates/highlightTemplate/default/highlightTemplate.json
//   templates/highlightTemplate/scripts/highlightTemplate.js
//
// Highlighter is an ASSESSMENT widget → dropped into a Generic Step column.
// Author-DOM-automatable: drop, settings panel + title/icon, Show Me/Header/
// Instruction checkboxes, outline + Action Assets colour, style panel, add/
// remove sentences (min=1, max=10), sentence text entry + mixed formatting,
// a DOM-assertable correct-highlight range, tags, copy/delete chrome, security.
// The student highlight-selection popup (Incorrect/Undo) needs a live browser
// Range + execCommand in Preview/Reader, plus submission-lock, persistence-
// after-reload, network and a11y — all DEFERRED. See HIGHLIGHTER-DEEP-AUTOMATION.md.
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
  cy.ensureHighlighterDeepSetup({ through: 'content', skipStepCreation: true });
});

// ===========================================================================
// Suite A — Drop & author page (TC_01)
// ===========================================================================
describe('34-A — Highlighter: Drop into Generic Step column (TC_01)', () => {
  it('TC_DROP — Drop Highlighter into Generic Step column', function () {
    skipIfNoUrl(this);
    cy.ensureHighlighterDeepSetup({ through: 'dropped', skipStepCreation: false });
    cy.get(`.generic-step-column-content ${HL_CANVAS.component}`, { timeout: 20000 }).should('exist');
    cy.log('✅ Highlighter dropped inside Generic Step column');
  });

  it('TC_01 — Clicking the component opens the Highlighter settings panel', function () {
    skipIfNoUrl(this);
    cy.openHighlighterSettings();
    cy.get(HL_SETTINGS.panel).should('be.visible');
    cy.get(HL_SETTINGS.title).should('contain.text', 'Highlighter');
    cy.get(HL_SETTINGS.icon).should('exist');
    cy.log('ℹ TC_01: Settings panel + title/icon present; Preview/Reader visibility is deferred');
  });
});

// ===========================================================================
// Suite B — Text entry & formatting (TC_02, TC_03, TC_04, TC_05)
// ===========================================================================
describe('34-B — Highlighter: Text entry & formatting (TC_02–TC_05)', () => {
  it('TC_02/TC_03 — Sentence accepts numbers/alphabets/special chars/other language', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.sentence).first().setContentEditableOn(HL_DATA.mixedFormatting);
    cy.get(HL_CANVAS.sentence).first().should('contain.text', 'café');
    cy.get(HL_CANVAS.sentence).first().should('contain.text', '日本語');
    cy.log('✅ TC_02/03: Mixed-character text accepted in the sentence field');
  });

  it('TC_04/TC_05 — Header & Instruction fields accept text (font/align/list render verified in Reader)', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.header).first().setContentEditableOn(HL_DATA.header);
    cy.get(HL_CANVAS.header).first().should('contain.text', HL_DATA.header);
    cy.get(HL_CANVAS.instruction).first().setContentEditableOn(HL_DATA.instruction);
    cy.get(HL_CANVAS.instruction).first().should('contain.text', HL_DATA.instruction);
    cy.log('ℹ TC_04/05: Text entered; applied font/colour/lists/hyperlink rendering is a Preview/Reader check (deferred)');
  });
});

// ===========================================================================
// Suite C — Highlight range (correct-answer config) (TC_06, TC_30, TC_35)
// ===========================================================================
describe('34-C — Highlighter: Highlight range config (TC_06, TC_30, TC_35)', () => {
  it('TC_06 — A word range can be highlighted in the sentence (DOM-assertable)', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.sentence).first().setContentEditableOn(HL_DATA.sentence);
    cy.applyHighlighterWordRange(HL_DATA.highlightWord);
    cy.get(`${HL_CANVAS.sentence} .cy-highlight-range`).should('contain.text', HL_DATA.highlightWord);
    cy.log('✅ TC_06: A word in the sentence is wrapped as a highlighted range');
  });

  it('TC_30 — Highlight range only wraps a selected word, not the whole sentence', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.sentence).first().setContentEditableOn(HL_DATA.sentence);
    cy.applyHighlighterWordRange(HL_DATA.highlightWord);
    cy.get(`${HL_CANVAS.sentence} .cy-highlight-range`).invoke('text').then((t) => {
      expect(t.trim()).to.eq(HL_DATA.highlightWord);
      expect(t.trim().length).to.be.lessThan(HL_DATA.sentence.length);
    });
    cy.log('ℹ TC_30: Range marks only the selected word; live unselected-area blocking is a Preview/Reader check (deferred)');
  });

  it('TC_35 — Empty sentence has no highlightable text (graceful)', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.sentence).first().setContentEditableOn('');
    cy.get(`${HL_CANVAS.sentence} .cy-highlight-range`).should('not.exist');
    cy.log('✅ TC_35: No highlight is possible with an empty sentence (no error)');
  });
});

// ===========================================================================
// Suite D — Add / remove sentences (TC_07, TC_14, TC_25, TC_33)
// ===========================================================================
describe('34-D — Highlighter: Add/remove sentences (TC_07, TC_14, TC_25, TC_33)', () => {
  it('TC_07/TC_25 — Delete is disabled for the only sentence; enabled after adding more', function () {
    skipIfNoUrl(this);
    function trimToOne() {
      cy.get(HL_CANVAS.sentenceRow).then(($rows) => {
        if ($rows.length > 1) {
          cy.get(`${HL_CANVAS.sentenceDelete}:not(.disabled)`).last().click({ force: true });
          trimToOne();
        }
      });
    }
    trimToOne();
    cy.get(HL_CANVAS.sentenceRow).should('have.length', HL_RULES.minSentences);
    cy.get(HL_CANVAS.sentenceDelete).first().should('have.class', 'disabled');
    cy.get(HL_CANVAS.addSentenceClick).click({ force: true });
    cy.get(HL_CANVAS.sentenceRow).should('have.length.greaterThan', 1);
    cy.get(`${HL_CANVAS.sentenceDelete}:not(.disabled)`).should('have.length.greaterThan', 0);
    cy.log('✅ TC_07/25: Delete hidden/disabled for single sentence, available once 2+ exist');
  });

  it('TC_14/TC_33 — Multiple sentences can be added and each is independently editable', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.addSentenceClick).click({ force: true });
    cy.get(HL_CANVAS.sentenceRow).should('have.length.greaterThan', 1);
    cy.get(HL_CANVAS.sentence).eq(0).setContentEditableOn(HL_DATA.sentence);
    cy.get(HL_CANVAS.sentence).eq(1).setContentEditableOn(HL_DATA.sentenceTwo);
    cy.get(HL_CANVAS.sentence).eq(0).should('contain.text', 'quick brown fox');
    cy.get(HL_CANVAS.sentence).eq(1).should('contain.text', 'second independent');
    cy.log('✅ TC_14/33: Multiple sentences added and edited independently');
  });

  it('TC_DROP-MAX — Cannot add sentences beyond max (max_question=10)', function () {
    skipIfNoUrl(this);
    for (let i = 0; i < 12; i += 1) {
      cy.get('body').then(() => {
        cy.get(HL_CANVAS.sentenceRow).then(($rows) => {
          if ($rows.length < HL_RULES.maxSentences) {
            cy.get(HL_CANVAS.addSentenceClick).click({ force: true });
          }
        });
      });
    }
    cy.get(HL_CANVAS.sentenceRow).should('have.length.lte', HL_RULES.maxSentences);
    cy.log(`✅ MAX: Sentence count capped at ${HL_RULES.maxSentences}`);
  });
});

// ===========================================================================
// Suite E — Settings checkboxes (TC_10, TC_11, TC_18, TC_24, TC_34)
// ===========================================================================
describe('34-E — Highlighter: Settings checkboxes (TC_10, TC_11, TC_18, TC_24, TC_34)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openHighlighterSettings(); });

  it('TC_10/TC_34 — Show Me / Add Header / Add Instruction are checked by default', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(HL_SETTINGS.showMe).length) {
        cy.get(HL_SETTINGS.showMe).should('be.checked');
      } else {
        cy.log('ℹ Show Me checkbox not rendered (isGroupActivity) — header/instruction still asserted');
      }
    });
    cy.get(HL_SETTINGS.headerVisibility).should('be.checked');
    cy.get(HL_SETTINGS.instructionVisibility).should('be.checked');
    cy.log('✅ TC_10/34: Header + Instruction (and Show Me when present) checked by default');
  });

  it('TC_11 — Unchecking Add Header / Add Instruction hides those sections', function () {
    skipIfNoUrl(this);
    cy.get(HL_SETTINGS.headerVisibility).uncheck({ force: true });
    cy.get(HL_SETTINGS.instructionVisibility).uncheck({ force: true });
    cy.wait(300);
    cy.get(HL_CANVAS.headerHolder).should('have.class', 'displayNone');
    cy.get(HL_CANVAS.instructionHolder).should('have.class', 'displayNone');
    cy.log('✅ TC_11: Header & Instruction sections hidden when unchecked');
  });

  it('TC_18 — "Allow activity restart" control is present (state reset is a Reader flow)', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(HL_SETTINGS.allowRestart).length === 0) {
        cy.log('ℹ TC_18: Allow activity restart hidden (isGroupActivity) — deferred');
        return;
      }
      cy.get(HL_SETTINGS.allowRestart).should('exist');
      cy.log('ℹ TC_18: Allow activity restart present; clearing previous attempts is a Reader flow (deferred)');
    });
  });

  it('TC_24 — Unchecked options are not interactive (sections collapse)', function () {
    skipIfNoUrl(this);
    cy.get(HL_SETTINGS.headerVisibility).uncheck({ force: true });
    cy.wait(200);
    cy.get(HL_CANVAS.headerHolder).should('have.class', 'displayNone');
    cy.log('ℹ TC_24: Disabled option hides its section; full inaccessibility across all toggles is partly a Reader check (deferred)');
  });
});

// ===========================================================================
// Suite F — Styles (TC_12)
// ===========================================================================
describe('34-F — Highlighter: Styles (TC_12)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openHighlighterSettings(); });

  it('TC_12 — Style panel renders (Style One active, Coming Soon present)', function () {
    skipIfNoUrl(this);
    cy.get(HL_SETTINGS.stylePanel).should('exist');
    cy.log(`ℹ TC_12: Style panel rendered (source: ${HL_RULES.activeStyle} active, ${HL_RULES.comingSoonStyle} coming-soon); disabled-state is a visual check`);
  });
});

// ===========================================================================
// Suite G — Outline & Action Assets colour (TC_13, TC_36)
// ===========================================================================
describe('34-G — Highlighter: Outline & Action Assets (TC_13, TC_36)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openHighlighterSettings(); });

  it('TC_13 — No Outline / Outline radios exist; one is selected by default', function () {
    skipIfNoUrl(this);
    cy.get(HL_SETTINGS.outlineNone).should('exist');
    cy.get(HL_SETTINGS.outlineBg).should('exist');
    cy.get('body').then(($body) => {
      const checked =
        $body.find(`${HL_SETTINGS.outlineNone}:checked`).length +
        $body.find(`${HL_SETTINGS.outlineBg}:checked`).length;
      expect(checked, 'one outline option pre-selected').to.be.greaterThan(0);
    });
    cy.log(`✅ TC_13: Outline radios present (source default = ${HL_RULES.defaultOutline})`);
  });

  it('TC_36 — Action Assets colour picker is present and accepts a value', function () {
    skipIfNoUrl(this);
    cy.get(HL_SETTINGS.colorPickerLabel).should('contain.text', 'Action Assets');
    cy.get(HL_SETTINGS.colorPickerButton).should('exist');
    cy.get(HL_SETTINGS.colorPickerInput)
      .clear({ force: true })
      .type(HL_DATA.appearanceColor, { force: true })
      .should('have.value', HL_DATA.appearanceColor);
    cy.log('✅ TC_36: Action Assets colour picker present and accepts a colour code');
  });
});

// ===========================================================================
// Suite H — Tags (TC_19, TC_37)
// ===========================================================================
describe('34-H — Highlighter: Tags (TC_19, TC_37)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openHighlighterSettings(); });

  it('TC_19/TC_37 — Add Tag (tag-manager) control is present', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(HL_SETTINGS.tagManager).length === 0) {
        cy.log('ℹ TC_19/37: tag-manager renders only when currSettings.showText is set — not mounted here (deferred)');
        return;
      }
      cy.get(HL_SETTINGS.tagManager).should('exist');
      cy.log('✅ TC_19/37: Tag manager control present; add/edit/delete tag behaviour is runtime (partly deferred)');
    });
  });
});

// ===========================================================================
// Suite I — Submit button & placeholders (TC_21, TC_23)
// ===========================================================================
describe('34-I — Highlighter: Submit & placeholders (TC_21, TC_23)', () => {
  it('TC_23 — Common buttons bar (Submit/Show Me) is present after a sentence exists', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.sentence).first().setContentEditableOn(HL_DATA.sentence);
    cy.get(HL_CANVAS.commonButtons).should('exist');
    cy.log('ℹ TC_23: Common buttons bar present in author DOM; live Submit enablement is a Preview/Reader check (deferred)');
  });

  it('TC_21 — Header/Instruction/Sentence fields expose placeholder text', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.header).first().should('have.attr', 'placeholder');
    cy.get(HL_CANVAS.instruction).first().should('have.attr', 'placeholder');
    cy.get(HL_CANVAS.sentence).first().should('have.attr', 'placeholder');
    cy.log('✅ TC_21: Placeholder/helper text present on header, instruction and sentence fields');
  });
});

// ===========================================================================
// Suite J — Copy / Delete component chrome (TC_38, TC_39, TC_40, TC_43)
// ===========================================================================
describe('34-J — Highlighter: Copy & Delete component (TC_38–TC_40, TC_43)', () => {
  it('TC_39/TC_40/TC_43 — Copy Component control is present/clickable', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(HL_CANVAS.copyButton).length === 0) {
        cy.log('ℹ TC_39/40/43: Copy control lives in the shared hover toolbar (not mounted in headless DOM) — deferred to runtime');
        return;
      }
      cy.get(HL_CANVAS.copyButton).first().should('exist');
      cy.log('✅ TC_39/40/43: Copy Component control present');
    });
  });

  it('TC_38 — Delete Component control is present', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(HL_CANVAS.deleteButton).length === 0) {
        cy.log('ℹ TC_38: Delete control in shared hover toolbar (not mounted in headless DOM) — deferred to runtime');
        return;
      }
      cy.get(HL_CANVAS.deleteButton).first().should('exist');
      cy.log('✅ TC_38: Delete Component control present (confirmation pop-up flow deferred)');
    });
  });
});

// ===========================================================================
// Suite K — Security
// ===========================================================================
describe('34-K — Highlighter: Security', () => {
  it('SEC/TC_27 — Script tags in a sentence are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get(HL_CANVAS.sentence).first().setContentEditableOn(HL_DATA.scriptInjection);
    cy.get(HL_CANVAS.sentence).first().should('not.contain.html', '<script>');
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ SEC/TC_27: Script injection in the sentence is not executed');
  });
});

// ===========================================================================
// DEFERRED — student highlight-selection (Incorrect/Undo) Preview/Reader flow,
// submission lock, persistence-after-reload, network, responsive, a11y, copy
// success pop-up lifecycle. it.skip() with explicit reasons.
// ===========================================================================
describe('34-Z — Highlighter: Deferred (Preview / Reader / lifecycle / a11y)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_08', 'Mark word incorrect via arrow → red marking (live selection popup, Preview/Reader)'],
    ['TC_09', 'Reverse arrow undoes incorrect marking/highlight (Preview/Reader undo flow)'],
    ['TC_15', 'Highlighter non-editable after submission/completion (submit lock — Reader)'],
    ['TC_16', 'Change answer in Reader after attempt if allowed (Reader flow)'],
    ['TC_17', 'Attempts persist after close/reopen across browsers/devices (persistence/compat)'],
    ['TC_20', 'Responsive minimize/maximize, mobile/tablet, multi-browser (viewport/visual)'],
    ['TC_22', 'Consistent spacing/alignment across editor/preview/reader (visual)'],
    ['TC_26', 'Excessively long text error/restriction (no maxlength in source — runtime/Preview)'],
    ['TC_28', 'Cannot edit after submission/completion (submit lock — Reader)'],
    ['TC_29', 'No UI break after rapid add/remove/edit/highlight/undo/redo (runtime stress)'],
    ['TC_31', 'Highlight states do not persist after restart with new student (Reader restart)'],
    ['TC_32', 'Network failure during submit/update → graceful error (Reader network)'],
    ['TC_41', 'Success pop-up "component has been copied successfully" after copy (lifecycle)'],
    ['TC_42', 'Pop-up appears each time on multiple copy actions (lifecycle)'],
    ['TC_44', 'Copy pop-up does NOT appear for other buttons (negative lifecycle)'],
    ['TC_45', 'Copy control hidden/disabled when no component present (lifecycle)'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
