import Redis from "ioredis";
import { env } from "../config/env";

export type Stage =
  | "NEW"
  | "AUTHENTICATED"
  | "WAITING_FOR_APPOINTMENT_DETAILS"
  | "WAITING_FOR_DOCTOR_CONFIRMATION";

export interface PendingBooking {
  doctorName?: string;
  date?: string;
  time?: string;
  // If we found a candidate but need confirmation, store it here
  suggestedDoctor?: {
    id: string;
    name: string;
  };
}

export interface TgSession {
  userId: number;              // Telegram user ID
  stage: Stage;
  pendingBooking?: PendingBooking;
  lastUpdated: number;
}

const redis = new Redis(env.REDIS_URL);
const PREFIX = "tg-session:";

export async function getSession(userId: number): Promise<TgSession | null> {
  const raw = await redis.get(PREFIX + userId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TgSession;
  } catch {
    await redis.del(PREFIX + userId);
    return null;
  }
}

export async function saveSession(session: TgSession): Promise<void> {
  session.lastUpdated = Date.now();
  await redis.set(PREFIX + session.userId, JSON.stringify(session), "EX", 60 * 60 * 6);
}

export async function ensureSession(userId: number): Promise<TgSession> {
  const existing = await getSession(userId);
  if (existing) return existing;
  const session: TgSession = {
    userId,
    stage: "NEW",
    lastUpdated: Date.now()
  };
  await saveSession(session);
  return session;
}
