import axios from 'axios';

const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || 'http://localhost:4000';
const VIDEO_SERVICE_SECRET = process.env.VIDEO_SERVICE_SECRET || 'my-secret-key-123';
const AI_DOCTOR_SERVICE_URL = process.env.AI_DOCTOR_SERVICE_URL || 'http://localhost:4500';

/**
 * POST /api/ai-consultation/start
 * 1. Create video session (doctorId = 'ai-doctor')
 * 2. Join patient to session
 * 3. Tell AI doctor service to join the same room
 * 4. Return room join URL to frontend
 */
export const startAiConsultation = async (req, res) => {
  try {
    const userId = req.user.userId.toString();

    const consultationId = `ai-${userId}-${Date.now()}`;

    if (!VIDEO_SERVICE_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Video service not configured',
      });
    }

    const createResp = await axios.post(
      `${VIDEO_SERVICE_URL}/sessions`,
      {
        appointmentId: consultationId,
        doctorId: 'ai-doctor',
        patientId: userId,
      },
      {
        headers: {
          'X-Internal-Secret': VIDEO_SERVICE_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    const sessionId = createResp.data.sessionId;
    if (!sessionId) {
      return res.status(500).json({
        success: false,
        message: 'Video service did not return sessionId',
      });
    }

    const joinResp = await axios.post(
      `${VIDEO_SERVICE_URL}/sessions/${sessionId}/join`,
      {
        role: 'patient',
        userId,
      },
      {
        headers: {
          'X-Internal-Secret': VIDEO_SERVICE_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    let joinUrl = joinResp.data?.joinUrl;
    if (!joinUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get patient join URL',
      });
    }
    joinUrl = joinUrl + (joinUrl.includes('?') ? '&' : '?') + 'aiConsultation=true';

    try {
      await axios.post(
        `${AI_DOCTOR_SERVICE_URL}/join`,
        { sessionId, roomId: sessionId },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );
    } catch (err) {
      console.error('AI doctor join error:', err.message);
    }

    res.json({
      success: true,
      joinUrl,
      sessionId,
    });
  } catch (error) {
    console.error('Start AI consultation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to start AI consultation',
    });
  }
};
