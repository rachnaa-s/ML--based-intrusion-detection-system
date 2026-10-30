import crypto from 'crypto';
import { isConnected } from '../config/db.js';
import PredictionLog from '../models/PredictionLog.js';
import BlockedIP from '../models/BlockedIP.js';
import Preset from '../models/Preset.js';
import Zone from '../models/Zone.js';
import Alert from '../models/Alert.js';
import AuditTrail from '../models/AuditTrail.js';
import { SAMPLE_PRESETS } from './dataConstants.js';
import { DEFAULT_ZONES } from './prioritization.js';

// In-memory fallbacks when MongoDB is not connected
const memoryStore = {
  history: [],
  blockedIPs: [
    {
      _id: 'mem_1',
      id: 'FW-1092',
      ip: '203.0.113.45',
      reason: 'Known external botnet scanner (Pre-configured sample)',
      severity: 'Critical',
      threat_type: 'Reconnaissance Probe',
      timestamp: '2026-10-21 14:15:00',
      createdAt: new Date('2026-10-21T14:15:00Z')
    }
  ],
  presets: [...SAMPLE_PRESETS],
  zones: JSON.parse(JSON.stringify(DEFAULT_ZONES)),
  alerts: [],
  auditTrail: [
    {
      id: `AUD-${Date.now()}-init`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event_type: 'SYSTEM_INITIALIZATION',
      actor: 'SYSTEM',
      details: 'Defence Network Security Monitoring and Incident Response System initialized with 4 simulated zones.'
    }
  ]
};

/**
 * Seed presets, initial firewall rules, and defence zones if MongoDB collections are empty
 */
export async function seedDefaultsIfNeeded() {
  if (!isConnected()) return;

  try {
    const presetCount = await Preset.countDocuments();
    if (presetCount === 0) {
      await Preset.insertMany(SAMPLE_PRESETS);
      console.log(`[MongoDB] Seeded ${SAMPLE_PRESETS.length} benchmark traffic presets into database.`);
    }

    const blockedCount = await BlockedIP.countDocuments();
    if (blockedCount === 0) {
      await BlockedIP.create(memoryStore.blockedIPs[0]);
      console.log(`[MongoDB] Seeded initial firewall sample block rule into database.`);
    }

    const zoneCount = await Zone.countDocuments();
    if (zoneCount === 0) {
      await Zone.insertMany(DEFAULT_ZONES);
      console.log(`[MongoDB] Seeded ${DEFAULT_ZONES.length} defence network zones into database.`);

      await logAuditEvent(
        'SYSTEM_INITIALIZATION',
        'SYSTEM',
        'Defence Network Security Monitoring and Incident Response System initialized with 4 simulated zones.'
      );
    }
  } catch (err) {
    console.warn('[MongoDB] Seeding notice:', err.message);
  }
}

/**
 * Log an audit trail event
 */
