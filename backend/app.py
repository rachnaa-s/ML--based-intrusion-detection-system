import os
import sys
import datetime
import logging
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger("Defence_IDS_Backend")

# Scikit-Learn version compatibility shim for _RemainderColsList
try:
    import sklearn.compose._column_transformer
    if not hasattr(sklearn.compose._column_transformer, '_RemainderColsList'):
        class _RemainderColsList(list):
            """Compatibility stub for unpickling ColumnTransformer across scikit-learn versions."""
            pass
        sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList
        logger.info("Initialized scikit-learn compatibility shim for _RemainderColsList.")
except Exception as e:
    logger.warning(f"Could not install scikit-learn compatibility shim: {e}")

import joblib
import pandas as pd
import numpy as np

from features import FEATURE_NAMES, CATEGORICAL_FEATURES, CATEGORICAL_OPTIONS, FEATURE_GROUPS, SAMPLE_PRESETS, ATTACK_TAXONOMY
from database import (
    init_db, get_all_zones, get_zone_by_id, update_zone_stats,
    toggle_simulated_isolation, create_alert, get_alerts,
    get_alert_by_id, update_alert_investigation, record_approved_action,
    get_audit_trail, log_audit_event
)
from prioritization import calculate_threat_priority

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SQLite database
init_db()

MODEL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ids_model.pkl")
model_pipeline = None

def load_trained_model():
    """Load the trained machine learning pipeline from ids_model.pkl."""
    global model_pipeline
    if not os.path.exists(MODEL_FILE):
        logger.error(f"CRITICAL: Model file not found at: {MODEL_FILE}")
        return False
    try:
        logger.info(f"Loading trained IDS model from {MODEL_FILE}...")
        model_pipeline = joblib.load(MODEL_FILE)
        logger.info("IDS model pipeline loaded successfully into memory.")
        if hasattr(model_pipeline, "classes_"):
            logger.info(f"Model classes: {model_pipeline.classes_}")
        return True
    except Exception as ex:
        logger.error(f"Failed to load model file: {ex}", exc_info=True)
        model_pipeline = None
        return False

