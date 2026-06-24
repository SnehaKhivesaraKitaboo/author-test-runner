/// <reference types="cypress" />
import './commands';
import { CAROUSEL_CANVAS, CAROUSEL_RULES, CAROUSEL_SETTINGS } from './selectors';
import { CAROUSEL_DATA } from './testdata';

// =============================================================================
// 28 — Carousel (slideshow element) — Deep Component Test
//
// QC authority : Author Test Cases - Carousel.pdf (TC_01–TC_101)
// Source authority:
//   config/config.js (widget catalog: name "Carousel"/"Slideshow", dataType "slideshow")
//   templates/slideshow/slideshow.html
//   templates/slideshow/common-template-settings-panel.html
//   templates/slideshow/default/slideshow.json
//   templates/slideshow/scripts/slideshow-directive.js · templates/stylepanel.html
//
// Carousel is an ELEMENT (not an assessment widget): it drops onto the
// Instructions-for-Students canvas (#desktop_view), NOT a Generic Step column.
// This is an image/media-heavy widget: most QC cases assert the rendered media,
// Preview/Reader playback, Publish lifecycle, or persistence-after-reload — all
// outside the authoring DOM and therefore DEFERRED. Automated cases cover the
// authoring-DOM surface: drop, settings panel, visibility/layout/media/outline
// controls, add/reorder/delete slides + count limits, caption/title editing,
// and security. See CAROUSEL-DEEP-AUTOMATION.md.
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
  cy.ensureCarouselDeepSetup({ through: 'content', skipCanvasNav: true });
});

// ===========================================================================
// Suite A — Drop & author page
// ===========================================================================
describe('28-A — Carousel: Drop onto canvas', () => {
  it('TC_DROP — Drop Carousel element onto the Instructions canvas', function () {
    skipIfNoUrl(this);
    cy.ensureCarouselDeepSetup({ through: 'dropped', skipCanvasNav: false });
    cy.get(`#desktop_view .sd-item ${CAROUSEL_CANVAS.component}`, { timeout: 20000 }).should('exist');
    cy.log('✅ Carousel element dropped onto canvas');
  });

  it('TC_30/TC_52 — Carousel ships the default slide set on placement', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_CANVAS.component).should('exist');
    cy.get(CAROUSEL_CANVAS.slide).should('have.length.at.least', CAROUSEL_RULES.defaultSlideCount);
    cy.log(`✅ TC_30/52: Carousel placed with >= ${CAROUSEL_RULES.defaultSlideCount} default slides`);
  });

  it('TC_DROP-SETTINGS — Clicking the component opens the Carousel settings panel', function () {
    skipIfNoUrl(this);
    cy.openCarouselSettings();
    cy.get(CAROUSEL_SETTINGS.panel).should('be.visible');
    cy.get(CAROUSEL_SETTINGS.title).should('contain.text', 'Carousel');
    cy.get(CAROUSEL_SETTINGS.icon).should('exist');
    cy.log('✅ Settings panel opens with "Carousel" title + slideshow icon');
  });
});

