import { createBot } from "./bot";
import { log } from "./utils/logger";

async function main() {
  const bot = createBot();

  // Long polling for now (simpler for dev).
  await bot.launch();
  log.info("telegram-appointment-bot is running (long polling)");

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main().catch((err) => {
  log.error("Fatal error starting bot:", err);
  process.exit(1);
});