# Attempt model loading at startup
load_trained_model()

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "system": "Defence Network Security Monitoring and Incident Response System",
        "prototype_classification": "Academic Defense Prototype (Simulated Environment)",
        "status": "online",
        "model_loaded": model_pipeline is not None,
        "endpoints": {
            "/health": "GET - System health & model status",
            "/schema": "GET - NSL-KDD 41-feature schema",
            "/presets": "GET - Attack benchmark presets",
            "/predict": "POST - Evaluate packet with ML model & generate threat alert",
            "/api/zones": "GET - Simulated defence network zones status",
            "/api/zones/<id>/simulate-isolation": "POST - Human-approved simulated zone isolation",
            "/api/alerts": "GET - Prioritized security alerts feed",
            "/api/alerts/<id>": "GET / PATCH - Alert details & analyst investigation",
            "/api/alerts/<id>/action": "POST - Record human-approved simulated containment",
            "/api/audit-trail": "GET - Immutable audit trail records"
        }
    })

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint to verify backend status and model readiness."""
    return jsonify({
        "status": "healthy",
        "system": "Defence Network Security Monitoring and Incident Response System",
        "disclaimer": "Academic research prototype. Network zones and isolation actions are strictly simulated.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "model_loaded": model_pipeline is not None,
        "model_path": MODEL_FILE,
        "expected_features_count": len(FEATURE_NAMES),
        "expected_classes": ["Normal (0)", "Intrusion (1)"]
    }), 200

@app.route("/schema", methods=["GET"])
def get_schema():
    """Returns the full schema metadata and feature groups."""
    return jsonify({
        "total_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "categorical_features": CATEGORICAL_FEATURES,
        "categorical_options": CATEGORICAL_OPTIONS,
        "feature_groups": FEATURE_GROUPS,
        "attack_taxonomy": ATTACK_TAXONOMY
    }), 200

@app.route("/presets", methods=["GET"])
def get_presets():
    """Returns pre-configured benchmark traffic samples."""
    return jsonify({
        "presets": SAMPLE_PRESETS
    }), 200

# ==========================================
# 1. DEFENCE NETWORK COMMAND CENTRE & ZONES
# ==========================================

@app.route("/api/zones", methods=["GET"])
def api_get_zones():
    """Returns all simulated defence zones with live telemetry and alert metrics."""
    zones = get_all_zones()
    return jsonify({
        "environment": "SIMULATED_DEFENCE_NETWORK",
        "disclaimer": "All network zones, topologies, and isolation states are simulated for academic evaluation.",
        "zones": zones
    }), 200

@app.route("/api/zones/<zone_id>/simulate-isolation", methods=["POST"])
def api_toggle_zone_isolation(zone_id):
    """
    Applies or revokes human-approved simulated containment isolation on a zone.
    Requires human confirmation; does not execute commands on physical networks.
    """
    data = request.get_json(force=True, silent=True) or {}
    actor = data.get("actor", "SOC_HUMAN_OPERATOR")
    confirmation = data.get("confirm_simulated_action", False)

    if not confirmation:
        return jsonify({
            "error": "Explicit human confirmation required before recording simulated isolation action.",
            "message": "Please confirm that you understand this is a simulated containment action."
        }), 400

    updated_zone, error = toggle_simulated_isolation(zone_id, actor=actor)
    if error:
        return jsonify({"error": error}), 404

    return jsonify({
        "success": True,
        "message": f"Simulated isolation state updated for {updated_zone['name']}.",
        "zone": updated_zone,
        "is_simulated": True
    }), 200

# ==========================================
# 2. THREAT PRIORITIZATION & INCIDENT ALERTS
# ==========================================

@app.route("/api/alerts", methods=["GET"])
def api_get_alerts():
    """Returns prioritized security alerts with optional filtering."""
    priority = request.args.get("priority")
    status = request.args.get("status")
    zone_id = request.args.get("zone_id")

    alerts = get_alerts(priority=priority, status=status, zone_id=zone_id)
    return jsonify({
        "total": len(alerts),
        "alerts": alerts
    }), 200

@app.route("/api/alerts/<alert_id>", methods=["GET"])
def api_get_alert_details(alert_id):
    """Retrieves full details for a single alert including 41 traffic features."""
    alert = get_alert_by_id(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    return jsonify(alert), 200

@app.route("/api/alerts/<alert_id>", methods=["PATCH"])
def api_update_alert(alert_id):
    """
    Updates an alert's analyst notes, review status, and recorded decision.
    Part of the Incident Response Workflow.
    """
    data = request.get_json(force=True, silent=True) or {}
    status = data.get("status", "UNDER_REVIEW")
    notes = data.get("analyst_notes", "")
    decision = data.get("analyst_decision", "UNDER_INVESTIGATION")
    actor = data.get("actor", "SOC_ANALYST_HUMAN")

    updated = update_alert_investigation(alert_id, status, notes, decision, actor=actor)
    if not updated:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({
        "success": True,
        "message": "Incident investigation notes and decision recorded successfully.",
        "alert": updated
    }), 200

@app.route("/api/alerts/<alert_id>/action", methods=["POST"])
def api_approve_simulated_action(alert_id):
    """
    Records human-approved simulated containment or isolation action.
    Strictly simulated; no physical network execution.
    """
    data = request.get_json(force=True, silent=True) or {}
    action_type = data.get("action_type") # e.g. "SIMULATED_IP_DROP", "SIMULATED_HOST_QUARANTINE"
    approved_by = data.get("approved_by", "SOC_SUPERVISOR_HUMAN")
    confirmation = data.get("confirm_action", False)

    if not action_type:
        return jsonify({"error": "Missing 'action_type' parameter."}), 400

    if not confirmation:
        return jsonify({
            "error": "Explicit human approval confirmation is required before recording containment action.",
            "message": "Check the confirmation box to confirm this simulated response action."
        }), 400

    updated = record_approved_action(alert_id, action_type, approved_by=approved_by)
    if not updated:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({
        "success": True,
        "message": f"Simulated response action '{action_type}' approved and recorded in immutable audit log.",
        "alert": updated,
        "is_simulated": True
    }), 200

@app.route("/api/recommendations/<alert_id>", methods=["GET"])
def api_get_recommendations(alert_id):
    """Generates human-reviewable response recommendations for an alert."""
    alert = get_alert_by_id(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    attack_type = alert.get("attack_type", "")
    zone_id = alert.get("zone_id", "command_centre")
    source_ip = alert.get("source_ip", "192.168.1.100")
    priority = alert.get("priority", "P3_MEDIUM")

    recs = []
    if "DoS" in attack_type or "SYN" in attack_type:
        recs.append({
            "id": "REC-01",
            "action_type": "SIMULATED_IP_DROP",
            "title": f"Deploy Simulated Ingress Firewall Drop for {source_ip}",
            "description": "Block incoming half-open TCP SYN packets from the malicious source IP address.",
            "urgency": "Immediate",
            "requires_approval": True
        })
        recs.append({
            "id": "REC-02",
            "action_type": "SIMULATED_RATE_LIMIT",
            "title": "Enable SYN Flood Rate Limiting on Ingress Interface",
            "description": "Engage simulated SYN cookie defense to protect connection tables from state exhaustion.",
            "urgency": "High",
            "requires_approval": True
        })
    elif "Probe" in attack_type or "Portscan" in attack_type:
        recs.append({
            "id": "REC-03",
            "action_type": "SIMULATED_IP_DROP",
            "title": f"Simulated Blacklist of Reconnaissance Scanner {source_ip}",
            "description": "Blacklist the scanning IP to prevent systematic port enumeration of defence assets.",
            "urgency": "Medium",
            "requires_approval": True
        })
    elif "Root" in attack_type or "U2R" in attack_type:
        recs.append({
            "id": "REC-04",
            "action_type": "SIMULATED_ZONE_ISOLATE",
            "title": f"Simulated Quarantine of Target Zone [{zone_id}]",
            "description": "Simulate local sector isolation to prevent lateral movement of root exploit payloads.",
            "urgency": "Critical",
            "requires_approval": True
        })
    else:
        recs.append({
            "id": "REC-05",
            "action_type": "SIMULATED_AUDIT_LOG",
            "title": "Log for Continuous Security Telemetry",
            "description": "Capture full packet telemetry in SIEM security audit trail.",
            "urgency": "Low",
            "requires_approval": False
        })

    return jsonify({
        "alert_id": alert_id,
        "recommendations": recs,
        "disclaimer": "Recommendations require explicit human review and approval before recording."
    }), 200

# ==========================================
# 3. IMMUTABLE AUDIT TRAIL
# ==========================================

@app.route("/api/audit-trail", methods=["GET"])
def api_get_audit_trail():
    """Retrieves chronological immutable audit trail records."""
    limit = int(request.args.get("limit", 200))
    trail = get_audit_trail(limit=limit)
    return jsonify({
        "total": len(trail),
        "audit_trail": trail
    }), 200

# ==========================================
# 4. PREDICTION ENDPOINT (Core ML Integration)
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint.
    Accepts 41 network traffic features in JSON, performs actual inference using ids_model.pkl,
    calculates threat priority, updates zone metrics, logs an alert, and writes an audit event.
    """
    global model_pipeline
    if model_pipeline is None:
        if not load_trained_model():
            return jsonify({
                "error": "Model file 'ids_model.pkl' is not loaded.",
                "message": f"Please verify that 'ids_model.pkl' exists at '{MODEL_FILE}'."
            }), 503

    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "error": "Invalid request: No JSON payload received.",
                "message": "Expected a JSON object containing network traffic features."
            }), 400

        features_dict = data.get("features", data)
        target_zone = data.get("zone_id", "command_centre")
        source_ip = data.get("source_ip", None)

        if not isinstance(features_dict, dict):
            return jsonify({
                "error": "Invalid request: 'features' must be a JSON dictionary.",
                "message": "Expected key-value pairs matching NSL-KDD traffic attributes."
            }), 400

        # Construct dataframe row in exact 41 feature order
        row_values = {}
        missing_features = []

        for feat in FEATURE_NAMES:
            if feat not in features_dict:
                missing_features.append(feat)
                if feat in CATEGORICAL_FEATURES:
                    row_values[feat] = CATEGORICAL_OPTIONS[feat][0]
                else:
                    row_values[feat] = 0
            else:
                raw_val = features_dict[feat]
                if feat in CATEGORICAL_FEATURES:
                    row_values[feat] = str(raw_val).strip()
                else:
                    try:
                        row_values[feat] = float(raw_val)
                    except (ValueError, TypeError):
                        row_values[feat] = 0.0

        # Build single-row DataFrame
        df_input = pd.DataFrame([row_values], columns=FEATURE_NAMES)

        # Run actual ML inference using the trained pipeline
        raw_pred = model_pipeline.predict(df_input)[0]
        prediction_code = int(raw_pred)

        # Probabilities & Confidence
        confidence = 100.0
        probabilities = None
        if hasattr(model_pipeline, "predict_proba"):
            try:
                probs = model_pipeline.predict_proba(df_input)[0]
                probabilities = {
                    "normal": round(float(probs[0]) * 100, 2),
                    "intrusion": round(float(probs[1]) * 100, 2)
                }
                confidence = round(float(probs[prediction_code]) * 100, 2)
            except Exception as pe:
                logger.warning(f"Could not extract predict_proba: {pe}")

        prediction_label = "Normal" if prediction_code == 0 else "Intrusion"
        is_intrusion = bool(prediction_code == 1)

        # Derive source IP if not specified
        if not source_ip:
            if is_intrusion:
                service = row_values.get("service", "")
                protocol = row_values.get("protocol_type", "")
                source_ip = "192.168.1.105" if service == "private" else ("172.16.4.88" if protocol == "icmp" else "10.0.0.64")
            else:
                source_ip = "192.168.1.42"

        # Calculate Threat Prioritization
        priority, priority_reason, attack_type = calculate_threat_priority(
            prediction_code=prediction_code,
            confidence=confidence,
            zone_id=target_zone,
            row_dict=row_values
        )

        # Update Zone Statistics
        update_zone_stats(target_zone, is_intrusion=is_intrusion)

        # Generate Unique Alert ID
        alert_id = f"ALT-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{os.urandom(2).hex()}"
        alert_payload = {
            "id": alert_id,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "zone_id": target_zone,
            "prediction": prediction_label,
            "prediction_code": prediction_code,
            "confidence": confidence,
            "priority": priority,
            "priority_reason": priority_reason,
            "status": "NEW" if is_intrusion else "RESOLVED",
            "source_ip": source_ip,
            "attack_type": attack_type,
            "analyst_notes": "" if is_intrusion else "Automatically verified normal baseline packet.",
            "analyst_decision": "PENDING_REVIEW" if is_intrusion else "BASELINE_CONFIRMED",
            "raw_features": row_values
        }

        # Store alert in SQLite
        create_alert(alert_payload)

        # Log prediction event in audit trail
        log_audit_event(
            event_type="MODEL_PREDICTION_EXECUTED",
            actor="ML_PIPELINE_ENGINE",
            details=f"Inference completed for target zone [{target_zone}]. Result: {prediction_label} ({confidence}%). Priority: {priority}.",
            zone_id=target_zone,
            alert_id=alert_id
        )

        response_payload = {
            "prediction": prediction_label,
            "prediction_code": prediction_code,
            "is_intrusion": is_intrusion,
            "confidence_percent": confidence,
            "probabilities": probabilities,
            "threat_priority": {
                "priority": priority,
                "priority_reason": priority_reason,
                "attack_type": attack_type,
                "target_zone": target_zone,
                "alert_id": alert_id
            },
            "source_ip": source_ip,
            "traffic_summary": {
                "protocol": row_values.get("protocol_type"),
                "service": row_values.get("service"),
                "flag": row_values.get("flag"),
                "src_bytes": row_values.get("src_bytes"),
                "dst_bytes": row_values.get("dst_bytes"),
                "connection_count": row_values.get("count"),
                "zone_id": target_zone
            },
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "model_architecture": "Scikit-Learn Pipeline (NSL-KDD Preprocessing + DecisionTreeClassifier)",
            "disclaimer": "Network zone telemetry and incident response actions are strictly simulated for academic evaluation."
        }

        return jsonify(response_payload), 200

    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        return jsonify({
            "error": "Prediction failed during model inference.",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Defence IDS Flask API server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
