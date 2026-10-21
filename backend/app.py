import os
import sys
import datetime
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger("IDS_Backend")

# Scikit-Learn version compatibility shim for _RemainderColsList
# Google Colab trained with scikit-learn 1.6.1; enables smooth unpickling across all versions
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
from features import FEATURE_NAMES, CATEGORICAL_FEATURES, CATEGORICAL_OPTIONS, FEATURE_GROUPS, SAMPLE_PRESETS

# Initialize Flask App
app = Flask(__name__)
# Enable CORS for React frontend (localhost:5173, localhost:3000, etc.)
CORS(app, resources={r"/*": {"origins": "*"}})

MODEL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ids_model.pkl")
model_pipeline = None

def load_trained_model():
    """Load the trained machine learning pipeline from ids_model.pkl."""
    global model_pipeline
    if not os.path.exists(MODEL_FILE):
        logger.error(f"CRITICAL: Model file not found at: {MODEL_FILE}")
        logger.error("Please place 'ids_model.pkl' inside the 'backend/' directory.")
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
        "system": "Machine Learning-Based Intrusion Detection System (IDS)",
        "status": "online",
        "model_loaded": model_pipeline is not None,
        "endpoints": {
            "/health": "GET - Backend & model health check",
            "/schema": "GET - Input features schema & options",
            "/presets": "GET - Sample attack & normal traffic presets",
            "/predict": "POST - Submit traffic features for intrusion detection"
        }
    })

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint to verify backend status and model readiness."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "model_loaded": model_pipeline is not None,
        "model_path": MODEL_FILE,
        "expected_features_count": len(FEATURE_NAMES),
        "expected_classes": ["Normal (0)", "Intrusion (1)"]
    }), 200

@app.route("/schema", methods=["GET"])
def get_schema():
    """Returns the full schema metadata and available feature groups for UI rendering."""
    return jsonify({
        "total_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "categorical_features": CATEGORICAL_FEATURES,
        "categorical_options": CATEGORICAL_OPTIONS,
        "feature_groups": FEATURE_GROUPS
    }), 200

@app.route("/presets", methods=["GET"])
def get_presets():
    """Returns pre-configured attack and normal traffic samples for easy 1-click evaluation."""
    return jsonify({
        "presets": SAMPLE_PRESETS
    }), 200

def generate_risk_assessment(prediction_code, probabilities, row_dict):
    """Generates an academic cybersecurity explanation based on detected features."""
    prob_intrusion = probabilities.get("intrusion", 0.0) if probabilities else (1.0 if prediction_code == 1 else 0.0)
    
    if prediction_code == 0:
        return {
            "threat_level": "Low / Safe",
            "severity_color": "green",
            "verdict": "Legitimate Network Traffic",
            "explanation": f"The connection exhibited normal behavioral characteristics: completed handshake (flag: {row_dict.get('flag')}), regular payload ratio, and normal error rates.",
            "recommended_action": "Allow packet. Log connection for standard traffic auditing."
        }
    else:
        # Determine likely attack vector
        flag = str(row_dict.get('flag', ''))
        srv_serror = float(row_dict.get('srv_serror_rate', 0.0))
        rerror = float(row_dict.get('rerror_rate', 0.0))
        failed_logins = int(row_dict.get('num_failed_logins', 0))
        protocol = str(row_dict.get('protocol_type', ''))
        count = float(row_dict.get('count', 0))
        
        attack_type = "Network Intrusion / Anomaly"
        if flag == 'S0' or srv_serror > 0.5:
            attack_type = "Denial of Service (DoS - SYN Flood / Neptune)"
        elif flag == 'REJ' or rerror > 0.5:
            attack_type = "Surveillance & Reconnaissance (Port Scan / Probe)"
        elif protocol == 'icmp' and count > 300:
            attack_type = "Denial of Service (ICMP Broadcast Flood / Smurf)"
        elif failed_logins >= 2:
            attack_type = "Remote-to-Local Privilege Escalation (Brute Force / R2L)"
        elif int(row_dict.get('root_shell', 0)) == 1 or int(row_dict.get('num_root', 0)) > 0:
            attack_type = "User-to-Root Exploitation (U2R / Privilege Escalation)"
            
        return {
            "threat_level": "High Risk / Alert",
            "severity_color": "red",
            "verdict": f"Hostile Intrusion Detected ({attack_type})",
            "explanation": f"Traffic patterns deviated significantly from baseline: flagged flag '{flag}', SYN/REJ error anomalies, and high connection density.",
            "recommended_action": "Isolate source IP, deploy dynamic firewall filtering rules, and alert SOC security analysts."
        }

