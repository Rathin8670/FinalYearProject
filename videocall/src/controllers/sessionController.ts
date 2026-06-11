import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import VideoSession from '../models/VideoSession.js';
import { createVideoToken } from '../services/tokenService.js';
import { pickSfuNode } from '../services/sfuService.js';

const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:4000';

interface CreateSessionRequest {
  appointmentId: string;
  doctorId: string;
  patientId: string;
}

interface JoinSessionRequest {
  role: 'doctor' | 'patient';
  userId: string;
}

// POST /sessions
export async function createSession(req: Request, res: Response) {
  try {
    const { appointmentId, doctorId, patientId }: CreateSessionRequest = req.body;

    console.log('Creating session:');
    console.log('  - Appointment ID:', appointmentId);
    console.log('  - Doctor ID (received):', doctorId);
    console.log('  - Doctor ID (type):', typeof doctorId);
    console.log('  - Patient ID:', patientId);

    // Validate request body
    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({
        message: 'Missing required fields: appointmentId, doctorId, patientId'
      });
    }

    // Normalize doctorId - extract user ID if it's an object
    let normalizedDoctorId: string;
    if (typeof doctorId === 'object' && doctorId !== null) {
      // If doctorId is an object, extract the user ID
      const doctorObj = doctorId as any;
      if (doctorObj.user?._id) {
        normalizedDoctorId = String(doctorObj.user._id);
      } else if (doctorObj.user) {
        normalizedDoctorId = String(doctorObj.user);
      } else if (doctorObj._id) {
        normalizedDoctorId = String(doctorObj._id);
      } else {
        normalizedDoctorId = String(doctorId);
      }
      console.log('  - Normalized Doctor ID (from object):', normalizedDoctorId);
    } else {
      // It's already a string
      normalizedDoctorId = String(doctorId);
      console.log('  - Normalized Doctor ID (from string):', normalizedDoctorId);
    }

    // Normalize patientId
    const normalizedPatientId = typeof patientId === 'object' && patientId !== null
      ? String((patientId as any)._id || patientId)
      : String(patientId);

    // Check if session already exists for this appointment (idempotent)
    let session = await VideoSession.findOne({ appointmentId });

    if (session) {
      console.log('Session already exists:');
      console.log('  - Session Doctor ID (stored):', session.doctorId);
      console.log('  - Normalized Doctor ID:', normalizedDoctorId);
      
      // Extract stored doctorId (handle both string and object formats)
      let storedDoctorId: string;
      const storedRaw = session.doctorId as any;
      if (typeof storedRaw === 'object' && storedRaw !== null) {
        // Stored as object - extract user ID
        if (storedRaw.user?._id) {
          storedDoctorId = String(storedRaw.user._id);
        } else if (storedRaw.user) {
          storedDoctorId = String(storedRaw.user);
        } else {
          storedDoctorId = String(storedRaw._id || storedRaw);
        }
      } else {
        storedDoctorId = String(storedRaw);
      }
      
      console.log('  - Stored Doctor ID (extracted):', storedDoctorId);
      console.log('  - Match:', storedDoctorId === normalizedDoctorId);
      
      // If the stored doctorId doesn't match, update it with normalized value
      if (storedDoctorId !== normalizedDoctorId) {
        console.log('Updating session with normalized doctorId...');
        session.doctorId = normalizedDoctorId;
        await session.save();
        console.log('Session updated successfully');
      }
      
      // Return existing session
      return res.json({
        sessionId: session.sessionId,
        roomName: session.roomName,
        sfuNodeId: session.sfuNodeId,
        baseUrl: `${CLIENT_BASE_URL}/join/${session.sessionId}`
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const roomName = `room_${sessionId}`;
    const sfuNodeId = pickSfuNode();

    session = await VideoSession.create({
      sessionId,
      appointmentId,
      doctorId: normalizedDoctorId, // Store normalized user ID as string
      patientId: normalizedPatientId,
      sfuNodeId,
      roomName,
      status: 'active'
    });

    console.log('Session created:');
    console.log('  - Session ID:', session.sessionId);
    console.log('  - Doctor ID (stored):', session.doctorId);

    res.json({
      sessionId: session.sessionId,
      roomName: session.roomName,
      sfuNodeId: session.sfuNodeId,
      baseUrl: `${CLIENT_BASE_URL}/join/${session.sessionId}`
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    
    if (error.code === 11000) {
      // Duplicate key error (appointmentId already exists)
      const existingSession = await VideoSession.findOne({ appointmentId: req.body.appointmentId });
      if (existingSession) {
        return res.json({
          sessionId: existingSession.sessionId,
          roomName: existingSession.roomName,
          sfuNodeId: existingSession.sfuNodeId,
          baseUrl: `${CLIENT_BASE_URL}/join/${existingSession.sessionId}`
        });
      }
    }

    res.status(500).json({
      message: 'Failed to create session',
      error: error.message
    });
  }
}

// POST /sessions/:sessionId/join
export async function joinSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { role, userId }: JoinSessionRequest = req.body;

    // Validate role
    if (!role || (role !== 'doctor' && role !== 'patient')) {
      return res.status(400).json({
        message: 'Invalid role. Must be "doctor" or "patient"'
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: 'Missing required field: userId'
      });
    }

    // Lookup session
    const session = await VideoSession.findOne({
      sessionId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        message: 'Session not found or has ended'
      });
    }

    // Verify user belongs to this session
    // Extract doctorId - handle both string and object formats (for old sessions)
    let sessionDoctorId: string;
    const doctorIdRaw = session.doctorId as any;
    
    // Check if it's stored as an object (legacy data)
    if (typeof doctorIdRaw === 'object' && doctorIdRaw !== null) {
      // It's an object - extract user ID from user._id
      if (doctorIdRaw.user?._id) {
        sessionDoctorId = String(doctorIdRaw.user._id);
      } else if (doctorIdRaw.user) {
        sessionDoctorId = String(doctorIdRaw.user);
      } else {
        sessionDoctorId = String(doctorIdRaw._id || doctorIdRaw);
      }
      
      // Auto-fix: Update the session to store as string for future
      console.log('Auto-fixing session: converting doctorId from object to string');
      session.doctorId = sessionDoctorId;
      await session.save();
    } else if (typeof doctorIdRaw === 'string') {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(doctorIdRaw);
        if (parsed && typeof parsed === 'object' && parsed.user?._id) {
          // It's a JSON stringified object - extract user ID
          sessionDoctorId = String(parsed.user._id);
          // Auto-fix: Update the session
          session.doctorId = sessionDoctorId;
          await session.save();
        } else {
          // It's a regular string
          sessionDoctorId = doctorIdRaw;
        }
      } catch {
        // Not JSON, use as-is
        sessionDoctorId = doctorIdRaw;
      }
    } else {
      // Fallback: convert to string
      sessionDoctorId = String(doctorIdRaw);
    }

    // Handle patientId similarly - extract from object if needed
    let sessionPatientId: string | undefined = undefined;
    let patientIdRaw = session.patientId as any;
    
    console.log('Patient ID extraction - raw value type:', typeof patientIdRaw);
    console.log('Patient ID extraction - raw value:', patientIdRaw);
    
    // If it's a string that contains an object representation (like "{ _id: new ObjectId('...') }")
    // Try to extract the ObjectId using regex FIRST, before trying JSON parse
    if (typeof patientIdRaw === 'string') {
      // Check if it contains ObjectId pattern (like "ObjectId('6932827e83ebb3c56926da27')")
      const objectIdMatch = patientIdRaw.match(/ObjectId\(['"]([^'"]+)['"]\)/);
      if (objectIdMatch && objectIdMatch[1]) {
        sessionPatientId = objectIdMatch[1];
        console.log('Extracted ObjectId from string representation using regex:', sessionPatientId);
        // Auto-fix: Update the session
        session.patientId = sessionPatientId;
        await session.save();
      } else if (patientIdRaw.trim().startsWith('{')) {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(patientIdRaw);
          if (parsed && typeof parsed === 'object' && parsed._id) {
            patientIdRaw = parsed; // Convert to object for further processing
            console.log('Parsed JSON string to object, got _id:', parsed._id);
          }
        } catch (e) {
          // Not valid JSON, will fall through to object check
          console.log('String is not valid JSON');
        }
      } else if (/^[0-9a-fA-F]{24}$/.test(patientIdRaw.trim())) {
        // It's already a plain ObjectId string
        sessionPatientId = patientIdRaw.trim();
        console.log('Using as plain ObjectId string:', sessionPatientId);
      }
    }
    
    // Check if it's stored as an object (legacy data or after parsing)
    // Only process if we haven't already extracted it from string
    if (!sessionPatientId && typeof patientIdRaw === 'object' && patientIdRaw !== null) {
      // It's an object - extract _id (handle both ObjectId and plain object)
      let extractedId: string;
      
      // Check if _id exists and handle ObjectId properly
      if (patientIdRaw._id) {
        // _id might be an ObjectId (Mongoose), so convert to string
        if (typeof patientIdRaw._id.toString === 'function') {
          extractedId = patientIdRaw._id.toString();
        } else if (patientIdRaw._id.toHexString && typeof patientIdRaw._id.toHexString === 'function') {
          extractedId = patientIdRaw._id.toHexString();
        } else {
          extractedId = String(patientIdRaw._id);
        }
      } else if (patientIdRaw.toString && typeof patientIdRaw.toString === 'function' && patientIdRaw.constructor && patientIdRaw.constructor.name === 'ObjectId') {
        // It's an ObjectId directly
        extractedId = patientIdRaw.toString();
      } else {
        // Try to get string representation
        extractedId = String(patientIdRaw);
      }
      
      sessionPatientId = extractedId;
      console.log('Extracted patient ID from object:', sessionPatientId);
      
      // Auto-fix: Update the session to store as string for future
      console.log('Auto-fixing session: converting patientId from object to string');
      session.patientId = sessionPatientId;
      await session.save();
    } else if (!sessionPatientId && typeof patientIdRaw === 'string') {
      // It's already a string - check if it's a valid ObjectId format
      if (/^[0-9a-fA-F]{24}$/.test(patientIdRaw.trim())) {
        // It's a valid ObjectId string
        sessionPatientId = patientIdRaw.trim();
      } else {
        // It's some other string, use as-is
        sessionPatientId = patientIdRaw;
      }
    }
    
    // Final fallback: ensure we have a value
    if (!sessionPatientId) {
      sessionPatientId = String(patientIdRaw);
    }
    
    console.log('Final extracted patient ID:', sessionPatientId, '(type:', typeof sessionPatientId, ')');

    const requestUserId = String(userId);

    console.log('Join session validation:');
    console.log('  - Role:', role);
    console.log('  - Request User ID:', requestUserId, '(type:', typeof requestUserId, ')');
    console.log('  - Session Doctor ID (extracted):', sessionDoctorId, '(type:', typeof sessionDoctorId, ')');
    console.log('  - Session Patient ID (extracted):', sessionPatientId, '(type:', typeof sessionPatientId, ')');
    console.log('  - Patient ID match:', sessionPatientId === requestUserId);
    console.log('  - Doctor ID match:', sessionDoctorId === requestUserId);

    if (role === 'doctor' && sessionDoctorId !== requestUserId) {
      console.error('Doctor ID mismatch:');
      console.error('  Expected (extracted):', sessionDoctorId);
      console.error('  Received:', requestUserId);
      return res.status(403).json({
        message: 'User does not match doctor for this session'
      });
    }

    if (role === 'patient' && sessionPatientId !== requestUserId) {
      console.error('Patient ID mismatch:');
      console.error('  Expected:', sessionPatientId);
      console.error('  Received:', requestUserId);
      return res.status(403).json({
        message: 'User does not match patient for this session'
      });
    }

    // Generate JWT token
    const token = createVideoToken({
      sub: userId,
      sessionId: session.sessionId,
      roomName: session.roomName,
      role
    });

    // Build join URL
    const joinUrl = `${CLIENT_BASE_URL}/join/${sessionId}?token=${token}`;

    res.json({
      joinUrl,
      expiresIn: 3600 // 1 hour
    });
  } catch (error: any) {
    console.error('Join session error:', error);
    res.status(500).json({
      message: 'Failed to generate join URL',
      error: error.message
    });
  }
}

