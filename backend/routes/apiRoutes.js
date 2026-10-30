import express from 'express';
import crypto from 'crypto';
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
  getStats,
  getAllZones,
  getZoneById,
  toggleSimulatedIsolation,
  updateZoneStats,
  createAlert,
  getAlerts,
  getAlertById,
  updateAlertInvestigation,
  recordApprovedAction,
  getAuditTrail
} from '../services/store.js';
import { calculateThreatPriority } from '../services/prioritization.js';
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
 * Defence Zones Endpoints
 */
router.get('/zones', async (req, res) => {
  try {
    const zones = await getAllZones();
    res.json({ zones });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch zones', details: err.message });
  }
});

router.post('/zones/:zone_id/simulate-isolation', async (req, res) => {
  try {
    const { zone_id } = req.params;
    const actor = req.body?.actor || 'HUMAN_ANALYST';
    const { zone, error } = await toggleSimulatedIsolation(zone_id, actor);

    if (error) {
      return res.status(404).json({ error });
    }

    res.json({
      success: true,
      zone,
      message: zone.is_isolated === 1
        ? `Simulated isolation activated for ${zone.name}.`
        : `Simulated isolation revoked for ${zone.name}.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle zone isolation', details: err.message });
  }
});

/**
 * Defence Alerts Endpoints
 */
router.get('/alerts', async (req, res) => {
  try {
    const { priority, status, zone_id, limit } = req.query;
    const alerts = await getAlerts({ priority, status, zone_id, limit });
    res.json({ alerts, count: alerts.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: err.message });
  }
});

router.get('/alerts/:alert_id', async (req, res) => {
  try {
    const alert = await getAlertById(req.params.alert_id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alert', details: err.message });
  }
});

router.patch('/alerts/:alert_id', async (req, res) => {
  try {
    const { status, analyst_notes, analyst_decision, actor } = req.body;
    const updated = await updateAlertInvestigation(
      req.params.alert_id,
      status || 'IN_PROGRESS',
      analyst_notes || '',
      analyst_decision || 'REVIEWED',
      actor || 'HUMAN_ANALYST'
    );
    if (!updated) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true, alert: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert', details: err.message });
  }
});

router.post('/alerts/:alert_id/action', async (req, res) => {
  try {
    const { action_type, confirmed, approved_by } = req.body;
    if (!confirmed) {
      return res.status(400).json({
        error: "Explicit human approval confirmation is required before recording containment action."
      });
    }

    const updated = await recordApprovedAction(
      req.params.alert_id,
      action_type,
      approved_by || 'SOC_OFFICER_1'
    );
    if (!updated) return res.status(404).json({ error: 'Alert not found' });

    res.json({
      success: true,
      message: `Simulated response action '${action_type}' approved and recorded in immutable audit log.`,
      alert: updated,
      is_simulated: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record action', details: err.message });
  }
});

/**
 * Recommendations for an Alert
 */
router.get('/recommendations/:alert_id', async (req, res) => {
  try {
    const alert = await getAlertById(req.params.alert_id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    const attackType = alert.attack_type || '';
    const zoneId = alert.zone_id || 'command_centre';
    const sourceIp = alert.source_ip || '192.168.1.100';

    const recs = [];
    if (attackType.includes('DoS') || attackType.includes('SYN')) {
      recs.push({
        id: 'REC-01',
        title: 'Dynamic SYN Rate-Limiting & Drop Rule',
        severity: 'High',
        action_type: 'FIREWALL_DROP_SYN',
        command: `iptables -A INPUT -p tcp --syn -s ${sourceIp} -j DROP`,
        justification: `SYN flood anomaly detected targeting ${zoneId}. Immediate packet discard mitigates service exhaustion.`
      });
    }

    if (attackType.includes('Portscan') || attackType.includes('Surveillance') || attackType.includes('Probe')) {
      recs.push({
        id: 'REC-02',
        title: 'Reconnaissance Quarantine & Blackhole Route',
        severity: 'Medium',
        action_type: 'QUARANTINE_IP',
        command: `ip route add blackhole ${sourceIp}/32`,
        justification: `Port scanning signature detected. Diverts reconnaissance probes away from internal sector assets.`
      });
    }

    if (alert.priority === 'P1_CRITICAL') {
      recs.push({
        id: 'REC-03',
        title: 'Simulated Zone Network Isolation',
        severity: 'Critical',
        action_type: 'SIMULATE_ZONE_ISOLATION',
        command: `simulate-isolate-zone --zone ${zoneId}`,
        justification: `Mission-critical sector under high-impact hostile threat. Isolates sector from external ingress.`
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: 'REC-04',
        title: 'Enhanced Traffic Auditing & Packet Capture',
        severity: 'Low',
        action_type: 'ENABLE_EXTENDED_LOGGING',
        command: `tcpdump -i any host ${sourceIp} -w /var/log/ids_capture.pcap`,
        justification: `Baseline packet inspection for standard SOC forensic records.`
      });
    }

    res.json({
      alert_id: alert.id,
      zone_id: zoneId,
      source_ip: sourceIp,
      priority: alert.priority,
      recommendations: recs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate recommendations', details: err.message });
  }
});

/**
 * Immutable Audit Trail Endpoint
 */
router.get('/audit-trail', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '200', 10);
    const trail = await getAuditTrail(limit);
    res.json({ audit_trail: trail, count: trail.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit trail', details: err.message });
  }
});

/**
 * ML Inference Prediction Endpoint
 * Evaluates traffic packet, calculates threat priority, creates Alert, updates Zone, and logs to MongoDB
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

    const featuresDict = data.features && typeof data.features === 'object' ? data.features : data;
    const zoneId = data.zone_id || 'command_centre';
    const sourceIp = data.source_ip || (data.flag === 'S0' ? '198.51.100.22' : '192.168.1.105');

    // Run Machine Learning inference
    const predictionResult = predictTraffic(featuresDict);

    // Threat prioritization calculation
    const priorityResult = calculateThreatPriority(
      predictionResult.prediction_code,
      predictionResult.confidence_percent,
      zoneId,
      featuresDict
    );

    // Update Zone dynamic statistics
    await updateZoneStats(zoneId, predictionResult.is_intrusion);

    // Create Alert record
    const alertId = `ALT-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const alertData = {
      id: alertId,
      timestamp: nowStr,
      zone_id: zoneId,
      prediction: predictionResult.prediction,
      prediction_code: predictionResult.prediction_code,
      confidence: predictionResult.confidence_percent,
      priority: priorityResult.priority,
      priority_reason: priorityResult.priority_reason,
      status: predictionResult.is_intrusion ? 'NEW' : 'CLOSED',
      source_ip: sourceIp,
      attack_type: priorityResult.attack_type,
      raw_features: featuresDict
    };

    await createAlert(alertData);

    // Persist to PredictionLog
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || sourceIp;
    const logRecord = {
      ...predictionResult,
      raw_input: { ...featuresDict },
      client_ip: String(clientIp)
    };

    const savedDoc = await savePrediction(logRecord);

    res.json({
      ...predictionResult,
      _id: savedDoc._id,
      priority_assessment: priorityResult,
      alert_id: alertId,
      zone_id: zoneId,
      source_ip: sourceIp,
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
