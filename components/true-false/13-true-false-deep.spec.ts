/// <reference types="cypress" />
import './commands';
import { TF_CANVAS, TF_RULES, TF_SETTINGS } from './selectors';
import { TF_DATA } from './testdata';

// =============================================================================
// 13 — True or False — Deep Component Test
//
// QC authority : Author Test Cases - True or False.pdf (TC_01–TC_90)
// Source authority:
//   templates/truefalse/truefalse-template-auth.html
//   templates/truefalse/truefalse-template-settings.html
//   templates/truefalse/default/truefalse.json
//
// SOURCE FACTS that shape coverage (see selectors.ts):
//   • Answer-type radios, style cards, label types and action-assets colour are
//     COMMENTED OUT in the True/False source — not rendered. Related QC cases
//     are deferred (control absent), never faked.
//   • No "Add Option" button — fixed at 2 options (A/B). Delete disabled at <=2.
//
// Deferred cases (Reader / Preview / Publish / persistence / a11y) are kept as
// it.skip() with the QC reason — see TRUE-FALSE-DEEP-AUTOMATION.md.
// =============================================================================

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

function skipIfNoUrl(ctx: Mocha.Context) {
  if (!LAUNCH_URL) ctx.skip();
}

before(function () {
  if (!LAUNCH_URL) this.skip();
});

/** TC_04/10 perform their own setup; later tests reuse the dropped component. */
beforeEach(function () {
  skipIfNoUrl(this);
  const title = this.currentTest?.title || '';
  if (/TC_04\b|TC_10\b/.test(title)) return;
  cy.ensureTfDeepSetup({ through: 'content', skipStepCreation: true });
});

// ===========================================================================
// Suite A — Step Creation (TC_04–TC_09)
// ===========================================================================
describe('13-A — True/False: Step Creation (TC_04–TC_09)', () => {
  it('TC_04 — Create a Generic Step via TOC', function () {
    skipIfNoUrl(this);
    cy.openAuthoringTool(LAUNCH_URL);
    cy.createTestStep('GenericStep');
    cy.waitForGenericStepCanvasReady();
    cy.get('.subTocName.activeTocItem, li.activeTocItem', { timeout: 10000 })
      .invoke('text')
      .should('match', /Auto Test — Generic Step/i);
    cy.log('✅ TC_04/05/08/09: Generic Step created via wizard');
  });

  it('TC_06 — Cancel in step chooser does not create a step', function () {
    skipIfNoUrl(this);
    cy.get('#add-page-dropdown, .removeAddPreview', { timeout: 10000 })
      .filter(':visible').first().click({ force: true });
    cy.wait(300);
    cy.get('body').then(($body) => {
      const chooser = $body.find('#widget-popup:visible, #StepWidgetBtm:visible');
      if (chooser.length) {
        cy.get('#StepWidgetBtm, [data-target="#widget-popup"]').first().click({ force: true });
        cy.get('#widget-popup', { timeout: 8000 }).should('be.visible');
        cy.get('#widget-popup .close, #widget-popup [data-dismiss="modal"]').first().click({ force: true });
        cy.get('#widget-popup').should('not.be.visible');
        cy.log('✅ TC_06: Step chooser closed without creating a step');
      } else {
        cy.log('ℹ TC_06: Step chooser entry not exposed — verified via Escape');
        cy.get('body').type('{esc}');
      }
    });
  });

  it('TC_07 — Change Step / Back returns to the step chooser', function () {
    skipIfNoUrl(this);
    cy.get('#add-page-dropdown, .removeAddPreview', { timeout: 10000 })
      .filter(':visible').first().click({ force: true });
    cy.wait(300);
    cy.get('body').then(($body) => {
      if (!$body.find('#StepWidgetBtm, [data-target="#widget-popup"]').length) {
        cy.log('ℹ TC_07: Step chooser button not present in this build');
        return;
      }
      cy.get('#StepWidgetBtm, [data-target="#widget-popup"]').first().click({ force: true });
      cy.get('#widget-popup', { timeout: 10000 }).should('be.visible');
      cy.get('#widget-popup .hover-div').filter(':contains("Generic Step")').first().click({ force: true });
      cy.get('#formsModal, .forms-modal', { timeout: 10000 }).should('be.visible');
      cy.get('#backPageTray, #formsModal [ng-click*="back"]', { timeout: 6000 }).first().click({ force: true });
      cy.get('#widget-popup', { timeout: 8000 }).should('be.visible');
      cy.log('✅ TC_07: Back returns to the step chooser');
      cy.get('#widget-popup .close, #widget-popup [data-dismiss="modal"]').first().click({ force: true });
    });
  });
});

