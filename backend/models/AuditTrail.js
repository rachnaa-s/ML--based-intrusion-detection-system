import mongoose from 'mongoose';

const AuditTrailSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    timestamp: {
      type: String,
      required: true
    },
    event_type: {
      type: String,
      required: true
    },
    actor: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    zone_id: {
      type: String
    },
    alert_id: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

AuditTrailSchema.index({ timestamp: -1 });

const AuditTrail = mongoose.models.AuditTrail || mongoose.model('AuditTrail', AuditTrailSchema);

export default AuditTrail;
