import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { joinRoom } from './socket.js';

const app = express();
const PORT = process.env.PORT ?? 4500;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'ai-doctor-service' });
});

app.post('/join', (req, res) => {
  const { sessionId, roomId } = req.body;
  if (!sessionId || !roomId) {
    return res.status(400).json({ success: false, message: 'sessionId and roomId required' });
  }
  joinRoom(sessionId, roomId);
  res.json({ success: true, message: 'AI doctor joining room' });
});

app.listen(PORT, () => {
  console.log(`AI Doctor Service running on port ${PORT}`);
});
