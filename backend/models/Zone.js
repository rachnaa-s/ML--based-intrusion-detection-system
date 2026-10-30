import mongoose from 'mongoose';

const ZoneSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      required: true
    },
    criticality: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    status: {
      type: String,
      default: 'SECURE'
    },
    traffic_count: {
      type: Number,
      default: 0
    },
    suspicious_count: {
      type: Number,
      default: 0
    },
    is_isolated: {
      type: Number,
      default: 0
    },
    isolation_timestamp: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Zone = mongoose.models.Zone || mongoose.model('Zone', ZoneSchema);

export default Zone;
