'use strict';

/**
 * Verify QC PDF files in D:/Author_Test_cases match fixtures/test-registry.json entries.
 * Run: node scripts/verify-qc-pdfs.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY = path.join(ROOT, 'fixtures', 'test-registry.json');
const QC_DIR = process.env.QC_TEST_CASES_DIR || 'D:/Author_Test_cases';

function main() {
  if (!fs.existsSync(REGISTRY)) {
    console.error('Missing test-registry.json');
    process.exit(1);
  }
  if (!fs.existsSync(QC_DIR)) {
    console.error(`QC folder not found: ${QC_DIR}`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf-8'));
  const pdfFiles = new Set(fs.readdirSync(QC_DIR).filter(f => f.toLowerCase().endsWith('.pdf')));
  const suites = registry.suites || [];

  let matched = 0;
  let missing = 0;
  let noPdf = 0;

  console.log(`\nQC PDF catalog check — ${QC_DIR}\n`);

  for (const s of suites) {
    if (!s.pdfFile) {
      noPdf++;
      continue;
    }
    const ok = pdfFiles.has(s.pdfFile);
    if (ok) {
      matched++;
      console.log(`✓ ${s.name.padEnd(28)} → ${s.pdfFile}`);
    } else {
      missing++;
      console.log(`✗ ${s.name.padEnd(28)} → MISSING: ${s.pdfFile}`);
    }
  }

  const orphanPdfs = [...pdfFiles].filter(pdf => {
    return !suites.some(s => s.pdfFile === pdf);
  });

  console.log(`\nSummary: ${matched} matched, ${missing} missing in QC folder, ${noPdf} registry entries without pdfFile`);
  if (orphanPdfs.length) {
    console.log(`\nOrphan PDFs in QC folder (not in registry): ${orphanPdfs.length}`);
    orphanPdfs.slice(0, 10).forEach(p => console.log(`  - ${p}`));
    if (orphanPdfs.length > 10) console.log(`  ... and ${orphanPdfs.length - 10} more`);
  }
  console.log('');
}

main();
