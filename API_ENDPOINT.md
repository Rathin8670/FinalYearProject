# CarePulse API Endpoints

This document lists all the API endpoints exposed by the various microservices in the CarePulse platform.

## 1. Backend Service (Express)
**Base URL:** `http://localhost:5000/api`

### **Authentication** (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Register a new user (Patient). | No |
| `POST` | `/signin` | Log in and receive access/refresh tokens. | No |
| `POST` | `/signout` | Invalidate refresh token. | Yes |

### **Doctors** (`/doctors`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieve all doctors. | No |
| `GET` | `/search` | Search doctors by name or specialization. | No |
| `GET` | `/:id` | Get details of a specific doctor. | No |
| `POST` | `/` | Create a new doctor profile (Admin only/Internal). | Yes |

### **Appointments** (`/appointments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Book a new appointment. | Yes |
| `GET` | `/` | Get appointments for the logged-in user (or doctor). | Yes |
| `GET` | `/:id` | Get details of a specific appointment. | Yes |
| `PATCH` | `/:id` | Update appointment status or notes. | Yes |
| `DELETE` | `/:id` | Delete an appointment. | Yes |
| `POST` | `/:id/cancel` | Cancel an appointment. | Yes |
| `POST` | `/:id/start-call` | (Doctor) Initialize a video session for the appointment. | Yes |
| `POST` | `/:id/join-call` | (Patient) Get a token/URL to join the video session. | Yes |

### **AI Consultation** (`/ai-consultation`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/start` | Start an AI consultation: create video session, join patient, join AI doctor to room; returns room join URL. | Yes |

### **System**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint. | No |

---

## 2. Video Call Service
**Base URL:** `http://localhost:4000` (Internal Service)

These endpoints are primarily consumed by the Backend Service, not directly by the frontend.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/sessions` | Create a new video session (room). | Internal Secret |
| `POST` | `/sessions/:sessionId/join` | Generate a join token/URL for a participant. | Internal Secret |

---

## 3. Frontend AI Service (Next.js)
**Base URL:** `http://localhost:3000/api`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/chat` | Chat with the AI Assistant. Accepts text message and files (PDF/Images) for analysis. | No (Rate Limited) |

---

## 4. Telegram Bot (Agent)
**Handle:** `@CarePulseBot` (or configured name)

The bot does not expose HTTP endpoints but acts as an interactive client.

### **Commands**
| Command | Description |
| :--- | :--- |
| `/start` | Welcome message and instructions. |
| `/link <code>` | Link Telegram account to CarePulse web account. |
| `/appointment` | Start the interactive booking flow. |

### **Interactive Flow**
1.  **Intent Recognition:** User types "Book with Dr. John on Friday".
2.  **Doctor Resolution:** Bot searches for "Dr. John".
3.  **Booking:** Bot calls Backend API (`POST /appointments`) to finalize booking.
