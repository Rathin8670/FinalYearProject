import axios from 'axios';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || 'http://localhost:4000';
const VIDEO_SERVICE_SECRET = process.env.VIDEO_SERVICE_SECRET || 'my-secret-key-123';

// Warn if using default secret
if (!VIDEO_SERVICE_SECRET) {
  console.warn('⚠️  WARNING: VIDEO_SERVICE_SECRET is not set in .env file!');
  console.warn('⚠️  Please add VIDEO_SERVICE_SECRET to your backend/.env file');
  console.warn('⚠️  It must match INTERNAL_SECRET in videocall/.env');
}

// Create appointment
export const createAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { doctorId, appointmentDate, appointmentTime, reason, comments } = req.body;

    // Validation
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, time, and reason are required'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    // Combine date and time
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);

    // Check if appointment date is in the future
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: appointmentDateTime,
      status: { $in: ['pending', 'scheduled'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this time'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: userId,
      doctor: doctorId,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      reason,
      comments: comments || '',
      status: 'pending'
    });

    // Populate doctor and patient details
    await appointment.populate('doctor');
    await appointment.populate('patient');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// Get appointments (patient or doctor)
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { status, scope, includeCounts } = req.query;

    const isDoctorScope = scope === 'doctor' || role === 'doctor';

    let query = {};

    if (isDoctorScope) {
      // find doctor profile for this user
      const doctor = await Doctor.findOne({ user: userId });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      query = { doctor: doctor._id };
    } else {
      query = { patient: userId };
    }
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .sort(isDoctorScope ? { appointmentDate: 1 } : { appointmentDate: -1 })
      .limit(isDoctorScope ? 200 : 50);

    let countsByDate = undefined;
    if (includeCounts === 'true') {
      const agg = await Appointment.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);
      countsByDate = agg.map(item => ({ date: item._id, count: item.count }));
    }

    res.json({
      success: true,
      data: appointments,
      countsByDate
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// Get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user' }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the patient or doctor
    const doctorUserId = appointment.doctor?.user?._id?.toString() || appointment.doctor?.user?.toString();
    if (appointment.patient.toString() !== userId && doctorUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment'
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { status, videoCallLink, meetingId, notes, prescription } = req.body;

    const appointment = await Appointment.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user' }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const doctorUserId = appointment.doctor?.user?._id?.toString() || appointment.doctor?.user?.toString();
    if (appointment.patient.toString() !== userId && doctorUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this appointment'
      });
    }

    // Update fields
    if (status) appointment.status = status;
    if (videoCallLink) appointment.videoCallLink = videoCallLink;
    if (meetingId) appointment.meetingId = meetingId;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user' }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization (patient, doctor, or admin)
    const patientId = appointment.patient?._id? appointment.patient._id.toString(): appointment.patient.toString();
    const doctorUserId = appointment.doctor?.user?._id?.toString() || appointment.doctor?.user?.toString();
    const requesterRole = req.user?.role;
    const isAdmin = requesterRole === 'admin';
    const isPatient = patientId === userId;
    const isDoctor = doctorUserId === userId;
    if (!isAdmin && patientId !== userId && doctorUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment'
    });
  }
};

