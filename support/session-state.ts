/// <reference types="cypress" />

export interface AuthoringSessionState {
  fibAssessmentStepCreated?: boolean;
  lastAutoTestStepTitle?: string;
  lastDroppedWidgetType?: string;
}

declare global {
  interface Window {
    __authoringSession?: AuthoringSessionState;
  }
}

function session(win: Window): AuthoringSessionState {
  if (!win.__authoringSession) {
    win.__authoringSession = {};
  }
  return win.__authoringSession;
}

export function markAutoTestStepCreated(win: Window, stepTitle: string): void {
  const s = session(win);
  s.fibAssessmentStepCreated = true;
  s.lastAutoTestStepTitle = stepTitle;
  // Legacy flag consumed by ensureFibDeepSetup
  (win as Window & { __fibAssessmentStepCreated?: boolean }).__fibAssessmentStepCreated = true;
}

export function getSessionState(win: Window): Readonly<AuthoringSessionState> {
  return { ...session(win) };
}

export function clearSessionState(win: Window): void {
  win.__authoringSession = {};
  delete (win as Window & { __fibAssessmentStepCreated?: boolean }).__fibAssessmentStepCreated;
}

export function setLastDroppedWidgetType(win: Window, dataType: string): void {
  session(win).lastDroppedWidgetType = dataType;
}
