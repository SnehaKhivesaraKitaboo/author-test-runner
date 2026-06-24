/// <reference types="cypress" />
// =============================================================================
// MCQ test data — reusable strings/values (no hardcoded literals in specs).
// =============================================================================

export const MCQ_DATA = {
  header: 'MCQ Automation Header',
  instruction: 'Choose the correct answer below.',
  question: 'What is the capital of France?',
  options: ['Paris', 'London', 'Berlin', 'Madrid'],
  extraOption: 'Rome',
  longOption:
    'This is a deliberately long answer option used to verify that option text ' +
    'wraps cleanly within the option area without overflowing the MCQ component.',
  copiedHeader: 'Copied MCQ Header',

  feedback: {
    correct: 'Congratulations! Your answer is correct.',
    incorrect: 'Incorrect. Please try again.',
  },

  media: {
    invalidVideoUrl: 'not-a-valid-url-!!!',
    youtubeId: 'dQw4w9WgXcQ',
  },

  actionAssetsColor: '#113e9a',
  invalidColor: 'zzz-not-a-color',

  tryAgainAttempts: 3,

  /** XSS payload for sanitization checks (TC: script in stem). */
  scriptInjection: '<script>alert(1)</script>Safe Header',
} as const;
