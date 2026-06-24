/// <reference types="cypress" />
// =============================================================================
// Fill in the Blank (FIB) component commands.
//
// NOTE: FIB is the framework's reference assessment widget — its custom commands
// already live in support/commands.ts (globally loaded via support/index.ts) and
// are reused as-is here (NOT duplicated):
//
//   cy.ensureFibDeepSetup, cy.dropFibIntoGenericStepColumn,
//   cy.fillFibDummyContent, cy.openFibSettings, cy.insertFibBlank,
//   cy.waitForFibWidgetReady, cy.pasteFibIntoNextGenericStepSlot
//
// This module exists for structural parity with the other components/<slug>/
// suites; it intentionally adds NO new command implementations.
//
// It DOES re-declare the shared FIB command signatures via `declare global` so
// TypeScript resolves cy.<fibCommand>() in this component suite. (support/
// commands.ts declares them inside a non-global `declare namespace Cypress`,
// which only applies within that module — the component suites that use
// `declare global` are the ones picked up project-wide.)
// =============================================================================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      openAuthoringTool(url?: string): Chainable<void>;
      createTestStep(stepType?: string): Chainable<void>;
      ensureFibDeepSetup(options?: {
        through?: 'canvas' | 'step' | 'dropped' | 'content' | 'settings';
        skipStepCreation?: boolean;
      }): Chainable<void>;
      ensureOnFibGenericStep(): Chainable<void>;
      dropFibIntoGenericStepColumn(): Chainable<void>;
      fillFibDummyContent(): Chainable<void>;
      openFibSettings(): Chainable<void>;
      insertFibBlank(): Chainable<void>;
      pasteFibIntoNextGenericStepSlot(): Chainable<void>;
      waitForFibWidgetReady(timeout?: number): Chainable<void>;
      waitForGenericStepCanvasReady(timeout?: number): Chainable<void>;
      setContentEditableOn(text: string): Chainable<JQuery>;
    }
  }
}

/** Marker so this stays an ES module (enables the `declare global` merge). */
export const FIB_COMMANDS_REUSE_SUPPORT = true;
