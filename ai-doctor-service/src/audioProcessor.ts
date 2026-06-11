/**
 * Pipeline: audio buffer → STT → AI doctor → TTS → audio buffer.
 */

import { transcribeAudio } from './stt.js';
import { generateDoctorResponse } from './aiDoctor.js';
import { generateSpeech } from './tts.js';

/**
 * Process incoming audio: transcribe → AI response → TTS.
 * @param sessionId - Conversation session for memory.
 * @param audioBuffer - Raw audio from the user.
 * @returns TTS audio buffer, or empty buffer if any step fails.
 */
export async function processAudio(
  sessionId: string,
  audioBuffer: Buffer
): Promise<Buffer> {
  const start = Date.now();

  const transcript = await transcribeAudio(audioBuffer);
  console.log('[audioProcessor] transcript:', transcript || '(empty)');

  if (!transcript.trim()) {
    console.log('[audioProcessor] processing time:', Date.now() - start, 'ms');
    return Buffer.from([]);
  }

  const aiResponse = await generateDoctorResponse(sessionId, transcript);
  console.log('[audioProcessor] AI response:', aiResponse);

  const audio = await generateSpeech(aiResponse);

  const elapsed = Date.now() - start;
  console.log('[audioProcessor] processing time:', elapsed, 'ms');

  return audio;
}