@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint.
    Accepts 41 network traffic features in JSON format and applies the saved ML pipeline.
    """
    global model_pipeline
    if model_pipeline is None:
        # Attempt reloading in case user recently copied file
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

        # Support payload wrapped in {"features": {...}} or direct {...}
        features_dict = data.get("features", data)

        if not isinstance(features_dict, dict):
            return jsonify({
                "error": "Invalid request: 'features' must be a JSON dictionary.",
                "message": "Expected key-value pairs matching NSL-KDD traffic attributes."
            }), 400

        # Construct dataframe row in EXACT 41 feature order
        row_values = {}
        missing_features = []

        for feat in FEATURE_NAMES:
            if feat not in features_dict:
                missing_features.append(feat)
                # Assign default fallback value from presets or defaults
                if feat in CATEGORICAL_FEATURES:
                    row_values[feat] = CATEGORICAL_OPTIONS[feat][0]
                else:
                    row_values[feat] = 0
            else:
                raw_val = features_dict[feat]
                # Type cast appropriately
                if feat in CATEGORICAL_FEATURES:
                    row_values[feat] = str(raw_val).strip()
                else:
                    try:
                        row_values[feat] = float(raw_val)
                    except (ValueError, TypeError):
                        row_values[feat] = 0.0

        # Build single-row DataFrame
        df_input = pd.DataFrame([row_values], columns=FEATURE_NAMES)

        # Run inference using the trained pipeline (ColumnTransformer + DecisionTreeClassifier)
        raw_pred = model_pipeline.predict(df_input)[0]
        prediction_code = int(raw_pred)
        
        # Calculate probabilities if available
        probabilities = None
        confidence = 100.0
        if hasattr(model_pipeline, "predict_proba"):
            try:
                probs = model_pipeline.predict_proba(df_input)[0]
                # Classes: [0, 1] -> 0: Normal, 1: Intrusion
                probabilities = {
                    "normal": round(float(probs[0]) * 100, 2),
                    "intrusion": round(float(probs[1]) * 100, 2)
                }
                confidence = round(float(probs[prediction_code]) * 100, 2)
            except Exception as pe:
                logger.warning(f"Could not extract predict_proba: {pe}")

        prediction_label = "Normal" if prediction_code == 0 else "Intrusion"
        is_intrusion = bool(prediction_code == 1)
        risk = generate_risk_assessment(prediction_code, probabilities, row_values)

        response_payload = {
            "prediction": prediction_label,
            "prediction_code": prediction_code,
            "is_intrusion": is_intrusion,
            "confidence_percent": confidence,
            "probabilities": probabilities,
            "risk_assessment": risk,
            "traffic_summary": {
                "protocol": row_values.get("protocol_type"),
                "service": row_values.get("service"),
                "flag": row_values.get("flag"),
                "src_bytes": row_values.get("src_bytes"),
                "dst_bytes": row_values.get("dst_bytes"),
                "connection_count": row_values.get("count")
            },
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "model_architecture": "Scikit-Learn Pipeline (NSL-KDD Preprocessing + DecisionTreeClassifier)",
            "warnings": [f"Missing feature '{f}' defaulted to {row_values[f]}" for f in missing_features] if missing_features else []
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
    logger.info(f"Starting IDS Flask API server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