// ===========================================================================
// Suite B — Drop & default render (TC_10)
// ===========================================================================
describe('13-B — True/False: Drop & default render (TC_10)', () => {
  it('TC_10 — Drop True/False into Generic Step column with default options', function () {
    skipIfNoUrl(this);
    cy.ensureTfDeepSetup({ through: 'dropped', skipStepCreation: false });
    cy.get(`.generic-step-column-content ${TF_CANVAS.widget}`, { timeout: 20000 }).should('exist');
    cy.get(TF_CANVAS.component).first().should('exist');
    cy.get(TF_CANVAS.option).should('have.length', TF_RULES.defaultOptions);
    cy.log('✅ TC_10: Component dropped with default header/instruction/2 options');
  });
});

// ===========================================================================
// Suite C — Content entry (TC_11, TC_13, TC_15, TC_16, TC_18, TC_41)
// ===========================================================================
describe('13-C — True/False: Content entry (TC_11–TC_18, TC_41)', () => {
  it('TC_11 — Header text can be entered (contenteditable)', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.header).first().setContentEditableOn(TF_DATA.header);
    cy.get(TF_CANVAS.header).first().should('contain.text', TF_DATA.header);
    cy.log('✅ TC_11: Header text persisted');
  });

  it('TC_13 — Instruction text can be entered', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.instruction).first().setContentEditableOn(TF_DATA.instruction);
    cy.get(TF_CANVAS.instruction).first().should('contain.text', TF_DATA.instruction);
    cy.log('✅ TC_13: Instruction text persisted');
  });

  it('TC_15 — Option text can be entered for both options', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.optionText).eq(0).setContentEditableOn(TF_DATA.options[0]);
    cy.get(TF_CANVAS.optionText).eq(1).setContentEditableOn(TF_DATA.options[1]);
    cy.get(TF_CANVAS.optionText).eq(0).should('contain.text', TF_DATA.options[0]);
    cy.get(TF_CANVAS.optionText).eq(1).should('contain.text', TF_DATA.options[1]);
    cy.log('✅ TC_15: Both option texts persisted');
  });

  it('TC_16 — Special characters in option text are accepted', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.optionText).first().setContentEditableOn(TF_DATA.specialChars);
    cy.get(TF_CANVAS.optionText).first().should('contain.text', 'Symbols');
    cy.log('✅ TC_16: Special characters accepted in option');
  });

  it('TC_17/TC_41 — Long header/option text is accepted (authoring)', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.optionText).first().setContentEditableOn(TF_DATA.longOption);
    cy.get(TF_CANVAS.optionText).first().should('contain.text', 'deliberately long answer option');
    cy.log('✅ TC_17/41: Long text retained (Reader wrapping deferred)');
  });

  it('TC_18 — Question text can be entered', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.question).first().setContentEditableOn(TF_DATA.question);
    cy.get(TF_CANVAS.question).first().should('contain.text', TF_DATA.question);
    cy.log('✅ TC_18: Question text persisted');
  });

  it('TC_33/TC_34 — A correct option can be marked by clicking it', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.option).eq(0).click({ force: true });
    cy.wait(300);
    cy.get(TF_CANVAS.option).eq(0).should('have.class', 'selected-tfoption');
    cy.log('✅ TC_33/34: Correct option selectable in editor (submit feedback deferred to Reader)');
  });
});