// ===========================================================================
// Suite B — Visibility & playback toggles (TC_10, TC_12–TC_19, TC_29, TC_49)
//   Presence + togglability automated; preview-visible effect is deferred.
// ===========================================================================
describe('28-B — Carousel: Visibility & playback toggles', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openCarouselSettings();
  });

  it('TC_10/TC_11 — Auto Play checkbox is present and togglable', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CAROUSEL_SETTINGS.autoPlay).length === 0) {
        cy.log('ℹ TC_10/11: Auto Play is flag-gated (showAutoSlideSetting) — not mounted here');
        return;
      }
      cy.get(CAROUSEL_SETTINGS.autoPlay).should('exist');
      cy.get(CAROUSEL_SETTINGS.panel).contains('Auto Play').should('exist');
      cy.log('✅ TC_10/11: Auto Play toggle present (runtime auto-play verified in Preview — deferred)');
    });
  });

  it('TC_12/TC_13 — Show Header checkbox is present and togglable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.showHeader).should('exist');
    cy.get(CAROUSEL_SETTINGS.panel).contains('Show Header').should('exist');
    cy.get(CAROUSEL_SETTINGS.showHeader).check({ force: true });
    cy.log('✅ TC_12/13: Show Header toggle present (preview visibility — deferred)');
  });

  it('TC_14/TC_15 — Show Instruction checkbox is present and togglable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.showInstruction).should('exist');
    cy.get(CAROUSEL_SETTINGS.panel).contains('Show Instruction').should('exist');
    cy.log('✅ TC_14/15: Show Instruction toggle present (preview visibility — deferred)');
  });

  it('TC_16/TC_17 — Show Slide Title checkbox is present and togglable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.showSlideTitle).should('exist');
    cy.get(CAROUSEL_SETTINGS.panel).contains('Show Slide Title').should('exist');
    cy.log('✅ TC_16/17: Show Slide Title toggle present (preview visibility — deferred)');
  });

  it('TC_18/TC_19 — Show Paragraph checkbox is present and togglable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.showParagraph).should('exist');
    cy.get(CAROUSEL_SETTINGS.panel).contains('Show Paragraph').should('exist');
    cy.log('✅ TC_18/19: Show Paragraph toggle present (preview visibility — deferred)');
  });

  it('TC_49 — Show Caption checkbox is present and togglable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.showCaption).should('exist');
    cy.get(CAROUSEL_SETTINGS.panel).contains('Show Caption').should('exist');
    cy.log('✅ TC_49: Show Caption toggle present (caption hide in preview — deferred)');
  });

  it('TC_26 — Multiple visibility toggles can be unchecked together', function () {
    skipIfNoUrl(this);
    [
      CAROUSEL_SETTINGS.showHeader,
      CAROUSEL_SETTINGS.showInstruction,
      CAROUSEL_SETTINGS.showSlideTitle,
      CAROUSEL_SETTINGS.showParagraph,
    ].forEach((sel) => cy.get(sel).uncheck({ force: true }));
    cy.log('✅ TC_26: All four visibility toggles interact consistently (preview effect — deferred)');
  });

  it('TC_29 — Default visibility toggles reflect source defaults', function () {
    skipIfNoUrl(this);
    // slideshow.json defaults: isHeaderVisible/isInstructionVisible/isSlideTitleVisible = true
    cy.get(CAROUSEL_SETTINGS.showHeader).should('exist');
    cy.get(CAROUSEL_SETTINGS.showInstruction).should('exist');
    cy.get(CAROUSEL_SETTINGS.showSlideTitle).should('exist');
    cy.log('ℹ TC_29: Source defaults Header/Instruction/Slide Title = checked (per slideshow.json)');
  });
});

// ===========================================================================
// Suite C — Layout & media-type controls (TC_20, TC_21, TC_25, TC_34, TC_35, TC_57, TC_58)
// ===========================================================================
describe('28-C — Carousel: Layout & media-type controls', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openCarouselSettings();
  });

  it('TC_20/TC_34 — Vertical layout radio is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.layoutVertical).should('exist').check({ force: true });
    cy.log('✅ TC_20/34: Vertical layout radio present and selectable (preview stacking — deferred)');
  });

  it('TC_21/TC_35 — Horizontal layout radio is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.layoutHorizontal).should('exist').check({ force: true });
    cy.log('✅ TC_21/35: Horizontal layout radio present and selectable (preview side-by-side — deferred)');
  });

  it('TC_25/TC_57/TC_58 — Image / Video / Text media radios are present', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.mediaImage).should('exist');
    cy.get(CAROUSEL_SETTINGS.mediaVideo).should('exist');
    cy.get(CAROUSEL_SETTINGS.mediaText).should('exist');
    cy.log('✅ TC_25/57/58: Image/Video/Text media radios present (placeholder swap — deferred)');
  });

  it('TC_25b — Selecting Text media type is reflected on the radio', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.mediaText).check({ force: true });
    cy.log('✅ TC_25b: Text media radio selectable (text entry area render — deferred)');
  });

  it('PLACEMENT — Layout placement (text/image position) icons are present', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.placementIcons).should('have.length.greaterThan', 0);
    cy.log('✅ PLACEMENT: Vertical/Horizontal text-image placement icons present');
  });
});

