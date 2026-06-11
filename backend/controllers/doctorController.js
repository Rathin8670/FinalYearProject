import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).sort({ 'rating.average': -1 });
    
    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor'
    });
  }
};

// Create doctor (admin only - for now, can be used to seed doctors)
export const createDoctor = async (req, res) => {
  try {
    const {
      userId,
      specialization,
      qualifications,
      experience,
      bio,
      consultationFee,
      availability
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists for this user'
      });
    }

    // Update user role to doctor
    user.role = 'doctor';
    await user.save();

    const doctor = await Doctor.create({
      user: userId,
      specialization,
      qualifications: qualifications || [],
      experience,
      bio,
      consultationFee,
      availability: availability || {}
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating doctor profile',
      error: error.message
    });
  }
};

// Search doctors by specialization
export const searchDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    
    let query = { isActive: true };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }
    
    const doctors = await Doctor.find(query).sort({ 'rating.average': -1 });
    
    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors'
    });
  }
};

