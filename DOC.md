# CarePulse Telemedicine Platform - Technical Architecture Document

## 1. Introduction

**CarePulse** is a modern telemedicine platform designed to bridge the gap between patients and healthcare providers through seamless digital interactions. It addresses the need for accessible, remote healthcare by enabling users to find doctors, book appointments, and conduct video consultations from a single interface.

### Product Goals
*   **Accessibility:** Provide a unified web interface and Telegram bot for easy appointment booking.
*   **Efficiency:** Streamline the scheduling process with real-time availability and conflict detection.
*   **Remote Care:** Facilitate high-quality video consultations directly within the browser.
*   **AI Support:** Enhance the user experience with an AI assistant that can interpret medical jargon and summarize reports.

### Non-Goals
*   **Full EMR/EHR:** While it stores appointment history and basic notes, CarePulse is not currently designed to replace a full-fledged Electronic Medical Record system for hospitals.

---

## 2. High-Level Architecture

CarePulse follows a **microservices-inspired architecture**, composing specialized services that communicate over HTTP/REST. The system relies on a central Backend API for core business logic, while offloading specific real-time and heavy tasks (like video signaling and Telegram polling) to dedicated sidecar services.

### System Diagram Description
*   **Frontend (Next.js):** The primary entry point for web users. It renders the UI, manages authentication state, and communicates with the backend APIs.
*   **Backend API (Express/Node):** The central nervous system. It routes requests, enforces authentication, and orchestrates data modifications in MongoDB.
*   **Video Service (Node):** A dedicated service for managing video call sessions. It abstracts the complexity of WebRTC signaling or provider integration.
*   **Telegram Bot (Telegraf):** A standalone process that polls Telegram for messages, utilizing the Backend API to perform booking actions on behalf of linked users.
*   **Database (MongoDB):** The single source of truth for Users, Doctors, and Appointments.
*   **Cache (Redis):** Used for session management or transient state (implied for scalable deployments).

---

## 3. Microservices Overview

| Service | Responsibilities | Tech Stack | Inputs/Outputs |
| :--- | :--- | :--- | :--- |
| **Auth Service** | Login, Signup, Token Management (JWT) | Node.js, Express, JWT | JSON Credentials / Access & Refresh Tokens |
| **User Service** | Profile management, Role checks | Node.js, Express | User ID / User Profile Data |
| **Doctor Service** | Doctor profiles, Specialization, Availability | Node.js, Express | Search Filters / Doctor List object |
| **Appointment Service** | Scheduling, Conflict detection, Status updates | Node.js, Express | Booking Request / Appointment Object |
| **Video Call Service** | Session creation, Token generation, Signaling | Node.js (Custom) | Appointment ID / Join URL & Session ID |
| **AI Assistant Service** | Contextual Chat, Medical Summarization | Node.js, OpenAI API | Text & Files / Analyzed Response |
| **Telegram Agent** | Chat interface, Intent extraction via LLM | Node.js, Telegraf | Natural Language / Booking Confirmation |

---

## 4. Detailed Service Design

### 4.1. Auth Service
*   **Responsibilities:** Validating credentials, issuing short-lived Access Tokens and long-lived Refresh Tokens.
*   **Logic:**
    *   **Signup:** Hashes password using `bcrypt` before storage.
    *   **Login:** Validates hash, signs JWT with `HS256`.
    *   **Middleware:** `authenticateToken` validates the `Authorization: Bearer <token>` header on protected routes.

### 4.2. Appointment Service
*   **Core Logic:**
    *   **Conflict Detection:** Before creation, it checks `Order.findOne({ doctor: id, date: dt, status: { $in: ['pending', 'scheduled'] } })`.
    *   **Ownership:** Ensures patients can only view/modify their own appointments (unless Admin).
    *   **Video Linkage:** Calls the Video Service to generate a room when a doctor "Starts" the call, storing the `videoMeetingId` and `videoCallLink` on the appointment.
*   **API:**
    *   `POST /appointments`: Create new booking.
    *   `GET /appointments?scope=doctor`: Get doctor's schedule.
    *   `POST /{id}/start-call`: Trigger video session creation.

