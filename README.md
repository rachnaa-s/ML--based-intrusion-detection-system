# Defence Network Security Monitoring and Incident Response System

An academic cybersecurity prototype upgraded from a Machine Learning Intrusion Detection System into an end-to-end **Defence SOC Monitoring and Incident Response System**. 

The system couples a pre-trained **Scikit-Learn Machine Learning Pipeline (NSL-KDD 41-feature model)** with simulated defence network sectors, rule-based threat prioritization, human-in-the-loop incident response, and an immutable SQLite audit trail.

---

## ⚠️ Academic Prototype & Simulation Disclaimer

> **IMPORTANT**: This application is strictly an **academic and laboratory evaluation prototype**.
>
> - **Simulated Defence Sectors**: All network sectors (*Command Centre*, *Surveillance Systems*, *Secure Communications*, *Military Base Networks*) and network topologies are simulated. The system is **NOT** connected to any physical military infrastructure or operational command hardware.
> - **Simulated Incident Response**: All isolation and containment actions (*Simulated Zone Isolation*, *Simulated IP Ingress Drop*) are software simulations for academic response evaluation. No commands are executed on real hardware or physical network interfaces.
> - **Real Machine Learning & Persistence**: The model predictions (*Normal* vs *Intrusion*), confidence calculations, threat prioritization rules, analyst decisions, and the SQLite audit trail are fully functional and persistent.

---

## 🏛️ System Architecture

```text
                               +-------------------------------------+
                               |   PERIMETER FIREWALL & CORE GATEWAY |
                               +-------------------------------------+
                                                  |
                     +----------------------------+----------------------------+
                     |                            |                            |
       +----------------------------+             |              +----------------------------+
       |   Zone 1: Command Centre   |             |              |  Zone 2: Surveillance Sys  |
       |  Tier 1 - Mission Critical |             |              |   Tier 2 - Tactical High   |
       +----------------------------+             |              +----------------------------+
                     |                            |                            |
                     +----------------------------+----------------------------+
                                                  |
                     +----------------------------+----------------------------+
                     |                                                         |
       +----------------------------+                            +----------------------------+
       | Zone 3: Secure Comms Link  |                            |  Zone 4: Military Base     |
       |    Tier 1 - Confidential   |                            |    Tier 3 - Operational    |
       +----------------------------+                            +----------------------------+
```

### Module Breakdown:

1. **Defence Network Command Center (`/api/zones`)**:
   - Manages 4 simulated defence zones with live simulated packet volumes, threat counters, and security statuses (`SECURE`, `ELEVATED`, `UNDER_ATTACK`, `ISOLATED_SIMULATED`).
2. **Threat Prioritization Engine (`prioritization.py`)**:
   - Generates alerts strictly from actual model predictions.
   - Evaluates documented priority rules combining model confidence, attack archetype (DoS, Probe, R2L, U2R), and sector criticality tier.
   - Decouples **Prediction** (Normal/Intrusion), **Severity** (P1 Critical, P2 High, P3 Medium, P4 Low), and **Confidence** (%).
3. **Incident Response Workflow Console (`IncidentResponseConsole.jsx`)**:
   - Full 41-feature NSL-KDD packet telemetry inspector.
   - Automated response recommendations for human review.
   - Human analyst journal and formal decision recorder (`CONFIRMED_INTRUSION`, `FALSE_POSITIVE`, `POLICY_VIOLATION`, `UNDER_INVESTIGATION`).
   - Explicit human approval modal required before recording simulated containment.
4. **Network Zone Topology Visualization (`DefenceTopology.jsx`)**:
   - Interactive SVG/node topology graph of interconnected defence zones with live status rings.
   - Single-click sector inspection and simulated zone containment toggle.
5. **Immutable Audit Trail (`database.py` & `AuditTrailView.jsx`)**:
   - Persistent SQLite database (`backend/defence_ids.db`) recording all model inferences, alert generation, analyst decisions, and approved simulated actions with timestamped Event IDs (`AUD-2026-XXXX`).

---

## 📂 Project Directory Structure

