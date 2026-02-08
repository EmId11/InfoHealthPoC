const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const markedKatex = require('marked-katex-extension');
const puppeteer = require('puppeteer');

async function generatePDF(inputFile, outputFile) {
  // Read markdown file
  const markdown = fs.readFileSync(inputFile, 'utf-8');

  // Configure marked with KaTeX
  const marked = new Marked();
  marked.use(markedKatex({
    throwOnError: false,
    output: 'html'
  }));

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdown);

  // Create full HTML document with KaTeX CSS
  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CHS Academic Paper</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }
    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      margin-bottom: 0.5em;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
      margin-top: 1.5em;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      margin-top: 1.2em;
      page-break-after: avoid;
    }
    h4 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 1em;
    }
    p {
      margin: 0.8em 0;
      text-align: justify;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #999;
      padding: 6px 10px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    code {
      background: #f5f5f5;
      padding: 2px 5px;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
    }
    pre {
      background: #f5f5f5;
      padding: 12px;
      overflow-x: auto;
      font-size: 9pt;
      border: 1px solid #ddd;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 3px solid #ccc;
      margin: 1em 0;
      padding-left: 1em;
      color: #666;
    }
    hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 2em 0;
    }
    ul, ol {
      margin: 0.8em 0;
      padding-left: 2em;
    }
    li {
      margin: 0.3em 0;
    }
    .katex {
      font-size: 1.05em;
    }
    .katex-display {
      margin: 1em 0;
      overflow-x: auto;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>
`;

  // Launch puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputFile,
    format: 'A4',
    margin: {
      top: '25mm',
      right: '25mm',
      bottom: '25mm',
      left: '25mm'
    },
    printBackground: true
  });

  await browser.close();
  console.log(`Generated: ${outputFile}`);
}

// Get input file from command line
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node generate-pdf.js <input.md>');
  process.exit(1);
}

const outputFile = inputFile.replace('.md', '.pdf');
generatePDF(inputFile, outputFile).catch(console.error);
