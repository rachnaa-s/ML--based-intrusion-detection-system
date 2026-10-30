/**
 * Threat Prioritization Engine for Defence Network Security Monitoring (JavaScript/Node.js).
 * Applies documented rules to calculate investigation priority based on:
 * 1. Model Prediction (Normal vs Intrusion from NSL-KDD Decision Tree)
 * 2. Model Confidence (Certainty score)
 * 3. Simulated Zone Criticality (Tier 1 Mission Critical, Tier 2 Tactical, Tier 3 Operational)
 * 4. Network Packet Attack Signature
 */

export const ZONE_CRITICALITY = {
  command_centre: { tier: 'Tier 1', weight: 3, label: 'Mission Critical' },
  secure_comms: { tier: 'Tier 1', weight: 3, label: 'Confidential (Tier 1)' },
  surveillance: { tier: 'Tier 2', weight: 2, label: 'Tactical High (Tier 2)' },
  military_base: { tier: 'Tier 3', weight: 1, label: 'Operational (Tier 3)' }
};

export const DEFAULT_ZONES = [
  {
    id: 'command_centre',
    name: 'Command Centre (HQ Core)',
    tier: 'Tier 1',
    criticality: 'Mission Critical',
    description: 'Primary military tactical command, control servers, and mission planning systems. Maximum security tier.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  },
  {
    id: 'surveillance',
    name: 'Surveillance & Reconnaissance',
    tier: 'Tier 2',
    criticality: 'Tactical High',
    description: 'Radar feeds, optical sensors, unmanned aerial reconnaissance (UAV), and perimeter monitoring networks.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  },
  {
    id: 'secure_comms',
    name: 'Secure Communications Network',
    tier: 'Tier 1',
    criticality: 'Confidential',
    description: 'Encrypted military tactical data links, encrypted SATCOM terminals, and secure field radio relays.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  },
  {
    id: 'military_base',
    name: 'Military Base Logistics & Admin',
    tier: 'Tier 3',
    criticality: 'Operational',
    description: 'Supply chain depots, facility access control, maintenance facilities, and administrative barracks network.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  }
];

export function calculateThreatPriority(predictionCode, confidence, zoneId, rowDict = {}) {
  const zoneMeta = ZONE_CRITICALITY[zoneId] || { tier: 'Tier 3', weight: 1, label: 'Unknown Sector' };
  const isIntrusion = predictionCode === 1;

  const flag = String(rowDict.flag || '');
  const srvSerror = parseFloat(rowDict.srv_serror_rate || 0.0);
  const rerror = parseFloat(rowDict.rerror_rate || 0.0);
  const failedLogins = parseInt(rowDict.num_failed_logins || 0, 10);
  const protocol = String(rowDict.protocol_type || '');
  const count = parseFloat(rowDict.count || 0);
  const rootShell = parseInt(rowDict.root_shell || 0, 10);
  const numRoot = parseFloat(rowDict.num_root || 0);

  // Detect attack archetype
  let attackType = "Statistical Anomaly / Policy Deviation";
  let attackSeverityRank = 1;

  if (rootShell === 1 || numRoot > 0) {
    attackType = "User-to-Root Exploitation (U2R)";
    attackSeverityRank = 3;
  } else if (flag === 'S0' || srvSerror > 0.5) {
    attackType = "Denial of Service (DoS - SYN Flood / Neptune)";
    attackSeverityRank = 3;
  } else if (protocol === 'icmp' && count > 300) {
    attackType = "Denial of Service (ICMP Broadcast Flood / Smurf)";
    attackSeverityRank = 3;
  } else if (failedLogins >= 2) {
    attackType = "Remote-to-Local Privilege Escalation (R2L Brute-force)";
    attackSeverityRank = 2;
  } else if (flag === 'REJ' || rerror > 0.5) {
    attackType = "Surveillance & Reconnaissance (Portscan Probe)";
    attackSeverityRank = 2;
  }

  // CASE A: Legitimate / Normal Traffic
  if (!isIntrusion) {
    return {
      priority: "P4_LOW",
      priority_reason: `Rule P4-Audit: Model classified packet as Normal (${confidence}% confidence). Routine baseline traffic for ${zoneMeta.label}; no immediate human intervention required.`,
      attack_type: "Legitimate Traffic"
    };
  }

  // CASE B: Intrusion Detected
  if (zoneMeta.weight === 3 || attackSeverityRank === 3) {
    if (zoneMeta.weight === 3) {
      return {
        priority: "P1_CRITICAL",
        priority_reason: `Rule P1-Alpha: Hostile intrusion (${attackType}) targeted at ${zoneMeta.label} with ${confidence}% ML certainty. Immediate threat to core defence operations.`,
        attack_type: attackType
      };
    } else {
      const p = confidence >= 90 ? "P1_CRITICAL" : "P2_HIGH";
      return {
        priority: p,
        priority_reason: `Rule P1-Beta: High-impact attack vector (${attackType}) detected in ${zoneMeta.label}. Model confidence: ${confidence}%.`,
        attack_type: attackType
      };
    }
  }

  if (zoneMeta.weight === 2) {
    return {
      priority: "P2_HIGH",
      priority_reason: `Rule P2-Tactical: Malicious traffic targeting ${zoneMeta.label}. Identified as ${attackType} (Confidence: ${confidence}%).`,
      attack_type: attackType
    };
  }

  return {
    priority: "P3_MEDIUM",
    priority_reason: `Rule P3-Operational: Intrusion detected in secondary sector (${zoneMeta.label}). Classified as ${attackType} with ${confidence}% confidence.`,
    attack_type: attackType
  };
}
