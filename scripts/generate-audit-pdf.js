'use strict';

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'docs', 'enterprise-audit-report.html');
const PDF = path.join(ROOT, 'docs', 'Kitaboo-Authoring-Enterprise-Audit-Report.pdf');

async function main() {
  if (!fs.existsSync(HTML)) {
    console.error('HTML source not found:', HTML);
    process.exit(1);
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('file:///' + HTML.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.pdf({
      path: PDF,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '14mm', left: '12mm' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="width:100%;font-size:8px;color:#64748b;padding:0 12mm;text-align:center;font-family:sans-serif;">
          Kitaboo Authoring Enterprise Audit &nbsp;|&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
    });
    console.log('PDF generated:', PDF);
  } catch (err) {
    console.error('PDF generation failed:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