// DOCTOR START CALL
export const startCall = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if user is doctor
    if (userRole !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can start calls'
      });
    }

    // Find doctor profile for the logged-in user first
    const doctor = await Doctor.findOne({ user: userId }).populate('user');
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found for your account'
      });
    }

    // Ensure we have the user ID correctly
    const doctorUserId = doctor.user?._id?.toString() || doctor.user?.toString() || userId.toString();

    //////////////////////////////////////////////////////////////////////////////
    // Find appointment and verify it belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctor._id
    });
    

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not assigned to you'
      });
    }
    
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment cancelled'
      });
    }
    
    // If no meeting yet → create one (idempotent)
    if (!appointment.videoMeetingId) {
      try {
        if (!VIDEO_SERVICE_SECRET) {
          console.error('VIDEO_SERVICE_SECRET is not set in environment variables');
          return res.status(500).json({
            success: false,
            message: 'Video service configuration error'
          });
        }

        console.log('Creating video session for appointment:', appointment._id);

        const createResp = await axios.post(
          `${VIDEO_SERVICE_URL}/sessions`,
          {
            appointmentId: appointment._id.toString(),
            doctorId: doctorUserId, // Use doctor's user ID, not doctor document ID
            patientId: appointment.patient.toString()
          },
          {
            headers: { 
              'X-Internal-Secret': VIDEO_SERVICE_SECRET,
              'Content-Type': 'application/json'
            }
          }
        );

        appointment.videoMeetingId = createResp.data.sessionId;
        appointment.videoCallLink = createResp.data.baseUrl || null;
        await appointment.save();
      } catch (error) {
        console.error('Video service error:', error.response?.data || error.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to create video session',
          error: error.response?.data?.message || error.message
        });
      }
    }

    // Now request the doctor's join URL

    try {
      if (!VIDEO_SERVICE_SECRET) {
        console.error('VIDEO_SERVICE_SECRET is not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Video service configuration error'
        });
      }

      console.log('Requesting join URL for session:', appointment.videoMeetingId);

      const joinResp = await axios.post(
        `${VIDEO_SERVICE_URL}/sessions/${appointment.videoMeetingId}/join`,
        {
          role: 'doctor',
          userId: userId.toString() // Ensure it's a string
        },
        {
          headers: { 
            'X-Internal-Secret': VIDEO_SERVICE_SECRET,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!joinResp.data || !joinResp.data.joinUrl) {
        console.error('Invalid response from video service:', joinResp.data);
        return res.status(500).json({
          success: false,
          message: 'Invalid response from video service',
          error: 'Missing joinUrl in response'
        });
      }

      console.log('Successfully generated join URL for session:', appointment.videoMeetingId);

      res.json({
        success: true,
        joinUrl: joinResp.data.joinUrl,
        sessionId: appointment.videoMeetingId
      });
    } catch (error) {
      console.error('Video service join error:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate join URL',
        error: error.response?.data?.message || error.message
      });
    }
  } catch (error) {
    console.error('Start call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PATIENT JOIN CALL
export const joinCall = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if user is patient or admin
    if (userRole !== 'patient' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can join calls'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify patient owns this appointment (unless admin)
    const patientId = appointment.patient?._id?.toString() || appointment.patient?.toString();

    if (userRole !== 'admin' && patientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not your appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment cancelled'
      });
    }

    if (!appointment.videoMeetingId) {
      return res.status(409).json({
        success: false,
        message: 'Doctor has not started the call yet'
      });
    }

    // Request patient join URL
    try {
      if (!VIDEO_SERVICE_SECRET) {
        console.error('VIDEO_SERVICE_SECRET is not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Video service configuration error'
        });
      }

      const joinResp = await axios.post(
        `${VIDEO_SERVICE_URL}/sessions/${appointment.videoMeetingId}/join`,
        {
          role: 'patient',
          userId: userId
        },
        {
          headers: { 
            'X-Internal-Secret': VIDEO_SERVICE_SECRET,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        success: true,
        joinUrl: joinResp.data.joinUrl,
        sessionId: appointment.videoMeetingId
      });
    } catch (error) {
      console.error('Video service join error:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate join URL',
        error: error.response?.data?.message || error.message
      });
    }
  } catch (error) {
    console.error('Join call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    console.log('🔍 req.user =', JSON.stringify(req.user));
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    // ADD THESE DEBUG LINES:
    console.log('=== DELETE DEBUG ===');
    console.log('req.user:', req.user);
    console.log('appointment id:', id);

    const appointment = await Appointment.findById(id).populate('patient');

    console.log('appointment.patient:', appointment?.patient?.toString());
    console.log('userId:', userId);
    console.log('match?', appointment?.patient?.toString() === userId);
    console.log('===================');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Authorization: Only Admin or the Patient who owns the appointment can delete
    // (Doctors usually cancel, but if needed they could delete too - sticking to patient for now based on context)
    const isPatient = appointment.patient._id.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isPatient && !isAdmin) {
       return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this appointment'
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment'
    });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user' }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only doctor can complete appointment
    const doctorUserId =
      appointment.doctor?.user?._id?.toString() ||
      appointment.doctor?.user?.toString();

    if (doctorUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only doctor can complete appointment'
      });
    }

    // Prevent invalid transitions
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cancelled appointment cannot be completed'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Appointment already completed'
      });
    }

    appointment.status = 'completed';

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment marked as completed',
      data: appointment
    });
  } catch (error) {
    console.error('Complete appointment error:', error);

    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
};

