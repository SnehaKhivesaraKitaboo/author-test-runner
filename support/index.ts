/// <reference types="cypress" />
import './commands';
export {
  getAuthoringModule,
  moduleUsesGenericStepForAssessment,
  resolveCanvasSetup,
  resolveDropTarget,
} from './module-setup';
export { logStage, waitForLoaderGone, waitForWidgetRegistry } from './wait-utils';

// Suppress known benign AngularJS / browser errors — fail on everything else
Cypress.on('uncaught:exception', (err) => {
  const ignored = [
    'ResizeObserver loop',
    '$apply already in progress',
    'digest already in progress',
    'Script error',
    'Non-Error promise rejection captured',
  ];
  if (ignored.some(msg => err.message.includes(msg))) return false;
  return true;
});

/** Capture debug screenshot + context on test failure. */
afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    const title = (this.currentTest.title || 'unknown')
      .replace(/[^a-z0-9]+/gi, '-')
      .slice(0, 40);
    cy.captureFailureDebug(`FAIL-${title}`);
  }
});
