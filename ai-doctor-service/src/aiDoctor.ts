/**
 * AI doctor: generates responses using GPT-4o with conversation memory.
 */

import { openai } from './openai.js';
import {
  addUserMessage,
  addAssistantMessage,
  getConversation,
} from './conversationMemory.js';

const MODEL = 'gpt-4o';

const SYSTEM_PROMPT =
  'You are an AI doctor conducting a voice-based telemedicine consultation. ' +
  'IMPORTANT RULES: ' +
  '1. Keep every response under 2-3 sentences maximum. ' +
  '2. Ask only ONE follow-up question at a time, never multiple. ' +
  '3. Be conversational and concise — this is a live voice call, not a written report. ' +
  '4. Never use bullet points, numbered lists, or markdown formatting. ' +
  '5. Speak naturally as if talking to a patient in person. ' +
  '6. Never give dangerous medical instructions. ' +
  '7. Always respond in English only, regardless of the language the patient uses. ' +
  '8. If the patient input is very short (one or two words like "you", "yes", "okay", "thank you"), ' +
  'wait for more context before asking a new question — just acknowledge briefly.';
    
export async function generateDoctorResponse(
  sessionId: string,
  userMessage: string
): Promise<string> {
  addUserMessage(sessionId, userMessage);

  if (!openai) {
    return 'AI is not configured. Please try again later.';
  }

  try {
    const history = getConversation(sessionId);
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
    });

    const content =
      completion.choices[0]?.message?.content?.trim() ??
      'I could not generate a response. Please try again.';

    addAssistantMessage(sessionId, content);
    return content;
  } catch {
    return 'Something went wrong. Please try again.';
  }
}
