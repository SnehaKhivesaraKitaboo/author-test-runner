/// <reference types="cypress" />

export type AuthoringModule = 'ela' | 'wl' | 'math';

export type CanvasSetupStrategy = 'instructions-page' | 'generic-step';
export type DropTargetStrategy = 'canvas' | 'generic-step-column';

export interface ModuleSetupProfile {
  id: AuthoringModule;
  label: string;
  /** How to prepare the canvas before component tests */
  defaultCanvas: CanvasSetupStrategy;
  /** WL uses a single unrestricted page for all component types */
  singlePageMode: boolean;
}

export interface ModuleCanvasOptions {
  dataType?: string;
  componentName?: string;
  /** Override auto-resolved setup */
  setup?: CanvasSetupStrategy;
}

export interface ModuleDropOptions {
  dataType?: string;
  columnIndex?: number;
  /** When true, caller captures the live screenshot (avoids duplicate snap in dropFib flow). */
  skipLiveCapture?: boolean;
}

const MODULE_PROFILES: Record<AuthoringModule, ModuleSetupProfile> = {
  ela: {
    id: 'ela',
    label: 'Lenses on Literature (ELA)',
    defaultCanvas: 'instructions-page',
    singlePageMode: false,
  },
  wl: {
    id: 'wl',
    label: 'World Languages (WL)',
    defaultCanvas: 'instructions-page',
    singlePageMode: true,
  },
  math: {
    id: 'math',
    label: 'Math',
    defaultCanvas: 'instructions-page',
    singlePageMode: false,
  },
};

/** Assessment widgets that must be dropped inside a Generic Step column (ELA & Math). */
export const ASSESSMENT_DATA_TYPES = new Set<string>([
  'fill-in-the-blank',
  'multiple-choice-template',
  'mcq-multiple',
  'true-false-template',
  'sorting',
  'match-the-pairs',
  'mtp-multiple',
  'shortLongAns',
  'extendedResponseMedia',
  'fib-media',
  'correction',
  'highlight',
  'identify-the-clip',
  'group-interactivity-template',
]);

/** Name aliases → dataType for drop-target resolution */
const NAME_TO_DATA_TYPE: Record<string, string> = {
  'fill in the blank': 'fill-in-the-blank',
  'multiple choice': 'multiple-choice-template',
  'mcq (single choice)': 'multiple-choice-template',
  'mcq multiple': 'mcq-multiple',
  'true or false': 'true-false-template',
  'true false': 'true-false-template',
  'match the pairs': 'match-the-pairs',
  'categorize': 'sorting',
  'sorting': 'sorting',
  'extended response': 'shortLongAns',
  'question answer': 'shortLongAns',
  'extended response media': 'extendedResponseMedia',
  'fib media': 'fib-media',
  'mtp multiple': 'mtp-multiple',
  'wl multipart': 'wl-multipart',
  'ela multipart': 'ela-multipart',
};

export function normalizeAuthoringModule(raw?: string): AuthoringModule {
  const id = (raw || Cypress.env('AUTHORING_MODULE') || 'ela').toLowerCase();
  if (id === 'wl' || id === 'math' || id === 'ela') return id;
  return 'ela';
}

export function getAuthoringModule(): AuthoringModule {
  return normalizeAuthoringModule();
}

export function getModuleProfile(module?: AuthoringModule): ModuleSetupProfile {
  return MODULE_PROFILES[module ?? getAuthoringModule()];
}

export function resolveDataType(dataType?: string, componentName?: string): string | undefined {
  if (dataType) return dataType;
  if (!componentName) return undefined;
  const key = componentName.trim().toLowerCase();
  return NAME_TO_DATA_TYPE[key];
}

export function isAssessmentWidget(dataType?: string, componentName?: string): boolean {
  const resolved = resolveDataType(dataType, componentName);
  return resolved ? ASSESSMENT_DATA_TYPES.has(resolved) : false;
}

/**
 * WL: single page — all drops on Instructions canvas.
 * ELA/Math: assessment widgets → Generic Step column; others → canvas.
 */
export function resolveDropTarget(
  dataType?: string,
  componentName?: string,
  module?: AuthoringModule,
): DropTargetStrategy {
  const mod = module ?? getAuthoringModule();
  if (mod === 'wl') return 'canvas';

  return isAssessmentWidget(dataType, componentName)
    ? 'generic-step-column'
    : 'canvas';
}

export function resolveCanvasSetup(
  dataType?: string,
  componentName?: string,
  module?: AuthoringModule,
): CanvasSetupStrategy {
  const mod = module ?? getAuthoringModule();
  if (mod === 'wl') return 'instructions-page';

  return resolveDropTarget(dataType, componentName, mod) === 'generic-step-column'
    ? 'generic-step'
    : 'instructions-page';
}

export function moduleUsesGenericStepForAssessment(module?: AuthoringModule): boolean {
  const mod = module ?? getAuthoringModule();
  return mod === 'ela' || mod === 'math';
}

export function logModuleContext(prefix = 'Authoring module'): void {
  const mod = getAuthoringModule();
  const profile = getModuleProfile(mod);
  cy.log(`${prefix}: ${profile.label} (${mod})${profile.singlePageMode ? ' · single-page mode' : ''}`);
}
