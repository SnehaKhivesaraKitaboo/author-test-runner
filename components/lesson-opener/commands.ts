/// <reference types="cypress" />
// =============================================================================
// Lesson Opener component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Lesson Opener is a droppable ELEMENT, not an assessment widget:
//   "lessonOpenerComponent" is NOT in support/module-setup.ts
//   ASSESSMENT_DATA_TYPES, so the framework routes it to the canvas
//   (resolveDropTarget → 'canvas'). It is dropped onto the
//   Instructions-for-Students page (#desktop_view) via
//   cy.dropComponent('Lesson Opener Components'), which injects the catalog
//   widget { name: "Lesson Opener Components", dataType: "lessonOpenerComponent" }
//   onto the unrestricted canvas. It is NOT dropped into a Generic Step column.
// =============================================================================

import { LO_CANVAS, LO_SETTINGS, LO_STYLES, LO_WIDGET_NAME } from './selectors';
import { LO_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureLessonOpenerDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropLessonOpenerIntoCanvas(): Chainable<void>;
      fillLessonOpenerDummyContent(): Chainable<void>;
      openLessonOpenerSettings(): Chainable<void>;
      selectLessonOpenerStyle(styleName: string): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureLessonOpenerDeepSetup', (options = {}) => {
  const through = options.through || 'content';
  const skipCanvasNav = options.skipCanvasNav ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (hasEditor) return;
    cy.openAuthoringTool(url);
  });

  if (!skipCanvasNav) {
    cy.navigateToCanvasPage();
  }

  if (through === 'canvas') return;

  cy.dropLessonOpenerIntoCanvas();
  if (through === 'dropped') return;

  cy.fillLessonOpenerDummyContent();
});

Cypress.Commands.add('dropLessonOpenerIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    const alreadyDropped = $desktop.find(`.sd-item ${LO_CANVAS.component}`).length > 0;
    if (alreadyDropped) {
      cy.log('ℹ Lesson Opener element already present on canvas');
      return;
    }
    // Element drop → canvas (lessonOpenerComponent is not an assessment widget).
    cy.dropComponent(LO_WIDGET_NAME);
  });

  cy.get(LO_CANVAS.component, { timeout: 20000 }).should('exist');
  cy.captureLiveStep('widget-dropped-lesson-opener');
});

Cypress.Commands.add('fillLessonOpenerDummyContent', () => {
  cy.get(LO_CANVAS.component, { timeout: 12000 }).first().should('exist');
  cy.get(LO_CANVAS.body, { timeout: 12000 }).first().setContentEditableOn(LO_DATA.body);
  cy.captureLiveStep('lesson-opener-dummy-content-entered');
});

Cypress.Commands.add('openLessonOpenerSettings', () => {
  // The lesson-opener-template directive's introclick() opens the settings panel
  // (displaySettingPanel) when the component is clicked on the canvas.
  cy.get(`#desktop_view .sd-item ${LO_CANVAS.component}, #desktop_view ${LO_CANVAS.component}`, {
    timeout: 12000,
  })
    .first()
    .click({ force: true });
  cy.get(LO_SETTINGS.root, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('lesson-opener-settings-panel-open');
});

Cypress.Commands.add('selectLessonOpenerStyle', (styleName: string) => {
  const known = Object.values(LO_STYLES) as string[];
  if (!known.includes(styleName)) {
    throw new Error(`Unknown Lesson Opener style "${styleName}". Known: ${known.join(', ')}`);
  }
  cy.openLessonOpenerSettings();
  cy.get(`${LO_SETTINGS.panel} .stylebgdiv#${styleName} .styleBackground`, { timeout: 10000 })
    .should('exist')
    .click({ force: true });
  cy.captureLiveStep(`lesson-opener-style-${styleName}-selected`);
});

export {};
