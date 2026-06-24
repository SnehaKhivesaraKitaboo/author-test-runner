/// <reference types="cypress" />
// =============================================================================
// Instruction for Student component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// IMPORTANT — Instructions for Students is a FIXED TOC page, not a widget:
//   It already exists in the Table of Contents (grouptoc.studentInstructions,
//   pageType "studentInstructions"). The setup NAVIGATES to the page via the
//   existing cy.navigateToCanvasPage() primitive — which clicks the
//   "Instructions for Students" TOC entry and verifies the [new-toc] page
//   attributes — and then authors content on #desktop_view. We never "drop" the
//   instruction page itself; we add elements (e.g. Text/paragraph) TO it, which
//   config.studentInstructions permits.
// =============================================================================

import { IS_CANVAS, IS_ALLOWED_ELEMENTS } from './selectors';
import { IS_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureInstructionStudentDeepSetup(options?: {
        through?: 'page' | 'element' | 'content';
        skipPageNav?: boolean;
      }): Chainable<void>;
      openInstructionStudentPage(): Chainable<void>;
      addElementToInstructionStudentPage(): Chainable<void>;
      fillInstructionStudentContent(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureInstructionStudentDeepSetup', (options = {}) => {
  const through = options.through || 'content';
  const skipPageNav = options.skipPageNav ?? false;
  const url = LAUNCH_URL();
  if (!url) throw new Error('AUTHORING_LAUNCH_URL is not configured');

  cy.document().then((doc) => {
    const hasEditor = Boolean(doc.querySelector('#desktop_view') && doc.querySelector('button.btn'));
    if (hasEditor) return;
    cy.openAuthoringTool(url);
  });

  if (!skipPageNav) {
    cy.openInstructionStudentPage();
  }

  if (through === 'page') return;

  cy.addElementToInstructionStudentPage();
  if (through === 'element') return;

  cy.fillInstructionStudentContent();
});

// Navigate to the fixed "Instructions for Students" TOC page. Reuses the
// framework's navigateToCanvasPage (which targets this exact page) so the
// [new-toc] page attributes are verified before any authoring.
Cypress.Commands.add('openInstructionStudentPage', () => {
  cy.navigateToCanvasPage();
  cy.get(IS_CANVAS.desktop, { timeout: 15000 }).should('exist');
  cy.captureLiveStep('instruction-student-page-open');
});

// Add a real element (Text/paragraph) to the instruction page. config.js marks
// `paragraph` as droppable on studentInstructions, so this exercises the page's
// editable/add-element capability using the existing cy.dropComponent primitive.
Cypress.Commands.add('addElementToInstructionStudentPage', () => {
  cy.openInstructionStudentPage();

  cy.get(IS_CANVAS.desktop).then(($desktop) => {
    const alreadyHasElement = $desktop.find('.sd-item').length > 0;
    if (alreadyHasElement) {
      cy.log('ℹ Instruction-student page already has an authored element');
      return;
    }
    cy.dropComponent(IS_ALLOWED_ELEMENTS.text.widgetName);
  });

  cy.get(IS_CANVAS.sdItem, { timeout: 20000 }).should('have.length.greaterThan', 0);
  cy.captureLiveStep('instruction-student-element-added');
});

Cypress.Commands.add('fillInstructionStudentContent', () => {
  cy.get(IS_CANVAS.sdItem, { timeout: 12000 }).should('have.length.greaterThan', 0);
  cy.get(IS_CANVAS.paragraphBody, { timeout: 12000 }).first().setContentEditableOn(IS_DATA.instruction);
  cy.captureLiveStep('instruction-student-content-entered');
});

export {};
