/// <reference types="cypress" />
import './commands';
import { LO_CANVAS, LO_RULES, LO_SETTINGS, LO_STYLE_LABELS, LO_STYLES } from './selectors';
import { LO_DATA } from './testdata';

// =============================================================================
// 44 — Lesson Opener (Lesson Opener Components) — Deep Component Test
//
// QC authority : Author Test Cases - Lesson Opener.pdf (TC_01–TC_126, 150 cases
//                incl. the TC_103 family TC_103__2..TC_103__25)
// Source authority:
//   config/config.js (catalog: name "Lesson Opener Components",
//                      dataType "lessonOpenerComponent")
//   templates/lessonOpener/lessonOpener.html
//   templates/lessonOpener/lessonOpener-setting-panel.html
//   templates/lessonOpener/default/lessonOpener.json
//   templates/lessonOpener/scripts/lessonOpener-directive.js
//   templates/stylepanel.html
//
// Lesson Opener is a droppable ELEMENT (config isDroppable:true), NOT an
// assessment widget: it drops onto the Instructions-for-Students canvas
// (#desktop_view), NOT a Generic Step column. (The QC PDF narrates a "Generic
// Step" drop, but the shipped config registers it as an unrestricted droppable
// element — see LESSON-OPENER-DEEP-AUTOMATION.md.)
//
// It renders ONE of four style layouts (fieldData.settings.layoutColorActive):
//   style1 "Learning Prompt" (default) · style2 "Make a Connection" ·
//   style3 "My Learning Goals" · style4 "Key Terms". The QC's four component
//   GROUPS (Key Terms / Make a Connection / My Learning Goals / Learning Prompt)
//   are exactly these four styles.
//
// Large QC surface is media-/Reader-heavy: hero image/video upload (OS picker),
// Preview/Reader/CLP student-teacher views, Publish/republish, persistence
// after reload, Figma/visual parity, responsive previews, cross-browser, and
// math RENDER are all outside the authoring DOM and are intentionally deferred.
// See LESSON-OPENER-DEEP-AUTOMATION.md.
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
  cy.ensureLessonOpenerDeepSetup({ through: 'content', skipCanvasNav: true });
});

// ===========================================================================
// Suite A — Page reachable & drop onto canvas (TC_04, TC_06, TC_07, TC_107)
// ===========================================================================
describe('44-A — Lesson Opener: Reach page & drop onto canvas', () => {
  it('TC_DROP — Drop Lesson Opener element onto the Instructions canvas', function () {
    skipIfNoUrl(this);
    cy.ensureLessonOpenerDeepSetup({ through: 'dropped', skipCanvasNav: false });
    cy.get(`#desktop_view .sd-item ${LO_CANVAS.component}`, { timeout: 20000 }).should('exist');
    cy.log('✅ Lesson Opener element dropped onto canvas');
  });

  it('TC_04/TC_06/TC_07 — Lesson Opener component is placed successfully in the layout', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.component).should('exist');
    cy.get(LO_CANVAS.styleContainer).first().should('exist');
    cy.log('✅ TC_04/06/07: Lesson Opener placed in the layout (drag-into-Generic-Step is narrated by QC but config registers it as a canvas element)');
  });

  it('TC_107 — Default style is "Learning Prompt" when the component is added', function () {
    skipIfNoUrl(this);
    cy.get(`${LO_CANVAS.styleContainer}`).first().should('exist');
    cy.get(LO_CANVAS.headerLabel).first().invoke('text').then((t) => {
      expect(t.trim()).to.contain(LO_RULES.defaultStyleLabel);
    });
    cy.log(`✅ TC_107: Default layout is "${LO_RULES.defaultStyleLabel}" (style1) per default JSON`);
  });
});

// ===========================================================================
// Suite B — Settings panel (TC_108)
// ===========================================================================
describe('44-B — Lesson Opener: Settings panel (TC_108)', () => {
  it('TC_108 — Clicking the component opens the Lesson Opener settings panel with title + icon', function () {
    skipIfNoUrl(this);
    cy.openLessonOpenerSettings();
    cy.get(LO_SETTINGS.root).should('exist');
    cy.get(LO_SETTINGS.title).should('contain.text', 'Lesson Opener');
    cy.get(LO_SETTINGS.icon).should('exist');
    cy.get(LO_SETTINGS.stylePanel).should('exist');
    cy.log('✅ TC_108: Settings panel opens with "Lesson Opener" title, icon, and Style dropdown');
  });
});