export async function logAuditEvent(eventType, actor, details, zoneId = null, alertId = null) {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const eventId = `AUD-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

  const entry = {
    id: eventId,
    timestamp: nowStr,
    event_type: eventType,
    actor,
    details,
    zone_id: zoneId,
    alert_id: alertId
  };

  if (isConnected()) {
    try {
      await AuditTrail.create(entry);
      return eventId;
    } catch (err) {
      console.error('[MongoDB] Error logging audit event:', err.message);
    }
  }

  memoryStore.auditTrail.unshift(entry);
  if (memoryStore.auditTrail.length > 500) memoryStore.auditTrail.pop();
  return eventId;
}

/**
 * Get chronological audit trail
 */
export async function getAuditTrail(limit = 200) {
  if (isConnected()) {
    try {
      return await AuditTrail.find({}).sort({ timestamp: -1 }).limit(Number(limit)).lean();
    } catch (err) {
      console.error('[MongoDB] Error fetching audit trail:', err.message);
    }
  }
  return memoryStore.auditTrail.slice(0, Number(limit));
}

/**
 * Zones Management
 */
export async function getAllZones() {
  if (isConnected()) {
    try {
      return await Zone.find({}).sort({ id: 1 }).lean();
    } catch (err) {
      console.error('[MongoDB] Error fetching zones:', err.message);
    }
  }
  return memoryStore.zones;
}

export async function getZoneById(zoneId) {
  if (isConnected()) {
    try {
      return await Zone.findOne({ id: zoneId }).lean();
    } catch (err) {
      console.error('[MongoDB] Error fetching zone:', err.message);
    }
  }
  return memoryStore.zones.find(z => z.id === zoneId) || null;
}

export async function updateZoneStats(zoneId, isIntrusion) {
  if (isConnected()) {
    try {
      const zone = await Zone.findOne({ id: zoneId });
      if (zone) {
        zone.traffic_count += 1;
        if (isIntrusion) zone.suspicious_count += 1;

        if (zone.is_isolated === 1) {
          zone.status = 'ISOLATED_SIMULATED';
        } else if (zone.suspicious_count >= 5) {
          zone.status = 'UNDER_ATTACK';
        } else if (zone.suspicious_count > 0) {
          zone.status = 'ELEVATED';
        } else {
          zone.status = 'SECURE';
        }
        await zone.save();
        return zone.toObject();
      }
    } catch (err) {
      console.error('[MongoDB] Error updating zone stats:', err.message);
    }
  }

  // Memory fallback
  const z = memoryStore.zones.find(item => item.id === zoneId);
  if (z) {
    z.traffic_count += 1;
    if (isIntrusion) z.suspicious_count += 1;
    if (z.is_isolated === 1) {
      z.status = 'ISOLATED_SIMULATED';
    } else if (z.suspicious_count >= 5) {
      z.status = 'UNDER_ATTACK';
    } else if (z.suspicious_count > 0) {
      z.status = 'ELEVATED';
    } else {
      z.status = 'SECURE';
    }
    return z;
  }
}

export async function toggleSimulatedIsolation(zoneId, actor = "HUMAN_ANALYST") {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (isConnected()) {
    try {
      const zone = await Zone.findOne({ id: zoneId });
      if (!zone) return { zone: null, error: "Zone not found" };

      const newIsolation = zone.is_isolated === 1 ? 0 : 1;
      zone.is_isolated = newIsolation;
      zone.isolation_timestamp = newIsolation === 1 ? nowStr : null;
      zone.status = newIsolation === 1 ? 'ISOLATED_SIMULATED' : (zone.suspicious_count > 0 ? 'ELEVATED' : 'SECURE');
      await zone.save();

      const actionLabel = newIsolation === 1 ? "SIMULATED_ZONE_ISOLATION_ACTIVATED" : "SIMULATED_ZONE_ISOLATION_REVOKED";
      const detailsDesc = `Analyst ${actor} ${newIsolation === 1 ? 'engaged simulated containment isolation on' : 'restored simulated connectivity to'} ${zone.name}.`;

      await logAuditEvent(actionLabel, actor, detailsDesc, zoneId);
      return { zone: zone.toObject(), error: null };
    } catch (err) {
      console.error('[MongoDB] Error toggling isolation:', err.message);
    }
  }

  // Memory fallback
  const z = memoryStore.zones.find(item => item.id === zoneId);
  if (!z) return { zone: null, error: "Zone not found" };

  z.is_isolated = z.is_isolated === 1 ? 0 : 1;
  z.isolation_timestamp = z.is_isolated === 1 ? nowStr : null;
  z.status = z.is_isolated === 1 ? 'ISOLATED_SIMULATED' : (z.suspicious_count > 0 ? 'ELEVATED' : 'SECURE');

  const actionLabel = z.is_isolated === 1 ? "SIMULATED_ZONE_ISOLATION_ACTIVATED" : "SIMULATED_ZONE_ISOLATION_REVOKED";
  const detailsDesc = `Analyst ${actor} ${z.is_isolated === 1 ? 'engaged simulated containment isolation on' : 'restored simulated connectivity to'} ${z.name}.`;
  await logAuditEvent(actionLabel, actor, detailsDesc, zoneId);

  return { zone: z, error: null };
}

/**
 * Alerts Management
 */
export async function createAlert(alertData) {
  if (isConnected()) {
    try {
      const doc = await Alert.create(alertData);
      await logAuditEvent(
        'ALERT_GENERATED',
        'ML_ENGINE_PIPELINE',
        `ML Model detected ${alertData.prediction} (${alertData.attack_type || 'Threat'}) in zone [${alertData.zone_id}]. Assigned ${alertData.priority}.`,
        alertData.zone_id,
        alertData.id
      );
      return doc.toObject();
    } catch (err) {
      console.error('[MongoDB] Error creating alert:', err.message);
    }
  }

  memoryStore.alerts.unshift(alertData);
  if (memoryStore.alerts.length > 500) memoryStore.alerts.pop();

  await logAuditEvent(
    'ALERT_GENERATED',
    'ML_ENGINE_PIPELINE',
    `ML Model detected ${alertData.prediction} (${alertData.attack_type || 'Threat'}) in zone [${alertData.zone_id}]. Assigned ${alertData.priority}.`,
    alertData.zone_id,
    alertData.id
  );

  return alertData;
}

export async function getAlerts({ priority, status, zone_id, limit = 100 } = {}) {
  if (isConnected()) {
    try {
      const query = {};
      if (priority) query.priority = priority;
      if (status) query.status = status;
      if (zone_id) query.zone_id = zone_id;

      return await Alert.find(query).sort({ timestamp: -1 }).limit(Number(limit)).lean();
    } catch (err) {
      console.error('[MongoDB] Error fetching alerts:', err.message);
    }
  }

  let filtered = [...memoryStore.alerts];
  if (priority) filtered = filtered.filter(a => a.priority === priority);
  if (status) filtered = filtered.filter(a => a.status === status);
  if (zone_id) filtered = filtered.filter(a => a.zone_id === zone_id);
  return filtered.slice(0, Number(limit));
}

export async function getAlertById(alertId) {
  if (isConnected()) {
    try {
      return await Alert.findOne({ id: alertId }).lean();
    } catch (err) {
      console.error('[MongoDB] Error fetching alert:', err.message);
    }
  }
  return memoryStore.alerts.find(a => a.id === alertId) || null;
}

export async function updateAlertInvestigation(alertId, status, notes, decision, actor = "HUMAN_ANALYST") {
  if (isConnected()) {
    try {
      const updated = await Alert.findOneAndUpdate(
        { id: alertId },
        { $set: { status, analyst_notes: notes, analyst_decision: decision } },
        { new: true }
      ).lean();

      if (updated) {
        await logAuditEvent(
          'ANALYST_INVESTIGATION_UPDATED',
          actor,
          `Analyst ${actor} updated Alert [${alertId}]: Status='${status}', Decision='${decision}'.`,
          updated.zone_id,
          alertId
        );
        return updated;
      }
    } catch (err) {
      console.error('[MongoDB] Error updating alert investigation:', err.message);
    }
  }

  const alert = memoryStore.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = status;
    alert.analyst_notes = notes;
    alert.analyst_decision = decision;

    await logAuditEvent(
      'ANALYST_INVESTIGATION_UPDATED',
      actor,
      `Analyst ${actor} updated Alert [${alertId}]: Status='${status}', Decision='${decision}'.`,
      alert.zone_id,
      alertId
    );
    return alert;
  }
  return null;
}

export async function recordApprovedAction(alertId, actionType, approvedBy = "SOC_OFFICER_1") {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (isConnected()) {
    try {
      const updated = await Alert.findOneAndUpdate(
        { id: alertId },
        {
          $set: {
            approved_action: actionType,
            approved_by: approvedBy,
            approved_at: nowStr,
            status: 'CONTAINED_SIMULATED'
          }
        },
        { new: true }
      ).lean();

      if (updated) {
        await logAuditEvent(
          'SIMULATED_CONTAINMENT_APPROVED',
          approvedBy,
          `Explicit human approval granted for simulated action '${actionType}' on Alert [${alertId}].`,
          updated.zone_id,
          alertId
        );
        return updated;
      }
    } catch (err) {
      console.error('[MongoDB] Error recording approved action:', err.message);
    }
  }

  const alert = memoryStore.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.approved_action = actionType;
    alert.approved_by = approvedBy;
    alert.approved_at = nowStr;
    alert.status = 'CONTAINED_SIMULATED';

    await logAuditEvent(
      'SIMULATED_CONTAINMENT_APPROVED',
      approvedBy,
      `Explicit human approval granted for simulated action '${actionType}' on Alert [${alertId}].`,
      alert.zone_id,
      alertId
    );
    return alert;
  }
  return null;
}

/**
 * Traffic Prediction Log Management
 */
export async function savePrediction(record) {
  if (isConnected()) {
    try {
      const doc = await PredictionLog.create(record);
      return doc.toObject();
    } catch (err) {
      console.error('[MongoDB] Error saving prediction log:', err.message);
    }
  }

  const memoryDoc = {
    ...record,
    _id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date()
  };
  memoryStore.history.unshift(memoryDoc);
  if (memoryStore.history.length > 500) {
    memoryStore.history.pop();
  }
  return memoryDoc;
}

export async function getHistory(limit = 100) {
  if (isConnected()) {
    try {
      return await PredictionLog.find({}).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    } catch (err) {
      console.error('[MongoDB] Error reading history logs:', err.message);
    }
  }
  return memoryStore.history.slice(0, Number(limit));
}

export async function clearHistory() {
  if (isConnected()) {
    try {
      await PredictionLog.deleteMany({});
    } catch (err) {
      console.error('[MongoDB] Error clearing history logs:', err.message);
    }
  }
  memoryStore.history = [];
  return { success: true, message: 'Prediction history log cleared.' };
}

export async function deleteHistoryItem(id) {
  if (isConnected()) {
    try {
      const result = await PredictionLog.findByIdAndDelete(id);
      if (result) return { success: true };
    } catch (err) {
      console.error('[MongoDB] Error deleting history item:', err.message);
    }
  }
  memoryStore.history = memoryStore.history.filter(h => h._id !== id && h.id !== id);
  return { success: true };
}

/**
 * Blocked IPs Management
 */
export async function getBlockedIPs() {
  if (isConnected()) {
    try {
      return await BlockedIP.find({}).sort({ createdAt: -1 }).lean();
    } catch (err) {
      console.error('[MongoDB] Error reading blocked IPs:', err.message);
    }
  }
  return memoryStore.blockedIPs;
}

export async function addBlockedIP({ ip, reason, severity = 'High', threat_type = 'Hostile Traffic' }) {
  const ruleId = `FW-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newEntry = {
    id: ruleId,
    ip: ip.trim(),
    reason: reason || 'Manual SOC Operator Intervention',
    severity,
    threat_type,
    timestamp: nowStr
  };

  if (isConnected()) {
    try {
      const updated = await BlockedIP.findOneAndUpdate(
        { ip: newEntry.ip },
        { $set: newEntry },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      return updated;
    } catch (err) {
      console.error('[MongoDB] Error adding blocked IP:', err.message);
    }
  }

  const existingIdx = memoryStore.blockedIPs.findIndex(b => b.ip === newEntry.ip);
  const memEntry = {
    ...newEntry,
    _id: `mem_${Date.now()}`,
    createdAt: new Date()
  };
  if (existingIdx >= 0) {
    memoryStore.blockedIPs[existingIdx] = memEntry;
  } else {
    memoryStore.blockedIPs.unshift(memEntry);
  }
  return memEntry;
}

export async function removeBlockedIP(identifier) {
  if (isConnected()) {
    try {
      await BlockedIP.deleteMany({
        $or: [{ _id: identifier }, { id: identifier }, { ip: identifier }]
      });
      return { success: true };
    } catch (err) {
      console.error('[MongoDB] Error removing blocked IP:', err.message);
    }
  }

  memoryStore.blockedIPs = memoryStore.blockedIPs.filter(
    b => b._id !== identifier && b.id !== identifier && b.ip !== identifier
  );
  return { success: true };
}

export async function getPresets() {
  if (isConnected()) {
    try {
      const presets = await Preset.find({}).lean();
      if (presets && presets.length > 0) return presets;
    } catch (err) {
      console.error('[MongoDB] Error reading presets:', err.message);
    }
  }
  return SAMPLE_PRESETS;
}

export async function getStats() {
  if (isConnected()) {
    try {
      const [totalCount, intrusionCount, normalCount, blockedCount, alertCount] = await Promise.all([
        PredictionLog.countDocuments(),
        PredictionLog.countDocuments({ is_intrusion: true }),
        PredictionLog.countDocuments({ is_intrusion: false }),
        BlockedIP.countDocuments(),
        Alert.countDocuments()
      ]);

      return {
        total_predictions: totalCount,
        intrusions_detected: intrusionCount,
        normal_traffic: normalCount,
        intrusion_rate: totalCount > 0 ? Math.round((intrusionCount / totalCount) * 10000) / 100 : 0,
        blocked_ips_count: blockedCount,
        alerts_count: alertCount
      };
    } catch (err) {
      console.error('[MongoDB] Error computing stats:', err.message);
    }
  }

  const total = memoryStore.history.length;
  const intrusions = memoryStore.history.filter(h => h.is_intrusion).length;
  const normals = total - intrusions;
  return {
    total_predictions: total,
    intrusions_detected: intrusions,
    normal_traffic: normals,
    intrusion_rate: total > 0 ? Math.round((intrusions / total) * 10000) / 100 : 0,
    blocked_ips_count: memoryStore.blockedIPs.length,
    alerts_count: memoryStore.alerts.length
  };
}
