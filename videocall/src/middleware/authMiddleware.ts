import { Request, Response, NextFunction } from 'express';

// Load environment variable lazily to ensure dotenv has run
function getInternalSecret(): string {
  const secret = process.env.INTERNAL_SECRET;
  if (!secret) {
    console.error('INTERNAL_SECRET environment variable is not set!');
    console.error('Make sure you have a .env file in the videocall folder with INTERNAL_SECRET defined');
  }
  return secret || '';
}

export function validateInternalSecret(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Express normalizes headers to lowercase
  const secret = req.headers['x-internal-secret'] as string | undefined;
  const INTERNAL_SECRET = getInternalSecret();

  if (!INTERNAL_SECRET) {
    console.error('INTERNAL_SECRET environment variable is not set!');
    console.error('Current working directory:', process.cwd());
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SECRET')));
    return res.status(500).json({
      message: 'Server configuration error: INTERNAL_SECRET not configured. Please check your .env file.'
    });
  }

  if (!secret) {
    console.error('Missing X-Internal-Secret header. Received headers:', Object.keys(req.headers));
    return res.status(401).json({
      message: 'Unauthorized: Missing X-Internal-Secret header'
    });
  }

  // Trim whitespace from both values to avoid issues
  const trimmedSecret = secret.trim();
  const trimmedInternalSecret = INTERNAL_SECRET.trim();

  if (trimmedSecret !== trimmedInternalSecret) {
    console.error('Invalid X-Internal-Secret header');
    console.error('Expected length:', trimmedInternalSecret.length, 'Received length:', trimmedSecret.length);
    console.error('Expected (first 10 chars):', trimmedInternalSecret.substring(0, 10));
    console.error('Received (first 10 chars):', trimmedSecret.substring(0, 10));
    console.error('Full expected value:', trimmedInternalSecret);
    console.error('Full received value:', trimmedSecret);
    console.error('Values match?', trimmedSecret === trimmedInternalSecret);
    console.error('');
    console.error('=== FIX INSTRUCTIONS ===');
    console.error('1. Check backend/.env has: VIDEO_SERVICE_SECRET=<value>');
    console.error('2. Check videocall/.env has: INTERNAL_SECRET=<same-value>');
    console.error('3. Make sure both values are EXACTLY the same (no extra spaces)');
    console.error('4. Restart both services after changing .env files');
    console.error('========================');
    return res.status(401).json({
      message: 'Unauthorized: Invalid X-Internal-Secret header. Please check that INTERNAL_SECRET in video service matches VIDEO_SERVICE_SECRET in backend.'
    });
  }

  next();
}

