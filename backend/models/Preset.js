import mongoose from 'mongoose';

const PresetSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    expected: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    features: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Preset = mongoose.models.Preset || mongoose.model('Preset', PresetSchema);

export default Preset;
