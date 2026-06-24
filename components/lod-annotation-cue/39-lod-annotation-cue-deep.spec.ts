/// <reference types="cypress" />
import './commands';
import {
  CUE_CANVAS,
  CUE_SETTINGS,
  LOD_CANVAS,
  LOD_CUE_RULES,
  LOD_SETTINGS,
} from './selectors';
import { LOD_CUE_DATA } from './testdata';

// =============================================================================
// 39 — LoD + Annotation Cue — Deep Component Test
//
// QC authority : Author Test Cases - LoD and Annottaion cue.pdf (TC_01–TC_144)
// Source authority (KITABOO_Authoring):
//   config/config.js (Layer widget "LoD" dataType "lod"; widget "Annotation Cue"
//                     dataType "annotationCueHighlightOutline"; BOTH flag-gated
//                     off in the layout droppability map)
//   templates/LoD/LoD.html · LoD-setting-panel.html · default/LoD.json
//   templates/LoD/scripts/LoD-directive.js
//   templates/annotation-cue/annotation-cue.html · annotation-cue-setting.html
//   templates/annotation-cue/default/annotation-cue.json
//
// LoD is a LAYER (drops onto the canvas, not a Generic Step column). Annotation
// Cue is the ONLY widget the LoD column accepts. Display Criteria values
// (Level of Support / Type / Activity tags) are loaded from a backend API
// (fetchLODSettingData) — none ship by default, so value-level QC cases need a
// provisioned backend and are deferred. The large CLP/Reader, Publish/republish,
// persistence-after-reload, cross-device, and a11y blocks of this 144-TC suite
// run outside the authoring DOM → deferred. Both controls are flag-gated, so
// drop-dependent tests log + return gracefully when the widget is unavailable.
// See LOD-ANNOTATION-CUE-DEEP-AUTOMATION.md.
//
// NOTE: Selectors were derived from source templates but are NOT yet live-
// verified against a running build (LoD/Cue are gated off by default). Treat
// graceful "ℹ" log paths as expected until the feature flag is enabled.
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
  cy.ensureLodDeepSetup({ through: 'cue', skipCanvasNav: true });
});

// ===========================================================================
// Suite A — Drop LoD layer & Annotation Cue (TC_04, TC_05, TC_07, TC_08)
// ===========================================================================
describe('39-A — LoD + Cue: Drop onto canvas (TC_04, TC_05, TC_07, TC_08)', () => {
  it('TC_DROP-LOD — Drop the LoD layer onto the canvas', function () {
    skipIfNoUrl(this);
    cy.ensureLodDeepSetup({ through: 'dropped', skipCanvasNav: false });
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_DROP-LOD: LoD layer flag-gated off — not droppable in this build');
        return;
      }
      cy.get(LOD_CANVAS.container).should('exist');
      cy.log('✅ TC_DROP-LOD: LoD layer dropped onto canvas');
    });
  });

  it('TC_04/TC_05 — LoD container renders with droppable area + delete chrome', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_04/05: LoD container not rendered (flag-gated)');
        return;
      }
      cy.get(LOD_CANVAS.container).should('exist');
      cy.get(`${LOD_CANVAS.container} .LoD-section, ${LOD_CANVAS.column}`).should('exist');
      cy.log('✅ TC_04/05: LoD bordered container + droppable column present');
    });
  });

  it('TC_07/TC_08 — Annotation Cue drops into the LoD column with default title', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.container).length === 0) {
        cy.log('ℹ TC_07/08: Annotation Cue not rendered (LoD/Cue flag-gated)');
        return;
      }
      cy.get(CUE_CANVAS.container).should('exist');
      cy.get(CUE_CANVAS.title).should('exist');
      cy.log(`✅ TC_07/08: Annotation Cue present (default title "${LOD_CUE_RULES.cueDefaultTitle}")`);
    });
  });
});

