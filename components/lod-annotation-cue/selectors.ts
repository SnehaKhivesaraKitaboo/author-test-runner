/// <reference types="cypress" />
// =============================================================================
// LoD + Annotation Cue — Verified selectors
//
// Source of truth (KITABOO_Authoring), all read & derived (never invented):
//   config/config.js
//     • Layer section widget: name "LoD", dataType "lod", iconClass "icon-LOD",
//       url templates/LoD/LoD.html, settingsURL templates/LoD/LoD-setting-panel.html,
//       allowClone:true, enableGroupInteractivity:true.
//     • Widget "Annotation Cue", dataType "annotationCueHighlightOutline",
//       url templates/annotation-cue/annotation-cue.html,
//       settingsURL templates/annotation-cue/annotation-cue-setting.html.
//     • Droppability map gates BOTH off for layouts: "lod":false and
//       "annotationCueHighlightOutline":false → controls are FLAG-GATED; helpers
//       and specs must log + return gracefully when not droppable in a build.
//   templates/LoD/LoD.html                          (canvas DOM)
//   templates/LoD/LoD-setting-panel.html            (settings panel)
//   templates/LoD/default/LoD.json                  (default field data)
//   templates/LoD/scripts/LoD-directive.js          (scope methods + ng-models)
//   templates/annotation-cue/annotation-cue.html    (canvas DOM)
//   templates/annotation-cue/annotation-cue-setting.html (settings panel)
//   templates/annotation-cue/default/annotation-cue.json (default field data)
//
// LoD is a LAYER (not an assessment widget) → it drops onto the canvas
// (#desktop_view) via cy.dropComponentForModule (resolveDropTarget → 'canvas').
// Annotation Cue is the ONLY widget the LoD column accepts: LoD-directive.js
// onDropComplete() returns early unless data.dataType === 'annotationCueHighlightOutline'.
//
// Source-driven facts:
//   • LoD canvas wrapper = .LoD-container.layer-lod ([lod-template] / [lod]);
//     host carries .customClass[lod-id="lod-<timestamp>"] (unique per drop).
//   • LoD settings panel id = "#lod-template-setting" (title "LoD").
//   • Display Criteria groups (.loDType) come from a backend API
//     (fetchLODSettingData) → displayCritaria is [] by default, so Level-of-
//     Support values (CORE/LIGHT/MODERATE/INTENSIVE) are NOT present without a
//     provisioned backend → those QC cases are deferred / graceful.
//   • Link Activity (.linkActivty) input id = "#customLinkedActivity";
//     add icon = .lod-activity-add-container.icon-Link; list rows = .activity-list;
//     delete = .lod-activity-list-delete; validation = .error-text.
//     Duplicate / empty Ref ID is rejected by validateAndAddLink().
//   • Apply Tag button id = "#apply-tag-button" (disabled until isApplyEnabled).
//   • Annotation Cue canvas = .annotationCueContainer.annotationCueHighlightOutline;
//     title contenteditable = .cue-section-title-text (default "Stop and Annotate"),
//     prompt contenteditable = .cue-section-textarea; pen icon (non-editable) =
//     .icon-Highlight_AnnotationCue; play btn = .cue-play.
//   • Annotation Cue settings = .annotation-cue-setting (title "Annotation Cue");
//     Show audio checkbox = ng-model currSettings.showAudio; colour input =
//     .colorPickerInputBox (maxlength 7, default #6E35C8).
// =============================================================================

export const LOD_DATA_TYPE = 'lod';
export const LOD_WIDGET_NAME = 'LoD';
export const CUE_DATA_TYPE = 'annotationCueHighlightOutline';
export const CUE_WIDGET_NAME = 'Annotation Cue';

/** LoD authoring-canvas DOM (the dropped LoD layer). */
export const LOD_CANVAS = {
  /** The component wrapper rendered from LoD.html. */
  container: '.LoD-container.layer-lod, [lod-template], [lod]',
  /** Host .sd-item carrying the per-drop unique id. */
  host: '.customClass[lod-id]',
  sdItem: '#desktop_view .sd-item:has([lod-template]), #desktop_view .sd-item:has(.LoD-container)',
  /** Droppable column slot inside the LoD container. */
  column: '.LoD-container .LoD-column, .LoD-container .column-content',
  /** Empty "Drag Components Here" placeholder. */
  dropPlaceholder: '.LoD-container .empty-droppable-text .drag-widget-text',
  dropAddIcon: '.LoD-container .empty-droppable-border.icon-Add',
  /** Per-question droppable cells (questionBank). */
  questionContainer: '.LoD-container .question-container',
  /** Delete control on the host .sd-item (shared chrome). */
  deleteIcon: '.sd-item .icon-Delete, .sd-item .dlet_icon',
} as const;

