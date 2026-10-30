import express from 'express';
import { predictTraffic, isModelLoaded } from '../services/mlEngine.js';
import {
  savePrediction,
  getHistory,
  clearHistory,
  deleteHistoryItem,
  getBlockedIPs,
  addBlockedIP,
  removeBlockedIP,
  getPresets,
  getStats
} from '../services/store.js';
import {
  FEATURE_NAMES,
  CATEGORICAL_FEATURES,
  CATEGORICAL_OPTIONS,
  FEATURE_GROUPS
} from '../services/dataConstants.js';
import { getDbStatus, isConnected } from '../config/db.js';

const router = express.Router();

/**
 * Health Check Endpoint
 */
router.get('/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'healthy',
    runtime: 'MERN Stack (Node.js + Express + MongoDB)',
    timestamp: new Date().toISOString(),
    model_loaded: isModelLoaded(),
    model_type: 'NSL-KDD Decision Tree (Pure Node.js Engine)',
    expected_features_count: FEATURE_NAMES.length,
    expected_classes: ['Normal (0)', 'Intrusion (1)'],
    mongodb: {
      status: dbStatus.connected ? 'connected' : 'running_in_memory_fallback',
      connected: dbStatus.connected,
      database: dbStatus.databaseName,
      message: dbStatus.connected
        ? 'Connected to MongoDB'
        : 'Running in resilient in-memory fallback. Add MONGODB_URI to backend/.env to connect MongoDB.'
    }
  });
});

/**
 * Schema and Feature Metadata
 */
router.get('/schema', (req, res) => {
  res.json({
    total_features: FEATURE_NAMES.length,
    feature_names: FEATURE_NAMES,
    categorical_features: CATEGORICAL_FEATURES,
    categorical_options: CATEGORICAL_OPTIONS,
    feature_groups: FEATURE_GROUPS
  });
});

/**
 * Benchmark Traffic Presets
 */
router.get('/presets', async (req, res) => {
  try {
    const presets = await getPresets();
    res.json({ presets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve presets', details: err.message });
  }
});

/**
 * ML Inference Prediction Endpoint
 * Evaluates traffic packet and automatically records audit log in MongoDB
 */
router.post('/predict', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Invalid request: No JSON payload received.',
        message: 'Expected a JSON object containing network traffic features.'
      });
    }

    // Support payload wrapped in {"features": {...}} or direct {...}
    const featuresDict = data.features && typeof data.features === 'object' ? data.features : data;

    // Run Machine Learning inference
    const predictionResult = predictTraffic(featuresDict);

    // Persist to MongoDB
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const logRecord = {
      ...predictionResult,
      raw_input: { ...featuresDict },
      client_ip: String(clientIp)
    };

    const savedDoc = await savePrediction(logRecord);

    res.json({
      ...predictionResult,
      _id: savedDoc._id,
      saved_to_db: isConnected()
    });
  } catch (err) {
    console.error('[API Predict Error]:', err);
    res.status(500).json({
      error: 'Prediction failed during model inference.',
      details: err.message
    });
  }
});

/**
 * History Audit Log Endpoints
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = await getHistory(limit);
    res.json({ history: logs, count: logs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
});

router.delete('/history', async (req, res) => {
  try {
    const result = await clearHistory();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history', details: err.message });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    const result = await deleteHistoryItem(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete history item', details: err.message });
  }
});

/**
 * Blocked IPs / Firewall Endpoints
 */
router.get('/blocked-ips', async (req, res) => {
  try {
    const list = await getBlockedIPs();
    res.json({ blocked_ips: list, count: list.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blocked IPs', details: err.message });
  }
});

router.post('/blocked-ips', async (req, res) => {
  try {
    const { ip, reason, severity, threat_type } = req.body;
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required.' });
    }

    const saved = await addBlockedIP({ ip, reason, severity, threat_type });
    res.status(201).json({
      message: `IP ${ip} blocked successfully.`,
      entry: saved
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block IP', details: err.message });
  }
});

router.delete('/blocked-ips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await removeBlockedIP(id);
    res.json({ message: `Firewall rule removed for ${id}.`, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove firewall rule', details: err.message });
  }
});

/**
 * Dashboard Aggregated Stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

export default router;
