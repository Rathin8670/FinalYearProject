/**
 * AI doctor as a Socket.IO client: joins videocall signaling server,
 * listens for patient audio, runs STT → AI → TTS, emits ai-audio back.
 */

import { io, Socket } from 'socket.io-client';
import { transcribeAudio } from './stt.js';
import { generateDoctorResponse } from './aiDoctor.js';
import { generateSpeech } from './tts.js';

const SIGNALING_URL = process.env.VIDEOCALL_URL ?? 'http://localhost:4000';
const AI_DOCTOR_USER_ID = 'ai-doctor';

let socket: Socket | null = null;
let currentRoomId: string | null = null;
let currentSessionId: string | null = null;
let isProcessing = false;
let pendingPayload: unknown = null;

function getSocket(): Socket {
  if (!socket || !socket.connected) {
    socket = io(SIGNALING_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socket.on('connect', () => {
      console.log('[AI Doctor] Connected to signaling server:', SIGNALING_URL);
    });
    socket.on('disconnect', (reason) => {
      console.log('[AI Doctor] Disconnected:', reason);
      currentRoomId = null;
      currentSessionId = null;
    });
    socket.on('connect_error', (err) => {
      console.error('[AI Doctor] Connection error:', err.message);
    });
  }
  return socket;
}

function getAudioBuffer(payload: unknown): Buffer | null {
  if (Buffer.isBuffer(payload)) return payload;
  if (payload && typeof payload === 'object' && 'audio' in payload) {
    const a = (payload as { audio: string | Buffer }).audio;
    if (typeof a === 'string') return Buffer.from(a, 'base64');
    if (Buffer.isBuffer(a)) return a;
  }
  return null;
}

async function handlePatientAudio(payload: unknown): Promise<void> {
  if (isProcessing) {
    pendingPayload = payload;
    console.log('[AI Doctor] Busy — queued incoming patient-audio chunk');
    return;
  }

  const roomId = currentRoomId;
  const sessionId = currentSessionId;
  if (!roomId || !sessionId) {
    console.log('[AI Doctor] (skip) No roomId or sessionId');
    return;
  }

  const audioBuffer = getAudioBuffer(payload);
  if (!audioBuffer || audioBuffer.length === 0) {
    console.log('[AI Doctor] (skip) No audio buffer or empty, payload keys:', payload && typeof payload === 'object' ? Object.keys(payload as object) : 'n/a');
    return;
  }

  console.log('[AI Doctor] Incoming patient-audio chunk size:', audioBuffer.length, 'bytes');

  isProcessing = true;
  try {
    const text = await transcribeAudio(audioBuffer);
    console.log('[AI Doctor] User said (STT transcript):', text || '(empty)');
    if (!text.trim()) {
      console.log('[AI Doctor] (skip) Empty transcript — not replying');
      return;
    }

    const response = await generateDoctorResponse(sessionId, text);
    console.log('[AI Doctor] AI text response:', response || '(empty)');
    if (!response.trim()) {
      console.log('[AI Doctor] (skip) Empty AI response — not replying');
      return;
    }

    const audio = await generateSpeech(response);
    console.log('[AI Doctor] TTS audio chunk size:', audio.length, 'bytes');
    if (audio.length === 0) {
      console.log('[AI Doctor] (skip) Empty TTS audio — not replying');
      return;
    }

    const s = getSocket();
    const base64Audio = audio.toString('base64');
    s.emit('ai-audio', { roomId, audio: base64Audio });
    console.log('[AI Doctor] Emitted ai-audio to room', roomId, '(', base64Audio.length, 'chars base64 )');
  } catch (err) {
    console.error('[AI Doctor] Pipeline error:', err);
  } finally {
    isProcessing = false;
    if (pendingPayload !== null) {
      const next = pendingPayload;
      pendingPayload = null;
      console.log('[AI Doctor] Processing queued patient-audio chunk');
      setImmediate(() => handlePatientAudio(next));
    }
  }
}

/**
 * Join a videocall room as the AI doctor. Listens for patient-audio and
 * responds with ai-audio (STT → AI → TTS).
 */
export function joinRoom(sessionId: string, roomId: string): void {
  const s = getSocket();
  currentSessionId = sessionId;
  currentRoomId = roomId;

  s.off('patient-audio');
  s.on('patient-audio', handlePatientAudio);

  s.emit('join-room', roomId, `${AI_DOCTOR_USER_ID}-${sessionId}`);
  console.log('[AI Doctor] Joined room', roomId, 'for session', sessionId);
}

/**
 * Disconnect from the signaling server and clear room/session state.
 */
export function disconnect(): void {
  if (socket) {
    socket.off('patient-audio');
    socket.disconnect();
    socket = null;
  }
  currentRoomId = null;
  currentSessionId = null;
}
