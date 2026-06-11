import mongoose, { Document, Schema } from 'mongoose';

export interface VideoSessionDocument extends Document {
  sessionId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  sfuNodeId: string;
  roomName: string;
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const VideoSessionSchema = new Schema<VideoSessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    appointmentId: {
      type: String,
      required: true,
      index: true
    },
    doctorId: {
      type: String,
      required: true
    },
    patientId: {
      type: String,
      required: true
    },
    sfuNodeId: {
      type: String,
      required: true
    },
    roomName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Enforce one session per appointment
VideoSessionSchema.index({ appointmentId: 1 }, { unique: true });

export default mongoose.model<VideoSessionDocument>('VideoSession', VideoSessionSchema);