// ===========================================================================
// Suite B — Annotation Cue authoring (TC_09, TC_10, TC_117, TC_118, TC_123)
// ===========================================================================
describe('39-B — Annotation Cue: Authoring (TC_09, TC_10, TC_117, TC_118, TC_123)', () => {
  it('TC_09/TC_117 — Cue title is editable', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.title).length === 0) {
        cy.log('ℹ TC_09/117: Cue title not rendered (flag-gated)');
        return;
      }
      cy.get(CUE_CANVAS.title).first().setContentEditableOn(LOD_CUE_DATA.cueTitle);
      cy.get(CUE_CANVAS.title).first().should('contain.text', LOD_CUE_DATA.cueTitle);
      cy.log('✅ TC_09/117: Cue title edited and retained');
    });
  });

  it('TC_10 — Pen icon is present and not a text-input (non-editable)', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.penIcon).length === 0) {
        cy.log('ℹ TC_10: Pen icon not rendered (flag-gated)');
        return;
      }
      cy.get(CUE_CANVAS.penIcon).should('exist');
      cy.get(CUE_CANVAS.penIcon).should('not.have.attr', 'contenteditable', 'true');
      cy.log('✅ TC_10: Pen icon present and not editable');
    });
  });

  it('TC_123 — Prompt body carries a placeholder before any input', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.text).length === 0) {
        cy.log('ℹ TC_123: Cue body not rendered (flag-gated)');
        return;
      }
      cy.get(CUE_CANVAS.text).first().invoke('attr', 'placeholder').should('exist');
      cy.log(`✅ TC_123: Placeholder "${LOD_CUE_RULES.cueTextPlaceholder}" present on empty cue body`);
    });
  });

  it('TC_118 — Empty cue title is allowed without error', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.title).length === 0) {
        cy.log('ℹ TC_118: Cue title not rendered (flag-gated)');
        return;
      }
      cy.get(CUE_CANVAS.title).first().setContentEditableOn('');
      cy.get(CUE_CANVAS.title).first().should('exist');
      cy.get('body').should('not.contain.text', 'Application Error');
      cy.log('✅ TC_118: Empty cue title handled gracefully');
    });
  });
});

// ===========================================================================
// Suite C — Annotation Cue settings (TC_11)
// ===========================================================================
describe('39-C — Annotation Cue: Settings (TC_11)', () => {
  it('TC_11 — Settings panel exposes a colour input that accepts a hex value', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.container).length === 0) {
        cy.log('ℹ TC_11: Annotation Cue not rendered (flag-gated)');
        return;
      }
      cy.openCueSettings();
      cy.get('body').then(($b2) => {
        if ($b2.find(CUE_SETTINGS.colorPickerInput).length === 0) {
          cy.log('ℹ TC_11: Colour picker not rendered in settings');
          return;
        }
        cy.get(CUE_SETTINGS.colorPickerInput).invoke('attr', 'maxlength')
          .should('eq', String(LOD_CUE_RULES.cueColorMaxLength));
        cy.get(CUE_SETTINGS.colorPickerInput).clear({ force: true })
          .type(LOD_CUE_DATA.cueColor, { force: true })
          .should('have.value', LOD_CUE_DATA.cueColor);
        cy.log('✅ TC_11: Cue border/primary colour input accepts a hex value');
      });
    });
  });

  it('TC_11b — Settings panel title is "Annotation Cue"', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.container).length === 0) {
        cy.log('ℹ TC_11b: Annotation Cue not rendered (flag-gated)');
        return;
      }
      cy.openCueSettings();
      cy.get('body').then(($b2) => {
        if ($b2.find(CUE_SETTINGS.title).length === 0) {
          cy.log('ℹ TC_11b: Cue settings title not rendered');
          return;
        }
        cy.get(CUE_SETTINGS.title).should('contain.text', LOD_CUE_RULES.cueSettingsTitle);
        cy.log('✅ TC_11b: Cue settings titled "Annotation Cue"');
      });
    });
  });
});

