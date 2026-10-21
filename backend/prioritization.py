"""
Threat Prioritization Engine for Defence Network Security Monitoring.
Applies documented rules to calculate investigation priority based on:
1. Model Prediction (Normal vs Intrusion from Scikit-Learn Pipeline)
2. Model Confidence (Certainty score)
3. Simulated Zone Criticality (Tier 1 Mission Critical, Tier 2 Tactical, Tier 3 Operational)
4. Network Packet Attack Signature
"""

ZONE_CRITICALITY = {
    'command_centre': {'tier': 'Tier 1', 'weight': 3, 'label': 'Mission Critical'},
    'secure_comms': {'tier': 'Tier 1', 'weight': 3, 'label': 'Confidential (Tier 1)'},
    'surveillance': {'tier': 'Tier 2', 'weight': 2, 'label': 'Tactical High (Tier 2)'},
    'military_base': {'tier': 'Tier 3', 'weight': 1, 'label': 'Operational (Tier 3)'}
}

def calculate_threat_priority(prediction_code, confidence, zone_id, row_dict):
    """
    Evaluates investigation priority and formats an explicit explanation.
    Keeps model prediction, alert severity, and confidence distinct.
    
    Returns:
        priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW'
        priority_reason: detailed human-readable justification of rule evaluation
        attack_type: specific classification of threat
    """
    zone_meta = ZONE_CRITICALITY.get(zone_id, {'tier': 'Tier 3', 'weight': 1, 'label': 'Unknown Sector'})
    is_intrusion = bool(prediction_code == 1)

    flag = str(row_dict.get('flag', ''))
    srv_serror = float(row_dict.get('srv_serror_rate', 0.0))
    rerror = float(row_dict.get('rerror_rate', 0.0))
    failed_logins = int(row_dict.get('num_failed_logins', 0))
    protocol = str(row_dict.get('protocol_type', ''))
    count = float(row_dict.get('count', 0))
    root_shell = int(row_dict.get('root_shell', 0))
    num_root = float(row_dict.get('num_root', 0))

    # Detect attack archetype
    if root_shell == 1 or num_root > 0:
        attack_type = "User-to-Root Exploitation (U2R)"
        attack_severity_rank = 3 # Highest
    elif flag == 'S0' or srv_serror > 0.5:
        attack_type = "Denial of Service (DoS - SYN Flood / Neptune)"
        attack_severity_rank = 3
    elif protocol == 'icmp' and count > 300:
        attack_type = "Denial of Service (ICMP Broadcast Flood / Smurf)"
        attack_severity_rank = 3
    elif failed_logins >= 2:
        attack_type = "Remote-to-Local Privilege Escalation (R2L Brute-force)"
        attack_severity_rank = 2
    elif flag == 'REJ' or rerror > 0.5:
        attack_type = "Surveillance & Reconnaissance (Portscan Probe)"
        attack_severity_rank = 2
    else:
        attack_type = "Statistical Anomaly / Policy Deviation"
        attack_severity_rank = 1

    # CASE A: Legitimate / Normal Traffic
    if not is_intrusion:
        priority = "P4_LOW"
        priority_reason = (
            f"Rule P4-Audit: Model classified packet as Normal ({confidence}% confidence). "
            f"Routine baseline traffic for {zone_meta['label']}; no immediate human intervention required."
        )
        return priority, priority_reason, "Legitimate Traffic"

    # CASE B: Intrusion Detected
    # Rule 1: Tier 1 Zone (Command Centre / Secure Comms) OR Root Exploits
    if zone_meta['weight'] == 3 or attack_severity_rank == 3:
        if zone_meta['weight'] == 3:
            priority = "P1_CRITICAL"
            priority_reason = (
                f"Rule P1-Alpha: Hostile intrusion ({attack_type}) targeted at {zone_meta['label']} "
                f"with {confidence}% ML certainty. Immediate threat to core defence operations."
            )
        else:
            priority = "P1_CRITICAL" if confidence >= 90 else "P2_HIGH"
            priority_reason = (
                f"Rule P1-Beta: High-impact attack vector ({attack_type}) detected in {zone_meta['label']}. "
                f"Model confidence: {confidence}%."
            )
        return priority, priority_reason, attack_type

    # Rule 2: Tier 2 Zone (Surveillance Systems)
    if zone_meta['weight'] == 2:
        priority = "P2_HIGH"
        priority_reason = (
            f"Rule P2-Tactical: Malicious traffic targeting {zone_meta['label']}. "
            f"Identified as {attack_type} (Confidence: {confidence}%)."
        )
        return priority, priority_reason, attack_type

    # Rule 3: Tier 3 Zone (Military Base Networks)
    priority = "P3_MEDIUM"
    priority_reason = (
        f"Rule P3-Operational: Intrusion detected in secondary sector ({zone_meta['label']}). "
        f"Classified as {attack_type} with {confidence}% confidence."
    )
    return priority, priority_reason, attack_type