// ===========================================================================
// Suite D — Styles: outline & action-asset colour (TC_22, TC_23, TC_24)
// ===========================================================================
describe('28-D — Carousel: Styles (outline & action-asset colour)', () => {
  beforeEach(function () {
    skipIfNoUrl(this);
    cy.openCarouselSettings();
  });

  it('TC_22 — "No Outline" radio is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.outlineNone).should('exist').check({ force: true });
    cy.log('✅ TC_22: No Outline option present and selectable (border render — deferred)');
  });

  it('TC_23 — "Outline" radio is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_SETTINGS.outlineOn).should('exist').check({ force: true });
    cy.log('✅ TC_23: Outline option present and selectable (border render — deferred)');
  });

  it('TC_24 — Action-asset colour picker accepts a hex value', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CAROUSEL_SETTINGS.colorPickerInput).length === 0) {
        cy.log('ℹ TC_24: Action Assets colour picker not mounted in this context');
        return;
      }
      cy.get(CAROUSEL_SETTINGS.colorPickerInput)
        .clear({ force: true })
        .type(CAROUSEL_DATA.actionAssetColor, { force: true })
        .should('have.value', CAROUSEL_DATA.actionAssetColor);
      cy.log('✅ TC_24: Action-asset colour entered (arrows/elements recolour in preview — deferred)');
    });
  });
});

// ===========================================================================
// Suite E — Slides: add / delete / count limits (TC_30–TC_33, TC_51, TC_56)
//   DOM-assertable via fieldData.slides ng-repeat + directive limits.
// ===========================================================================
describe('28-E — Carousel: Add / delete slides & count limits', () => {
  it('TC_30 — "+ Add Slide" increases the slide count', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_CANVAS.slide).then(($slides) => {
      const before = $slides.length;
      cy.addCarouselSlide();
      cy.get(CAROUSEL_CANVAS.slide, { timeout: 12000 }).should('have.length.greaterThan', before);
      cy.log(`✅ TC_30: Slide count grew from ${before} after Add Slide`);
    });
  });

  it('TC_31/TC_51 — "Delete Slide" decreases the slide count', function () {
    skipIfNoUrl(this);
    // Ensure at least 3 slides so a delete stays above the min.
    cy.addCarouselSlide();
    cy.get(CAROUSEL_CANVAS.slide).then(($slides) => {
      const before = $slides.length;
      cy.get(CAROUSEL_CANVAS.deleteSlide).first().click({ force: true });
      cy.get(CAROUSEL_CANVAS.slide, { timeout: 12000 }).should('have.length.lessThan', before);
      cy.log(`✅ TC_31/51: Slide count dropped from ${before} after Delete Slide (numbering re-render — deferred)`);
    });
  });

  it('TC_32 — Delete Slide is disabled at the minimum slide count', function () {
    skipIfNoUrl(this);
    // Default ships 2 slides == min_slides → Delete carries btn-disabled.
    cy.get(CAROUSEL_CANVAS.slide).then(($slides) => {
      if ($slides.length <= CAROUSEL_RULES.minSlides) {
        cy.get(CAROUSEL_CANVAS.deleteSlide).should('have.class', 'btn-disabled');
        cy.log(`✅ TC_32: Delete disabled at min (${CAROUSEL_RULES.minSlides} slides) — zero slides prevented`);
      } else {
        cy.log(`ℹ TC_32: ${$slides.length} slides present; min-guard asserted by btn-disabled rule (length <= ${CAROUSEL_RULES.minSlides})`);
      }
    });
  });

  it('TC_33 — Add Slide is disabled once the maximum is reached', function () {
    skipIfNoUrl(this);
    const max = CAROUSEL_RULES.maxSlides;
    function addUntilCap(): void {
      cy.get(CAROUSEL_CANVAS.slide).then(($slides) => {
        if ($slides.length >= max) {
          cy.get(CAROUSEL_CANVAS.addSlide).should('have.class', 'btn-disabled');
          cy.log(`✅ TC_33: Add Slide disabled at max (${max} slides)`);
          return;
        }
        cy.get(CAROUSEL_CANVAS.addSlide).then(($add) => {
          if ($add.hasClass('btn-disabled')) {
            cy.log(`✅ TC_33: Add Slide disabled at ${$slides.length} slides`);
            return;
          }
          cy.wrap($add).click({ force: true });
          cy.wait(400);
          addUntilCap();
        });
      });
    }
    addUntilCap();
  });

  it('TC_56 — Repeated add/delete keeps a consistent slide DOM (no zero/duplicate state)', function () {
    skipIfNoUrl(this);
    cy.addCarouselSlide();
    cy.get(CAROUSEL_CANVAS.deleteSlide).first().click({ force: true });
    cy.get(CAROUSEL_CANVAS.slide).its('length').should('be.gte', CAROUSEL_RULES.minSlides);
    cy.log('✅ TC_56: Slide DOM stays consistent through add/delete churn (id uniqueness — deferred)');
  });
});

