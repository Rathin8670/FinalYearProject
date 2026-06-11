import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import connectDB from '../config/database.js';

dotenv.config();

const doctorsData = [
  {
    email: 'dr.leila@carepulse.com',
    password: 'doctor123',
    name: 'Leila Cameron',
    role: 'doctor',
    specialization: 'Cardiology',
    experience: 10,
    bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
    consultationFee: 150,
    qualifications: [
      { degree: 'MD', institution: 'Harvard Medical School', year: 2010 },
      { degree: 'Board Certified Cardiology', institution: 'American Board of Internal Medicine', year: 2012 }
    ]
  },
  {
    email: 'dr.david@carepulse.com',
    password: 'doctor123',
    name: 'David Livingston',
    role: 'doctor',
    specialization: 'Pediatrics',
    experience: 8,
    bio: 'Pediatrician with expertise in child development and preventive care.',
    consultationFee: 120,
    qualifications: [
      { degree: 'MD', institution: 'Johns Hopkins University', year: 2012 },
      { degree: 'Board Certified Pediatrics', institution: 'American Board of Pediatrics', year: 2014 }
    ]
  },
  {
    email: 'dr.jane@carepulse.com',
    password: 'doctor123',
    name: 'Jane Powell',
    role: 'doctor',
    specialization: 'Dermatology',
    experience: 12,
    bio: 'Board-certified dermatologist specializing in skin conditions and cosmetic procedures.',
    consultationFee: 180,
    qualifications: [
      { degree: 'MD', institution: 'Stanford University', year: 2008 },
      { degree: 'Board Certified Dermatology', institution: 'American Board of Dermatology', year: 2010 }
    ]
  },
  {
    email: 'dr.evan@carepulse.com',
    password: 'doctor123',
    name: 'Evan Peter',
    role: 'doctor',
    specialization: 'General Medicine',
    experience: 15,
    bio: 'General practitioner with extensive experience in primary care and preventive medicine.',
    consultationFee: 100,
    qualifications: [
      { degree: 'MD', institution: 'Yale University', year: 2005 },
      { degree: 'Board Certified Internal Medicine', institution: 'American Board of Internal Medicine', year: 2007 }
    ]
  }
];

async function seedDoctors() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    for (const doctorData of doctorsData) {
      // Check if user exists
      let user = await User.findOne({ email: doctorData.email });
      
      if (!user) {
        // Create user
        user = await User.create({
          email: doctorData.email,
          password: doctorData.password,
          name: doctorData.name,
          role: 'doctor'
        });
        console.log(`Created user: ${user.name}`);
      } else {
        // Update role if needed
        user.role = 'doctor';
        await user.save();
        console.log(`Updated user: ${user.name}`);
      }

      // Create doctor profile
      const doctor = await Doctor.create({
        user: user._id,
        specialization: doctorData.specialization,
        experience: doctorData.experience,
        bio: doctorData.bio,
        consultationFee: doctorData.consultationFee,
        qualifications: doctorData.qualifications,
        rating: {
          average: Math.random() * 2 + 3, // Random rating between 3-5
          totalReviews: Math.floor(Math.random() * 50) + 10
        },
        isActive: true,
        videoCallEnabled: true
      });

      console.log(`Created doctor profile: ${doctorData.name} - ${doctorData.specialization}`);
    }

    console.log('✅ Doctors seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();

