import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor must be associated with a user account']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    institution: String,
    year: Number
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  availability: {
    monday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    tuesday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    wednesday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    thursday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    friday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    saturday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    sunday: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  videoCallEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Populate user details when querying
doctorSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email profilePicture'
  });
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;