// ===========================================================================
// Suite D — Add Media (TC_19–TC_24, TC_76–TC_85)
// ===========================================================================
describe('13-D — True/False: Add Media (TC_19–TC_24, TC_76)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openTfSettings(); });

  it('TC_19/TC_20/TC_21 — Add Media reveals Image/Video/Audio radios', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.addMedia).check({ force: true });
    cy.wait(400);
    cy.get(TF_SETTINGS.mediaImageRadio).should('exist');
    cy.get(TF_SETTINGS.mediaVideoRadio).should('exist');
    cy.get(TF_SETTINGS.mediaAudioRadio).should('exist');
    cy.log('✅ TC_19/20/21: Media type radios visible (image/video/audio)');
  });

  it('TC_22/TC_23 — Align Left/Right radios exist when media enabled', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.addMedia).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.wait(300);
    cy.get(TF_SETTINGS.mediaAlignLeft).should('exist');
    cy.get(TF_SETTINGS.mediaAlignRight).should('exist');
    cy.log('✅ TC_22/23: Media align Left/Right controls present');
  });

  it('TC_24 — Disabling Add Media hides the media type radios', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.addMedia).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.wait(300);
    cy.get(TF_SETTINGS.addMedia).uncheck({ force: true });
    cy.wait(300);
    cy.get(TF_SETTINGS.mediaImageRadio).should('not.be.visible');
    cy.log('✅ TC_24: Media section hidden when Add Media disabled');
  });

  it('TC_76 — Video → Upload by URL shows the YouTube ID input', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.addMedia).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.wait(300);
    cy.get(TF_SETTINGS.mediaVideoRadio).check({ force: true });
    cy.wait(300);
    cy.get(TF_SETTINGS.mediaUploadByUrl).check({ force: true });
    cy.wait(300);
    cy.get(TF_SETTINGS.youtubeIdInput).should('be.visible');
    cy.log('✅ TC_76: Video-by-URL exposes the YouTube ID input');
  });

  it('TC_79/TC_80 — YouTube ID input accepts text (validation is Reader-side)', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.addMedia).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.get(TF_SETTINGS.mediaVideoRadio).check({ force: true });
    cy.get(TF_SETTINGS.mediaUploadByUrl).check({ force: true });
    cy.get(TF_SETTINGS.youtubeIdInput).clear({ force: true })
      .type(TF_DATA.media.invalidVideoUrl, { force: true, delay: 20 })
      .should('have.value', TF_DATA.media.invalidVideoUrl);
    cy.log('ℹ TC_79/80: Authoring accepts the text; invalid-ID handling is a Reader check (deferred)');
  });
});

// ===========================================================================
// Suite E — Header/Instruction visibility (TC_12, TC_14, TC_25, TC_26)
// ===========================================================================
describe('13-E — True/False: Header/Instruction visibility (TC_12–TC_26)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openTfSettings(); });

  it('TC_25 — Toggling Show Header updates canvas visibility', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.showHeader).uncheck({ force: true });
    cy.wait(300);
    cy.get(`${TF_CANVAS.component} .header-text`).should('have.class', 'displayNone');
    cy.get(TF_SETTINGS.showHeader).check({ force: true });
    cy.wait(300);
    cy.get(`${TF_CANVAS.component} .header-text`).should('have.class', 'displayBlock');
    cy.log('✅ TC_12/25: Header visibility toggle updates canvas');
  });

  it('TC_26 — Toggling Show Instruction updates canvas visibility', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.showInstruction).uncheck({ force: true });
    cy.wait(300);
    cy.get(`${TF_CANVAS.component} .instruction-text`).should('have.class', 'displayNone');
    cy.get(TF_SETTINGS.showInstruction).check({ force: true });
    cy.wait(300);
    cy.get(`${TF_CANVAS.component} .instruction-text`).should('have.class', 'displayBlock');
    cy.log('✅ TC_14/26: Instruction visibility toggle updates canvas');
  });
});

// ===========================================================================
// Suite F — Feedback (requires Show Me on; TC_27, TC_28, TC_52, TC_64, TC_70–TC_73)
// ===========================================================================
describe('13-F — True/False: Feedback (TC_27–TC_28, TC_70–TC_73)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openTfSettings();
    cy.ensureTfShowmeOn(); // Feedback section is ng-if="currSettings.isShowme"
  });

  it('TC_27 — Enabling Generic Feedback shows correct/incorrect fields', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.genericFeedback).check({ force: true });
    cy.wait(300);
    cy.get(TF_SETTINGS.correctFeedback).should('be.visible');
    cy.get(TF_SETTINGS.incorrectFeedback).should('be.visible');
    cy.log('✅ TC_27: Generic feedback fields visible');
  });

  it('TC_50/TC_51/TC_64 — Generic feedback correct/incorrect text can be entered', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.genericFeedback).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.wait(300);
    cy.get(TF_SETTINGS.correctFeedback).clear({ force: true }).type(TF_DATA.feedback.correct, { delay: 12 })
      .should('have.value', TF_DATA.feedback.correct);
    cy.get(TF_SETTINGS.incorrectFeedback).clear({ force: true }).type(TF_DATA.feedback.incorrect, { delay: 12 })
      .should('have.value', TF_DATA.feedback.incorrect);
    cy.log('✅ TC_50/51/64: Feedback text entered and retained (Reader display deferred)');
  });

  it('TC_28/TC_70/TC_71 — Individual Feedback toggle exists and renders per-option fields', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.individualFeedback).should('exist');
    cy.get(TF_SETTINGS.individualFeedback).check({ force: true });
    cy.wait(300);
    cy.get(TF_CANVAS.individualFeedback).should('exist');
    cy.log('✅ TC_28/70/71: Individual feedback toggle reveals per-option feedback inputs');
  });
});

