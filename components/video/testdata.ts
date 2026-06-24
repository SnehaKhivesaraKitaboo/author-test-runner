/// <reference types="cypress" />
// =============================================================================
// Video (media element) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const VIDEO_DATA = {
  /** Header text (rendered only when Show Header + style1). */
  header: 'Video Component Automation Header',
  /** Caption text (rendered when Show Caption is on). */
  caption: 'This caption verifies that the Video element accepts caption text during authoring.',
  /** Long caption to probe overflow handling. */
  longCaption: 'C'.repeat(600),

  /** Alt text for the Accessibility section. */
  altText: 'A short instructional clip describing the water cycle for grade-5 science.',
  /** Over-limit alt text (> 2000) for the maxlength contract check. */
  altTextOverLimit: 'A'.repeat(2100),

  /** Custom dimensions for the W/H number inputs. */
  width: '640',
  height: '360',
  /** Invalid dimension values for validation probing. */
  invalidWidth: 'abc',
  negativeWidth: '-100',
  zeroHeight: '0',

  /** Valid YouTube video id for URL-mode entry. */
  youtubeId: 'dQw4w9WgXcQ',
  /** Invalid video id / URL for the validation case. */
  invalidVideoUrl: 'not-a-valid-id-@@@',

  /** Comma-separated meta tags. */
  tags: 'science,water-cycle,grade5',

  /** Hex colour for the Outline & Fill colour-picker input. */
  hexColor: '#113e9a',
  invalidHexColor: '#XYZ',

  /** Security payload — must never execute as live script. */
  scriptInjection: '<script>alert(1)</script>Safe Video Caption',
} as const;
