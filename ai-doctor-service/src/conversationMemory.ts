/**
 * In-memory conversation history per session in OpenAI chat format.
 */

const MAX_MESSAGES = 20;

export type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'system'; content: string };

const sessions = new Map<string, ChatMessage[]>();

function trimToLimit(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_MESSAGES) return messages;
  return messages.slice(-MAX_MESSAGES);
}

export function addUserMessage(sessionId: string, message: string): void {
  const history = sessions.get(sessionId) ?? [];
  history.push({ role: 'user', content: message });
  sessions.set(sessionId, trimToLimit(history));
}

export function addAssistantMessage(sessionId: string, message: string): void {
  const history = sessions.get(sessionId) ?? [];
  history.push({ role: 'assistant', content: message });
  sessions.set(sessionId, trimToLimit(history));
}

export function getConversation(sessionId: string): ChatMessage[] {
  const history = sessions.get(sessionId) ?? [];
  return history.length <= MAX_MESSAGES ? history : history.slice(-MAX_MESSAGES);
}
