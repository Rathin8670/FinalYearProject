
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

// Polyfill for pdfjs-dist in Node environment
// pdfjs-dist usually requires DOM globals or a specific setup
global.Promise = Promise;

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function renderPdf() {
    try {
        console.log("Loading PDF...");
        const data = new Uint8Array(fs.readFileSync(path.join(__dirname, 'test-bypass.js'))); // Use a dummy file to fail gracefully or actual PDF if available
        // We will create a dummy PDF buffer for testing rendering 
        // OR user can place a file. Since we don't have one, we will try to make a minimal PDF buffer 
        // Actually, let's just use the load mechanics.
        
        // Minimal valid PDF binary string for testing
        const pdfData = Buffer.from(
          "%PDF-1.7\n" +
          "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
          "2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n" +
          "3 0 obj<</Type/Page/MediaBox[0 0 144 144]/Parent 2 0 R/Resources<<>>>>endobj\n" +
          "xref\n" +
          "0 4\n" +
          "0000000000 65535 f \n" +
          "0000000009 00000 n \n" +
          "0000000052 00000 n \n" +
          "0000000101 00000 n \n" +
          "trailer<</Size 4/Root 1 0 R>>\n" +
          "startxref\n" +
          "178\n" +
          "%%EOF"
        );
        
        const loadingTask = pdfjsLib.getDocument({
            data: pdfData,
            standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/',
            disableFontFace: true,
            verbosity: 0
        });

        const doc = await loadingTask.promise;
        console.log(`Document loaded, pages: ${doc.numPages}`);

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        console.log(`Page 1 size: ${viewport.width}x${viewport.height}`);

        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log("Render finished!");

        const buffer = canvas.toBuffer('image/png');
        console.log(`Generated PNG buffer size: ${buffer.length}`);
        
    } catch (e) {
        console.error("Render failed:", e);
        process.exit(1);
    }
}

renderPdf();
