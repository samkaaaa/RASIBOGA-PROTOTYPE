import mongoose from 'mongoose';
import { mediaSchema } from './Food.js';

const { Schema } = mongoose;

const ingredientSchema = new Schema(
  {
    name: { type: String, required: [true, 'Nama bahan wajib diisi'], trim: true, maxlength: 140 },
    slug: { type: String, lowercase: true, trim: true, index: true },
    description: { type: String, default: '', trim: true, maxlength: 4000 },
    originLocations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
    image: { type: mediaSchema, default: () => ({}) },
    verificationStatus: {
      type: String,
      enum: ['verified', 'unverified'],
      default: 'unverified',
      index: true,
    },
  },
  { timestamps: true }
);

ingredientSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Ingredient', ingredientSchema);
