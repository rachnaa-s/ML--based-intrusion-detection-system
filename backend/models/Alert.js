import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
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
    zone_id: {
      type: String,
      required: true
    },
    prediction: {
      type: String,
      required: true
    },
    prediction_code: {
      type: Number,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    priority: {
      type: String,
      required: true
    },
    priority_reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'NEW'
    },
    source_ip: {
      type: String,
      default: '192.168.1.100'
    },
    attack_type: {
      type: String,
      default: 'Unclassified Anomaly'
    },
    analyst_notes: {
      type: String,
      default: ''
    },
    analyst_decision: {
      type: String,
      default: 'UNREVIEWED'
    },
    approved_action: {
      type: String
    },
    approved_by: {
      type: String
    },
    approved_at: {
      type: String
    },
    raw_features: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ priority: 1 });
AlertSchema.index({ status: 1 });
AlertSchema.index({ zone_id: 1 });

const Alert = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);

export default Alert;
