import mongoose from 'mongoose';

const { Schema } = mongoose;

export const DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit'];
export const STEP_MEDIA_TYPES = ['video', 'animation', 'illustration', ''];

const recipeIngredientSchema = new Schema(
  {
    ingredient: { type: Schema.Types.ObjectId, ref: 'Ingredient', default: null },
    name: { type: String, default: '', trim: true }, // fallback label when not linked
    quantity: { type: Number, default: null, min: 0 },
    unit: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const stepSchema = new Schema(
  {
    stepNumber: { type: Number, required: true, min: 1 },
    title: { type: String, default: '', trim: true, maxlength: 160 },
    description: { type: String, required: [true, 'Instruksi langkah wajib diisi'], trim: true, maxlength: 4000 },
    media: {
      type: {
        type: String,
        enum: STEP_MEDIA_TYPES,
        default: '',
      },
      url: { type: String, default: '', trim: true },
      thumbnail: { type: String, default: '', trim: true },
    },
    durationSeconds: { type: Number, default: 0, min: 0 },
    tips: { type: String, default: '', trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const tutorialVideoSchema = new Schema(
  {
    provider: { type: String, enum: ['youtube', 'cloudinary', 'local', ''], default: '' },
    url: { type: String, default: '', trim: true },
    embedUrl: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    title: { type: String, default: '', trim: true, maxlength: 160 },
    food: { type: Schema.Types.ObjectId, ref: 'Food', required: [true, 'Resep harus terhubung ke makanan'], index: true },

    servings: { type: Number, default: 2, min: 1, max: 100 },
    preparationTime: { type: Number, default: 0, min: 0 }, // minutes
    cookingTime: { type: Number, default: 0, min: 0 }, // minutes
    difficulty: { type: String, enum: DIFFICULTIES, default: 'Mudah' },

    ingredients: { type: [recipeIngredientSchema], default: [] },
    equipment: { type: [String], default: [] },
    steps: { type: [stepSchema], default: [] },

    tutorialVideo: { type: tutorialVideoSchema, default: () => ({}) },

    notes: { type: String, default: '', trim: true, maxlength: 4000 },
    contentStatus: {
      type: String,
      enum: ['draft', 'verified'],
      default: 'draft',
    },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

recipeSchema.index({ food: 1, createdAt: -1 });

/** Normalise step numbering so cooking mode can rely on it. */
recipeSchema.pre('validate', function normaliseSteps(next) {
  if (Array.isArray(this.steps)) {
    this.steps = this.steps
      .filter((step) => step && (step.description || '').trim())
      .map((step, index) => {
        step.stepNumber = index + 1;
        return step;
      });
  }
  next();
});

export default mongoose.model('Recipe', recipeSchema);
