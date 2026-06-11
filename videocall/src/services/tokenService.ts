import jwt from 'jsonwebtoken';

function getVideoJwtSecret(): string {
  const secret = process.env.VIDEO_JWT_SECRET;
  if (!secret) {
    throw new Error(
      'VIDEO_JWT_SECRET is not set in environment variables. ' +
      'Please add VIDEO_JWT_SECRET to your videocall/.env file. ' +
      'Example: VIDEO_JWT_SECRET=your-secret-key-here'
    );
  }
  return secret;
}

export interface VideoTokenPayload {
  sub: string; // userId from telemed
  sessionId: string;
  roomName: string;
  role: 'doctor' | 'patient';
  permissions: string[];
  iat?: number;
  exp?: number;
}

export function createVideoToken(
  payload: Omit<VideoTokenPayload, 'permissions'> & { role: 'doctor' | 'patient' }
): string {
  const VIDEO_JWT_SECRET = getVideoJwtSecret();
  
  const permissions =
    payload.role === 'doctor'
      ? ['host', 'mute-others', 'end-call']
      : ['participant'];

  const fullPayload: VideoTokenPayload = {
    ...payload,
    permissions
  };

  return jwt.sign(fullPayload, VIDEO_JWT_SECRET, {
    expiresIn: '1h'
  });
}

export function verifyVideoToken(token: string): VideoTokenPayload {
  const VIDEO_JWT_SECRET = getVideoJwtSecret();
  return jwt.verify(token, VIDEO_JWT_SECRET) as VideoTokenPayload;
}

