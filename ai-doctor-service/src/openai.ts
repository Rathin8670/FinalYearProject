/**
 * OpenAI client for AI doctor responses.
 * Uses OPENAI_API_KEY from environment (dotenv).
 */

import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openai: OpenAI | null = apiKey ? new OpenAI({ apiKey }) : null;

export function isOpenAIConfigured(): boolean {
  return openai !== null;
}
