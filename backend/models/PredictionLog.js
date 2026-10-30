import mongoose from 'mongoose';

const PredictionLogSchema = new mongoose.Schema(
  {
    prediction: {
      type: String,
      required: true,
      enum: ['Normal', 'Intrusion']
    },
    prediction_code: {
      type: Number,
      required: true,
      enum: [0, 1]
    },
    is_intrusion: {
      type: Boolean,
      required: true
    },
    confidence_percent: {
      type: Number,
      required: true
    },
    probabilities: {
      normal: { type: Number, default: 0 },
      intrusion: { type: Number, default: 0 }
    },
    risk_assessment: {
      threat_level: String,
      severity_color: String,
      verdict: String,
      explanation: String,
      recommended_action: String
    },
    traffic_summary: {
      protocol: String,
      service: String,
      flag: String,
      src_bytes: Number,
      dst_bytes: Number,
      connection_count: Number
    },
    raw_input: {
      type: Object,
      default: {}
    },
    client_ip: {
      type: String,
      default: '127.0.0.1'
    },
    timestamp: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast dashboard query and auditing
PredictionLogSchema.index({ createdAt: -1 });
PredictionLogSchema.index({ is_intrusion: 1 });
PredictionLogSchema.index({ prediction: 1 });

const PredictionLog = mongoose.models.PredictionLog || mongoose.model('PredictionLog', PredictionLogSchema);

export default PredictionLog;
