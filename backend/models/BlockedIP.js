import mongoose from 'mongoose';

const BlockedIPSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    ip: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    reason: {
      type: String,
      default: 'Manual Operator Intervention'
    },
    severity: {
      type: String,
      default: 'High'
    },
    threat_type: {
      type: String,
      default: 'Hostile Traffic'
    },
    timestamp: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

BlockedIPSchema.index({ createdAt: -1 });

const BlockedIP = mongoose.models.BlockedIP || mongoose.model('BlockedIP', BlockedIPSchema);

export default BlockedIP;