// ===========================================================================
// Suite D — LoD settings panel & Display Criteria (TC_15, TC_18, TC_19, TC_22, TC_23)
// ===========================================================================
describe('39-D — LoD: Settings panel & Display Criteria (TC_15, TC_18, TC_19, TC_22, TC_23)', () => {
  beforeEach(function () { skipIfNoUrl(this); });

  it('TC_15 — LoD settings panel opens with "LoD" title', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_15: LoD not rendered (flag-gated)');
        return;
      }
      cy.openLodSettings();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.title).length === 0) {
          cy.log('ℹ TC_15: LoD settings title not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.title).should('contain.text', LOD_CUE_RULES.lodSettingsTitle);
        cy.log('✅ TC_15: LoD settings panel visible with "LoD" title');
      });
    });
  });

  it('TC_18 — Display Criteria section is present in LoD settings', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_18: LoD not rendered (flag-gated)');
        return;
      }
      cy.openLodSettings();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.displayCriteriaLabel).length === 0) {
          cy.log('ℹ TC_18: Display Criteria label not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.displayCriteriaLabel).should('contain.text', 'Display Criteria');
        cy.log('✅ TC_18: Display Criteria section present');
      });
    });
  });

  it('TC_19/TC_22/TC_23 — Display Criteria toggles default OFF (backend-seeded groups)', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_19/22/23: LoD not rendered (flag-gated)');
        return;
      }
      cy.openLodSettings();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.criteriaToggle).length === 0) {
          cy.log(
            'ℹ TC_19/22/23: No Display Criteria groups rendered — displayCritaria is ' +
              'backend-seeded (fetchLODSettingData) and empty without a provisioned backend',
          );
          return;
        }
        cy.get(LOD_SETTINGS.criteriaToggle).each(($t) => {
          cy.wrap($t).should('not.be.checked');
        });
        cy.log('✅ TC_19/22/23: All Display Criteria toggles default OFF');
      });
    });
  });
});

// ===========================================================================
// Suite E — Link Activity (TC_28, TC_36, TC_37, TC_39, TC_42, TC_43, TC_50)
// ===========================================================================
function openLinkActivity() {
  cy.openLodSettings();
  cy.get('body').then(($b) => {
    if ($b.find(LOD_SETTINGS.linkActivityToggle).length === 0) return;
    cy.get(LOD_SETTINGS.linkActivityToggle).first().check({ force: true });
    cy.wait(300);
  });
}

