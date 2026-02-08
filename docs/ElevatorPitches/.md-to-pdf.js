module.exports = {
  stylesheet: [
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
  ],
  css: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    h1 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    pre { background-color: #f5f5f5; padding: 1em; overflow-x: auto; }
    .katex { font-size: 1.1em; }
    .katex-display { margin: 1em 0; overflow-x: auto; }
  `,
  body_class: 'markdown-body',
  marked_options: {
    headerIds: true,
    smartypants: true,
  },
  pdf_options: {
    format: 'A4',
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm'
    },
    printBackground: true
  },
  marked_extensions: [require('marked-katex-extension')({ throwOnError: false })]
};
