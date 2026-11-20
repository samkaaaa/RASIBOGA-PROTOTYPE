import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Shared shape for Cloudinary-backed media. */
export const mediaSchema = new Schema(
  {
    url: { type: String, default: '', trim: true },
    publicId: { type: String, default: '', trim: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw', ''], default: '' },
  },
  { _id: false }
);

export const FOOD_CATEGORIES = ['Makanan Berat', 'Jajanan Tradisional', 'Minuman'];

export const PROVENANCE_TYPES = ['local', 'adaptation', 'general'];

export const PROVENANCE_LABELS = {
  local: 'Kuliner Khas Rembang',
  adaptation: 'Resep Adaptasi',
  general: 'Resep Umum',
};

const foodSchema = new Schema(
  {
    name: { type: String, required: [true, 'Nama makanan wajib diisi'], trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    description: { type: String, default: '', trim: true, maxlength: 4000 },
    history: { type: String, default: '', trim: true, maxlength: 20000 },
    philosophy: { type: String, default: '', trim: true, maxlength: 20000 },

    category: {
      type: String,
      required: [true, 'Kategori wajib dipilih'],
      enum: { values: FOOD_CATEGORIES, message: 'Kategori tidak dikenal' },
      index: true,
    },

    provenance: {
      label: {
        type: String,
        enum: Object.values(PROVENANCE_LABELS),
        default: PROVENANCE_LABELS.general,
      },
      type: {
        type: String,
        enum: PROVENANCE_TYPES,
        default: 'general',
        index: true,
      },
    },

    originLocation: { type: Schema.Types.ObjectId, ref: 'Location', default: null },

    mainImage: { type: mediaSchema, default: () => ({}) },
    gallery: { type: [mediaSchema], default: [] },

    sources: { type: [String], default: [] },

    contentStatus: {
      type: String,
      enum: ['draft', 'verified'],
      default: 'draft',
      index: true,
    },

    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

foodSchema.index({ name: 'text', description: 'text', history: 'text' });
foodSchema.index({ createdAt: -1 });

/** Keep the provenance label in sync with its type. */
foodSchema.pre('validate', function syncProvenance(next) {
  if (this.provenance?.type && !this.provenance.label) {
    this.provenance.label = PROVENANCE_LABELS[this.provenance.type];
  }
  next();
});

export default mongoose.model('Food', foodSchema);
