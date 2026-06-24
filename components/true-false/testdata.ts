/// <reference types="cypress" />
// =============================================================================
// True or False test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const TF_DATA = {
  header: 'True or False Automation Header',
  instruction: 'Choose the correct answer below.',
  question: 'The Earth is flat.',
  options: ['True', 'False'],
  longOption:
    'This is a deliberately long answer option used to verify that option text ' +
    'wraps cleanly within the option area without overflowing the component.',

  feedback: {
    correct: 'Congratulations! Your answer is correct.',
    incorrect: 'Oops! You have selected the wrong answer.',
  },

  media: {
    invalidVideoUrl: 'not-a-valid-url-!!!',
    youtubeId: 'dQw4w9WgXcQ',
  },

  specialChars: 'Symbols & emoji: <>&% \u2705 \u26A0',

  /** XSS payload for sanitization checks (TC_42 / TC_90 script in header). */
  scriptInjection: '<script>alert(1)</script>Safe Header',
} as const;
