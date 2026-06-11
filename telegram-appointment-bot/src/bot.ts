import { Telegraf } from "telegraf";
import { env } from "./config/env";
import { ensureSession, saveSession, TgSession } from "./services/sessionService";
import { extractIntent } from "./services/intentService";
import { bookAppointment, findDoctorByQuery } from "./services/appointmentService";
import { log } from "./utils/logger";

export function createBot() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not set");
  }

  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  bot.start(async (ctx) => {
    const userId = ctx.from!.id;
    let session: TgSession = await ensureSession(userId);

    session.stage = "AUTHENTICATED";
    await saveSession(session);

    await ctx.reply(
      "Hi, I'm CarePulse Assistant 🤖\n" +
      "I can help you book doctor appointments via Telegram.\n\n" +
      "Use /appointment to book an appointment."
    );
  });

  bot.command("appointment", async (ctx) => {
    const userId = ctx.from!.id;
    const session = await ensureSession(userId);

    if (session.stage !== "AUTHENTICATED" && session.stage !== "WAITING_FOR_APPOINTMENT_DETAILS") {
        // Allow restarting if stuck in confirmation
        // But ideally strict auth first
    }

    session.stage = "WAITING_FOR_APPOINTMENT_DETAILS";
    session.pendingBooking = {};
    await saveSession(session);

    await ctx.reply(
      "Please describe your appointment, for example:\n" +
      `"I want an appointment with Doc 1 on 11 Dec at 11am".`
    );
  });

  bot.on("text", async (ctx) => {
    const userId = ctx.from!.id;
    const text = ctx.message.text.trim();
    let session = await ensureSession(userId);

    // 1. Handle Doctor Confirmation Flow
    if (session.stage === "WAITING_FOR_DOCTOR_CONFIRMATION") {
        const lower = text.toLowerCase();
        if (lower === "yes" || lower === "y" || lower === "yeah") {
            // CONFIRMED
            const doctor = session.pendingBooking?.suggestedDoctor;
            if (doctor) {
                // Proceed to book with suggested doctor
                await finalizeBooking(ctx, userId, session, doctor.id, doctor.name);
            } else {
                await ctx.reply("Session error. Please start over with /appointment.");
                session.stage = "AUTHENTICATED";
                await saveSession(session);
            }
            return;
        } else {
            // REJECTED
            session.stage = "WAITING_FOR_APPOINTMENT_DETAILS";
            session.pendingBooking = {}; // clear
            await saveSession(session);
            await ctx.reply("Okay, let's try again. Please type the full appointment details (Doctor, Date, Time).");
            return;
        }
    }

    // 2. Handle Appointment Details (Normal Flow)
    if (session.stage === "WAITING_FOR_APPOINTMENT_DETAILS") {
      await handleAppointmentDetails(ctx, session, text);
      return;
    }

    if (text.startsWith("/")) return;

    await ctx.reply("Use /appointment to start booking.");
  });

  return bot;
}

async function handleAppointmentDetails(ctx: any, session: TgSession, text: string) {
  const userId = session.userId;

  // -- (Logic for slot suggestions logic omitted for brevity, assuming standard flow) --
  // If we had slot suggestions, we'd handle them here (omitted to keep diff clean)
  
  await ctx.reply("Let me check availability for that…");

  const intent = await extractIntent(text);
  if (intent.type !== "BOOK_APPOINTMENT") {
    await ctx.reply("I couldn't understand that. Try: \"Appointment with Doc 1 on 12th Dec at 10am\"");
    return;
  }

  const { doctorName, date, time } = intent;

  if (!doctorName || !date || !time) {
    await ctx.reply("Missing details. I need Doctor Name, Date, and Time.");
    return;
  }

  // >>> DYNAMIC DOCTOR LOOKUP WITH AI <<<
  const matchResult = await findDoctorByQuery(doctorName);

  if (matchResult.type === "NONE") {
      await ctx.reply(`I couldn't find any doctor named "${doctorName}". Please check the spelling.`);
      return;
  }

  if (matchResult.type === "SUGGESTION") {
      // Ask for confirmation
      const suggestedName = matchResult.doctor.name;
      await ctx.reply(`I couldn't find "${doctorName}", but I found "${suggestedName}". Did you mean ${suggestedName}? (Yes/No)`);
      
      // Store state
      session.stage = "WAITING_FOR_DOCTOR_CONFIRMATION";
      session.pendingBooking = {
          doctorName, // original
          date,
          time,
          suggestedDoctor: matchResult.doctor
      };
      await saveSession(session);
      return;
  }

  // EXACT MATCH
  await finalizeBooking(ctx, userId, session, matchResult.doctor.id, matchResult.doctor.name, date, time);
}

// Helper to actually call the booking API
async function finalizeBooking(ctx: any, userId: number, session: TgSession, doctorId: string, doctorName: string, dateOverride?: string, timeOverride?: string) {
    const date = dateOverride || session.pendingBooking?.date;
    const time = timeOverride || session.pendingBooking?.time;

    if (!date || !time) {
        await ctx.reply("Error: Missing date/time in session. Please start over.");
        return;
    }

    const result = await bookAppointment({
        patientId: userId,
        doctorId,
        date,
        time
    });

    if (result.ok) {
        session.stage = "AUTHENTICATED";
        session.pendingBooking = undefined;
        await saveSession(session);
        await ctx.reply(
            `✅ Appointment confirmed!\n` +
            `Doctor: ${result.doctorName}\n` +
            `Date: ${result.date}\n` +
            `Time: ${result.time}\n` +
            `ID: ${result.appointmentId}`
        );
    } else if (result.reason === "SLOT_UNAVAILABLE") {
        // ... (existing slot logic)
        const slots = result.availableSlots || [];
         await ctx.reply(
            `⛔ Slot unavailable for ${doctorName}.\n` +
            (slots.length ? `Try: ${slots.join(", ")}` : "No slots open.")
        );
        // Could enable "choose slot" flow here (omitted for brevity)
    } else {
        await ctx.reply(`❌ Booking failed: ${result.message}`);
    }
}
