"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIntent = extractIntent;
exports.findClosestDoctor = findClosestDoctor;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const client = new openai_1.default({ apiKey: env_1.env.OPENAI_API_KEY });
const SYSTEM_PROMPT = `
You are an intent extraction engine for a Telegram bot that books doctor appointments.
Your ONLY job is to convert a single user sentence into JSON.

If the user wants to book an appointment, respond with:

{
  "type": "BOOK_APPOINTMENT",
  "doctorName": "<name or null>",
  "date": "<YYYY-MM-DD or null>",
  "time": "<HH:MM 24h format or null>"
}

If you cannot confidently detect a booking intent, respond with:

{ "type": "UNKNOWN" }

Today's date is provided. Support expressions like "tomorrow", "next monday", etc.
In those cases, compute the actual date.
Return STRICT JSON. No comments, no extra fields.
`;
async function extractIntent(message, now = new Date()) {
    if (!env_1.env.OPENAI_API_KEY)
        return { type: "UNKNOWN" };
    const today = now.toISOString().slice(0, 10);
    const userPrompt = `
Today is ${today}.
User message: "${message}"
Return JSON only.
`;
    try {
        const completion = await client.chat.completions.create({
            model: env_1.env.OPENAI_INTENT_MODEL,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            temperature: 0
        });
        const content = completion.choices[0]?.message?.content?.trim() ?? "";
        try {
            const parsed = JSON.parse(content);
            if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
                return { type: "UNKNOWN" };
            }
            return parsed;
        }
        catch (err) {
            logger_1.log.error("Failed to parse intent JSON:", content, err);
            return { type: "UNKNOWN" };
        }
    }
    catch (err) {
        logger_1.log.error("OpenAI error:", err);
        return { type: "UNKNOWN" };
    }
}
async function findClosestDoctor(query, doctorNames) {
    const prompt = `
You are a helpful assistant.
User searched for: "${query}"
Available Doctors: ${JSON.stringify(doctorNames)}

Which doctor from the list is the user most likely referring to?
If there is a reasonable match (even with typos or partial names), return ONLY the exact name from the list.
If no reasonable match found, return "null".
`;
    try {
        const completion = await client.chat.completions.create({
            model: env_1.env.OPENAI_INTENT_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0
        });
        const result = completion.choices[0]?.message?.content?.trim();
        if (!result || result === "null" || result === "None")
            return null;
        // Verify it exists in the list to be safe
        if (doctorNames.includes(result)) {
            return result;
        }
        // Clean up quotes if AI added them
        const cleaned = result.replace(/^"|"$/g, '');
        if (doctorNames.includes(cleaned))
            return cleaned;
        return null;
    }
    catch (e) {
        logger_1.log.error("AI Doctor Match Error:", e);
        return null;
    }
}
