"""
SQLite Database module for Defence Network Security Monitoring and Incident Response System.
Persists zones, alerts, and audit trail events.
"""

import sqlite3
import os
import json
import datetime
import logging

logger = logging.getLogger("Defence_DB")

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "defence_ids.db")

DEFAULT_ZONES = [
    {
        'id': 'command_centre',
        'name': 'Command Centre (HQ Core)',
        'tier': 'Tier 1',
        'criticality': 'Mission Critical',
        'description': 'Primary military tactical command, control servers, and mission planning systems. Maximum security tier.',
        'status': 'SECURE',
        'traffic_count': 0,
        'suspicious_count': 0,
        'is_isolated': 0
    },
    {
        'id': 'surveillance',
        'name': 'Surveillance & Reconnaissance',
        'tier': 'Tier 2',
        'criticality': 'Tactical High',
        'description': 'Radar feeds, optical sensors, unmanned aerial reconnaissance (UAV), and perimeter monitoring networks.',
        'status': 'SECURE',
        'traffic_count': 0,
        'suspicious_count': 0,
        'is_isolated': 0
    },
    {
        'id': 'secure_comms',
        'name': 'Secure Communications Network',
        'tier': 'Tier 1',
        'criticality': 'Confidential',
        'description': 'Encrypted military tactical data links, encrypted SATCOM terminals, and secure field radio relays.',
        'status': 'SECURE',
        'traffic_count': 0,
        'suspicious_count': 0,
        'is_isolated': 0
    },
    {
        'id': 'military_base',
        'name': 'Military Base Logistics & Admin',
        'tier': 'Tier 3',
        'criticality': 'Operational',
        'description': 'Supply chain depots, facility access control, maintenance facilities, and administrative barracks network.',
        'status': 'SECURE',
        'traffic_count': 0,
        'suspicious_count': 0,
        'is_isolated': 0
    }
]

def get_connection():
    """Returns a SQLite connection with dict-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite schema and seeds default simulated defence zones."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Zones table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tier TEXT NOT NULL,
        criticality TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'SECURE',
        traffic_count INTEGER DEFAULT 0,
        suspicious_count INTEGER DEFAULT 0,
        is_isolated INTEGER DEFAULT 0,
        isolation_timestamp TEXT
    );
    """)

    # 2. Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        zone_id TEXT NOT NULL,
        prediction TEXT NOT NULL,
        prediction_code INTEGER NOT NULL,
        confidence REAL NOT NULL,
        priority TEXT NOT NULL,
        priority_reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'NEW',
        source_ip TEXT,
        attack_type TEXT,
        analyst_notes TEXT,
        analyst_decision TEXT,
        approved_action TEXT,
        approved_by TEXT,
        approved_at TEXT,
        raw_features TEXT,
        FOREIGN KEY (zone_id) REFERENCES zones (id)
    );
    """)

    # 3. Audit trail table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_trail (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        actor TEXT NOT NULL,
        details TEXT NOT NULL,
        zone_id TEXT,
        alert_id TEXT
    );
    """)

    conn.commit()

    # Seed default zones if empty
    cursor.execute("SELECT COUNT(*) FROM zones")
    count = cursor.fetchone()[0]
    if count == 0:
        logger.info("Seeding default simulated defence network zones...")
        for z in DEFAULT_ZONES:
            cursor.execute("""
            INSERT INTO zones (id, name, tier, criticality, description, status, traffic_count, suspicious_count, is_isolated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (z['id'], z['name'], z['tier'], z['criticality'], z['description'], z['status'], z['traffic_count'], z['suspicious_count'], z['is_isolated']))
        conn.commit()

        # Log system initialization event in audit trail
        log_audit_event(
            event_type="SYSTEM_INITIALIZATION",
            actor="SYSTEM",
            details="Defence Network Security Monitoring and Incident Response System initialized with 4 simulated zones.",
            conn=conn
        )

    conn.close()
    logger.info("Database initialized successfully.")

def log_audit_event(event_type, actor, details, zone_id=None, alert_id=None, conn=None):
    """Appends an immutable event record to the audit trail."""
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True

    try:
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Generate monotonic ID
        event_id = f"AUD-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{os.urandom(2).hex()}"
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO audit_trail (id, timestamp, event_type, actor, details, zone_id, alert_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (event_id, now_str, event_type, actor, details, zone_id, alert_id))
        conn.commit()
        return event_id
    finally:
        if should_close:
            conn.close()

def get_all_zones():
    """Fetches all defence zones and dynamic security status."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM zones ORDER BY id ASC")
    rows = cursor.fetchall()
    zones = [dict(r) for r in rows]
    conn.close()
    return zones

