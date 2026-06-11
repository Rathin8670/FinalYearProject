
try {
    console.log("Attempting to require pdf-parse/lib/pdf-parse.js directly...");
    const pdf = require('pdf-parse/lib/pdf-parse.js');
    console.log("Success! Type:", typeof pdf);
    
    // Test polyfill requirement
    try {
        pdf(Buffer.from("dummy")); 
    } catch(e) {
        console.log("Parsing trigger error (expected):", e.message);
    }

} catch(e) {
    console.error("FAIL:", e);
}
