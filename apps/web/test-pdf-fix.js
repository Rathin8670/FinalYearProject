
const fs = require('fs');
const path = require('path');

// 1. Simulation of the error (without polyfill)
// To verify the fix, we will simulate the environment and try to apply the polyfill.

try {
  console.log("Testing PDF Parse with Polyfill...");

  // POLYFILL BEGIN
  // Try to load canvas
  try {
      const canvas = require('@napi-rs/canvas');
      if (!global.DOMMatrix) {
          global.DOMMatrix = canvas.DOMMatrix;
          global.ImageData = canvas.ImageData;
          global.Path2D = canvas.Path2D;
          console.log("Polyfilled DOMMatrix, ImageData, Path2D");
      }
  } catch (e) {
      console.warn("Could not load @napi-rs/canvas", e);
  }
  // POLYFILL END

  let pdf;
  try {
      console.log("Attempt 1: require('pdf-parse')");
      const attempt1 = require('pdf-parse');
      if (typeof attempt1 === 'function') {
          pdf = attempt1;
      } else if (attempt1.default && typeof attempt1.default === 'function') {
           pdf = attempt1.default;
      } else if (attempt1.PDFParse && typeof attempt1.PDFParse === 'function') {
           console.log("Found PDFParse export, assuming it is the main function for now (or a class)");
           // To check if it's the main function, we'll try to use it. 
           // Standard pdf-parse returns a Promise.
           pdf = attempt1.PDFParse;
      } else {
          console.log("Attempt 1 keys:", Object.keys(attempt1 || {}));
      }
  } catch(e) { console.log("Attempt 1 failed:", e.message); }

  if (!pdf) {
     // ... fallback
  }

  if (!pdf) {
      throw new Error("Could not find pdf function in any export");
  }

  // Optional: Try to parse empty buffer to see if it reaches parsing logic vs crashing on load
  pdf(Buffer.from("dummy pdf content")).then(data => {
      console.log("Parsed data:", data.text);
  }).catch(e => {
      // We expect a parsing error for dummy content, but NOT a DOMMatrix error
      if (e.message.includes("DOMMatrix")) {
          console.error("FAIL: DOMMatrix error still present!");
          process.exit(1);
      } else {
          console.log("Success: Parsing attempted (failed on invalid PDF as expected, but no DOMMatrix error)");
      }
  });

} catch (e) {
  console.error("CRITICAL FAIL:", e);
}
