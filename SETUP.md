# Setup Guide - Telemedicine App

This guide will help you set up and run both the frontend and backend of the telemedicine application.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/telemedicine`)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/telemedicine
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telemedicine

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

4. Seed sample doctors (optional but recommended):
```bash
npm run seed:doctors
```

This will create 4 sample doctors:
- Dr. Leila Cameron (Cardiology)
- Dr. David Livingston (Pediatrics)
- Dr. Jane Powell (Dermatology)
- Dr. Evan Peter (General Medicine)

All doctors have password: `doctor123`

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env.local` file in the frontend directory if you need to change the API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Home Page** (`/`): Shows when user is not logged in. Provides links to sign in or sign up.

2. **Sign Up** (`/signup`): Create a new patient account with email and password.

3. **Sign In** (`/signin`): Sign in with existing credentials.

4. **Dashboard** (`/dashboard`): 
   - View available doctors
   - Book appointments with doctors
   - View your appointment history
   - See appointment statistics (scheduled, pending, cancelled)
   - Cancel appointments

## Features

- ✅ MongoDB database integration
- ✅ User authentication with JWT
- ✅ Doctor profiles with specialization, experience, ratings
- ✅ Appointment booking system
- ✅ Appointment management (view, cancel)
- ✅ Protected routes
- ✅ Responsive dark-themed UI
- ✅ Real-time appointment statistics

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out (requires auth)

### Doctors
- `GET /api/doctors` - Get all active doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/search?specialization=...&search=...` - Search doctors

### Appointments
- `POST /api/appointments` - Create new appointment (requires auth)
- `GET /api/appointments` - Get user's appointments (requires auth)
- `GET /api/appointments/:id` - Get appointment by ID (requires auth)
- `POST /api/appointments/:id/cancel` - Cancel appointment (requires auth)
- `PATCH /api/appointments/:id` - Update appointment (requires auth)

## Database Schemas

### User Schema
- email (unique, required)
- password (hashed)
- name
- role (patient, doctor, admin)
- refreshToken
- profilePicture
- phoneNumber
- dateOfBirth
- address

### Doctor Schema
- user (reference to User)
- specialization
- qualifications
- experience
- bio
- consultationFee
- availability
- rating
- isActive
- videoCallEnabled

### Appointment Schema
- patient (reference to User)
- doctor (reference to Doctor)
- appointmentDate
- appointmentTime
- reason
- comments
- status (pending, scheduled, completed, cancelled)
- videoCallLink
- meetingId
- duration
- notes
- prescription
- followUpDate

## Testing the Application

1. Start MongoDB (if using local)
2. Start both backend and frontend servers
3. Visit `http://localhost:3000`
4. Sign up for a new account
5. After signing in, you'll see the dashboard with:
   - Available doctors
   - Appointment statistics
   - Your appointments table
6. Click "Book Appointment" on any doctor
7. Fill in the appointment form and submit
8. View your appointments in the table below

## Notes

- Make sure MongoDB is running before starting the backend
- Use strong, unique JWT secrets in production
- The seed script creates doctors with the password `doctor123` - change this in production
- Video call links can be added later when integrating with video calling services (Zoom, Twilio, etc.)
