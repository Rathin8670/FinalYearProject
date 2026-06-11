import mongoose from 'mongoose';


export async function connectDatabase() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/videocall';
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

