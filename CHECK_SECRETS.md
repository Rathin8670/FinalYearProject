# Quick Secret Check Guide

## The Problem
If you see "Unauthorized: Invalid X-Internal-Secret header", it means the secrets don't match.

## Quick Fix

### Step 1: Check Current Values

Run the diagnostic script:
```bash
cd videocall
npm run check-secrets
```

This will show you:
- What value is set in video service
- What value is set in backend
- Whether they match

### Step 2: Set Matching Values

**Backend `.env` file** (in `backend` folder):
```env
VIDEO_SERVICE_SECRET=my-secret-123
```

**Video Service `.env` file** (in `videocall` folder):
```env
INTERNAL_SECRET=my-secret-123
```

**IMPORTANT:** They MUST be exactly the same (same value, no extra spaces, same case)

### Step 3: Restart Both Services

1. **Restart the video service:**
   ```bash
   cd videocall
   npm run dev
   ```

2. **Restart the backend:**
   ```bash
   cd backend
   npm start
   ```

## Debug Endpoints

You can also check the video service secret configuration:
```bash
curl http://localhost:4000/debug/secret
```

This will show the first and last characters of the configured secret (for verification only).

## Common Issues

1. **Backend using default value**: If `VIDEO_SERVICE_SECRET` is not set, the backend will show a warning. Make sure to set it in `.env`.

2. **Extra spaces**: Make sure there are no spaces around the `=` sign or in the value itself.

3. **Different files**: Make sure you're editing the correct `.env` files:
   - `backend/.env` for VIDEO_SERVICE_SECRET
   - `videocall/.env` for INTERNAL_SECRET

4. **Not restarted**: After changing `.env` files, you MUST restart both services for changes to take effect.

