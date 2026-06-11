import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    trim: true
  },
  comments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  videoMeetingId: {
    type: String,
    default: null,
    index: true
  },
  videoProvider: {
    type: String,
    enum: ['internal', 'livekit', 'twilio'],
    default: 'internal'
  },
  videoCallLink: {
    type: String,
    default: null // optional/display only
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  notes: {
    type: String,
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Populate patient and doctor details
appointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'patient',
    select: 'name email profilePicture'
  }).populate({
    path: 'doctor',
    populate: {
      path: 'user',
      select: 'name email profilePicture'
    }
  });
  next();
});

// Index for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

