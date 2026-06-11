# CarePulse Telegram Assistant 🤖

An intelligent Telegram bot that allows patients to manage their healthcare on the go. It uses OpenAI to parse natural language requests and integrates directly with the CarePulse backend.

## 🚀 Tech Stack

- **Framework:** Telegraf (Telegram Bot API)
- **AI:** OpenAI GPT-4o-mini (Intent Classification & entity extraction)
- **Language:** TypeScript
- **Integration:** Axios (Validation with Main Backend)

## ✨ Features

- **Account Linking:**
  - Securely link Telegram account to CarePulse web profile using a unique token (`/link <token>`).
- **AI Appointment Booking:**
  - Natural language scheduling (e.g., "Book a dentist appointment next Tuesday at 10am").
  - Automatically identifies specialization and time preferences.
  - Suggests available doctors.
- **Appointment Management:**
  - View upcoming appointments.
  - Cancel appointments via chat.

## 🛠️ Setup & Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file:
    ```env
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    OPENAI_API_KEY=your_openai_key
    BACKEND_URL=http://localhost:5000/api
    BACKEND_AUTH_TOKEN=your_backend_internal_token
    ```

3.  **Run Bot:**
    ```bash
    npm run dev
    ```

## 🤖 Commands

- `/start` - Welcome message & instructions.
- `/link <code>` - Link your CarePulse account.
- `/appointment` - Start the AI-driven booking flow.
- `/cancel` - Cancel an existing appointment.
- `/help` - Show available commands.

## 🧠 AI Logic

The bot uses a dedicated `IntentService` to analyze user messages. It determines if the user wants to book, cancel, or just query info, and extracts relevant entities (Date, Time, Doctor Specialization) to query the backend API.
