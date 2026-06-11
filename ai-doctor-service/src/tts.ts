/**
 * Text-to-Speech using OpenAI TTS (gpt-4o-mini-tts).
 */

import { openai } from './openai.js';

const TTS_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_VOICE = 'alloy';

/**
 * Generates speech from text using OpenAI TTS.
 * @param text - Text to convert to speech.
 * @returns Audio buffer (MP3 by default), or empty buffer if generation fails or client is not configured.
 */
export async function generateSpeech(text: string): Promise<Buffer> {
  if (!openai || !text.trim()) return Buffer.from([]);

  try {
    const response = await openai.audio.speech.create({
      model: TTS_MODEL,
      voice: DEFAULT_VOICE,
      input: text,
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return Buffer.from([]);
  }
}