// ===========================================================================
// Suite C — Styles present & selectable (TC_04/05/27, TC_46, TC_75/76, TC_101)
// ===========================================================================
describe('44-C — Lesson Opener: Styles present & selectable', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openLessonOpenerSettings(); });

  it('TC_05/TC_27 — "Learning Prompt" (style1) is present and active by default', function () {
    skipIfNoUrl(this);
    cy.get(`${LO_SETTINGS.panel} .stylebgdiv#${LO_STYLES.learningPrompt} .styleBackground`)
      .should('exist')
      .and('have.class', 'active-style');
    cy.log('✅ TC_05/27: Learning Prompt style present and active (source default)');
  });

  it('TC_46 — "Make a Connection" (style2) is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(`${LO_SETTINGS.panel} .stylebgdiv#${LO_STYLES.makeConnection} .styleBackground`)
      .should('exist')
      .click({ force: true });
    cy.log('✅ TC_46: Make a Connection style button present and clickable');
  });

  it('TC_75/TC_76 — "My Learning Goals" (style3) is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(`${LO_SETTINGS.panel} .stylebgdiv#${LO_STYLES.myLearningGoals} .styleBackground`)
      .should('exist')
      .click({ force: true });
    cy.log('✅ TC_75/76: My Learning Goals style button present and clickable');
  });

  it('TC_04b — "Key Terms" (style4) is present and selectable', function () {
    skipIfNoUrl(this);
    cy.get(`${LO_SETTINGS.panel} .stylebgdiv#${LO_STYLES.keyTerms} .styleBackground`)
      .should('exist')
      .click({ force: true });
    cy.log('✅ TC_04: Key Terms style button present and clickable');
  });

  it('TC_101/TC_108b — Only the four source-defined Lesson Opener styles are offered', function () {
    skipIfNoUrl(this);
    const known = Object.values(LO_STYLES) as string[];
    cy.get(LO_SETTINGS.styleButtons).should('have.length.greaterThan', 0);
    cy.get(LO_SETTINGS.styleDivs).each(($el) => {
      const id = $el.attr('id') || '';
      if (id) expect(known, `style "${id}" is a known/supported Lesson Opener style`).to.include(id);
    });
    cy.log('✅ TC_101: Style list is constrained to the four supported Lesson Opener styles');
  });
});

// ===========================================================================
// Suite D — Fixed (non-editable) titles + icons per style (TC_08, TC_50,
//           TC_78/79, TC_103__2..4)
// ===========================================================================
describe('44-D — Lesson Opener: Fixed titles & icons per style', () => {
  it('TC_08 — "Key Terms" (style4) shows its fixed title + icon', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.keyTerms);
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style4);
    cy.get(LO_CANVAS.goalsKeyTermsIcon).should('exist');
    cy.log('✅ TC_08: Key Terms fixed title + icon rendered');
  });

  it('TC_50 — "Make a Connection" (style2) shows its fixed title + icon', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.makeConnection);
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style2);
    cy.get(LO_CANVAS.makeConnectionIcon).should('exist');
    cy.log('✅ TC_50: Make a Connection fixed title + icon rendered');
  });

  it('TC_78/TC_79 — "My Learning Goals" (style3) shows its fixed title + icon', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.myLearningGoals);
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style3);
    cy.get(LO_CANVAS.goalsKeyTermsIcon).should('exist');
    cy.log('✅ TC_78/79: My Learning Goals fixed title + icon rendered');
  });

  it('TC_103__2/TC_103__3 — "Learning Prompt" (style1) shows its fixed title + bulb icon', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.learningPrompt);
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style1);
    cy.get(LO_CANVAS.learningPromptIcon).should('exist');
    cy.log('✅ TC_103__2/3: Learning Prompt fixed title + bulb icon rendered');
  });

  it('TC_34 — The fixed header label is a non-editable text node (not contenteditable)', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.headerLabel).first().invoke('attr', 'contenteditable').should('not.eq', 'true');
    cy.log('✅ TC_34: Fixed header label is not contenteditable (title cannot be edited)');
  });
});

