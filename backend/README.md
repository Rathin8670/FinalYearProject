# CarePulse Backend API

The RESTful API service powering the CarePulse platform. It handles user authentication, data management, and business logic for appointments and doctors.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** bcryptjs (hashing), cors

## ✨ Features

- **User Management:**
  - Sign up/Sign in (Patient & Doctor)
  - Role-based access control (Patient, Doctor, Admin)
  - Telegram account linking
- **Doctor Management:**
  - Doctor profiles (Specialization, Ratings, Availability)
  - Search and filter doctors
- **Appointment System:**
  - Book/Cancel/Delete appointments
  - Status management (Pending, Scheduled, Completed)
  - Video call session management
- **Real-time:**
  - Socket.IO integration (optional extension)

## 🛠️ Setup & Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/carepulse
    JWT_SECRET=your_super_secret_jwt_key
    JWT_REFRESH_SECRET=your_super_secret_refresh_key
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:5000`.

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Get current user info

### Doctors
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Create doctor profile (Admin only)
- `GET /api/doctors/search` - Search by specialization

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Book new appointment
- `POST /api/appointments/:id/start-call` - Initiate video call
- `POST /api/appointments/:id/join-call` - Join video call

### Telegram
- `POST /api/telegram/link-token` - Generate token for bot linking

## 🗄️ Database Models

- **User:** Base user account (email, password, role).
- **Doctor:** Extended profile for doctors (linked to User).
- **Appointment:** Connects Patient (User) and Doctor.