```text
zealous-bell/
├── backend/
│   ├── ids_model.pkl              # Pre-trained NSL-KDD Scikit-Learn ML pipeline
│   ├── app.py                     # Flask REST API with defence endpoints
│   ├── database.py                # SQLite database manager (zones, alerts, audit)
│   ├── prioritization.py          # Threat prioritization rule engine
│   ├── features.py                # 41 NSL-KDD feature metadata & attack presets
│   ├── test_api.py                # Automated test suite
│   ├── requirements.txt           # Python dependencies
│   └── defence_ids.db             # Persistent SQLite database file
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Defense header & module navigation
│   │   │   ├── DefenceTopology.jsx         # Command center & interactive topology
│   │   │   ├── ThreatPrioritization.jsx    # Prioritized security alerts feed
│   │   │   ├── IncidentResponseConsole.jsx # Analyst investigation & approval console
│   │   │   ├── AuditTrailView.jsx          # SQLite audit trail viewer & CSV export
│   │   │   ├── SummaryCards.jsx            # Global SOC KPI metrics
│   │   │   ├── PresetSelector.jsx          # 1-click benchmark attack presets
│   │   │   ├── TrafficForm.jsx             # 41-feature tabbed input form
│   │   │   ├── PredictionResult.jsx        # SOC threat verdict & IP block banner
│   │   │   ├── BlockedIPsTable.jsx         # Firewall blacklist manager
│   │   │   ├── HistoryTable.jsx            # Session history table
│   │   │   └── DatasetInfoModal.jsx        # NSL-KDD dataset reference dialog
│   │   ├── App.jsx                         # Main dashboard controller
│   │   ├── index.css                       # Cyber defence dark navy & emerald theme
│   │   └── main.jsx                        # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md                               # Project documentation
```

---

## 🚀 Setup & Execution Guide

### 1. Start Backend (Flask API)
```powershell
cd backend
python app.py
```
- Server starts on: **`http://localhost:5000`**
- SQLite database initializes automatically at `backend/defence_ids.db`.

### 2. Start Frontend (React + Vite)
In a second terminal:
```powershell
cd frontend
npm run dev
```
- Dashboard opens at: **`http://localhost:5173`**

---

## 🎯 How to Demonstrate to an Examiner / Professor

Follow this structured demonstration flow:

1. **Module 1: Command Center & Network Topology**
   - Open `http://localhost:5173`.
   - Point to the **Defence Network Topology**: explain the 4 interconnected simulated zones and their criticality tiers.
   - Point out the simulation disclaimers confirming academic prototype status.
2. **Simulate an Ingress Cyber Attack**:
   - In the Command Center, select **"Target Ingress Sector: Command Centre (HQ Core)"**.
   - Click the preset **"SYN Flood Attack (Neptune DoS)"**.
   - Click **"Analyze Traffic Packet"**.
   - Point out that the packet is evaluated by the real `ids_model.pkl` pipeline:
     - Model Prediction: **`INTRUSION DETECTED (Class 1)`**
     - DecisionTree Certainty: **`100%`**
     - Target Sector: **Command Centre**
3. **Module 2: Threat Prioritization**:
   - Switch to the **"Threat Prioritization"** tab in the top navigation.
   - Point out the newly generated alert:
     - Assigned Severity: **`P1 CRITICAL`**
     - Documented Rule Justification: *"Rule P1-Alpha: Hostile intrusion (Neptune DoS) targeted at Mission Critical Command Centre with 100% certainty."*
     - Emphasize to the examiner that Prediction (`Intrusion`), Confidence (`100%`), and Severity (`P1`) are strictly decoupled.
4. **Module 3: Incident Response Workflow**:
   - Click **"Investigate Incident"** on the alert.
   - Show the **Raw 41-Feature Telemetry Inspector** displaying exact packet values (`flag: S0`, `serror_rate: 1.0`).
   - Review the automated response recommendations.
   - Record an investigation note in the Analyst Journal: *"Confirmed SYN Flood targeting HQ Gateway. Approving simulated IP drop."*
   - Change decision to **`CONFIRMED INTRUSION`** and click **"Save Investigation"**.
   - Click **"Review & Approve"** on the simulated firewall drop recommendation:
     - Check the required approval box confirming simulated action.
     - Enter Callsign: `DUTY_OFFICER_CAPT_MILLER` and click **"Confirm Simulated Action"**.
5. **Module 4: Simulated Sector Isolation**:
   - Return to the **"Command Center & Topology"** tab.
   - Click **"Command Centre"** &rarr; click **"Engage Simulated Zone Isolation"**.
   - Confirm the action: the node turns into **`ISOLATED (SIM)`** with a lock icon, demonstrating defense-in-depth containment.
6. **Module 5: Immutable Audit Trail**:
   - Switch to the **"Audit Trail"** tab.
   - Show the examiner the permanent SQLite event log displaying:
     - `MODEL_PREDICTION_EXECUTED` by `ML_PIPELINE_ENGINE`
     - `ALERT_GENERATED`
     - `ANALYST_INVESTIGATION_UPDATED` by analyst
     - `SIMULATED_CONTAINMENT_APPROVED` with duty officer callsign
     - `SIMULATED_ZONE_ISOLATION_ACTIVATED`
   - Click **"Export CSV"** to demonstrate compliance reporting.

---

## 🧪 Automated Testing
Run the backend automated test suite:
```powershell
cd backend
python test_api.py
```
*(Tests `/health`, `/api/zones`, `/predict`, `/api/alerts`, `/api/recommendations`, `/api/audit-trail`, and simulated containment approvals)*