def get_zone_by_id(zone_id):
    """Fetches a single zone by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM zones WHERE id = ?", (zone_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_zone_stats(zone_id, is_intrusion):
    """Increments traffic count and suspicious count for a zone."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check current zone status
    cursor.execute("SELECT is_isolated, suspicious_count FROM zones WHERE id = ?", (zone_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return

    is_isolated = row['is_isolated']
    current_suspicious = row['suspicious_count'] + (1 if is_intrusion else 0)

    # Determine status
    if is_isolated:
        new_status = 'ISOLATED_SIMULATED'
    elif current_suspicious >= 5:
        new_status = 'UNDER_ATTACK'
    elif current_suspicious > 0:
        new_status = 'ELEVATED'
    else:
        new_status = 'SECURE'

    cursor.execute("""
    UPDATE zones
    SET traffic_count = traffic_count + 1,
        suspicious_count = suspicious_count + ?,
        status = ?
    WHERE id = ?
    """, (1 if is_intrusion else 0, new_status, zone_id))

    conn.commit()
    conn.close()

def toggle_simulated_isolation(zone_id, actor="HUMAN_ANALYST"):
    """Toggles simulated isolation for a defence network zone."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM zones WHERE id = ?", (zone_id,))
    zone = cursor.fetchone()
    if not zone:
        conn.close()
        return None, "Zone not found"

    current_isolation = zone['is_isolated']
    new_isolation = 0 if current_isolation == 1 else 1
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_status = 'ISOLATED_SIMULATED' if new_isolation == 1 else ('ELEVATED' if zone['suspicious_count'] > 0 else 'SECURE')

    cursor.execute("""
    UPDATE zones
    SET is_isolated = ?,
        status = ?,
        isolation_timestamp = ?
    WHERE id = ?
    """, (new_isolation, new_status, now_str if new_isolation == 1 else None, zone_id))
    conn.commit()

    action_label = "SIMULATED_ZONE_ISOLATION_ACTIVATED" if new_isolation == 1 else "SIMULATED_ZONE_ISOLATION_REVOKED"
    details_desc = f"Analyst {actor} {'engaged simulated containment isolation on' if new_isolation == 1 else 'restored simulated connectivity to'} {zone['name']}."

    log_audit_event(
        event_type=action_label,
        actor=actor,
        details=details_desc,
        zone_id=zone_id,
        conn=conn
    )

    cursor.execute("SELECT * FROM zones WHERE id = ?", (zone_id,))
    updated_zone = dict(cursor.fetchone())
    conn.close()
    return updated_zone, None

def create_alert(alert_data):
    """Inserts a new alert generated from ML prediction."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO alerts (
        id, timestamp, zone_id, prediction, prediction_code, confidence,
        priority, priority_reason, status, source_ip, attack_type,
        analyst_notes, analyst_decision, approved_action, approved_by, approved_at, raw_features
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert_data['id'],
        alert_data['timestamp'],
        alert_data['zone_id'],
        alert_data['prediction'],
        alert_data['prediction_code'],
        alert_data['confidence'],
        alert_data['priority'],
        alert_data['priority_reason'],
        alert_data.get('status', 'NEW'),
        alert_data.get('source_ip', '192.168.1.100'),
        alert_data.get('attack_type', 'Unclassified Anomaly'),
        alert_data.get('analyst_notes', ''),
        alert_data.get('analyst_decision', 'UNREVIEWED'),
        alert_data.get('approved_action', None),
        alert_data.get('approved_by', None),
        alert_data.get('approved_at', None),
        json.dumps(alert_data.get('raw_features', {}))
    ))
    conn.commit()

    # Log in audit trail
    log_audit_event(
        event_type="ALERT_GENERATED",
        actor="ML_ENGINE_PIPELINE",
        details=f"ML Model detected {alert_data['prediction']} ({alert_data.get('attack_type', 'Threat')}) in zone [{alert_data['zone_id']}]. Assigned {alert_data['priority']}.",
        zone_id=alert_data['zone_id'],
        alert_id=alert_data['id'],
        conn=conn
    )

    conn.close()
    return alert_data['id']

def get_alerts(priority=None, status=None, zone_id=None, limit=100):
    """Retrieves filtered list of alerts."""
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM alerts WHERE 1=1"
    params = []
    if priority:
        query += " AND priority = ?"
        params.append(priority)
    if status:
        query += " AND status = ?"
        params.append(status)
    if zone_id:
        query += " AND zone_id = ?"
        params.append(zone_id)

    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    alerts = []
    for r in rows:
        d = dict(r)
        try:
            d['raw_features'] = json.loads(d['raw_features']) if d.get('raw_features') else {}
        except Exception:
            d['raw_features'] = {}
        alerts.append(d)
    conn.close()
    return alerts

def get_alert_by_id(alert_id):
    """Retrieves a single alert with full features."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    d = dict(row)
    try:
        d['raw_features'] = json.loads(d['raw_features']) if d.get('raw_features') else {}
    except Exception:
        d['raw_features'] = {}
    conn.close()
    return d

def update_alert_investigation(alert_id, status, notes, decision, actor="HUMAN_ANALYST"):
    """Updates analyst investigation notes and decision."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE alerts
    SET status = ?,
        analyst_notes = ?,
        analyst_decision = ?
    WHERE id = ?
    """, (status, notes, decision, alert_id))
    conn.commit()

    log_audit_event(
        event_type="ANALYST_INVESTIGATION_UPDATED",
        actor=actor,
        details=f"Analyst {actor} updated Alert [{alert_id}]: Status='{status}', Decision='{decision}'.",
        alert_id=alert_id,
        conn=conn
    )

    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def record_approved_action(alert_id, action_type, approved_by="SOC_OFFICER_1"):
    """Records human-approved simulated containment action."""
    conn = get_connection()
    cursor = conn.cursor()

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    UPDATE alerts
    SET approved_action = ?,
        approved_by = ?,
        approved_at = ?,
        status = 'CONTAINED_SIMULATED'
    WHERE id = ?
    """, (action_type, approved_by, now_str, alert_id))
    conn.commit()

    # Log in audit trail
    log_audit_event(
        event_type="SIMULATED_CONTAINMENT_APPROVED",
        actor=approved_by,
        details=f"Explicit human approval granted for simulated action '{action_type}' on Alert [{alert_id}].",
        alert_id=alert_id,
        conn=conn
    )

    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_audit_trail(limit=200):
    """Retrieves chronological audit trail records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_trail ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    trail = [dict(r) for r in rows]
    conn.close()
    return trail