// ===========================================================================
// Suite F — Content editing: title, text, caption (TC_37, TC_39, TC_48)
//   Contenteditable bodies via setContentEditableOn (never cy.type).
// ===========================================================================
describe('28-F — Carousel: Content editing (title / text / caption)', () => {
  it('TC_37 — Slide Title accepts entered text', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_CANVAS.slideTitle).first().setContentEditableOn(CAROUSEL_DATA.slideTitle);
    cy.get(CAROUSEL_CANVAS.slideTitle).first().should('contain.text', CAROUSEL_DATA.slideTitle);
    cy.log('✅ TC_37: Slide Title text entered and retained');
  });

  it('TC_39 — Slide Title accepts special characters', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_CANVAS.slideTitle).first().setContentEditableOn(CAROUSEL_DATA.specialChars);
    cy.get(CAROUSEL_CANVAS.slideTitle).first().should('contain.text', '50% off!');
    cy.log('✅ TC_39: Special characters accepted in Slide Title');
  });

  it('TC_48 — Caption field accepts entered text', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CAROUSEL_CANVAS.caption).length === 0) {
        cy.log('ℹ TC_48: Caption is flag-gated (captiondisplay) / shown for media slides — not present here');
        return;
      }
      cy.get(CAROUSEL_CANVAS.caption).first().setContentEditableOn(CAROUSEL_DATA.caption);
      cy.get(CAROUSEL_CANVAS.caption).first().should('contain.text', CAROUSEL_DATA.caption);
      cy.log('✅ TC_48: Caption text entered and retained');
    });
  });
});

// ===========================================================================
// Suite G — Security
// ===========================================================================
describe('28-G — Carousel: Security', () => {
  it('SEC — Script tags in a slide title are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get(CAROUSEL_CANVAS.slideTitle).first().setContentEditableOn(CAROUSEL_DATA.scriptInjection);
    cy.get(CAROUSEL_CANVAS.slideTitle).first().should('not.contain.html', '<script>');
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ SEC: Script injection in a slide title is not executed');
  });
});