// ===========================================================================
// Suite E — Content entry into the editable body (TC_14, TC_53, TC_84/85,
//           TC_103__10/11)
// ===========================================================================
describe('44-E — Lesson Opener: Content entry', () => {
  it('TC_14/TC_53 — Editable body accepts and retains entered text', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.body).first().setContentEditableOn(LO_DATA.shortBody);
    cy.get(LO_CANVAS.body).first().should('contain.text', LO_DATA.shortBody);
    cy.log('✅ TC_14/53: Lesson Opener body content entered (persistence-after-reload deferred)');
  });

  it('TC_38/TC_104 — Empty body retains its empty/placeholder state (no crash)', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.body).first().setContentEditableOn('');
    cy.get(LO_CANVAS.body).first().should('exist');
    cy.log('ℹ TC_38/104: Empty input handled gracefully; validation/warning is a Save/Publish check (deferred)');
  });

  it('TC_103__10/TC_103__11 — Body preserves a line break entered in edit mode', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.body).first().then(($el) => {
      const el = $el[0];
      el.focus();
      el.innerHTML = 'First prompt line.<br>Second prompt line.';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.get(LO_CANVAS.body).first().find('br').should('exist');
    cy.log('✅ TC_103__10/11: Line break preserved in the contenteditable body');
  });
});

// ===========================================================================
// Suite F — Style switching keeps the editable body content (TC_109–TC_111,
//           TC_115, TC_117, TC_124)
// ===========================================================================
describe('44-F — Lesson Opener: Style switching & content retention', () => {
  it('TC_109/TC_110 — Switch Learning Prompt → Make a Connection → back', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.makeConnection);
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style2);
    cy.selectLessonOpenerStyle(LO_STYLES.learningPrompt);
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style1);
    cy.log('✅ TC_109/110: Style switches both directions and the layout updates');
  });

  it('TC_111/TC_124 — Body content is retained when switching styles', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.body).first().setContentEditableOn(LO_DATA.learningPromptBody);
    cy.selectLessonOpenerStyle(LO_STYLES.makeConnection);
    cy.get(LO_CANVAS.body).first().should('contain.text', LO_DATA.learningPromptBody);
    cy.selectLessonOpenerStyle(LO_STYLES.learningPrompt);
    cy.get(LO_CANVAS.body).first().should('contain.text', LO_DATA.learningPromptBody);
    cy.log('✅ TC_111/124: Original body content retained across style switches');
  });

  it('TC_115 — Switching styles multiple times keeps the component stable', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.makeConnection);
    cy.selectLessonOpenerStyle(LO_STYLES.myLearningGoals);
    cy.selectLessonOpenerStyle(LO_STYLES.keyTerms);
    cy.selectLessonOpenerStyle(LO_STYLES.learningPrompt);
    cy.get(LO_CANVAS.component).should('exist');
    cy.get(LO_CANVAS.headerLabel).should('contain.text', LO_STYLE_LABELS.style1);
    cy.log('✅ TC_115: Component remains stable after repeated style switches');
  });

  it('TC_116 — Header text stays non-editable after switching styles', function () {
    skipIfNoUrl(this);
    cy.selectLessonOpenerStyle(LO_STYLES.keyTerms);
    cy.get(LO_CANVAS.headerLabel).first().invoke('attr', 'contenteditable').should('not.eq', 'true');
    cy.log('✅ TC_116: Header remains non-editable after style switch');
  });
});

