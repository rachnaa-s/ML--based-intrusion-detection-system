import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FEATURE_NAMES, CATEGORICAL_FEATURES, CATEGORICAL_OPTIONS } from './dataConstants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load exported trained Decision Tree model
const MODEL_FILE = path.join(__dirname, '..', 'model.json');

let modelData = null;

export function loadModel() {
  try {
    if (!fs.existsSync(MODEL_FILE)) {
      console.error(`[IDS ML Engine] Model file not found at: ${MODEL_FILE}`);
      return false;
    }
    const raw = fs.readFileSync(MODEL_FILE, 'utf-8');
    modelData = JSON.parse(raw);
    console.log(`[IDS ML Engine] Decision Tree model successfully loaded into memory.`);
    console.log(`[IDS ML Engine] Nodes: ${modelData.tree.node_count}, Classes: ${modelData.classes}`);
    return true;
  } catch (err) {
    console.error(`[IDS ML Engine] Error loading model:`, err);
    modelData = null;
    return false;
  }
}

// Auto-load at startup
loadModel();

export function isModelLoaded() {
  return modelData !== null;
}

/**
 * Cybersecurity Risk Assessment Engine
 * Generates an academic SOC explanation based on detected features
 */
export function generateRiskAssessment(predictionCode, probabilities, rowDict) {
  if (predictionCode === 0) {
    return {
      threat_level: "Low / Safe",
      severity_color: "green",
      verdict: "Legitimate Network Traffic",
      explanation: `The connection exhibited normal behavioral characteristics: completed handshake (flag: ${rowDict.flag || 'SF'}), regular payload ratio, and normal error rates.`,
      recommended_action: "Allow packet. Log connection for standard traffic auditing."
    };
  } else {
    const flag = String(rowDict.flag || '');
    const srv_serror = parseFloat(rowDict.srv_serror_rate || 0.0);
    const rerror = parseFloat(rowDict.rerror_rate || 0.0);
    const failed_logins = parseInt(rowDict.num_failed_logins || 0, 10);
    const protocol = String(rowDict.protocol_type || '');
    const count = parseFloat(rowDict.count || 0);

    let attackType = "Network Intrusion / Anomaly";
    if (flag === 'S0' || srv_serror > 0.5) {
      attackType = "Denial of Service (DoS - SYN Flood / Neptune)";
    } else if (flag === 'REJ' || rerror > 0.5) {
      attackType = "Surveillance & Reconnaissance (Port Scan / Probe)";
    } else if (protocol === 'icmp' && count > 300) {
      attackType = "Denial of Service (ICMP Broadcast Flood / Smurf)";
    } else if (failed_logins >= 2) {
      attackType = "Remote-to-Local Privilege Escalation (Brute Force / R2L)";
    } else if (parseInt(rowDict.root_shell || 0, 10) === 1 || parseInt(rowDict.num_root || 0, 10) > 0) {
      attackType = "User-to-Root Exploitation (U2R / Privilege Escalation)";
    }

    return {
      threat_level: "High Risk / Alert",
      severity_color: "red",
      verdict: `Hostile Intrusion Detected (${attackType})`,
      explanation: `Traffic patterns deviated significantly from baseline: flagged flag '${flag}', SYN/REJ error anomalies, and high connection density.`,
      recommended_action: "Isolate source IP, deploy dynamic firewall filtering rules, and alert SOC security analysts."
    };
  }
}

/**
 * Predict function executing NSL-KDD Decision Tree inference in pure Node.js
 */
export function predictTraffic(featuresDict = {}) {
  if (!modelData) {
    if (!loadModel()) {
      throw new Error("Model is not loaded. Ensure model.json is present in the backend folder.");
    }
  }

  // Build row values according to 41 feature specification
  const rowValues = {};
  const missingFeatures = [];

  for (const feat of FEATURE_NAMES) {
    if (featuresDict[feat] === undefined || featuresDict[feat] === null) {
      missingFeatures.push(feat);
      if (CATEGORICAL_FEATURES.includes(feat)) {
        rowValues[feat] = CATEGORICAL_OPTIONS[feat][0];
      } else {
        rowValues[feat] = 0;
      }
    } else {
      const rawVal = featuresDict[feat];
      if (CATEGORICAL_FEATURES.includes(feat)) {
        rowValues[feat] = String(rawVal).trim();
      } else {
        const num = parseFloat(rawVal);
        rowValues[feat] = isNaN(num) ? 0.0 : num;
      }
    }
  }

  // Preprocessing: One-hot encode categorical features, followed by numeric features
  const encoded = [];
  for (const col of modelData.cat_cols) {
    const val = String(rowValues[col] || '');
    const cats = modelData.categories[col];
    for (const cat of cats) {
      encoded.push(val === cat ? 1.0 : 0.0);
    }
  }

  for (const col of modelData.num_cols) {
    encoded.push(Number(rowValues[col]) || 0.0);
  }

  // Execute Decision Tree Traversal
  const { children_left, children_right, feature, threshold, value } = modelData.tree;
  let node = 0;

  while (children_left[node] !== children_right[node]) {
    const fIdx = feature[node];
    const th = threshold[node];
    if (encoded[fIdx] <= th) {
      node = children_left[node];
    } else {
      node = children_right[node];
    }
  }

  // Leaf node probability distribution
  const leafValues = value[node];
  const total = leafValues.reduce((acc, curr) => acc + curr, 0);
  const probNormal = total > 0 ? leafValues[0] / total : 0;
  const probIntrusion = total > 0 ? leafValues[1] / total : 0;

  const predictionCode = probIntrusion > probNormal ? 1 : 0;
  const predictionLabel = predictionCode === 1 ? "Intrusion" : "Normal";
  const isIntrusion = predictionCode === 1;

  const probabilities = {
    normal: Math.round(probNormal * 10000) / 100,
    intrusion: Math.round(probIntrusion * 10000) / 100
  };

  const confidence = Math.round((predictionCode === 1 ? probIntrusion : probNormal) * 10000) / 100;
  const risk = generateRiskAssessment(predictionCode, probabilities, rowValues);

  return {
    prediction: predictionLabel,
    prediction_code: predictionCode,
    is_intrusion: isIntrusion,
    confidence_percent: confidence,
    probabilities: probabilities,
    risk_assessment: risk,
    traffic_summary: {
      protocol: rowValues.protocol_type,
      service: rowValues.service,
      flag: rowValues.flag,
      src_bytes: rowValues.src_bytes,
      dst_bytes: rowValues.dst_bytes,
      connection_count: rowValues.count
    },
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    model_architecture: "NSL-KDD Decision Tree (Pure Node.js High-Performance Inference)",
    warnings: missingFeatures.map(f => `Missing feature '${f}' defaulted to ${rowValues[f]}`)
  };
}
