import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedVideo extends Document {
  project: mongoose.Types.ObjectId;
  videoUrl: string;
  videoId: string;
  title?: string;
  isPlaying: boolean;
  currentTime: number;
  isMinimized: boolean;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SharedVideoSchema = new Schema<ISharedVideo>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    isMinimized: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only one active video per project
SharedVideoSchema.index({ project: 1 }, { unique: true });

export default mongoose.model<ISharedVideo>('SharedVideo', SharedVideoSchema);

