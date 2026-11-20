import mongoose from 'mongoose';

const { Schema } = mongoose;

export const VIDEO_TYPES = ['youtube', 'uploaded-video', 'animation', 'lottie'];

const videoSchema = new Schema(
  {
    title: { type: String, required: [true, 'Judul video wajib diisi'], trim: true, maxlength: 180 },
    description: { type: String, default: '', trim: true, maxlength: 4000 },

    type: { type: String, enum: VIDEO_TYPES, default: 'youtube', index: true },
    category: { type: String, default: 'Dokumentasi', trim: true, maxlength: 80 },

    url: { type: String, default: '', trim: true },
    embedUrl: { type: String, default: '', trim: true },
    thumbnail: { type: String, default: '', trim: true },

    relatedFood: { type: Schema.Types.ObjectId, ref: 'Food', default: null, index: true },

    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

videoSchema.index({ createdAt: -1 });

export default mongoose.model('Video', videoSchema);