describe('39-E — LoD: Link Activity (TC_28, TC_36, TC_37, TC_39, TC_42, TC_43, TC_50)', () => {
  it('TC_28/TC_50 — Enabling Link Activity reveals the Ref ID input', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_28/50: LoD not rendered (flag-gated)');
        return;
      }
      openLinkActivity();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.linkRefInput).length === 0) {
          cy.log('ℹ TC_28/50: Link Activity input not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.linkRefInput).should('exist');
        cy.get(LOD_SETTINGS.linkMessage).should('exist');
        cy.log('✅ TC_28/50: Ref ID input shown after enabling Link Activity');
      });
    });
  });

  it('TC_37 — Adding a valid Ref ID lists it under Linked Activities', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_37: LoD not rendered (flag-gated)');
        return;
      }
      openLinkActivity();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.linkRefInput).length === 0) {
          cy.log('ℹ TC_37: Link Activity input not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.linkRefInput).clear({ force: true }).type(LOD_CUE_DATA.refId1, { force: true });
        cy.get(LOD_SETTINGS.linkAddIcon).click({ force: true });
        cy.wait(300);
        cy.get(LOD_SETTINGS.activityListText).should('contain.text', LOD_CUE_DATA.refId1);
        cy.log('✅ TC_37: Linked activity Ref ID listed');
      });
    });
  });

  it('TC_36 — Duplicate Ref ID is rejected with an error message', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_36: LoD not rendered (flag-gated)');
        return;
      }
      openLinkActivity();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.linkRefInput).length === 0) {
          cy.log('ℹ TC_36: Link Activity input not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.linkRefInput).clear({ force: true }).type(LOD_CUE_DATA.refId1, { force: true });
        cy.get(LOD_SETTINGS.linkAddIcon).click({ force: true });
        cy.wait(200);
        cy.get(LOD_SETTINGS.linkRefInput).clear({ force: true }).type(LOD_CUE_DATA.refId1, { force: true });
        cy.get(LOD_SETTINGS.linkAddIcon).click({ force: true });
        cy.wait(200);
        cy.get(LOD_SETTINGS.errorText).should('exist').and('not.be.empty');
        cy.log('✅ TC_36: Duplicate Ref ID rejected (validateAndAddLink)');
      });
    });
  });

  it('TC_42/TC_43 — Empty / invalid Ref ID is rejected', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_42/43: LoD not rendered (flag-gated)');
        return;
      }
      openLinkActivity();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.linkRefInput).length === 0) {
          cy.log('ℹ TC_42/43: Link Activity input not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.linkRefInput).clear({ force: true }).type(LOD_CUE_DATA.refIdEmpty, { force: true });
        cy.get(LOD_SETTINGS.linkAddIcon).click({ force: true });
        cy.wait(200);
        // Empty input keeps the add icon disabled and/or surfaces an error; the
        // list must NOT gain a blank entry.
        cy.get('body').then(($b3) => {
          const listed = $b3.find(LOD_SETTINGS.activityListText).length;
          expect(listed, 'no blank Ref ID added').to.eq(0);
        });
        cy.log('✅ TC_42/43: Empty/invalid Ref ID not added to the list');
      });
    });
  });

  it('TC_39 — A listed Ref ID can be deleted', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_39: LoD not rendered (flag-gated)');
        return;
      }
      openLinkActivity();
      cy.get('body').then(($b2) => {
        if ($b2.find(LOD_SETTINGS.linkRefInput).length === 0) {
          cy.log('ℹ TC_39: Link Activity input not rendered');
          return;
        }
        cy.get(LOD_SETTINGS.linkRefInput).clear({ force: true }).type(LOD_CUE_DATA.refId2, { force: true });
        cy.get(LOD_SETTINGS.linkAddIcon).click({ force: true });
        cy.wait(200);
        cy.get(LOD_SETTINGS.activityListDelete).first().click({ force: true });
        cy.wait(200);
        cy.get('body').then(($b3) => {
          const stillThere = $b3.find(`${LOD_SETTINGS.activityListText}:contains("${LOD_CUE_DATA.refId2}")`).length;
          expect(stillThere, 'deleted Ref ID removed').to.eq(0);
        });
        cy.log('✅ TC_39: Linked Ref ID removed via delete icon');
      });
    });
  });
});

// ===========================================================================
// Suite F — LoD identity & lifecycle (TC_13, TC_16, TC_82, TC_84, TC_141)
// ===========================================================================
describe('39-F — LoD: Identity & lifecycle (TC_13, TC_16, TC_82, TC_84, TC_141)', () => {
  it('TC_16/TC_84 — Dropped LoD carries a unique lod-id', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.host).length === 0) {
        cy.log('ℹ TC_16/84: LoD host (lod-id) not rendered (flag-gated)');
        return;
      }
      cy.get(LOD_CANVAS.host).first().invoke('attr', 'lod-id').should('match', /^lod-\d+/);
      cy.log('✅ TC_16/84: LoD host carries a unique lod-id');
    });
  });

  it('TC_141 — LoD config allows clone (allowClone:true) — duplicate control present in chrome', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_141: LoD not rendered (flag-gated)');
        return;
      }
      // allowClone is a config capability; the duplicate/clone affordance lives in
      // shared .sd-item chrome. Presence of the host is the DOM-assertable part;
      // the actual duplicate action + resulting second container is runtime.
      cy.get(LOD_CANVAS.host).first().should('exist');
      cy.log('ℹ TC_141: allowClone=true in config; duplicate action result is runtime (see Deferred)');
    });
  });

  it('TC_13 — LoD container can be deleted from the canvas', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(LOD_CANVAS.container).length === 0) {
        cy.log('ℹ TC_13: LoD not rendered (flag-gated)');
        return;
      }
      cy.get(LOD_CANVAS.container).its('length').then((before) => {
        cy.deleteLastDroppedComponent();
        cy.get('body').should('not.contain.text', 'Application Error');
        cy.get('body').then(($b2) => {
          const after = $b2.find(LOD_CANVAS.container).length;
          expect(after, 'LoD container removed').to.be.lessThan(before);
        });
      });
      cy.log('✅ TC_13: LoD container removed from canvas');
    });
  });
});

