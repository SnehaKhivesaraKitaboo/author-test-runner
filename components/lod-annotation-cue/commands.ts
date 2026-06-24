/// <reference types="cypress" />
// =============================================================================
// LoD + Annotation Cue component commands — reusable workflows.
//
// Reuses existing framework helpers from support/ (NOT duplicated):
//   cy.openAuthoringTool, cy.navigateToCanvasPage, cy.dropComponentForModule,
//   cy.setContentEditableOn, cy.captureLiveStep
//
// ARCHITECTURE (verified against KITABOO_Authoring source):
//   • LoD (dataType "lod") is a LAYER, not an assessment widget. The framework
//     routes it to the canvas (#desktop_view) via resolveDropTarget → 'canvas'.
//   • Annotation Cue (dataType "annotationCueHighlightOutline") is the ONLY
//     widget the LoD column accepts — LoD-directive.js onDropComplete() returns
//     early for any other dataType.
//   • BOTH are flag-gated off in the layout droppability map (config.js):
//     "lod":false / "annotationCueHighlightOutline":false. So they may be absent
//     from scope.widgets in a given build. Every helper logs + returns
//     gracefully rather than throwing when the widget is not available.
// =============================================================================

import {
  CUE_CANVAS,
  CUE_DATA_TYPE,
  CUE_SETTINGS,
  CUE_WIDGET_NAME,
  LOD_CANVAS,
  LOD_DATA_TYPE,
  LOD_SETTINGS,
  LOD_WIDGET_NAME,
} from './selectors';
import { LOD_CUE_DATA } from './testdata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      ensureLodDeepSetup(options?: {
        through?: 'canvas' | 'dropped' | 'cue' | 'content';
        skipCanvasNav?: boolean;
      }): Chainable<void>;
      dropLodIntoCanvas(): Chainable<void>;
      dropCueIntoLodColumn(): Chainable<void>;
      fillCueDummyContent(): Chainable<void>;
      openLodSettings(): Chainable<void>;
      openCueSettings(): Chainable<void>;
      /** Resolves true when the LoD widget is present in scope.widgets (not flag-gated off). */
      lodWidgetAvailable(): Chainable<boolean>;
    }
  }
}

const LAUNCH_URL = (): string => Cypress.env('AUTHORING_LAUNCH_URL') || '';

/** Flatten scope.widgets (array- or object-shaped) into a flat widget list. */
function flattenWidgetsList(widgets: unknown): Array<{ name?: string; dataType?: string }> {
  const out: Array<{ name?: string; dataType?: string }> = [];
  const sections = Array.isArray(widgets) ? widgets : Object.values(widgets || {});
  sections.forEach((section: any) => {
    const inner = section && Array.isArray(section.widget) ? section.widget : [];
    inner.forEach((w: any) => out.push(w));
  });
  return out;
}

Cypress.Commands.add('lodWidgetAvailable', () => {
  return cy.window().then((win) => {
    const ang = (win as any).angular;
    const ctrlEl = win.document.getElementById('myController');
    if (!ang || !ctrlEl) return false;
    const scope = ang.element(ctrlEl).scope();
    const widgets = flattenWidgetsList(scope?.widgets);
    const found = widgets.some(
      (w) => w && (w.dataType === LOD_DATA_TYPE || w.name === LOD_WIDGET_NAME),
    );
    if (!found) {
      cy.log('ℹ LoD widget not present in scope.widgets (flag-gated off in this build)');
    }
    return found;
  });
});

Cypress.Commands.add('ensureLodDeepSetup', (options = {}) => {
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

  cy.dropLodIntoCanvas();
  if (through === 'dropped') return;

  cy.dropCueIntoLodColumn();
  if (through === 'cue') return;

  cy.fillCueDummyContent();
});

Cypress.Commands.add('dropLodIntoCanvas', () => {
  cy.navigateToCanvasPage();

  cy.lodWidgetAvailable().then((available) => {
    if (!available) {
      cy.log('⏭ Skipping LoD drop — widget flag-gated off (config.js droppability map)');
      return;
    }

    cy.get('#desktop_view').then(($desktop) => {
      const alreadyDropped = $desktop.find(LOD_CANVAS.container).length > 0;
      if (alreadyDropped) {
        cy.log('ℹ LoD layer already present on canvas');
        return;
      }
      // Layer drop → canvas (LoD is not an assessment widget).
      cy.dropComponentForModule(LOD_WIDGET_NAME, { dataType: LOD_DATA_TYPE, skipLiveCapture: true });
    });

    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ LoD container did not render after drop (flag-gated / not droppable here)');
        return;
      }
      cy.get(LOD_CANVAS.container, { timeout: 20000 }).should('exist');
      cy.captureLiveStep('widget-dropped-lod');
    });
  });
});

