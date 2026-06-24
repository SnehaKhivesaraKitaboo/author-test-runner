/// <reference types="cypress" />
// =============================================================================
// Instruction for Teacher component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.dropComponent, cy.setContentEditableOn,
//   cy.captureLiveStep
//
// IMPORTANT — Instructions for Teacher is a FIXED TOC page, not a widget:
//   It already exists in the Table of Contents (grouptoc.teacherInstructions,
//   pageType "teacherInstructions"). Unlike the Student page, the framework's
//   cy.navigateToCanvasPage() targets "Instructions for Students" first, so this
//   command navigates to the Teacher page explicitly by clicking the verified
//   "Instructions for Teacher" TOC entry (same click pattern as
//   navigateToCanvasPage), then authors content on #desktop_view. We never
//   "drop" the instruction page itself; we add elements (e.g. Text/paragraph)
//   TO it, which config.teacherInstructions permits.
// =============================================================================

import { IT_CANVAS, IT_TOC, IT_ALLOWED_ELEMENTS } from './selectors';
import { IT_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureInstructionTeacherDeepSetup(options?: {
        through?: 'page' | 'element' | 'content';
        skipPageNav?: boolean;
      }): Chainable<void>;
      openInstructionTeacherPage(): Chainable<void>;
      addElementToInstructionTeacherPage(): Chainable<void>;
      fillInstructionTeacherContent(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

Cypress.Commands.add('ensureInstructionTeacherDeepSetup', (options = {}) => {
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
    cy.openInstructionTeacherPage();
  }

  if (through === 'page') return;

  cy.addElementToInstructionTeacherPage();
  if (through === 'element') return;

  cy.fillInstructionTeacherContent();
});

// Navigate to the fixed "Instructions for Teacher" TOC page. Mirrors the click
// pattern used by support/commands.ts navigateToCanvasPage, but targets the
// Teacher entry explicitly and verifies the [new-toc] page attributes.
Cypress.Commands.add('openInstructionTeacherPage', () => {
  cy.contains(IT_TOC.entryText, { timeout: 15000 })
    .parents('.toc-container, [ng-click*="tocPageClick"], li')
    .first()
    .click({ force: true });

  cy.get(IT_CANVAS.desktop, { timeout: 15000 }).should('exist');
  cy.get(IT_CANVAS.newToc, { timeout: 10000 }).should('have.attr', 'pagesequence');
  cy.captureLiveStep('instruction-teacher-page-open');
});

// Add a real element (Text/paragraph) to the instruction page. config.js marks
// `paragraph` as droppable on teacherInstructions, so this exercises the page's
// editable/add-element capability using the existing cy.dropComponent primitive.
Cypress.Commands.add('addElementToInstructionTeacherPage', () => {
  cy.openInstructionTeacherPage();

  cy.get(IT_CANVAS.desktop).then(($desktop) => {
    const alreadyHasElement = $desktop.find('.sd-item').length > 0;
    if (alreadyHasElement) {
      cy.log('ℹ Instruction-teacher page already has an authored element');
      return;
    }
    cy.dropComponent(IT_ALLOWED_ELEMENTS.text.widgetName);
  });

  cy.get(IT_CANVAS.sdItem, { timeout: 20000 }).should('have.length.greaterThan', 0);
  cy.captureLiveStep('instruction-teacher-element-added');
});

Cypress.Commands.add('fillInstructionTeacherContent', () => {
  cy.get(IT_CANVAS.sdItem, { timeout: 12000 }).should('have.length.greaterThan', 0);
  cy.get(IT_CANVAS.paragraphBody, { timeout: 12000 }).first().setContentEditableOn(IT_DATA.instruction);
  cy.captureLiveStep('instruction-teacher-content-entered');
});

export {};