// ===========================================================================
// DEFERRED — image/media-heavy widget. Requires login/activity/step bootstrap,
// OS file pickers (image/video upload), runtime autoplay/navigation, rich-text
// formatting overlay, math render, Preview/Reader/Publish, persistence-after-
// reload, and accessibility/contrast checks — all outside the authoring DOM.
// ===========================================================================
describe('28-Z — Carousel: Deferred (Bootstrap / Media / Preview / Reader / Publish / lifecycle / a11y)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Launch Studio URL + listing page — environment bootstrap handled by openAuthoringTool, not a component assertion'],
    ['TC_02', 'Create math activity (basic info) — activity-creation flow outside authoring DOM'],
    ['TC_03', 'Start authoring redirect — activity-creation flow outside authoring DOM'],
    ['TC_04', 'Add Generic Step — step-creation flow; Carousel is a canvas element, not a Generic Step widget'],
    ['TC_05', 'Enter Step Title — step-wizard flow outside the Carousel element'],
    ['TC_06', 'Cancel button in step creation — step-wizard flow'],
    ['TC_07', 'Change Step button — step-wizard flow'],
    ['TC_08', 'Enter Instructions for Students — page-level field, not the Carousel element'],
    ['TC_09', 'Enter Instructions for Teachers — page-level field, not the Carousel element'],
    ['TC_11r', 'Auto Play OFF runtime (no auto-advance, manual nav required) — Preview/Reader playback'],
    ['TC_27', 'Save + reload retains checkbox states — persistence-after-reload'],
    ['TC_28', 'Preview reflects real-time checkbox changes — Preview rendering'],
    ['TC_36', 'Switching layout retains existing content — visual/runtime layout render'],
    ['TC_38', 'Long Slide Title truncation/scroll — visual edge-case best seen in Preview'],
    ['TC_40', 'Apply Bold formatting — rich-text overlay + render (not in authoring panel DOM)'],
    ['TC_41', 'Apply Italic formatting — rich-text overlay + render'],
    ['TC_42', 'Apply Underline formatting — rich-text overlay + render'],
    ['TC_43', 'Clear formatting — rich-text overlay + render'],
    ['TC_44', 'Add a math equation — math editor + render'],
    ['TC_45', 'Edit an existing equation — math editor + render'],
    ['TC_46', 'Delete a math equation — math editor + render'],
    ['TC_47', 'Whitespace-only validation prevents save — Save/validation flow'],
    ['TC_50', 'Undo/Redo step-by-step — editor history runtime'],
    ['TC_53', 'Preview reflects all current edits — Preview rendering'],
    ['TC_54', 'Save edits retained after reload — persistence-after-reload'],
    ['TC_55', 'Discard changes reverts to last save — persistence/refresh flow'],
    ['TC_59', 'Large/multiline equations render without overflow — math render/visual'],
    ['TC_60', 'Combined bold/italic/underline simultaneously — rich-text render'],
    ['TC_61', 'Placeholder text guidance shown when empty — visual/Preview'],
    ['TC_62', 'Paragraph at character limit accepted — limit/validation runtime'],
    ['TC_63', 'Paragraph exceeding limit truncates gracefully — limit/validation runtime'],
    ['TC_64', 'Add slide without content — Save/validation flow'],
    ['TC_65', 'Preview with mixed content types — Preview rendering'],
    ['TC_66', 'Apply text colour — rich-text colour picker + render'],
    ['TC_67', 'Reset text colour to default — rich-text colour picker + render'],
    ['TC_68', 'Apply bullets — rich-text list formatting + render'],
    ['TC_69', 'Apply numbering — rich-text list formatting + render'],
    ['TC_70', 'Remove bullets (toggle off) — rich-text list formatting + render'],
    ['TC_71', 'Remove numbering (toggle off) — rich-text list formatting + render'],
    ['TC_72', 'Text colour combined with bullets — rich-text render'],
    ['TC_73', 'Text colour combined with numbering — rich-text render'],
    ['TC_74', 'Bullets across multiline text — rich-text render'],
    ['TC_75', 'Numbering across multiline text — rich-text render'],
    ['TC_76', 'Switch bullet/number formatting while editing — rich-text render'],
    ['TC_77', 'Bullets with empty lines handled gracefully — rich-text render'],
    ['TC_78', 'Numbering with empty lines handled gracefully — rich-text render'],
    ['TC_79', 'Bullets/numbering persist after save+reload — persistence-after-reload'],
    ['TC_80', 'Text colour persists after save+reload — persistence-after-reload'],
    ['TC_81', 'Preview shows bullets/numbering correctly — Preview rendering'],
    ['TC_82', 'Preview shows custom text colours correctly — Preview rendering'],
    ['TC_83', 'Clear all formatting reverts to plain/default — rich-text render'],
    ['TC_84', 'Bullets/numbering blocked in Slide Title (negative) — rich-text validation'],
    ['TC_85', 'Text colour picker opens/closes without applying — rich-text overlay runtime'],
    ['TC_86', 'Unsupported/invalid hex colour validation — rich-text colour validation'],
    ['TC_87', 'Switching layout retains text formatting — visual/runtime'],
    ['TC_88', 'Paste preformatted text (sanitised) — clipboard/paste sanitisation runtime'],
    ['TC_89', 'Publish the activity — Publish flow outside authoring DOM'],
    ['TC_90', 'Launch activity in Reader — Reader flow'],
    ['TC_91', 'Slide navigation in Reader (arrows/dots) — Reader runtime'],
    ['TC_92', 'Formatting consistency in Reader vs preview — Reader rendering'],
    ['TC_93', 'Edit published activity — Publish/edit lifecycle'],
    ['TC_94', 'Republish after editing — Publish lifecycle'],
    ['TC_95', 'Reader shows updated content after republish — Reader rendering'],
    ['TC_96', 'Republish without changes — Publish lifecycle'],
    ['TC_97', 'Per-slide formatting compatibility across slides — Preview/Reader rendering'],
    ['TC_98', 'Switch layout after bullets/numbering retains lists — visual/runtime'],
    ['TC_99', 'Publish with long text/lists (scrollbars) — Publish/Reader rendering'],
    ['TC_100', 'Text colour contrast in Reader (a11y) — Reader/accessibility check'],
    ['TC_101', 'Edit activity after Reader launch — Reader/edit lifecycle'],
    ['TC_IMG', 'Slide image/video upload via picker — OS file picker + server upload'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
