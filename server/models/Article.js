import mongoose from 'mongoose';

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: [true, 'Judul artikel wajib diisi'], trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, default: '', trim: true, maxlength: 500 },
    content: { type: String, default: '', trim: true, maxlength: 60000 },
    coverImage: { type: String, default: '', trim: true },
    category: { type: String, default: 'Budaya', trim: true, maxlength: 80, index: true },
    author: { type: String, default: 'Tim RASIBOGA', trim: true, maxlength: 120 },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

articleSchema.index({ createdAt: -1 });

export default mongoose.model('Article', articleSchema);
