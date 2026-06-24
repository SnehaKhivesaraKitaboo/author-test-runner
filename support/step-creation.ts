/// <reference types="cypress" />

import { logStage, waitForAngularSettled, waitForLoaderGone } from './wait-utils';

/** Selenium ClosifyAuthoringPage selectors (see selenium-project-context.mdc). */
export const STEP_SELECTORS = {
  tocAddToggle: '#add-page-dropdown.removeAddPreview, .title-toc-holder .removeAddPreview',
  addNewStepItem: 'ul.dropdown-menu.tocPageIconMenu #StepWidgetBtm, ul.tocPageIconMenu #StepWidgetBtm',
  bottomAddStep: '.addStepBtn .addNewPageToc[data-target="#widget-popup"]',
  stepPopup: '#widget-popup',
  stepCard: '#widget-popup .hover-div, #widget-popup .step-div',
  stepLabel: '#widget-popup .step-text',
  formsModal: '#formsModal, .forms-modal',
  titleInput: '#formsModal #title, #title[ng-model="stepTitle"]',
  nextBtn: '#formsModal #nextBtn:visible',
  subBtn: '#formsModal #subBtn:visible',
  activeToc: '.subTocName.activeTocItem, li.activeTocItem, .activeTocItem',
  canvas: '#desktop_view',
  loader: '#loader',
} as const;

/** JS click — mirrors Selenium executeScript click (avoids .action-btns overlay intercept). */
export function jsClick(selector: string, timeout = 8000): void {
  cy.get(selector, { timeout }).then($el => {
    const node = $el[0] as HTMLElement;
    node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    node.click();
  });
  waitForAngularSettled();
}

/** Open step chooser: .removeAddPreview → #StepWidgetBtm (Selenium clickAddStep). */
export function openStepChooserFromToc(): void {
  logStage('STEP', 'clickAddStep — TOC + Add → Add New Step');

  cy.get('body').then($body => {
    const bottomBtn = $body.find(STEP_SELECTORS.bottomAddStep + ':visible');
    const headerToggle = $body.find(STEP_SELECTORS.tocAddToggle + ':visible');

    if (headerToggle.length) {
      cy.wrap(headerToggle.first()).scrollIntoView().click({ force: true });
      cy.get(STEP_SELECTORS.addNewStepItem, { timeout: 10000 })
        .filter(':visible')
        .first()
        .should('be.visible')
        .then($item => {
          ($item[0] as HTMLElement).click();
        });
      return;
    }

    if (bottomBtn.length) {
      cy.log('   Fallback: bottom TOC .addStepBtn');
      cy.wrap(bottomBtn.first()).scrollIntoView().click({ force: true });
      return;
    }

    throw new Error('TOC "+ Add" control not found — cannot open step chooser');
  });

  cy.get(STEP_SELECTORS.stepPopup, { timeout: 15000 }).should('be.visible');
  cy.captureLiveStep('step-chooser-modal-open');
}

/** Select step type card by display name (Selenium selectStepType). */
export function selectStepTypeCard(stepLabel: string): void {
  logStage('STEP', `selectStepType — "${stepLabel}"`);
  cy.get(STEP_SELECTORS.stepCard, { timeout: 15000 })
    .contains(stepLabel)
    .first()
    .scrollIntoView()
    .then($card => {
      ($card[0] as HTMLElement).click();
    });
  cy.get(STEP_SELECTORS.formsModal, { timeout: 15000 }).should('be.visible');
}

/** Fill step title (Selenium fillStepTitle). */
export function fillStepTitle(stepTitle: string): void {
  logStage('STEP', `fillStepTitle — "${stepTitle}"`);
  cy.get(STEP_SELECTORS.titleInput, { timeout: 8000 })
    .should('be.visible')
    .clear()
    .type(stepTitle, { delay: 35 });
  cy.get('#formsModal #title').should('have.value', stepTitle);
  cy.captureLiveStep('step-metadata-title-filled');
}

/**
 * Advance wizard tabs and submit (Selenium submitStepForm — native click #nextBtn → #subBtn).
 *
 * The Generic Step wizard has a variable number of tabs (e.g. Basic Info → Levels →
 * Instructions → Support Content). Rather than assume a fixed count, loop clicking the
 * enabled #nextBtn until the Submit button (#subBtn) becomes visible, then submit.
 */
export function submitStepWizard(): void {
  logStage('STEP', 'submitStepForm — advance tabs until Submit appears, then submit');

  // Defensive cap: real wizards top out around 4–5 tabs; 8 leaves headroom.
  const MAX_NEXT_CLICKS = 8;

  const advance = (remaining: number): void => {
    cy.get('#formsModal', { timeout: 8000 }).then($modal => {
      const submitVisible = $modal.find('#subBtn:visible').length > 0;
      if (submitVisible) {
        return; // reached final tab — submit handled below
      }

      if (remaining <= 0) {
        throw new Error(
          'submitStepWizard: exhausted Next clicks without reaching Submit (#subBtn). ' +
            'Wizard may have an unexpected number of tabs or a blocked/required field.',
        );
      }

      const $next = $modal.find('#nextBtn:visible');
      if ($next.length === 0 || $next.hasClass('disabledBtn')) {
        throw new Error(
          'submitStepWizard: #nextBtn not clickable but Submit not yet visible — ' +
            'wizard is stuck (likely a required field on the current tab).',
        );
      }

      ($next[0] as HTMLElement).click();
      waitForAngularSettled();
      advance(remaining - 1);
    });
  };

  advance(MAX_NEXT_CLICKS);

  cy.get('#formsModal #subBtn:visible', { timeout: 15000 })
    .should('be.visible')
    .then($btn => {
      ($btn[0] as HTMLElement).click();
    });
  cy.captureLiveStep('step-wizard-submitted');
  waitForAngularSettled();
}

/** Post-save wait signals (Selenium: loader hidden + activeTocItem + desktop_view). */
export function waitForStepSaved(): void {
  logStage('STEP', 'Wait — loader hidden, active TOC, canvas ready');
  cy.get(STEP_SELECTORS.formsModal, { timeout: 30000 }).should('not.be.visible');
  waitForLoaderGone();
  cy.get(STEP_SELECTORS.activeToc, { timeout: 25000 }).should('exist');
  cy.get(STEP_SELECTORS.canvas, { timeout: 25000 }).should('exist');
  cy.captureLiveStep('new-step-active-in-toc');
  waitForAngularSettled();
}
