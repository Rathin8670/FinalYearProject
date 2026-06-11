"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.saveSession = saveSession;
exports.ensureSession = ensureSession;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const redis = new ioredis_1.default(env_1.env.REDIS_URL);
const PREFIX = "tg-session:";
async function getSession(userId) {
    const raw = await redis.get(PREFIX + userId);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        await redis.del(PREFIX + userId);
        return null;
    }
}
async function saveSession(session) {
    session.lastUpdated = Date.now();
    await redis.set(PREFIX + session.userId, JSON.stringify(session), "EX", 60 * 60 * 6);
}
async function ensureSession(userId) {
    const existing = await getSession(userId);
    if (existing)
        return existing;
    const session = {
        userId,
        stage: "NEW",
        lastUpdated: Date.now()
    };
    await saveSession(session);
    return session;
}
