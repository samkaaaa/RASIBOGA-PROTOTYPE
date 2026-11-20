import mongoose from 'mongoose';
import { mediaSchema } from './Food.js';

const { Schema } = mongoose;

export const SUBMISSION_TYPES = ['food-suggestion', 'story', 'recipe', 'photo'];
export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'];

const communitySubmissionSchema = new Schema(
  {
    type: {
      type: String,
      enum: { values: SUBMISSION_TYPES, message: 'Jenis kontribusi tidak dikenal' },
      required: true,
      index: true,
    },
    name: { type: String, required: [true, 'Nama wajib diisi'], trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      trim: true,
      lowercase: true,
      maxlength: 160,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format email tidak valid'],
    },
    title: { type: String, required: [true, 'Judul wajib diisi'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'Deskripsi wajib diisi'], trim: true, maxlength: 6000 },
    media: { type: [mediaSchema], default: [] },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: 'pending',
      index: true,
    },
    adminNote: { type: String, default: '', trim: true, maxlength: 2000 },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

communitySubmissionSchema.index({ createdAt: -1 });

export default mongoose.model('CommunitySubmission', communitySubmissionSchema);
