/// <reference types="cypress" />
// =============================================================================
// Extended Response about Media test data — reusable strings/values.
// =============================================================================

export const ERM_DATA = {
  header: 'Watch the clip and respond.',
  question: 'What is the main idea conveyed by the media above?',
  shortAnswer: 'A concise model response.',
  /** Pipe-separated multiple correct answers (TC_122/127/128). */
  pipeAnswers: 'Orange | Apple | Mango',
  paragraphAnswer:
    'A longer model answer that spans multiple sentences to verify that the ' +
    'response field accepts and retains paragraph-length content during authoring.',
  caption: 'Caption text describing the media.',
  transcript: 'This is the spoken transcript for the uploaded audio.',
  tags: 'media,response,extended',
  altText: 'Descriptive alt text for the media used by screen readers.',
  /** 2001 chars to exercise the 2000 alt-text limit. */
  altTextOverLimit: 'a'.repeat(2001),
  colorCode: '#113e9a',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

  scriptInjection: '<script>alert(1)</script>Safe Question',
} as const;
