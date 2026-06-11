/**
 * Speech-to-Text using OpenAI Whisper API (whisper-1).
 */

import { openai } from './openai.js';

/**
 * Transcribes raw audio buffer to text using OpenAI Whisper.
 * @param audioBuffer - Raw audio bytes (e.g. webm, mp3, wav, m4a).
 * @returns Transcript text, or empty string if transcription fails or client is not configured.
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  if (!openai) return '';

  try {
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language: 'en',
    });
    return transcription.text ?? '';
  } catch (err) {
    console.error('[AI Doctor] STT (Whisper) error:', err);
    return '';
  }
}