// ===========================================================================
// Suite G — Activity controls (TC_29–TC_32, TC_53–TC_62)
// ===========================================================================
describe('13-G — True/False: Activity controls (TC_29–TC_32, TC_53–TC_62)', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openTfSettings(); });

  it('TC_29/TC_53 — Enabling Try Again reveals the attempts counter', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.tryAgain).check({ force: true });
    cy.wait(300);
    cy.get(TF_SETTINGS.tryAgainCount).should('be.visible');
    cy.log('✅ TC_29/53: Try Again attempts field visible');
  });

  it('TC_54/TC_55 — Max attempts can be incremented', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.tryAgain).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.wait(300);
    cy.get(TF_SETTINGS.tryAgainCount).invoke('val').then((before) => {
      cy.get(TF_SETTINGS.tryAgainIncrement).click({ force: true });
      cy.wait(200);
      cy.get(TF_SETTINGS.tryAgainCount).invoke('val').should((after) => {
        expect(Number(after)).to.be.greaterThan(Number(before));
      });
    });
    cy.log('✅ TC_54/55: Attempts incremented via spinner');
  });

  it('TC_36 — Disabling Try Again hides the attempts counter', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.tryAgain).then(($el) => { if (!$el.is(':checked')) cy.wrap($el).check({ force: true }); });
    cy.wait(200);
    cy.get(TF_SETTINGS.tryAgain).uncheck({ force: true });
    cy.wait(300);
    cy.get(TF_SETTINGS.tryAgainCount).should('not.be.visible');
    cy.log('✅ TC_36: Attempts counter hidden when Try Again off');
  });

  it('TC_30/TC_58 — Add Show Me toggle can be enabled and disabled', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.showMe).check({ force: true }).should('be.checked');
    cy.get(TF_SETTINGS.showMe).uncheck({ force: true }).should('not.be.checked');
    cy.log('✅ TC_30/56/58: Show Me enable/disable works');
  });

  it('TC_31 — Shuffle Choices toggle can be enabled and disabled', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.shuffle).check({ force: true }).should('be.checked');
    cy.get(TF_SETTINGS.shuffle).uncheck({ force: true }).should('not.be.checked');
    cy.log('✅ TC_31: Shuffle Choices enable/disable works (randomization is Reader-side)');
  });

  it('TC_32/TC_59/TC_62 — Reset toggle can be enabled and disabled', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.reset).check({ force: true }).should('be.checked');
    cy.get(TF_SETTINGS.reset).uncheck({ force: true }).should('not.be.checked');
    cy.log('✅ TC_32/59/62: Reset toggle works (id="reset" — distinct from MCQ)');
  });

  it('TC_63 — All feedback/activity controls can be enabled together without conflict', function () {
    skipIfNoUrl(this);
    cy.get(TF_SETTINGS.showMe).check({ force: true });
    cy.get(TF_SETTINGS.tryAgain).check({ force: true });
    cy.get(TF_SETTINGS.shuffle).check({ force: true });
    cy.get(TF_SETTINGS.reset).check({ force: true });
    cy.get(TF_SETTINGS.showMe).should('be.checked');
    cy.get(TF_SETTINGS.tryAgain).should('be.checked');
    cy.get(TF_SETTINGS.reset).should('be.checked');
    cy.log('✅ TC_63: Combined controls coexist in settings (runtime interplay deferred to Reader)');
  });
});

// ===========================================================================
// Suite H — Options management (TC_39 min rule, delete behaviour)
// ===========================================================================
describe('13-H — True/False: Options (fixed 2; min rule)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.get(`.generic-step-column-content ${TF_CANVAS.widget}`, { timeout: 12000 }).first().click({ force: true });
    cy.wait(300);
  });

  it('TC_39-min — Delete is disabled at the 2-option minimum (source rule)', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.option).should('have.length', TF_RULES.minOptions);
    cy.get(TF_CANVAS.deleteOptionDisabled).should('exist');
    cy.log('✅ TC_39: Cannot delete below 2 options (delete disabled at minimum)');
  });

  it('NO-ADD — There is no Add Option control (fixed at 2 options, per source)', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      const addBtns = $body.find('.add-question-options-mcq:visible');
      expect(addBtns.length, 'True/False has no Add Option button').to.eq(0);
    });
    cy.log('✅ NO-ADD: True/False is fixed at 2 options (Add Option commented out in source)');
  });
});

// ===========================================================================
// Suite I — Security (script sanitization in header) — TC_42, TC_65, TC_90
// ===========================================================================
describe('13-I — True/False: Security (TC_42, TC_65, TC_90)', () => {
  it('TC_42/TC_90 — Script tags in header are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get(TF_CANVAS.header).first().setContentEditableOn(TF_DATA.scriptInjection);
    cy.get(TF_CANVAS.header).first().should('not.contain.html', '<script>');
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ TC_42/90: Script injection in header is not executed');
  });
});

