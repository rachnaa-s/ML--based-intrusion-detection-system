import json
from app import app
from features import SAMPLE_PRESETS

client = app.test_client()

print("--- 1. Testing /health ---")
r_health = client.get("/health")
assert r_health.status_code == 200
print("Health OK:", r_health.get_json()["status"])

print("\n--- 2. Testing /api/zones ---")
r_zones = client.get("/api/zones")
assert r_zones.status_code == 200
zones_data = r_zones.get_json()["zones"]
print(f"Loaded {len(zones_data)} simulated defence zones:")
for z in zones_data:
    print(f"  [{z['tier']}] {z['name']} - Status: {z['status']}")

print("\n--- 3. Testing /predict with SYN Flood (Command Centre) ---")
dos_preset = SAMPLE_PRESETS[2] # Neptune DoS
pred_res = client.post("/predict", json={
    "features": dos_preset["features"],
    "zone_id": "command_centre",
    "source_ip": "192.168.1.105"
})
assert pred_res.status_code == 200
pred_json = pred_res.get_json()
print("Prediction:", pred_json["prediction"])
print("Priority:", pred_json["threat_priority"]["priority"])
print("Priority Reason:", pred_json["threat_priority"]["priority_reason"])
alert_id = pred_json["threat_priority"]["alert_id"]
assert pred_json["prediction"] == "Intrusion"
assert pred_json["threat_priority"]["priority"] == "P1_CRITICAL"

print(f"\n--- 4. Testing /api/alerts (Retrieving Alert {alert_id}) ---")
r_alerts = client.get("/api/alerts")
assert r_alerts.status_code == 200
alerts_list = r_alerts.get_json()["alerts"]
print(f"Total alerts in database: {len(alerts_list)}")
assert any(a["id"] == alert_id for a in alerts_list)

print(f"\n--- 5. Testing Incident Response Workflow on Alert {alert_id} ---")
# 5a. Get Recommendations
r_rec = client.get(f"/api/recommendations/{alert_id}")
assert r_rec.status_code == 200
recs = r_rec.get_json()["recommendations"]
print(f"Recommendations generated: {len(recs)}")
for rc in recs:
    print(f"  - [{rc['urgency']}] {rc['title']}")

# 5b. Analyst Review & Decision
r_patch = client.patch(f"/api/alerts/{alert_id}", json={
    "status": "UNDER_REVIEW",
    "analyst_notes": "SYN Flood pattern confirmed against Command Centre gateway. Initiating simulated mitigation.",
    "analyst_decision": "CONFIRMED_INTRUSION",
    "actor": "SOC_ANALYST_COLE"
})
assert r_patch.status_code == 200
print("Analyst decision recorded successfully.")

# 5c. Approve Simulated Containment Action
r_act = client.post(f"/api/alerts/{alert_id}/action", json={
    "action_type": "SIMULATED_IP_DROP",
    "approved_by": "DUTY_OFFICER_CAPT_MILLER",
    "confirm_action": True
})
assert r_act.status_code == 200
print("Simulated containment action approved and recorded.")

print("\n--- 6. Testing Simulated Zone Isolation ---")
r_iso = client.post("/api/zones/command_centre/simulate-isolation", json={
    "actor": "SOC_ANALYST_COLE",
    "confirm_simulated_action": True
})
assert r_iso.status_code == 200
print(f"Command Centre simulated isolation status: {r_iso.get_json()['zone']['status']}")
assert r_iso.get_json()["zone"]["is_isolated"] == 1

print("\n--- 7. Testing Immutable Audit Trail ---")
r_audit = client.get("/api/audit-trail")
assert r_audit.status_code == 200
trail = r_audit.get_json()["audit_trail"]
print(f"Total audit trail entries logged: {len(trail)}")
print(f"Latest 3 audit events:")
for ev in trail[:3]:
    print(f"  [{ev['timestamp']}] {ev['event_type']} by {ev['actor']}: {ev['details']}")

print("\nALL DEFENCE MODULE BACKEND ENDPOINTS AND TESTS PASSED!")
