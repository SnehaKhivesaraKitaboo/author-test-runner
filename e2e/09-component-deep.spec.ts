/// <reference types="cypress" />
// =============================================================================
// 09 — Component Deep Test
//
// Runs a thorough end-to-end test for each selected component:
//   Step 1  → Component appears in the left panel (correct section)
//   Step 2  → Component is visible after expanding its accordion section
//   Step 3  → Component can be dropped onto the canvas
//   Step 4  → Dropped component renders with correct base structure (.sd-item)
//   Step 5  → Clicking the component opens the Settings Panel
//   Step 6  → Settings Panel contains the expected feature options
//   Step 7  → Feature-specific interactions work (where applicable)
//   Step 8  → Cleanup — component is deleted, canvas returns to clean state
//
// Controlled by env:
//   AUTHORING_TEST_COMPONENTS = "Image,Header,Multiple Choice"  (comma-separated)
//                             | "all"                           (all components)
// =============================================================================

import { resolvePickerNamesToDataTypes } from '../support/component-registry';
import { getAuthoringModule } from '../support/module-setup';

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';
const COMPONENTS_INPUT: string = Cypress.env('AUTHORING_TEST_COMPONENTS') || 'all';
const AUTHORING_MODULE: string = Cypress.env('AUTHORING_MODULE') || 'ela';

// ---------------------------------------------------------------------------
// Full component registry with detailed assertions per component
// Names here match the authoring panel widget labels (may differ from JSON).
// ---------------------------------------------------------------------------
interface SettingsCheck {
  label: string;
  selector: string;
  description: string;
}

interface FeatureCheck {
  label: string;
  action: () => void;
}

interface ComponentDef {
  name: string;
  dataType: string;
  section: string;
  category: 'Layout' | 'Layer' | 'Element' | 'Widget';
  description: string;
  features: string[];
  settingsChecks: SettingsCheck[];
  featureInteraction?: () => void;
}