/** LoD settings panel DOM (#lod-template-setting). */
export const LOD_SETTINGS = {
  panel: '#lod-template-setting, [lod-template-setting]',
  title: '#lod-template-setting .txt-set-title .para-ellipsis',
  icon: '#lod-template-setting .txt-set-icon',

  // Display Criteria
  displayCriteriaLabel: '#lod-template-setting .display-criteria-lable',
  criteriaGroup: '#lod-template-setting .loDType',
  criteriaToggle: '#lod-template-setting .loDType .switch input[type="checkbox"]',
  criteriaMultiCheckbox: '#lod-template-setting .tagBlockValue input[type="checkbox"]',
  criteriaSingleRadio: '#lod-template-setting .tagBlockValue input[type="radio"]',

  // Link Activity
  linkActivityBlock: '#lod-template-setting .linkActivty',
  linkActivityToggle:
    '#lod-template-setting .linkActivty .switch input[type="checkbox"], ' +
    '#lod-template-setting .linkActivty input[ng-model="currSettings.LinkedActivity.visible"]',
  linkRefInput: '#lod-template-setting #customLinkedActivity, #lod-template-setting .lod-activity-add',
  linkAddIcon: '#lod-template-setting .lod-activity-add-container.icon-Link',
  linkMessage: '#lod-template-setting .linkMessage',
  errorText: '#lod-template-setting .error-text',
  activityList: '#lod-template-setting .activity-list',
  activityListText: '#lod-template-setting .lod-activity-list-text',
  activityListDelete: '#lod-template-setting .lod-activity-list-delete',

  // Footer
  applyTagButton: '#lod-template-setting #apply-tag-button',
} as const;

/** Annotation Cue authoring-canvas DOM. */
export const CUE_CANVAS = {
  container: `.annotationCueContainer.${CUE_DATA_TYPE}, [annotation-cue-template]`,
  form: '.annotationCueContainer .annotation-cue-form',
  section: '.annotationCueContainer #cue-section, .annotationCueContainer .cue-section',
  /** Pen / highlight icon — non-editable per QC. */
  penIcon: '.annotationCueContainer .icon-Highlight_AnnotationCue',
  /** Editable title (default "Stop and Annotate"). */
  title: '.annotationCueContainer .cue-section-title-text',
  /** Editable prompt/body. */
  text: '.annotationCueContainer .cue-section-textarea',
  /** Audio play/pause control. */
  playBtn: '.annotationCueContainer .cue-play',
  audioPlayer: '.annotationCueContainer #cue-player-audio',
} as const;

/** Annotation Cue settings panel DOM (.annotation-cue-setting). */
export const CUE_SETTINGS = {
  panel: '.annotation-cue-setting',
  title: '.annotation-cue-setting .txt-set-title .para-ellipsis',
  icon: '.annotation-cue-setting .icon-Annoation',
  showAudio: '.annotation-cue-setting input[ng-model="currSettings.showAudio"]',
  colorPickerContainer: '.annotation-cue-setting .colorPickerContainer',
  colorPickerInput: '.annotation-cue-setting .colorPickerInputBox',
  colorPickerButton: '.annotation-cue-setting .colorPickerButton',
} as const;

/** Source-verified business rules / defaults. */
export const LOD_CUE_RULES = {
  lodSettingsTitle: 'LoD',
  cueSettingsTitle: 'Annotation Cue',
  cueDefaultTitle: 'Stop and Annotate',
  cueTitlePlaceholder: 'Enter your title here...',
  cueTextPlaceholder: 'Type question or prompt here...',
  cueDefaultColor: '#6E35C8',
  cueColorMaxLength: 7,
  /** Display Criteria values are backend-provisioned; none ship by default. */
  displayCriteriaSeededByBackend: true,
  /** Only Annotation Cue may be dropped into a LoD column. */
  lodColumnAcceptedDataType: CUE_DATA_TYPE,
  /** Both controls are gated off in the layout droppability map (config.js). */
  flagGated: true,
} as const;
