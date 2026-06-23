/// <reference types="cypress" />
// =============================================================================
// 08 — Widget Components
// Component list: fixtures/test-registry.json (primary) + local fallback
// =============================================================================

import { loadComponentsForSpec } from '../support/component-registry';

const LAUNCH_URL: string = Cypress.env('AUTHORING_LAUNCH_URL') || '';

interface Widget {
  name: string;
  dataType: string;
  settingsChecks?: Array<{ label: string; selector: string }>;
}

const WIDGET_OVERRIDES: Record<string, Partial<Widget>> = {
  'Multiple Choice': {
    settingsChecks: [
      { label: 'MCQ settings panel',    selector: '#mcq-settings-panel'  },
      { label: 'MCQ style card',        selector: '.mcq_style_holder'    },
    ],
  },
};

const WIDGET_FALLBACK: Widget[] = [
  { name: 'Multiple Choice', dataType: 'multiple-choice-template' },
  { name: 'Fill in the Blank',  dataType: 'fill-in-the-blank'            },
  { name: 'Sorting',            dataType: 'sorting'                       },
  { name: 'Match The Pairs',    dataType: 'match-the-pairs'               },
  { name: 'True False',         dataType: 'true-false-template'           },
  { name: 'Flashcard',          dataType: 'flashcard'                     },
  { name: 'Click to Reveal',    dataType: 'clickToReveal'                 },
  { name: 'Slideshow',          dataType: 'slideshow'                     },
  { name: 'Highlighter',        dataType: 'highlight'                     },
  { name: 'Correction',         dataType: 'correction'                    },
  { name: 'Question Answer',    dataType: 'shortLongAns'                  },
  { name: 'Word Search',        dataType: 'wordsearch'                    },
  { name: 'Sidebar',            dataType: 'aside-bar'                     },
  { name: 'Image Labeling',     dataType: 'imagelabelling'                },
  { name: 'Annotation',         dataType: 'annotationHighlightOutline'    },
  { name: 'MTP Multiple',       dataType: 'mtp-multiple'                  },
  { name: 'Image GO',           dataType: 'graphicOrganizerImageHotSpot'  },
  { name: 'CLIC Component',     dataType: 'sketchpad'                     },
  { name: 'Identify the Clip',  dataType: 'identify-the-clip'             },
  { name: 'Group Activity',     dataType: 'group-interactivity-template'  },
];

const WIDGETS: Widget[] = loadComponentsForSpec(
  '08-widget-components.spec.ts',
  WIDGET_FALLBACK,
).map(base => ({
  ...base,
  ...(WIDGET_OVERRIDES[base.name] || {}),
}));

const GENERIC_CHECKS = [
  { label: 'Settings panel is visible',   selector: '.componentSettingPanel'     },
  { label: 'Settings panel has content',  selector: '.componentSettingPanel > *' },
];

function getChecks(widget: Widget) {
  return widget.settingsChecks || GENERIC_CHECKS;
}

describe('08 — Widget Components', () => {

  before(function () {
    if (!LAUNCH_URL) this.skip();
  });

  // ── STEP 0 ─────────────────────────────────────────────────────────────────
  // Explicit it() — shows in video timeline and PDF/HTML report as a named step.
  // ───────────────────────────────────────────────────────────────────────────
  it('SETUP · Step 0 — Module-aware canvas setup before widget testing', function () {
    if (!LAUNCH_URL) { this.skip(); return; }
    cy.openAuthoringTool(LAUNCH_URL);
    cy.setupModuleCanvas();
    cy.openAddPanel();
    cy.expandSection('Widgets');
  });

  WIDGETS.forEach((widget, idx) => {
    const tcBase = `TC-08.${(idx * 4) + 1}`;

    it(`${tcBase}a — [Widget] ${widget.name}: visible in Widgets section of the Add panel`, () => {
      cy.log(`🔍 Looking for "${widget.name}" in Widgets accordion`);
      cy.get('#lbl-add-content li.activeDrags .widget-name', { timeout: 10000 })
        .filter(`:contains("${widget.name}")`).scrollIntoView()
        .should('exist').and('be.visible');
      cy.wait(300);
    });

    it(`${tcBase}b — [Widget] ${widget.name}: drops onto canvas`, () => {
      cy.log(`🖱 Dropping "${widget.name}" onto canvas`);
      cy.dropComponent(widget.name);
      cy.wait(700);
      cy.get('#desktop_view .sd-item', { timeout: 20000 })
        .last().scrollIntoView().should('be.visible');
      cy.wait(400);
    });

    it(`${tcBase}c — [Widget] ${widget.name}: settings panel opens when component is clicked`, () => {
      cy.log(`⚙️ Opening settings panel for "${widget.name}"`);
      cy.openComponentSettings();
      cy.get('.componentSettingPanel', { timeout: 12000 }).should('be.visible');
      cy.wait(500);
    });

    it(`${tcBase}d — [Widget] ${widget.name}: settings panel contains expected controls`, () => {
      const checks = getChecks(widget);
      checks.forEach(({ label, selector }) => {
        cy.log(`✅ Verifying: "${label}"`);
        cy.get('.componentSettingPanel', { timeout: 5000 })
          .find(selector, { timeout: 8000 })
          .should('exist');
        cy.wait(200);
      });
      cy.log(`🗑 Cleaning up "${widget.name}"`);
      cy.deleteLastComponent();
      cy.wait(400);
    });
  });

});
