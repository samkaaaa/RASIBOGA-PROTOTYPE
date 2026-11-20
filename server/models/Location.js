import mongoose from 'mongoose';

const { Schema } = mongoose;

export const LOCATION_TYPES = ['food-origin', 'ingredient-origin'];
export const VERIFICATION_STATUSES = ['verified', 'unverified'];

const locationSchema = new Schema(
  {
    name: { type: String, required: [true, 'Nama lokasi wajib diisi'], trim: true, maxlength: 160 },
    village: { type: String, default: '', trim: true, maxlength: 120 },
    district: { type: String, default: '', trim: true, maxlength: 120, index: true },
    regency: { type: String, default: 'Rembang', trim: true, maxlength: 120 },
    province: { type: String, default: 'Jawa Tengah', trim: true, maxlength: 120 },

    coordinates: {
      lat: { type: Number, default: null, min: -90, max: 90 },
      lng: { type: Number, default: null, min: -180, max: 180 },
    },

    description: { type: String, default: '', trim: true, maxlength: 4000 },
    locationType: {
      type: [{ type: String, enum: LOCATION_TYPES }],
      default: ['food-origin'],
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'unverified',
      index: true,
    },
  },
  { timestamps: true }
);

/** A location is only mappable when both coordinates are finite numbers. */
locationSchema.virtual('hasCoordinates').get(function hasCoordinates() {
  const { lat, lng } = this.coordinates || {};
  return Number.isFinite(lat) && Number.isFinite(lng);
});

locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Location', locationSchema);