### 4.3. Video Call Service
*   **Responsibilities:** Managing the lifecycle of a video session. It is decoupled from the main backend to allow independent scaling of WebSocket/Signaling connections.
*   **Internal Flow:**
    1.  Backend requests `POST /sessions` with `appointmentId`, `doctorId`, `patientId`.
    2.  Video Service creates a session record and returns a `sessionId`.
    3.  Backend requests `POST /sessions/{id}/join` with a `role` (host/participant).
    4.  Video Service returns a specialized `joinUrl` that the frontend opens in a new window/tab.

### 4.4. Telegram Agent Service
*   **State Machine:**
    *   `NEW`: User starts bot.
    *   `AUTHENTICATED`: User has successfully linked their Telegram ID to a CarePulse User via `/link`.
    *   `WAITING_FOR_APPOINTMENT_DETAILS`: Bot is listening for natural language booking requests.
    *   `WAITING_FOR_DOCTOR_CONFIRMATION`: Ambiguous doctor name requires user selection.
*   **Integration:**
    *   Uses a dedicated `BACKEND_AUTH_TOKEN` (system-to-system) to authenticate calls to the core Backend API.
    *   Uses OpenAI to parse "Book with Dr. Smith tomorrow at 10am" into structured JSON: `{ doctorName: "Smith", date: "YYYY-MM-DD", time: "HH:mm" }`.

---

## 5. Data Persistence & Schema Design

### 5.1. MongoDB Collections

**`users`**
```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "enum['patient', 'doctor', 'admin']",
  "telegramId": "string (sparse index)",
  "refreshToken": "string"
}
```