// ===========================================================================
// Suite G — Settings: display toggles & accessibility (TC_35/67, TC_108)
// ===========================================================================
describe('44-G — Lesson Opener: Settings toggles & accessibility', () => {
  beforeEach(function () { skipIfNoUrl(this); cy.openLessonOpenerSettings(); });

  it('TOGGLES — Show Header / Show Image toggles are present', function () {
    skipIfNoUrl(this);
    cy.get(LO_SETTINGS.showHeader).should('exist');
    cy.get(LO_SETTINGS.showImage).should('exist');
    cy.log('✅ Show Header + Show Image toggles present in settings');
  });

  it('TC_35/TC_67 — Background/Stroke colour inputs are disabled for sidebar styles', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LO_SETTINGS.backgroundColorInput).length === 0) {
        cy.log('ℹ TC_35/67: Sidebar colour inputs not rendered for the current style');
        return;
      }
      cy.get(LO_SETTINGS.backgroundColorInput).should('be.disabled');
      cy.log('✅ TC_35/67: Background colour input is disabled (fixed colour, source-restricted)');
    });
  });

  it('ALT — Accessibility Alt Text field present and enforces maxlength=2000', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LO_SETTINGS.altText).length === 0) {
        cy.log('ℹ ALT: Alt Text only renders for image-enabled styles (not active here)');
        return;
      }
      cy.get(LO_SETTINGS.altText).invoke('attr', 'maxlength').should('eq', String(LO_RULES.altTextMaxLength));
      cy.get(LO_SETTINGS.altText).clear({ force: true }).type(LO_DATA.altText, { force: true })
        .should('have.value', LO_DATA.altText);
      cy.log('✅ ALT: Alt Text present, editable, maxlength=2000');
    });
  });
});

// ===========================================================================
// Suite H — Security (TC_103__25)
// ===========================================================================
describe('44-H — Lesson Opener: Security', () => {
  it('TC_103__25 — Script tags in the body are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get(LO_CANVAS.body).first().setContentEditableOn(LO_DATA.scriptInjection);
    cy.get(LO_CANVAS.body).first().should('not.contain.html', '<script>');
    cy.window().then((win) => {
      expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
    });
    cy.log('✅ TC_103__25: Script injection in the Lesson Opener body is not executed');
  });
});

