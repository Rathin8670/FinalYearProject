"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const logger_1 = require("./utils/logger");
async function main() {
    const bot = (0, bot_1.createBot)();
    // Long polling for now (simpler for dev).
    await bot.launch();
    logger_1.log.info("telegram-appointment-bot is running (long polling)");
    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
main().catch((err) => {
    logger_1.log.error("Fatal error starting bot:", err);
    process.exit(1);
});