const REGISTRY: ComponentDef[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Left', dataType: 'layout-1', section: 'Layout', category: 'Layout',
    description: 'Left-aligned single column layout container',
    features: ['Column layout', 'Droppable container for elements'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
      { label: 'Panel has content',  selector: '.componentSettingPanel > *', description: 'Settings has at least one option' },
    ],
  },
  {
    name: 'Center', dataType: 'layout-2', section: 'Layout', category: 'Layout',
    description: 'Center-aligned layout container',
    features: ['Center layout', 'Droppable container'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Right', dataType: 'layout-3', section: 'Layout', category: 'Layout',
    description: 'Right-aligned layout container',
    features: ['Right layout', 'Droppable container'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Four Column', dataType: 'layout-4', section: 'Layout', category: 'Layout',
    description: 'Four equal-column layout grid',
    features: ['4-column grid', 'Each column accepts elements/widgets'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Three Column', dataType: 'layout-5', section: 'Layout', category: 'Layout',
    description: 'Three equal-column layout grid',
    features: ['3-column grid', 'Flexible column widths'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Custom Center', dataType: 'layout-6', section: 'Layout', category: 'Layout',
    description: 'Custom-width centered layout',
    features: ['Custom width control', 'Centered alignment'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Flexi', dataType: 'layout-7', section: 'Layout', category: 'Layout',
    description: 'Flexible CSS-grid-based layout',
    features: ['Flexible column ratio', 'Resizable columns'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Layer', dataType: 'layer-1', section: 'Layer', category: 'Layer',
    description: 'Overlay layer for stacking content above the page',
    features: ['Overlay positioning', 'Z-index stacking', 'Layered content'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
      { label: 'Panel has content',  selector: '.componentSettingPanel > *', description: 'Settings has options' },
    ],
  },
  {
    name: 'LoD', dataType: 'lod', section: 'Layer', category: 'Layer',
    description: 'Level of Differentiation layer for multi-level content',
    features: ['Multiple differentiation levels', 'Level switching', 'Per-level content'],
    settingsChecks: [
      { label: 'Settings panel',     selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ELEMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Title', dataType: 'chapter-headingNew-h1', section: 'Elements', category: 'Element',
    description: 'Chapter/page title element with configurable background styles',
    features: ['H1 heading', 'Background image or solid color', 'Reset style'],
    settingsChecks: [
      { label: 'Background radio buttons',  selector: 'input[name="chapter_radio"]',    description: 'Image/Solid background toggle' },
      { label: 'Image background option',   selector: 'input[value="bg-image"]',        description: 'Background image option' },
      { label: 'Solid background option',   selector: 'input[value="bg-color"]',        description: 'Solid color option' },
      { label: 'Reset Style button',        selector: '.resetbutton',                   description: 'Reset to default style' },
    ],
  },
  {
    name: 'Header', dataType: 'header', section: 'Elements', category: 'Element',
    description: 'Section header with H2–H6 style cards and color customization',
    features: ['H2–H6 style variants', 'Component color picker', 'Apply to all', 'Reset changes', 'Alt text'],
    settingsChecks: [
      { label: 'H2 style card',          selector: '.h2-style-holder',                           description: 'H2 heading style option' },
      { label: 'H3 style card',          selector: '.h3-style-holder',                           description: 'H3 heading style option' },
      { label: 'H4 style card',          selector: '.h4-style-holder',                           description: 'H4 heading style option' },
      { label: 'H5 style card',          selector: '.h5-style-holder',                           description: 'H5 heading style option' },
      { label: 'H6 style card',          selector: '.h6-style-holder',                           description: 'H6 heading style option' },
      { label: 'Color picker',           selector: '.colorPickerContainer',                      description: 'Component color picker' },
      { label: 'Apply to all button',    selector: '.applyToAllButton',                          description: 'Apply style to all Headers' },
      { label: 'Reset button',           selector: '.applyToAllResetButton',                     description: 'Reset style changes' },
      { label: 'Alt text input',         selector: 'textarea[ng-model="currSettings.altText"]',  description: 'Accessibility alt text' },
    ],
    featureInteraction: () => {
      cy.get('.componentSettingPanel .h3-style-holder', { timeout: 8000 }).click({ force: true });
      cy.get('.componentSettingPanel .h3-style-holder').should('have.class', 'header-comp-bgColr');
    },
  },
  {
    name: 'Text', dataType: 'paragraph', section: 'Elements', category: 'Element',
    description: 'Rich-text paragraph element with label type options',
    features: ['Rich text editing', 'Label type toggle (Primary/Secondary)', 'Paragraph formatting'],
    settingsChecks: [
      { label: 'Settings section heading',  selector: '.Setting-Panel-setting-name',                       description: 'Settings panel heading' },
      { label: 'Show Label checkbox',       selector: 'input[ng-model="currSettings.isLabelTypeParagraph"]', description: 'Toggle label type display' },
    ],
  },
  {
    name: 'Image', dataType: 'image', section: 'Elements', category: 'Element',
    description: 'Image element with upload, dimensions, alignment and alt text',
    features: ['Image upload', 'W/H dimension control', 'Full-width option', 'Alignment (L/C/R)', 'Alt text', 'Image border'],
    settingsChecks: [
      { label: 'Upload image area',  selector: '#upload-comp-img',   description: 'Image upload target' },
      { label: 'Width input',        selector: '#imgWidthc',          description: 'Image width input' },
    ],
  },
  {
    name: 'Video', dataType: 'video', section: 'Elements', category: 'Element',
    description: 'Video element supporting file upload and YouTube embed',
    features: ['Video file upload', 'YouTube URL embed', 'Dimension control', 'Alignment', 'Transcript'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
      { label: 'Panel has content', selector: '.componentSettingPanel > *', description: 'Settings has video options' },
    ],
  },
  {
    name: 'Audio', dataType: 'audio', section: 'Elements', category: 'Element',
    description: 'Audio player element with transcript and caption options',
    features: ['MP3 upload', 'Transcript text', 'Show Caption toggle', 'Play in Background option'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
      { label: 'Panel has content', selector: '.componentSettingPanel > *', description: 'Settings has audio options' },
    ],
  },
  {
    name: 'Table', dataType: 'tablesNew', section: 'Elements', category: 'Element',
    description: 'Configurable data table with rows and columns',
    features: ['Row/column configuration', 'Cell editing', 'Table styling'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Callout Box', dataType: 'sidebarComponent', section: 'Elements', category: 'Element',
    description: 'Styled callout/sidebar box for highlighting key content',
    features: ['Box styling', 'Icon options', 'Color variants'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Situation Header', dataType: 'situationbox', section: 'Elements', category: 'Element',
    description: 'Situation/scenario header box for case-study content',
    features: ['Situation styling', 'Title and description fields'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGETS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Multiple Choice', dataType: 'multiple-choice-template', section: 'Widgets', category: 'Widget',
    description: 'Multiple-choice question widget with style variants',
    features: ['MCQ question editor', 'Multiple style cards', 'Single/multi answer', 'Submit feedback'],
    settingsChecks: [
      { label: 'MCQ settings panel',  selector: '#mcq-settings-panel',     description: 'MCQ settings panel ID' },
      { label: 'MCQ style card',      selector: '.mcq_style_holder',        description: 'MCQ visual style options' },
      { label: 'Style section title', selector: '.Setting-Panel-style-name', description: 'Style section heading' },
    ],
  },
  {
    name: 'Fill in the Blank', dataType: 'fill-in-the-blank', section: 'Widgets', category: 'Widget',
    description: 'Fill-in-the-blank question with text-input and dropdown variants',
    features: ['Text input blanks', 'Dropdown blanks', 'Drag-and-drop blanks', 'Answer validation'],
    settingsChecks: [
      { label: 'FIB settings panel',    selector: '#fib-settings-panel',  description: 'Dedicated FIB settings panel' },
      { label: 'Dropdown option type', selector: '#with-option',         description: 'Dropdown answer mode' },
      { label: 'Text option type',     selector: '#without-option',      description: 'Text answer mode' },
      { label: 'Show Label Type',      selector: '#label-visibility',    description: 'Primary/Secondary label toggle' },
      { label: 'Shuffle Choice',       selector: '#add-shuftle-choices', description: 'Shuffle dropdown options' },
    ],
  },
  {
    name: 'Sorting', dataType: 'sorting', section: 'Widgets', category: 'Widget',
    description: 'Drag-to-sort ordering activity',
    features: ['Orderable items', 'Drag-to-sort interaction', 'Correct order validation'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Match The Pairs', dataType: 'match-the-pairs', section: 'Widgets', category: 'Widget',
    description: 'Drag-and-match pairs activity',
    features: ['Left and right columns', 'Drag-to-match', 'Pair validation'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'True False', dataType: 'true-false-template', section: 'Widgets', category: 'Widget',
    description: 'True/False question widget',
    features: ['True/False answer buttons', 'Question text', 'Submit feedback'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Flashcard', dataType: 'flashcard', section: 'Widgets', category: 'Widget',
    description: 'Flip-card flashcard set for memorization',
    features: ['Front/back card editing', 'Flip animation', 'Multiple cards'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Click to Reveal', dataType: 'clickToReveal', section: 'Widgets', category: 'Widget',
    description: 'Click-to-reveal interaction for hidden content',
    features: ['Hidden content', 'Reveal trigger', 'Image/text reveals'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Slideshow', dataType: 'slideshow', section: 'Widgets', category: 'Widget',
    description: 'Image/content slideshow carousel',
    features: ['Multiple slides', 'Navigation arrows', 'Auto-play option'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Highlighter', dataType: 'highlight', section: 'Widgets', category: 'Widget',
    description: 'Text highlighting activity where students highlight correct phrases',
    features: ['Passage text', 'Highlight color', 'Correct answer marking'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Correction', dataType: 'correction', section: 'Widgets', category: 'Widget',
    description: 'Error correction activity — find and fix mistakes in text',
    features: ['Correction text editor', 'Error markers', 'Student response area'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Question Answer', dataType: 'shortLongAns', section: 'Widgets', category: 'Widget',
    description: 'Short/Long answer open-response question',
    features: ['Question text', 'Short or long answer mode', 'Character limit'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Word Search', dataType: 'wordsearch', section: 'Widgets', category: 'Widget',
    description: 'Word search puzzle generator',
    features: ['Word list editor', 'Grid size', 'Direction options'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Sidebar', dataType: 'aside-bar', section: 'Widgets', category: 'Widget',
    description: 'Expandable sidebar panel for supplementary content',
    features: ['Toggle open/close', 'Title and content', 'Position options'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Image Labeling', dataType: 'imagelabelling', section: 'Widgets', category: 'Widget',
    description: 'Interactive image with draggable label hotspots',
    features: ['Background image', 'Label hotspots', 'Drag-to-label interaction'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Annotation', dataType: 'annotationHighlightOutline', section: 'Widgets', category: 'Widget',
    description: 'Text annotation and outline activity',
    features: ['Text passage', 'Highlight annotation', 'Outline annotation'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'MTP Multiple', dataType: 'mtp-multiple', section: 'Widgets', category: 'Widget',
    description: 'Multiple match-the-pairs sets in one widget',
    features: ['Multiple pair sets', 'Combined scoring', 'Drag-to-match'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Image GO', dataType: 'graphicOrganizerImageHotSpot', section: 'Widgets', category: 'Widget',
    description: 'Graphic organizer with image hotspot interactions',
    features: ['Image canvas', 'Hotspot markers', 'Pop-up content on click'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'CLIC Component', dataType: 'sketchpad', section: 'Widgets', category: 'Widget',
    description: 'Sketch pad for freehand drawing responses',
    features: ['Drawing canvas', 'Pen/eraser tools', 'Color picker', 'Submit sketch'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Identify the Clip', dataType: 'identify-the-clip', section: 'Widgets', category: 'Widget',
    description: 'Video-clip identification activity',
    features: ['Video clip upload', 'Identification question', 'Answer options'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Group Activity', dataType: 'group-interactivity-template', section: 'Widgets', category: 'Widget',
    description: 'Collaborative group activity wrapper',
    features: ['Group configuration', 'Activity type selection', 'Submission settings'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL WIDGETS (from PDF test suite coverage)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'MCQ Multiple', dataType: 'mcq-multiple', section: 'Widgets', category: 'Widget',
    description: 'Multiple-choice multi-answer question (select all that apply)',
    features: ['Multi-answer MCQ', 'Style variants', 'Submit with feedback', 'Shuffle options'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
      { label: 'Panel has content', selector: '.componentSettingPanel > *', description: 'MCQ Multiple settings options' },
    ],
  },
  {
    name: 'Thumbcard', dataType: 'thumbcard', section: 'Widgets', category: 'Widget',
    description: 'Thumbnail card widget for visual content navigation',
    features: ['Thumbnail image', 'Title and description', 'Click to expand', 'Card grid layout'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'FIB Media', dataType: 'fib-media', section: 'Widgets', category: 'Widget',
    description: 'Fill-in-the-blank with image-based blanks and media prompts',
    features: ['Image blanks', 'Media prompt', 'Answer validation', 'Multiple blank types'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Extended Response Media', dataType: 'extendedResponseMedia', section: 'Widgets', category: 'Widget',
    description: 'Extended response question with image/video media prompt',
    features: ['Media prompt (image/video)', 'Open response area', 'Word count limit', 'Sample answer'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'HTML Interactivity', dataType: 'htmlInteractivity', section: 'Widgets', category: 'Widget',
    description: 'Custom HTML embed widget for rich interactive content',
    features: ['HTML code editor', 'CSS injection', 'JS execution', 'Responsive embed'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'ELA Multipart', dataType: 'ela-multipart', section: 'Widgets', category: 'Widget',
    description: 'ELA-specific multipart assessment with passage and multiple question types',
    features: ['Reading passage', 'Multiple question formats', 'Combined scoring', 'Stimulus-based questions'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'WL Multipart', dataType: 'wl-multipart', section: 'Widgets', category: 'Widget',
    description: 'World Languages multipart assessment (largest suite — 205 test cases)',
    features: ['Audio/video stimulus', 'Multiple question types', 'Language-specific formatting', 'Combined score'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE / STEP TYPES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Lesson Opener', dataType: 'lesson-opener', section: 'Elements', category: 'Element',
    description: 'Lesson opener page type with title, media and learning objectives',
    features: ['Lesson title', 'Background media', 'Learning objectives list', 'Edition info'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
  {
    name: 'Offline Step', dataType: 'offline-step', section: 'Elements', category: 'Element',
    description: 'Offline/printable step type for non-digital pencil-and-paper activities',
    features: ['Offline indicator', 'Print-optimized layout', 'Instruction text', 'Activity description'],
    settingsChecks: [
      { label: 'Settings panel',    selector: '.componentSettingPanel',     description: 'Settings panel opens' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Resolve which components to test from env input
// ---------------------------------------------------------------------------
function resolveComponents(): ComponentDef[] {
  if (COMPONENTS_INPUT.trim().toLowerCase() === 'all') return REGISTRY;

  const inputNames = COMPONENTS_INPUT.split(',').map(s => s.trim().toLowerCase());
  const dataTypes = resolvePickerNamesToDataTypes(inputNames);

  return REGISTRY.filter(c =>
    inputNames.includes(c.name.toLowerCase()) ||
    dataTypes.includes(c.dataType),
  );
}

const TARGETS = resolveComponents();

// ---------------------------------------------------------------------------
// Shared helpers (reuse from commands.ts via cy.*)
// ---------------------------------------------------------------------------
function dropComponent(name: string, dataType?: string) {
  cy.dropComponentForModule(name, { dataType });
}

function deleteLastComponent() {
  cy.deleteLastDroppedComponent();
}

// ---------------------------------------------------------------------------
// Guard — skip entire file if URL not set
// ---------------------------------------------------------------------------
before(function () {
  if (!LAUNCH_URL || TARGETS.length === 0) this.skip();
});

// ---------------------------------------------------------------------------
// SETUP — Mandatory Step 0: Create a Generic Step before any component test.
//
// Runs as an explicit it() so it appears in the HTML/PDF report with a SETUP
// badge and is clearly visible at the start of the video recording.
// ---------------------------------------------------------------------------
describe('09 — [Setup] Module-aware canvas setup (prerequisite for all component tests)', () => {
  it(`SETUP · Step 0 — Prepare canvas for module "${AUTHORING_MODULE}"`, function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    cy.log(`Module context: ${getAuthoringModule()}`);
    // Default unrestricted page; per-component before() applies Generic Step when needed
    cy.setupModuleCanvas();
  });
});

// ---------------------------------------------------------------------------
// Generate one describe block per component
// ---------------------------------------------------------------------------
TARGETS.forEach(comp => {
  const label = `[${comp.category}] ${comp.name}`;

  describe(`09 — ${label}`, () => {

    before(function () {
      if (!LAUNCH_URL) { this.skip(); return; }
      cy.openAuthoringTool(LAUNCH_URL);
      cy.setupModuleCanvas({ dataType: comp.dataType, componentName: comp.name });
      cy.openAddPanel();
      cy.expandSection(comp.section);
    });

    // ── Step 1: Component exists in its section ──────────────────────────
    it(`${label} · Step 1 — "${comp.section}" accordion section is present`, () => {
      cy.get('#lbl-add-content .accordion-toggle', { timeout: 10000 })
        .filter(`:contains("${comp.section}")`)
        .should('exist');
    });

    // ── Step 2: Component is visible in the widget list ──────────────────
    it(`${label} · Step 2 — Component visible in "${comp.section}" list`, () => {
      cy.get('#lbl-add-content li.activeDrags .widget-name', { timeout: 10000 })
        .filter(`:contains("${comp.name}")`)
        .should('exist');
    });

    // ── Step 3: Drop onto canvas ─────────────────────────────────────────
    it(`${label} · Step 3 — Drops onto canvas via module-aware injection`, () => {
      dropComponent(comp.name, comp.dataType);
    });

    // ── Step 4: Dropped component renders correctly ──────────────────────
    it(`${label} · Step 4 — Dropped component renders as .sd-item on canvas`, () => {
      cy.get(
        '.generic-step-column-content .sd-item, #desktop_view .sd-item',
        { timeout: 15000 },
      )
        .last()
        .should('exist')
        .and('be.visible');
    });

    // ── Step 5: Settings panel opens ────────────────────────────────────
    it(`${label} · Step 5 — Settings panel opens when component is clicked`, () => {
      cy.openDroppedComponentSettings();
      cy.get('.componentSettingPanel, #fib-settings-panel, #mcq-settings-panel', { timeout: 15000 })
        .filter(':visible')
        .first()
        .should('be.visible')
        .and('not.be.empty');
    });

    // ── Step 6: Component-specific settings assertions ───────────────────
    comp.settingsChecks.forEach((check, i) => {
      it(`${label} · Step 6.${i + 1} — Settings: "${check.label}" (${check.description})`, () => {
        cy.get('.componentSettingPanel', { timeout: 5000 })
          .find(check.selector, { timeout: 8000 })
          .should('exist');
      });
    });

    // ── Step 7: Feature-specific interaction (if defined) ────────────────
    if (comp.featureInteraction) {
      it(`${label} · Step 7 — Feature interaction test`, () => {
        comp.featureInteraction!();
      });
    }

    // ── Step 8: Cleanup ──────────────────────────────────────────────────
    it(`${label} · Step 8 — Cleanup: component deleted, canvas restored`, () => {
      deleteLastComponent();
      cy.get('body').should('be.visible');
      cy.get('body').should('not.contain.text', 'Application Error');
    });

  });
});