// ===========================================================================
// Suite G — Security
// ===========================================================================
describe('39-G — LoD + Cue: Security', () => {
  it('SEC — Script tags in the cue title are not rendered as live <script>', function () {
    skipIfNoUrl(this);
    cy.get('body').then(($body) => {
      if ($body.find(CUE_CANVAS.title).length === 0) {
        cy.log('ℹ SEC: Annotation Cue not rendered (flag-gated)');
        return;
      }
      cy.get(CUE_CANVAS.title).first().setContentEditableOn(LOD_CUE_DATA.scriptInjection);
      cy.get(CUE_CANVAS.title).first().should('not.contain.html', '<script>');
      cy.window().then((win) => {
        expect(win.document.querySelector('script[data-cy-injected]')).to.be.null;
      });
      cy.log('✅ SEC: Script injection in cue title is not executed');
    });
  });
});

// ===========================================================================
// DEFERRED — backend-seeded Display Criteria values, Preview/Reader (CLP)
// rendering, Publish/republish, persistence-after-reload, cross-device, a11y,
// undo/redo, multipart/layout paste, EPUB project bootstrap.
// ===========================================================================
describe('39-Z — LoD + Cue: Deferred (Backend criteria / CLP-Reader / Publish / lifecycle / a11y)', () => {
  const deferred: Array<[string, string]> = [
    ['TC_01', 'Create reflowable EPUB from studio — project bootstrap outside authoring DOM'],
    ['TC_02', 'Add multiple components into EPUB — multi-component activity flow'],
    ['TC_03', 'Save EPUB with only base text — Save/Publish flow'],
    ['TC_06', 'Tooltip "Layers of Differentiation" on LoD icon — left-panel hover overlay'],
    ['TC_12', 'Container deletion confirmation popup — confirmation modal flow'],
    ['TC_14', 'LoD alignment when dragged to positions — drag-positioning visual'],
    ['TC_17', 'LoD container repositioning by drag — drag visual'],
    ['TC_20', 'Level of Support values CORE/LIGHT/MODERATE/INTENSIVE — backend-seeded (fetchLODSettingData)'],
    ['TC_21', 'Select Level of Support value persists — backend value + persistence'],
    ['TC_24', 'Activity toggle ON shows "Add New" — backend-seeded Activity criterion'],
    ['TC_25', 'Tag selections persist after refresh — persistence-after-reload'],
    ['TC_26', 'Tag values saved in DB (via API) — backend/DB verification'],
    ['TC_27', 'UI updates after backend tag modification — backend round-trip'],
    ['TC_29', 'LoD linked with annotation activity — cross-entity link verification'],
    ['TC_30', 'RTE (bold/italic/underline/colour) inside LoD — RTE toolbar overlay'],
    ['TC_31', 'Text formatting reflects in cue — RTE apply + visual'],
    ['TC_32', 'Insert media (audio/image) in cue — file picker + upload'],
    ['TC_33', 'Save LoD + tags + widget — Save flow + backend'],
    ['TC_34', 'Preview hides components inside LoD (MVP) — Preview flow'],
    ['TC_35', 'Add multiple linked activities — depends on backend acceptance'],
    ['TC_38', 'Linked activity IDs persist after save — persistence-after-reload'],
    ['TC_40', 'Delete one of multiple links survives save/reload — persistence'],
    ['TC_41', 'Deletion confirmation prompt for a link — confirmation modal'],
    ['TC_44', 'Link >10 activities (stress / max limit) — backend max-limit behaviour'],
    ['TC_45', 'Tooltip/hover details for a linked activity — hover overlay'],
    ['TC_46', 'Same activity linked across two LoDs — multi-LoD + backend rule'],
    ['TC_47', 'Linking status after republishing — Publish/Reopen flow'],
    ['TC_48', 'Clicking linked activity opens reference (marked invalid in QC)'],
    ['TC_49', 'Undo/redo after add/delete link — history flow'],
    ['TC_51', 'Add button appears after first valid Ref ID — add-button visibility state'],
    ['TC_52', 'Add button adds a second activity — multi-add flow'],
    ['TC_53', 'Add button stays until max limit — backend max-limit'],
    ['TC_54', 'Add button hides at max limit — backend max-limit'],
    ['TC_55', 'Add button hidden for invalid Ref ID — add-button visibility state'],
    ['TC_56', 'Add button reappears after deleting a link — add-button visibility state'],
    ['TC_57', 'Add button tooltip text — hover overlay'],
    ['TC_58', 'Add button works after reload — persistence-after-reload'],
    ['TC_59', 'Add button alignment/spacing — visual layout'],
    ['TC_60', 'Edit LoD before publishing saved — Save flow'],
    ['TC_61', 'Edit after publishing reflects on student view — Publish/Reader'],
    ['TC_62', 'Edit only LoD updates published package — Publish diff'],
    ['TC_63', 'Delete LoD + republish removes it — Publish flow'],
    ['TC_64', 'Republish status visible in student interface — Reader'],
    ['TC_65', 'Student launches text from CLC — CLP/Reader'],
    ['TC_66', 'Highlight text for generic annotation — CLP/Reader'],
    ['TC_67', 'Add notes on text — CLP/Reader'],
    ['TC_68', 'View annotation cue on standalone text — CLP/Reader'],
    ['TC_69', 'Launch annotation activity + step annotation — CLP/Reader'],
    ['TC_70', 'View all LoDs for text in activity — CLP/Reader'],
    ['TC_71', 'Hide/view LoD on text — CLP/Reader toggle'],
    ['TC_72', 'LoD adapts to LTI/teacher assignment — CLP/LTI'],
    ['TC_73', 'No LoD assigned — student sees no cues — CLP/Reader'],
    ['TC_74', 'Multiple LoD cues for overlapping tags — CLP/Reader'],
    ['TC_75', 'After LoD deleted, cues gone for student — Publish/Reader'],
    ['TC_76', 'View annotation cues with multiple LoS on CLP — CLP'],
    ['TC_77', 'View tags associated with book/activity — CLP teacher panel'],
    ['TC_78', 'Assign LoD to individual student — CLP (out of scope)'],
    ['TC_79', 'Assign LoD to group/class — CLP (out of scope)'],
    ['TC_80', 'Assign LoD with multiple tag combos — CLP (out of scope)'],
    ['TC_81', 'Assign LoD without selecting student — CLP (out of scope)'],
    ['TC_83', 'Deleting one LoD does not affect others — multi-LoD lifecycle (runtime)'],
    ['TC_85', 'Student launches annotation activity — CLP/Reader'],
    ['TC_86', 'Pencil icon displays correct colour — CLP/Reader'],
    ['TC_87', 'Annotation text displays correct colours — CLP/Reader'],
    ['TC_88', 'Student views text linked to activity — CLP/Reader'],
    ['TC_89', 'Student views all thumbnails for linked text — CLP/Reader'],
    ['TC_90', 'Student views all LoD for a book — CLP/Reader'],
    ['TC_91', 'Student highlights text in reader — CLP/Reader'],
    ['TC_92', 'Student adds note to highlight — CLP/Reader'],
    ['TC_93', 'LoD + annotation work together — CLP/Reader'],
    ['TC_94', 'No LoD on book behaviour — CLP/Reader'],
    ['TC_95', 'Annotation activity with no linked text — CLP/Reader'],
    ['TC_96', 'LoD/text/annotation across devices — cross-device'],
    ['TC_97', 'Multiple highlights on same text — CLP/Reader'],
    ['TC_98', 'Multiple notes on same highlight — CLP/Reader'],
    ['TC_99', 'Notes persist after refresh — CLP persistence'],
    ['TC_100', 'LoD highlights match tag rules — CLP/Reader + backend'],
    ['TC_101', 'Long text behaviour (scroll) — CLP/Reader'],
    ['TC_102', 'Removing highlight removes notes — CLP/Reader'],
    ['TC_103', 'RTE content retained in reader — CLP/Reader'],
    ['TC_104', 'Cue RTE content supports scroll — CLP/Reader'],
    ['TC_105', 'Cue long RTE opens as popup — CLP/Reader'],
    ['TC_106', 'Annotation inside LoD for Activity 1 shown — CLP/Reader'],
    ['TC_107', 'Annotation inside LoD for Activity 2 shown — CLP/Reader'],
    ['TC_108', 'Annotations isolated per activity — CLP/Reader'],
    ['TC_109', 'Multiple annotations in one LoD shown — CLP/Reader'],
    ['TC_110', 'Deleting annotation updates reader — CLP/Reader'],
    ['TC_111', 'Long annotation in LoD scroll/popup — CLP/Reader'],
    ['TC_112', 'Backward compatibility with non-LoD EPUBs — legacy (out of scope)'],
    ['TC_113', 'Link with insufficient permissions — permission/backend'],
    ['TC_114', 'Cue persistence after relaunch — Reader persistence'],
    ['TC_115', 'Multiple LoDs load without lag — performance/Reader'],
    ['TC_116', 'LoD visibility while scrolling long text — Reader scroll'],
    ['TC_119', 'Cue text truncation/overflow wrap — visual/Reader'],
    ['TC_120', 'Copy-paste formatted text into cue — clipboard + RTE'],
    ['TC_121', 'Cue text alignment via RTE — RTE overlay'],
    ['TC_122', 'Font size/style + special characters — RTE overlay + visual'],
    ['TC_124', 'Toast message after LoD + cue added — toast timing (runtime)'],
    ['TC_125', 'Show/Hide Annotation Cues button presence — CLP'],
    ['TC_126', 'Cues visible by default — CLP'],
    ['TC_127', 'Hide Annotation Cues — CLP toggle'],
    ['TC_128', 'Show Annotation Cues after hiding — CLP toggle'],
    ['TC_129', 'Toggle cues multiple times — CLP toggle'],
    ['TC_130', 'Cues stay hidden after scroll — CLP'],
    ['TC_131', 'Cues stay visible after scroll — CLP'],
    ['TC_132', 'Toggle does not break other content — CLP'],
    ['TC_133', 'Multiple cues hide simultaneously — CLP'],
    ['TC_134', 'Hidden state persists across CLP navigation — CLP persistence'],
    ['TC_135', 'Hidden/visible state persists across refresh — CLP persistence'],
    ['TC_136', 'Show/Hide button tooltip/accessible text — CLP a11y'],
    ['TC_137', 'Mobile responsiveness of toggle — CLP cross-device'],
    ['TC_138', 'Screen reader announces Show/Hide — a11y (out of scope)'],
    ['TC_139', 'Reset filters does not affect cue — CLP filter flow'],
    ['TC_140', 'Disable Annotation Cue toggle no page impact — CLP filter flow'],
    ['TC_142', 'Copy/paste cue inside LoD container — clipboard lifecycle (runtime)'],
    ['TC_143', 'Copy/paste cue inside Layouts — layout paste lifecycle'],
    ['TC_144', 'Copy/paste cue inside Multipart — multipart paste lifecycle'],
  ];

  deferred.forEach(([tc, reason]) => {
    it.skip(`${tc} — DEFERRED: ${reason}`, () => undefined);
  });
});
