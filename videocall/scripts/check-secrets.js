import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load video service .env
const videoServiceEnv = dotenv.config({ path: join(__dirname, '../.env') });

// Try to load backend .env (might be in parent directory)
const backendEnvPath = join(__dirname, '../../backend/.env');
let backendEnv = {};
try {
  const backendEnvContent = readFileSync(backendEnvPath, 'utf-8');
  backendEnvContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      backendEnv[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (error) {
  console.log('Could not read backend .env file (this is okay if backend is in a different location)');
}

console.log('\n=== Secret Configuration Check ===\n');

const videoSecret = process.env.INTERNAL_SECRET || videoServiceEnv.parsed?.INTERNAL_SECRET;
const backendSecret = backendEnv.VIDEO_SERVICE_SECRET;

console.log('Video Service INTERNAL_SECRET:');
if (videoSecret) {
  console.log(`  ✓ Set (length: ${videoSecret.length})`);
  console.log(`  First 10 chars: "${videoSecret.substring(0, 10)}"`);
  console.log(`  Last 10 chars: "${videoSecret.substring(Math.max(0, videoSecret.length - 10))}"`);
} else {
  console.log('  ✗ NOT SET - Please add INTERNAL_SECRET to videocall/.env');
}

console.log('\nBackend VIDEO_SERVICE_SECRET:');
if (backendSecret) {
  console.log(`  ✓ Set (length: ${backendSecret.length})`);
  console.log(`  First 10 chars: "${backendSecret.substring(0, 10)}"`);
  console.log(`  Last 10 chars: "${backendSecret.substring(Math.max(0, backendSecret.length - 10))}"`);
} else {
  console.log('  ✗ NOT SET - Please add VIDEO_SERVICE_SECRET to backend/.env');
}

if (videoSecret && backendSecret) {
  console.log('\n=== Comparison ===');
  if (videoSecret === backendSecret) {
    console.log('  ✓ MATCH - Secrets are identical!');
  } else {
    console.log('  ✗ MISMATCH - Secrets do not match!');
    console.log('\n  To fix:');
    console.log('  1. Make sure both .env files have the same value');
    console.log('  2. Check for extra spaces or different quotes');
    console.log('  3. Restart both services after updating');
  }
} else {
  console.log('\n⚠ Cannot compare - one or both secrets are missing');
}

console.log('\n=== Instructions ===');
console.log('1. Edit videocall/.env and set: INTERNAL_SECRET=your-secret-value');
console.log('2. Edit backend/.env and set: VIDEO_SERVICE_SECRET=your-secret-value');
console.log('3. Make sure both values are EXACTLY the same');
console.log('4. Restart both services\n');

