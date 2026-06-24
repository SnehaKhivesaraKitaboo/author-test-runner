/// <reference types="cypress" />
// =============================================================================
// Table (tablesNew) test data — reusable strings/values (no hardcoded literals).
// =============================================================================

export const TABLE_DATA = {
  /** Header title typed into .table-template-header (contenteditable). */
  header: 'Table Automation Header',
  /** Caption typed into the figcaption. */
  caption: 'Automated table caption text.',
  /** Generic cell content. */
  cell: 'Cell content',
  /** Distinct values used to verify cells accept independent text. */
  cellA: 'Alpha',
  cellB: 'Beta',
  cellC: 'Gamma',
  /** Large payload to exercise overflow/scroll handling (TC_36/TC_63). */
  largeCell:
    'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ' +
    'tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam '.repeat(6),
  /** LaTeX/math payload for math-render cases (TC_33/TC_60). */
  mathEquation: '$$x^2 + y^2 = r^2$$',
  /** Custom row/column counts used to verify the Create dialog inputs. */
  customRows: 3,
  customCols: 5,
  /** Over-limit values to verify the max=20 constraint (DOM-level). */
  overLimitRows: 25,
  overLimitCols: 25,

  scriptInjection: '<script>alert(1)</script>Safe Table',
} as const;