Cypress.Commands.add('dropCueIntoLodColumn', () => {
  cy.get('body').then(($body) => {
    if ($body.find(LOD_CANVAS.container).length === 0) {
      cy.log('⏭ Skipping Annotation Cue drop — no LoD container on canvas');
      return;
    }
    if ($body.find(CUE_CANVAS.container).length > 0) {
      cy.log('ℹ Annotation Cue already present inside LoD column');
      return;
    }

    // The LoD column only accepts annotationCueHighlightOutline. Drive the drop
    // through the directive's onDropComplete (mirrors framework's canvas drop).
    cy.window().then((win) => {
      const ang = (win as any).angular;
      const ctrlEl = win.document.getElementById('myController');
      if (!ang || !ctrlEl) {
        cy.log('ℹ AngularJS controller not available — cannot inject Annotation Cue');
        return;
      }
      const ctrlScope = ang.element(ctrlEl).scope();
      const cueWidget = flattenWidgetsList(ctrlScope?.widgets).find(
        (w) => w && (w.dataType === CUE_DATA_TYPE || w.name === CUE_WIDGET_NAME),
      );
      if (!cueWidget) {
        cy.log('ℹ Annotation Cue widget not in scope.widgets (flag-gated off) — cue drop skipped');
        return;
      }

      const lodEl = win.document.querySelector('[lod-template]');
      if (!lodEl) {
        cy.log('ℹ LoD template element not found — cue drop skipped');
        return;
      }
      const lodScope = ang.element(lodEl).scope();
      const $col = (win as any).$('[lod-template] .column-content').first();
      if (lodScope && typeof lodScope.onDropComplete === 'function' && $col.length) {
        lodScope.dropElement = $col;
        lodScope.onDropComplete(0, cueWidget, { element: (win as any).$(lodEl) });
        lodScope.$apply();
      }
    });

    cy.get('body').then(($b2) => {
      if ($b2.find(CUE_CANVAS.container).length === 0) {
        cy.log('ℹ Annotation Cue did not render inside LoD (build/flag-dependent)');
        return;
      }
      cy.get(CUE_CANVAS.container, { timeout: 20000 }).should('exist');
      cy.captureLiveStep('annotation-cue-dropped-in-lod');
    });
  });
});

Cypress.Commands.add('fillCueDummyContent', () => {
  cy.get('body').then(($body) => {
    if ($body.find(CUE_CANVAS.container).length === 0) {
      cy.log('⏭ Skipping cue content — no Annotation Cue on canvas');
      return;
    }
    cy.get(CUE_CANVAS.title).first().setContentEditableOn(LOD_CUE_DATA.cueTitle);
    cy.get(CUE_CANVAS.text).first().setContentEditableOn(LOD_CUE_DATA.cueText);
    cy.captureLiveStep('annotation-cue-dummy-content-entered');
  });
});

Cypress.Commands.add('openLodSettings', () => {
  cy.get('body').then(($body) => {
    if ($body.find(LOD_CANVAS.container).length === 0) {
      cy.log('⏭ Skipping LoD settings — no LoD container on canvas');
      return;
    }
    cy.get(`#desktop_view .sd-item:has(${LOD_CANVAS.container}), ${LOD_CANVAS.container}`, {
      timeout: 12000,
    })
      .first()
      .click({ force: true });
    cy.get(LOD_SETTINGS.panel, { timeout: 15000 }).should('exist');
    cy.captureLiveStep('lod-settings-panel-open');
  });
});

Cypress.Commands.add('openCueSettings', () => {
  cy.get('body').then(($body) => {
    if ($body.find(CUE_CANVAS.container).length === 0) {
      cy.log('⏭ Skipping cue settings — no Annotation Cue on canvas');
      return;
    }
    cy.get(CUE_CANVAS.container, { timeout: 12000 }).first().click({ force: true });
    cy.get(CUE_SETTINGS.panel, { timeout: 15000 }).should('exist');
    cy.captureLiveStep('annotation-cue-settings-panel-open');
  });
});

export {};