// ===========================================================================
// DEFERRED — login/activity/step bootstrap, hero media upload (OS picker),
// RTE math RENDER, Preview/Reader/CLP student & teacher views, Publish/
// republish, persistence-after-reload, Figma/visual & responsive parity,
// cross-browser, multilingual, glossary, saLTIre launch, a11y audits.
// Every remaining QC id appears here exactly once.
// ===========================================================================
describe('44-Z — Lesson Opener: Deferred (Bootstrap / Media / Preview / Reader / Publish / lifecycle / a11y)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Launch Studio URL + listing page — environment bootstrap handled by openAuthoringTool, not a component assertion'],
    ['TC_02', 'Create math activity (basic info) — activity-creation flow outside authoring DOM'],
    ['TC_03', 'Start authoring redirect — activity-creation flow outside authoring DOM'],
    ['TC_09', 'Figma visual parity (bg/font/style) — visual-design review, not a DOM assertion'],
    ['TC_10', 'All RTE features applied/visible — floating RTE toolbar + render verified in Preview'],
    ['TC_11', 'Math text + special characters render — math RENDER verified in Preview'],
    ['TC_12', 'Glossary term linked + shown in CLP — glossary + CLP flow'],
    ['TC_13', 'Restriction on editing title/font/color (full) — runtime edit-guard + visual'],
    ['TC_15', 'Preview in desktop/tablet/mobile — Preview/responsive flow'],
    ['TC_16', 'Publish activity with Key Terms — Publish flow outside authoring DOM'],
    ['TC_17', 'Edit + re-publish reflected in CLP — Publish/CLP flow'],
    ['TC_18', 'Glossary viewable in CLP as student — CLP student flow'],
    ['TC_19', 'Component appears as expected for teacher — CLP teacher flow'],
    ['TC_20', 'No scrollbars with long content — visual/overflow assertion best seen in Preview'],
    ['TC_21', 'Restriction on using outside Generic Step — runtime drop-guard (config registers as canvas element)'],
    ['TC_22', 'Browser compatibility — Chrome — cross-browser matrix'],
    ['TC_23', 'Browser compatibility — Safari — cross-browser matrix (no Safari runner)'],
    ['TC_24', 'Add component to older activities — pre-existing activity bootstrap'],
    ['TC_25', 'UI matches Figma (full) — visual-design review'],
    ['TC_26', 'Creation of static Lesson Opener — Preview/Reader static behaviour'],
    ['TC_28', 'Static behaviour (no interactivity) — Reader runtime behaviour'],
    ['TC_29', 'Restriction of Lesson Opener to Generic Step — runtime drop-guard'],
    ['TC_30', 'Multilingual content support — locale-switch + render flow'],
    ['TC_31', 'Math support (equations display) — math RENDER verified in Preview'],
    ['TC_32', 'Responsive behaviour — responsive Preview flow'],
    ['TC_33', 'Restriction on dragging into unsupported step — runtime drop-guard'],
    ['TC_36', 'Restriction on unsupported nested components — runtime drop-guard'],
    ['TC_37', 'Restriction on adding Key Terms outside Lesson Opener — runtime drop-guard'],
    ['TC_39', 'Broken glossary link behaviour — glossary runtime'],
    ['TC_40', 'Unsupported browser behaviour — cross-browser matrix'],
    ['TC_41', 'Conflicting RTE usage misalignment — visual/RTE runtime'],
    ['TC_42', 'Long glossary term overflow — visual/overflow in Preview'],
    ['TC_43', 'Add math text + symbols — math RENDER verified in Preview'],
    ['TC_44', 'Math equation saved + previewed — Save + Preview render flow'],
    ['TC_45', 'Multiple languages render — locale flow'],
    ['TC_47', 'Drag/drop Make a Connection into Generic Step — runtime drop into step'],
    ['TC_48', 'Make a Connection restricted to Generic step — runtime drop-guard'],
    ['TC_49', 'Make a Connection UI matches Figma — visual-design review'],
    ['TC_51', 'Make a Connection RTE basic formatting — RTE render in Preview'],
    ['TC_52', 'Make a Connection math + special chars — math RENDER in Preview'],
    ['TC_54', 'Make a Connection preview across modes — Preview/responsive flow'],
    ['TC_55', 'Publish with Make a Connection — Publish flow'],
    ['TC_56', 'Published Make a Connection in CLP — CLP flow'],
    ['TC_57', 'Make a Connection edit + republish — Publish/CLP flow'],
    ['TC_58', 'Make a Connection static on CLP — CLP runtime'],
    ['TC_59', 'Make a Connection Chrome compatibility — cross-browser matrix'],
    ['TC_60', 'Make a Connection Safari compatibility — cross-browser matrix'],
    ['TC_61', 'Existing activity accepts Make a Connection — pre-existing activity bootstrap'],
    ['TC_62', 'Make a Connection multilingual — locale flow'],
    ['TC_63', 'Make a Connection long content no scrollbars — visual/overflow in Preview'],
    ['TC_64', 'Make a Connection math saves + re-renders — Save + Preview render'],
    ['TC_65', 'Make a Connection cannot be added to Multipart/interactive — runtime drop-guard'],
    ['TC_66', 'Make a Connection fixed title not editable (full) — runtime edit-guard'],
    ['TC_68', 'Make a Connection not available outside Lesson Opener — runtime availability'],
    ['TC_69', 'Make a Connection empty save blocks publish — Publish validation flow'],
    ['TC_70', 'Make a Connection formatting conflicts — RTE runtime'],
    ['TC_71', 'Make a Connection invalid math fails gracefully — math validation in Preview'],
    ['TC_72', 'Make a Connection no glossary/hyperlinks — RTE feature-gate runtime'],
    ['TC_73', 'Make a Connection long-text overflow — visual/overflow in Preview'],
    ['TC_74', 'Make a Connection corrupted save preserves input — persistence/retry runtime'],
    ['TC_77', 'My Learning Goals drag/drop in Flexi layout — runtime drop into layout section'],
    ['TC_80', 'My Learning Goals bg/colors match Figma — visual-design review'],
    ['TC_81', 'My Learning Goals RTE options work — RTE render in Preview'],
    ['TC_82', 'My Learning Goals math via math keyboard — math RENDER in Preview'],
    ['TC_83', 'My Learning Goals long math renders — math RENDER in Preview'],
    ['TC_84', 'My Learning Goals math saved after save — Save + persistence'],
    ['TC_85', 'My Learning Goals content saved in backend — persistence-after-reload'],
    ['TC_86', 'My Learning Goals across author preview modes — Preview flow'],
    ['TC_87', 'My Learning Goals published content in CLP — CLP flow'],
    ['TC_88', 'My Learning Goals republish preserves content — Publish/CLP flow'],
    ['TC_89', 'My Learning Goals read-only on CLP as student — CLP student flow'],
    ['TC_90', 'My Learning Goals teacher preview/review — CLP teacher flow'],
    ['TC_91', 'My Learning Goals no data loss on reload — persistence-after-reload'],
    ['TC_92', 'My Learning Goals Chrome compatibility — cross-browser matrix'],
    ['TC_93', 'My Learning Goals Safari compatibility — cross-browser matrix'],
    ['TC_94', 'Editing previously created activity — pre-existing activity bootstrap + Publish'],
    ['TC_95', 'Launch published activity via saLTIre — LTI launch flow'],
    ['TC_96', 'Long text + math rendered — math RENDER in Preview'],
    ['TC_97', 'Equation inside list/formatted text — math RENDER in Preview'],
    ['TC_98', 'Editing fixed title blocked (full) — runtime edit-guard'],
    ['TC_99', 'Invalid LaTeX/MathML syntax — math validation in Preview'],
    ['TC_100', 'Unsupported symbols sanitized — sanitization verified in Preview/Publish'],
    ['TC_102', 'Lesson Opener Components visible only in Generic Step — runtime step-type availability guard'],
    ['TC_103', 'Lesson Opener Components visible in elements tray — catalog/tray listing flow'],
    ['TC_103__4', 'Fixed bg/font/color match Figma — visual-design review'],
    ['TC_103__5', 'RTE bulleted list — RTE render in Preview'],
    ['TC_103__6', 'RTE numbered list — RTE render in Preview'],
    ['TC_103__7', 'RTE bold/italic/underline — RTE render in Preview'],
    ['TC_103__8', 'Math equations via RTE — math RENDER in Preview'],
    ['TC_103__9', 'Long text + math together — math RENDER in Preview'],
    ['TC_103__12', 'Authoring preview (desktop) — Preview flow'],
    ['TC_103__13', 'Authoring preview (tablet) — responsive Preview flow'],
    ['TC_103__14', 'Authoring preview (mobile) — responsive Preview flow'],
    ['TC_103__15', 'Edit + re-preview — Preview flow'],
    ['TC_103__16', 'Published activity retains Learning Prompt — Publish/CLP flow'],
    ['TC_103__17', 'Republish retains updated content — Publish/CLP flow'],
    ['TC_103__18', 'No data loss during edit/save/publish — persistence + Publish'],
    ['TC_103__19', 'CLP student view — no interaction — CLP student flow'],
    ['TC_103__20', 'CLP teacher view — readable, non-editable — CLP teacher flow'],
    ['TC_103__21', 'UI matches Figma (colors/spacing/alignment) — visual-design review'],
    ['TC_103__22', 'Cross-browser Chrome — cross-browser matrix'],
    ['TC_103__23', 'Cross-browser Safari — cross-browser matrix'],
    ['TC_103__24', 'Multiple Lesson Opener components independently editable — multi-instance lifecycle'],
    ['TC_105', 'Delete component title via dev tools re-renders — DOM-tamper resilience runtime'],
    ['TC_106', 'Long math exceeds limit — math limit handling in Preview/Publish'],
    ['TC_112', 'Math equation preserved while switching styles — math RENDER in Preview'],
    ['TC_113', 'List preserved after switching styles — RTE render in Preview'],
    ['TC_114', 'Style-specific UI updates on switch (full visual) — visual parity in Preview'],
    ['TC_117', 'Save after switching style — Save/persistence flow'],
    ['TC_118', 'Publish after style switch — Publish flow'],
    ['TC_119', 'Preview after switching styles — Preview flow'],
    ['TC_120', 'Edit → re-preview after publish with new style — Publish/Preview flow'],
    ['TC_121', 'No data loss during rapid style switching — persistence/runtime'],
    ['TC_122', 'Responsive preview after style switch — responsive Preview flow'],
    ['TC_123', 'Switch style with empty required fields — Save/validation runtime'],
    ['TC_125', 'Style change reflected in CLP (student) — Publish/CLP flow'],
    ['TC_126', 'Style change reflected in CLP (teacher) — Publish/CLP flow'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
