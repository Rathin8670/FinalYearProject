# CarePulse Frontend

This is the main frontend application for the CarePulse telemedicine platform. Built with Next.js 14, it serves as the primary interface for patients, doctors, and administrators.

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Radix Primitives)
- **Animations:** Framer Motion, GSAP
- **State/Data Fetching:** TanStack Query (React Query)
- **Icons:** Lucide React

## ✨ Features

- **Landing Page:** Modern, animated landing page showcasing platform features.
- **Authentication:** JWT-based auth with secure context management.
- **Patient Dashboard:**
  - View upcoming appointments
  - Book new appointments with doctors
  - View stats (Scheduled, Pending, Cancelled)
  - Join video calls directly
  - Link Telegram account (QR/Code generation)
- **Doctor Dashboard:**
  - View daily schedule
  - Manage appointment requests (Accept/Cancel)
  - Start video calls
  - View patient history
- **Admin Features:**
  - Register new doctors
- **Video Call Integration:** Seamless redirect to the video call service.
- **AI Integration:** Floating AI assistant widget for checkups.

## 🛠️ Setup & Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env.local` file in the root of `apps/web`:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(auth)/`: Authentication routes (signin, signup).
  - `dashboard/`: Protected dashboard views.
- `components/`: Reusable UI components.
  - `ui/`: Base Shadcn UI components.
  - `home/`: Landing page sections.
  - `layout/`: Header, Footer, etc.
- `lib/`: Utilities and API definitions (`api.ts`).
- `contexts/`: React Contexts (AuthContext).

## 🔗 Key Integrations

- **Backend API:** Connects to `http://localhost:5000` for all data operations.
- **Telegram:** Generates link tokens to connect to the Telegram bot.
- **Video Service:** Redirects users to `http://localhost:4000/join/...` with signed tokens.
