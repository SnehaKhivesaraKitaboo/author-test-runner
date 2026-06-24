/// <reference types="cypress" />
// =============================================================================
// Copy and Paste (cross-component platform feature) — Verified selectors
//
// Source of truth (KITABOO_Authoring):
//   editor/ngcontroller.js
//     • $scope.componentCopy($event)      — copies the .sd-item under the cursor;
//       writes localStorage keys copiedComponent / targetDataType / copiedTemplates
//       / isDroppable; toast "The component has been copied successfully."
//     • $scope.componentDuplicate($event) — clones .sd-item in place; toast
//       "Component duplicated successfully."
//     • $scope.componentPaste(e, instance) — reads localStorage copiedComponent and
//       rebuilds the widget; instance==='layout' rejects non-droppable copies
//       (sets isDroppable=false and returns) — the invalid-target rule.
//     • findTag() (lines ~10030/5296) renders the component heading toolbar markup:
//         .sd-item > .template-main-heading >
//             span.duplicate-widget-icon.icon-Page-duplication-01 (componentDuplicate)
//             span.copy-widget-icon.icon-Copy-Icon                (componentCopy)
//             span.dlet_icon.icon-Delete                          (componentDeletePopup)
//   templates/generic-step/generic-step.html
//     • Empty slot .generic-step-empty-droppable-text toggles questions.showPasteHere
//       on hover → renders .icon-Paste-Icon + "Paste Here"; ng-click="pastecomp($event)".
//   templates/generic-step/scripts/generic-step-directive.js
//     • scope.pastecomp → con.componentPaste(e) + scope.onPasteDropComplete(e),
//       reading localStorage "copiedComponent".
//   editor/contenteditable-ng-model-directive.js
//     • ShowMessage/Example toast → element ".bb-alert" with span.textContent +
//       span.alert-icon; success state adds class "alert-success".
//
// IMPORTANT (source-verified nuances):
//   • The per-component COPY icon (.copy-widget-icon) is appended by findTag() and
//     on duplicated items, but the ORIGINAL drop template (ngcontroller.js ~2341)
//     renders only the DUPLICATE + DELETE icons. So a freshly dropped component may
//     expose duplicate (always) and copy (build-dependent). All helpers degrade
//     gracefully (log + return) when the copy icon is absent.
//   • The clipboard is localStorage-backed (NOT the OS clipboard) — driveable.
//   • Paste targets are the empty Generic Step slots; pasting "outside a step"
//     (TOC / instructions canvas) has no pastecomp handler — the invalid-target case.
// =============================================================================

/** Component heading toolbar (rendered inside each dropped .sd-item). */
export const CP_TOOLBAR = {
  /** Any dropped component instance on the active canvas / Generic Step column. */
  sdItem: '#desktop_view .sd-item, .generic-step-column-content .sd-item',
  heading: '.sd-item .template-main-heading',
  /** Copy icon — ng-click="componentCopy($event)". May be absent on some builds. */
  copyIcon: '.sd-item .template-main-heading .copy-widget-icon.icon-Copy-Icon',
  /** Duplicate icon — ng-click="componentDuplicate($event)". */
  duplicateIcon: '.sd-item .template-main-heading .duplicate-widget-icon.icon-Page-duplication-01',
  /** Delete icon — ng-click="componentDeletePopup($event)". */
  deleteIcon: '.sd-item .template-main-heading .dlet_icon.icon-Delete',
} as const;

/** Generic Step paste targets (templates/generic-step/generic-step.html). */
export const CP_PASTE = {
  /** Empty droppable slot — also the paste target (ng-click="pastecomp($event)"). */
  emptySlot: '#desktop_view .generic-step-empty-droppable-text',
  /** Question container wrapping each slot/widget. */
  questionContainer: '#desktop_view .generic-step-question-container',
  /** Column body that holds dropped widgets. */
  columnContent: '#desktop_view .generic-step-column-content',
  /** "Paste Here" affordance shown while hovering an empty slot (showPasteHere). */
  pasteHereIcon: '#desktop_view .empty-droppable-border-paste.icon-Paste-Icon',
} as const;

/** Invalid paste zones — no pastecomp handler exists here (TC_16). */
export const CP_INVALID_TARGETS = {
  /** TOC / page tray panel. */
  tocPanel: '.title-toc-holder, #add-page-dropdown, .tocPageIconMenu',
  /** Plain Instructions canvas region (not a Generic Step slot). */
  instructionsCanvas: '#desktop_view .instructions-for-students, #desktop_view .sd-area:not(.generic-step-column-content)',
} as const;

/** Success / status toast (ShowMessage + Example share ".bb-alert"). */
export const CP_TOAST = {
  alert: '.bb-alert',
  alertSuccess: '.bb-alert.alert-success',
  text: '.bb-alert span.textContent',
} as const;

/** localStorage clipboard keys written by componentCopy (source-verified). */
export const CP_CLIPBOARD_KEYS = {
  copiedComponent: 'copiedComponent',
  targetDataType: 'targetDataType',
  copiedTemplates: 'copiedTemplates',
  isDroppable: 'isDroppable',
  isPastable: 'isPastable',
} as const;

/** Source-verified business rules / copy. */
export const CP_RULES = {
  copySuccessMessage: 'The component has been copied successfully.',
  duplicateSuccessMessage: 'Component duplicated successfully.',
  pasteHereLabel: 'Paste Here',
  /** componentCopy clears localStorage then sets isDroppable=true. */
  copyClearsClipboard: true,
  /** componentPaste('layout') sets isDroppable=false when the copy is not droppable. */
  layoutPasteRequiresDroppable: true,
} as const;