**`doctors`**
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "specialization": "string",
  "consultationFee": "number",
  "videoCallEnabled": "boolean",
  "availability": {
    "monday": { "available": "boolean", "startTime": "HH:mm", "endTime": "HH:mm" },
    ...
  }
}
```

**`appointments`**
```json
{
  "_id": "ObjectId",
  "patient": "ObjectId (ref: User)",
  "doctor": "ObjectId (ref: Doctor)",
  "appointmentDate": "Date",
  "appointmentTime": "string",
  "status": "enum['pending', 'scheduled', 'cancelled', 'completed']",
  "videoMeetingId": "string",
  "videoCallLink": "string" // Cached for UI display
}
```
*   **Indexes:**
    *   Compound index on `{ doctor: 1, appointmentDate: -1 }` for quick schedule lookups.
    *   Index on `{ patient: 1 }` for user history.

---

## 6. Authentication & Authorization

*   **Strategy:** Dual-token JWT (Access + Refresh).
*   **Frontend Storage:** Tokens stored in `localStorage` (via `lib/api.ts`).
*   **Bot Auth:** The Telegram bot uses a static system token (API Key pattern) stored in environment variables to bypass user-level login when performing system lookups, but acts on behalf of the `telegramId`-linked user for bookings.
*   **Role-Based Access Control (RBAC):**
    *   **Patient:** Can create appointments, view own history.
    *   **Doctor:** Can view assigned appointments, start calls, update availability.
    *   **Admin:** Full read/write access.

---

## 7. AI Features Design

### 7.1. Web AI Assistant
*   **Architecture:** Frontend FAB component ➔ Next.js API Route ➔ OpenAI API.
*   **Capabilities:**
    *   **Medical Report Analysis:** Users upload PDF/Image. Server extracts text (OCR) and prompts LLM: "Summarize this medical report for a layman, highlighting critical values."
    *   **Prescription Summary:** Extracts medicine names and dosages.
*   **Safety:** System prompt includes: "You are a helpful assistant. Do not provide medical diagnoses. Always advise consulting a doctor."

### 7.2. Telegram Intent Extraction
*   **Model:** GPT-4o-mini (or similar fast model).
*   **Prompt Strategy:** "Extract entities: Doctor Name, Date (convert relative 'tomorrow' to YYYY-MM-DD based on today's date), Time. Return JSON only."
*   **Fallback:** If extraction fails or data is missing, the bot enters a clarification loop asking specifically for the missing field.

---

## 8. Video Call Architecture

*   **Provider:** Internal Custom Provider (Node.js).
*   **Flow:**
    1.  Doctor clicks **Start Call** on Dashboard.
    2.  `AppointmentService` verifies Doctor ownership.
    3.  Calls `VideoService` ➔ Generates `sessionId`.
    4.  Returns `joinUrl` to Doctor.
    5.  Database updates `Appointment.videoMeetingId`.
    6.  Patient clicks **Join Call**.
    7.  `AppointmentService` verifies Patient ownership.
    8.  Calls `VideoService` to get participant token/URL for that `sessionId`.
*   **Security:** Join URLs are signed or uniquely generated per participant role to prevent unauthorized access.

---

## 9. Telegram Appointment Agent Flow

1.  **User:** `/start`
2.  **Bot:** "Please link your account using `/link <CODE>` available in your web profile."
3.  **User:** `/link 123456`
    *   **Bot:** Calls Backend API to link `telegramId` to User with code `123456`.
4.  **User:** `/appointment I need to see Dr. John on Friday at 2pm`
5.  **Bot (Internal):**
    *   Calls OpenAI Intent API.
    *   Receives: `{ "doctorName": "John", "date": "2025-12-12", "time": "14:00" }`.
    *   Calls Backend `GET /doctors/search?name=John`.
    *   **Match Found:** Calls `POST /appointments` with linked `patientId`.
6.  **Bot:** "Appointment request sent! Status: Pending."

---

## 10. Scalability & Performance

*   **Stateless Services:** All backend services (Auth, User, Appointment) are stateless HTTP servers. They can be horizontally scaled behind a load balancer (e.g., Nginx or Cloud Load Balancer).
*   **Database:** MongoDB can be scaled via Replica Sets for read-heavy loads.
*   **Optimistic Locking:** Appointment booking uses Mongoose atomic checks to ensure two users don't book the same doctor slot simultaneously.

---

## 11. Reliability & Observability

*   **Health Checks:** All services expose a GET `/health` endpoint returning `200 OK`.
*   **Logging:** Centralized logging (console/stdout) captured by process managers (PM2 or Docker logs).
*   **Graceful Degradation:** If the AI Service is down, the Telegram bot falls back to a structured menu-based input flow instead of natural language processing.

---

## 12. Security Considerations

*   **Environment Variables:** Strictly used for all secrets (`JWT_SECRET`, `OPENAI_API_KEY`, `DB_CONNECTION_STRING`).
*   **Input Validation:** Mongoose schemas strictly define data types (e.g., Enums for status, Date objects for time).
*   **CORS:** Configured to allow requests only from the trusted Frontend domain.
*   **Password Security:** `bcrypt` with 10 salt rounds used for all user passwords.

---

## 13. Deployment & DevOps

*   **Docker:** Each microservice has a `Dockerfile`.
*   **Orchestration:** `docker-compose.yml` is used for local development to spin up:
    *   `mongo`
    *   `backend`
    *   `web`
    *   `videocall`
    *   `bot`
*   **CI/CD:** GitHub Actions pipeline (recommended) to run linting and build steps on push to `main`.

---

## 14. Failure Scenarios

*   **Video Service Unavailable:**
    *   User sees error toast "Unable to start call".
    *   Doctor is advised to refresh or use fallback phone contact stored in profile.
*   **AI Service Latency/Timeout:**
    *   Web UI shows "Analyzing..." spinner with a timeout message "AI is busy, please try again later" after 10s.
*   **Database Connection Loss:**
    *   API returns `503 Service Unavailable`. Frontend displays a "System Maintenance" page.

---

## 15. Future Roadmap

1.  **Notification Microservice:** Decoupling email (SendGrid) and SMS (Twilio) logic from the main backend into a dedicated queue-based worker.
2.  **Payment Integration:** Integrating Stripe for pre-payment of consultation fees before booking confirmation.
3.  **Mobile App:** Native React Native app consuming the same REST APIs.
4.  **Advanced Availability:** allowing doctors to set recurring weekly schedules and exception days (vacation mode).

---

## 16. Appendix: Example JSON Payloads

**Booking Intent (LLM Output)**
```json
{
  "type": "BOOK_APPOINTMENT",
  "doctorName": "Emily Stone",
  "date": "2025-10-15",
  "time": "14:30"
}
```

**Doctor Availability Object**
```json
{
  "monday": { 
    "available": true, 
    "startTime": "09:00", 
    "endTime": "17:00" 
  }
}
```
