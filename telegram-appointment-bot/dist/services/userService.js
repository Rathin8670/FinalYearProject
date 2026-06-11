"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkTelegramToUser = linkTelegramToUser;
const env_1 = require("../config/env");
async function linkTelegramToUser(params) {
    try {
        const res = await fetch(`${env_1.env.USER_SERVICE_BASE_URL}/api/telegram/link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: params.token,
                telegramId: String(params.telegramId),
                telegramUsername: params.telegramUsername
            })
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
            return {
                ok: false,
                message: data.message || "Linking failed"
            };
        }
        return {
            ok: true,
            user: data.user
        };
    }
    catch (err) {
        return { ok: false, message: "Failed to reach CarePulse API" };
    }
}
