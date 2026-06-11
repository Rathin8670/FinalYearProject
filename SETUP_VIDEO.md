# Video Service Setup Guide

## Environment Variables

### Telemedicine Backend (.env)
Make sure your backend `.env` file includes:
```env
VIDEO_SERVICE_URL=http://localhost:4000
VIDEO_SERVICE_SECRET=your-internal-secret-key-change-this
```

### Video Service (.env)
Make sure your video service `.env` file includes:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/videocall
INTERNAL_SECRET=your-internal-secret-key-change-this
VIDEO_JWT_SECRET=your-video-jwt-secret-key-change-this
CLIENT_BASE_URL=http://localhost:4000
SFU_NODES=sfu-1,sfu-2
```

**IMPORTANT:** The `VIDEO_SERVICE_SECRET` in the telemedicine backend must match the `INTERNAL_SECRET` in the video service!

## Quick Setup

1. **Set matching secrets:**
   - In `backend/.env`: `VIDEO_SERVICE_SECRET=my-secret-key-123`
   - In `videocall/.env`: `INTERNAL_SECRET=my-secret-key-123`

2. **Start MongoDB** (if not already running)

3. **Start Video Service:**
   ```bash
   cd videocall
   npm install
   npm run dev
   ```

4. **Start Telemedicine Backend:**
   ```bash
   cd backend
   npm start
   ```

## Troubleshooting

If you see "Unauthorized: Invalid or missing X-Internal-Secret header":

1. Check that both services have the same secret value
2. Restart both services after changing .env files
3. Check the video service logs for detailed error messages
4. Verify the VIDEO_SERVICE_URL is correct in backend .env

