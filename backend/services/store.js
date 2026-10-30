import { isConnected } from '../config/db.js';
import PredictionLog from '../models/PredictionLog.js';
import BlockedIP from '../models/BlockedIP.js';
import Preset from '../models/Preset.js';
import { SAMPLE_PRESETS } from './dataConstants.js';

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
  presets: [...SAMPLE_PRESETS]
};

/**
 * Seed presets and initial firewall rules if MongoDB collection is empty
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
  } catch (err) {
    console.warn('[MongoDB] Seeding notice:', err.message);
  }
}

/**
 * Save a new traffic prediction log
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

  // Fallback to memory
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

/**
 * Retrieve prediction history logs
 */
export async function getHistory(limit = 100) {
  if (isConnected()) {
    try {
      const logs = await PredictionLog.find({})
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();
      return logs;
    } catch (err) {
      console.error('[MongoDB] Error reading history logs:', err.message);
    }
  }
  return memoryStore.history.slice(0, Number(limit));
}

/**
 * Clear all prediction history logs
 */
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

/**
 * Delete a single prediction history record
 */
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
 * Retrieve all blocked IPs
 */
export async function getBlockedIPs() {
  if (isConnected()) {
    try {
      const list = await BlockedIP.find({}).sort({ createdAt: -1 }).lean();
      return list;
    } catch (err) {
      console.error('[MongoDB] Error reading blocked IPs:', err.message);
    }
  }
  return memoryStore.blockedIPs;
}

/**
 * Add an IP to the firewall blocklist
 */
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
      // Upsert to avoid duplicate errors
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

  // Memory fallback
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

/**
 * Remove an IP from the firewall blocklist
 */
export async function removeBlockedIP(identifier) {
  if (isConnected()) {
    try {
      // identifier can be ruleId (_id, id, or ip)
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

/**
 * Get presets (from MongoDB if available, otherwise dataConstants)
 */
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

/**
 * Get aggregated statistics for dashboard KPIs
 */
export async function getStats() {
  if (isConnected()) {
    try {
      const [totalCount, intrusionCount, normalCount, blockedCount] = await Promise.all([
        PredictionLog.countDocuments(),
        PredictionLog.countDocuments({ is_intrusion: true }),
        PredictionLog.countDocuments({ is_intrusion: false }),
        BlockedIP.countDocuments()
      ]);

      return {
        total_predictions: totalCount,
        intrusions_detected: intrusionCount,
        normal_traffic: normalCount,
        intrusion_rate: totalCount > 0 ? Math.round((intrusionCount / totalCount) * 10000) / 100 : 0,
        blocked_ips_count: blockedCount
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
    blocked_ips_count: memoryStore.blockedIPs.length
  };
}
