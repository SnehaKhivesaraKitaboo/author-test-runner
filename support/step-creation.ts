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

function getProgramName(win: Window): string {
  const ang = (win as { angular?: { element: (el: Element) => { scope: () => { programName?: string } } } }).angular;
  const el = win.document.getElementById('myController');
  return el && ang ? ang.element(el).scope()?.programName || '' : '';
}

/** Advance wizard tabs and submit (Selenium submitStepForm — native click #nextBtn → #subBtn). */
export function submitStepWizard(): void {
  logStage('STEP', 'submitStepForm — advance tabs and submit');

  cy.get('#formsModal #nextBtn:visible', { timeout: 8000 })
    .should('not.have.class', 'disabledBtn')
    .then($btn => {
      ($btn[0] as HTMLElement).click();
    });

  cy.get('#formsModal').then($modal => {
    if ($modal.find('#subBtn:visible').length === 0) {
      cy.get('#formsModal #nextBtn:visible', { timeout: 8000 })
        .then($btn => {
          if ($btn.length && !$btn.hasClass('disabledBtn')) {
            ($btn[0] as HTMLElement).click();
          }
        });
    }
  });

  cy.window().then(win => {
    if (getProgramName(win) === 'CL-MATH') {
      cy.get('#formsModal #subBtn:visible').then($sub => {
        if (!$sub.length) {
          cy.get('#formsModal #nextBtn:visible').then($btn => {
            if ($btn.length) ($btn[0] as HTMLElement).click();
          });
        }
      });
    }
  });

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