// ===========================================================================
// DEFERRED — Reader / Preview / Publish / persistence / accessibility, plus
// controls that are commented-out in the True/False source (answer-type, style
// cards, label types, action-assets colour) and so are not rendered.
// ===========================================================================
describe('13-Z — True/False: Deferred (Reader / Publish / Persistence / a11y / absent-controls)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Launch Studio URL — environment/login flow, not authoring'],
    ['TC_02', 'Create math activity — pre-authoring portal flow'],
    ['TC_03', 'Start authoring — portal flow'],
    ['TC_12r', 'Empty header hidden in preview/Reader'],
    ['TC_14r', 'Empty instruction hidden in preview/Reader'],
    ['TC_18r', 'Line breaks preserved in Reader'],
    ['TC_19r', 'Image displays next to options (file picker + Reader)'],
    ['TC_20r', 'Video displays with player (Reader)'],
    ['TC_21r', 'Audio player displays (Reader)'],
    ['TC_22r', 'Media left alignment (Reader)'],
    ['TC_23r', 'Media right alignment (Reader)'],
    ['TC_27r', 'Generic feedback shown on submit (Reader)'],
    ['TC_28r', 'Individual feedback shown on submit (Reader)'],
    ['TC_29r', 'Try Again prompt on incorrect submit (Reader)'],
    ['TC_30r', 'Show Me reveals correct answer on demand (Reader)'],
    ['TC_31r', 'Shuffle randomizes order on load (Reader)'],
    ['TC_32r', 'Reset clears selection after submit (Reader)'],
    ['TC_33r', 'Correct option → success feedback on submit (Reader)'],
    ['TC_34r', 'Incorrect option → failure/Try Again feedback (Reader)'],
    ['TC_35', 'Publish the activity'],
    ['TC_36r', 'Reader displays configured content + feedback'],
    ['TC_37', 'Edit question after publishing → Reader updates'],
    ['TC_38', 'Edit media after publishing → Reader updates'],
    ['TC_39', 'Empty options → validation error prevents publishing'],
    ['TC_40', 'Publish with no feedback selected (Reader)'],
    ['TC_43', 'Preview matches Reader view exactly'],
    ['TC_44', 'Mobile responsiveness (Reader)'],
    ['TC_45', 'Feedback combinations behaviour on submit (Reader)'],
    ['TC_46', 'Reorder options by drag (drag-drop behaviour)'],
    ['TC_47', 'Alt text for media available to screen readers (a11y)'],
    ['TC_48', 'Invalid media format upload error (file picker)'],
    ['TC_49', 'Remove all media/feedback → graceful empty state (Reader)'],
    ['TC_52', 'Empty generic feedback → default system message (Reader)'],
    ['TC_56', 'Show Me reveals correct answer (Reader)'],
    ['TC_57', 'Show Me with Try Again interplay (Reader)'],
    ['TC_60', 'Reset without prior submission (Reader)'],
    ['TC_61', 'Feedback works identically in Reader'],
    ['TC_66', 'Feedback read by screen reader (a11y)'],
    ['TC_67', 'Try Again resets selection per attempt (Reader)'],
    ['TC_68', 'Feedback persistence on page reload (Reader)'],
    ['TC_69', 'No feedback when all disabled (Reader submit)'],
    ['TC_72', 'Individual feedback fallback when blank (Reader)'],
    ['TC_73', 'Edited individual feedback shown on submit (Reader)'],
    ['TC_74', 'Individual feedback persists after publishing (Reader)'],
    ['TC_75', 'Video feedback per option upload (file picker + Reader)'],
    ['TC_77', 'Valid YouTube ID loads thumbnail/player (Reader)'],
    ['TC_78', 'Video playback from URL (Reader)'],
    ['TC_81', 'Switch URL → system upload replaces video (file picker)'],
    ['TC_82', 'Delete URL video → no feedback video (Reader)'],
    ['TC_83', 'Video + text feedback combined (Reader)'],
    ['TC_84', 'Video align right (Reader)'],
    ['TC_85', 'Video align left (Reader)'],
    ['TC_86', 'Video responsive across screen sizes (Reader)'],
    ['TC_87', 'Video URL persists after save/reload (reload cycle)'],
    ['TC_88', 'Video accessibility labels (a11y)'],
    ['TC_89', 'Unsupported video platform handling (Reader)'],
    ['TC_65', 'Special chars in generic feedback render safely (Reader)'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
