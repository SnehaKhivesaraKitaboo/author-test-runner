/// <reference types="cypress" />
// =============================================================================
// WL Multipart (Multipart Question / group-interactivity-template) commands.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponent,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// MODULE: WL is single-page (support/module-setup.ts). The Multipart shell is an
//   assessment widget (group-interactivity-template ∈ ASSESSMENT_DATA_TYPES) but
//   for the WL module resolveDropTarget(...) === 'canvas', so it is dropped onto
//   the Instructions-for-Students canvas (#desktop_view) via cy.dropComponent —
//   NOT into a Generic Step column. cy.dropComponent only permits this assessment
//   widget when module === 'wl'.
//
//   ⚠ Run WL specs with CYPRESS_AUTHORING_MODULE=wl so getAuthoringModule()==='wl'.
//
// FLAG-GATED: config.js sets "group-interactivity-template": true|false per
//   subject. When the active catalog does not offer the widget, dropWlMultipart-
//   IntoCanvas logs + returns gracefully (no hard failure); dependent tests then
//   short-circuit on the missing-widget guard.
// =============================================================================

import {
  WL_MULTIPART_CANVAS,
  WL_MULTIPART_DATA_TYPE,
  WL_MULTIPART_SETTINGS,
  WL_MULTIPART_WIDGET_NAME,
} from './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureWlMultipartDeepSetup(options?: {
        through?: 'canvas' | 'dropped';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropWlMultipartIntoCanvas(): Chainable<void>;
      addWlMultipartPart(): Chainable<void>;
      openWlMultipartSettings(): Chainable<void>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

/** True when the dropped Multipart shell exists on the canvas. */
function multipartPresent($body: JQuery<HTMLElement>): boolean {
  return $body.find(WL_MULTIPART_CANVAS.container).length > 0;
}

Cypress.Commands.add('ensureWlMultipartDeepSetup', (options = {}) => {
  const through = options.through || 'dropped';
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

  cy.dropWlMultipartIntoCanvas();
});

Cypress.Commands.add('dropWlMultipartIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.get('#desktop_view').then(($desktop) => {
    if ($desktop.find(WL_MULTIPART_CANVAS.container).length > 0) {
      cy.log('ℹ WL Multipart already present on canvas');
      return;
    }

    // FLAG-GATED: the catalog may not offer group-interactivity-template for the
    // active subject. Probe the live widget registry before attempting the drop.
    cy.window().then((win) => {
      const ctrlEl = win.document.getElementById('myController');
      const ang = (win as any).angular;
      const scope = ctrlEl && ang ? ang.element(ctrlEl).scope() : null;
      const groups: any[] = scope && Array.isArray(scope.widgets) ? scope.widgets : [];
      const flat: any[] = groups.flatMap((g: any) => (Array.isArray(g?.widget) ? g.widget : []));
      const offered = flat.some(
        (w: any) => w?.dataType === WL_MULTIPART_DATA_TYPE || w?.name === WL_MULTIPART_WIDGET_NAME,
      );
      if (!offered) {
        cy.log(
          'ℹ WL Multipart (group-interactivity-template) is NOT offered by the active subject catalog ' +
            '(flag-gated false) — skipping drop. Dependent tests will short-circuit.',
        );
        return;
      }
      // Drop by dataType (matches in dropComponent by name OR dataType).
      cy.dropComponent(WL_MULTIPART_DATA_TYPE);
    });
  });

  cy.captureLiveStep('widget-dropped-wl-multipart');
});

// The directive auto-pushes a fresh empty part after each successful widget drop
// into a part (onDropComplete/onPasteDropComplete). There is no dedicated
// "add part" button in the source DOM — a new empty ".question-container" slot
// appears once a part receives a widget. This command surfaces the current empty
// slot for interaction and documents that mechanism rather than inventing a
// non-existent control.
Cypress.Commands.add('addWlMultipartPart', () => {
  cy.get('body').then(($body) => {
    if (!multipartPresent($body)) {
      cy.log('ℹ WL Multipart not present (flag-gated / not offered) — cannot surface a part');
      return;
    }
    cy.log(
      'ℹ WL Multipart parts grow automatically: the [group-interactivity] directive pushes a new ' +
        'empty part (questionBank, cap 35) after a widget is dropped into a slot. No standalone ' +
        '"add part" button exists in the source DOM (see WL-MULTIPART-DEEP-AUTOMATION.md).',
    );
    cy.get(WL_MULTIPART_CANVAS.questionContainer).should('have.length.greaterThan', 0);
  });
});

Cypress.Commands.add('openWlMultipartSettings', () => {
  cy.get('body').then(($body) => {
    if (!multipartPresent($body)) {
      cy.log('ℹ WL Multipart not present (flag-gated / not offered) — cannot open settings');
      return;
    }
    cy.get(`#desktop_view .sd-item ${WL_MULTIPART_CANVAS.container}, #desktop_view ${WL_MULTIPART_CANVAS.container}`, {
      timeout: 12000,
    })
      .first()
      .click({ force: true });
    cy.get(WL_MULTIPART_SETTINGS.panel, { timeout: 15000 }).should('be.visible');
    cy.captureLiveStep('wl-multipart-settings-panel-open');
  });
});

export {};
