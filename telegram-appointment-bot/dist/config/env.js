"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
    REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    OPENAI_INTENT_MODEL: process.env.OPENAI_INTENT_MODEL ?? "gpt-4o-mini",
    APPOINTMENT_SERVICE_BASE_URL: process.env.APPOINTMENT_SERVICE_BASE_URL ?? "http://localhost:5000",
    APPOINTMENT_BOOKING_ENDPOINT: process.env.APPOINTMENT_BOOKING_ENDPOINT ?? "/api/appointments",
    BACKEND_AUTH_TOKEN: process.env.BACKEND_AUTH_TOKEN ?? "",
    USER_SERVICE_BASE_URL: process.env.USER_SERVICE_BASE_URL ?? process.env.APPOINTMENT_SERVICE_BASE_URL ?? "http://localhost:5000"
};
if (!exports.env.TELEGRAM_BOT_TOKEN) {
    console.error("[env] TELEGRAM_BOT_TOKEN missing");
}
if (!exports.env.OPENAI_API_KEY) {
    console.warn("[env] OPENAI_API_KEY missing – intent extraction will not work");
}
if (!exports.env.BACKEND_AUTH_TOKEN) {
    console.warn("[env] BACKEND_AUTH_TOKEN missing – real booking will fail (401)");
}
