import json
from app import app
from features import SAMPLE_PRESETS

client = app.test_client()

print("--- 1. Testing /health ---")
r_health = client.get("/health")
print("Status:", r_health.status_code)
print("Response:", r_health.get_json())
assert r_health.status_code == 200
assert r_health.get_json()["model_loaded"] is True

print("\n--- 2. Testing /schema ---")
r_schema = client.get("/schema")
print("Status:", r_schema.status_code)
schema_data = r_schema.get_json()
print("Features count:", schema_data["total_features"])
assert schema_data["total_features"] == 41

print("\n--- 3. Testing /predict with Normal Preset ---")
normal_preset = SAMPLE_PRESETS[0]
r_pred1 = client.post("/predict", json={"features": normal_preset["features"]})
print("Status:", r_pred1.status_code)
pred1_json = r_pred1.get_json()
print("Prediction:", pred1_json["prediction"])
print("Confidence:", pred1_json["confidence_percent"])
print("Risk verdict:", pred1_json["risk_assessment"]["verdict"])
assert pred1_json["prediction"] == "Normal"

print("\n--- 4. Testing /predict with SYN Flood Attack Preset ---")
dos_preset = SAMPLE_PRESETS[1]
r_pred2 = client.post("/predict", json={"features": dos_preset["features"]})
print("Status:", r_pred2.status_code)
pred2_json = r_pred2.get_json()
print("Prediction:", pred2_json["prediction"])
print("Confidence:", pred2_json["confidence_percent"])
print("Risk verdict:", pred2_json["risk_assessment"]["verdict"])
assert pred2_json["prediction"] == "Intrusion"

print("\n--- 5. Testing /predict with Port Scan Preset ---")
probe_preset = SAMPLE_PRESETS[2]
r_pred3 = client.post("/predict", json={"features": probe_preset["features"]})
print("Status:", r_pred3.status_code)
pred3_json = r_pred3.get_json()
print("Prediction:", pred3_json["prediction"])
print("Confidence:", pred3_json["confidence_percent"])
print("Risk verdict:", pred3_json["risk_assessment"]["verdict"])
assert pred3_json["prediction"] == "Intrusion"

print("\nALL FLASK API ENDPOINTS PASSED RIGOROUSLY!")
