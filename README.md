# 🛡️ CyberShield IDS — Defence Network Security Monitoring & Incident Response System (MERN Stack)

<div align="center">

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Mongoose-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-REST%20API-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React%2018-Vite%20Dashboard-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20Runtime-339933?logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Cyber_Navy_Theme-38B2AC?logo=tailwind-css&logoColor=white)
![Dataset](https://img.shields.io/badge/Dataset-NSL--KDD%20(41%20Features)-blue)
![Google Colab](https://img.shields.io/badge/Training-Google%20Colab-F9AB00?logo=googlecolab&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

**An academic cybersecurity prototype and full-stack Security Operations Center (SOC) dashboard that evaluates network connection vectors, simulates defence network topology containment, calculates threat prioritization, and manages incident responses in real time.**

[Architecture](#-mern-architecture) • [Modules](#-soc-defence-modules) • [Colab Model Training](#-model-training--colab) • [Quick Start](#-quick-start-guide) • [API Docs](#-backend-api-endpoints) • [Deployment](#-cloud-deployment-guide) • [Attack Taxonomy](#-attack-taxonomy-covered)

</div>

---

## 🌟 What's New in Version 2.0 (MERN & Defence Incident Response)

- 🍃 **MongoDB & Mongoose Database**: Full persistent database integration with MongoDB Atlas:
  - `Zone`: Defence network sectors (`Command Centre`, `Surveillance`, `Secure Comms`, `Military Base`).
  - `Alert`: Prioritized incident response cases with analyst notes and containment status.
  - `AuditTrail`: Immutable event logging for forensics and compliance.
  - `PredictionLog`: Real-time traffic predictions, probabilities, and raw 41-feature vectors.
  - `BlockedIP`: Operator-enforced firewall quarantine rules.
  - `Preset`: Pre-seeded benchmark attack scenarios.
- ⚡ **Pure Node.js Machine Learning Runtime**: Trained NSL-KDD Decision Tree classifier and OneHotEncoder preprocessing pipeline run natively in Node.js.
  - **Zero Python runtime dependencies** required for deployment.
  - **Sub-millisecond inference** (< 0.1ms per packet).
  - Eliminates heavy C-library compilation errors and scikit-learn version mismatches on cloud hosting providers.
- 🎓 **Google Colab Model Training Notebook**: Includes [`IDS_Model_Training.ipynb`](IDS_Model_Training.ipynb) documenting the complete data preprocessing, exploratory data analysis, and Decision Tree training on the NSL-KDD benchmark dataset.
- 🚀 **Effortless 1-Click Deployment**: Production-ready for **Render**, **Vercel**, **Railway**, and **Heroku**.
- 🛡️ **Graceful Fallback Mode**: If MongoDB is not yet connected during local testing, the backend seamlessly operates with an in-memory repository without crashing.

---

## 🏗️ MERN Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      CLIENT LAYER (React + Vite)                       │
 │  • Module 1: Command Center & Interactive Defence Network Topology     │
 │  • Module 2: Rule-Based Threat Prioritization (P1, P2, P3, P4)         │
 │  • Module 3: Human-in-the-Loop Incident Response Console               │
 │  • Module 4: Traffic Inspector (41 Features & Benchmark Attack Presets)│
 │  • Module 5: Immutable Audit Trail Forensic Table                      │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API (JSON)
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    SERVER LAYER (Node.js + Express)                    │
 │  • Express REST Endpoints (/predict, /zones, /alerts, /audit-trail...) │
 │  • Embedded NSL-KDD ML Inference Engine (Decision Tree Classifier)     │
 │  • Threat Prioritization Engine (Zone Criticality + Attack Archetypes) │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ Mongoose ODM
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     DATABASE LAYER (MongoDB Atlas)                     │
 │  • Zone Collection (Simulated military sectors & containment status)   │
 │  • Alert Collection (Triage queue, analyst notes, approved actions)    │
 │  • AuditTrail Collection (Immutable chronological security event log)  │
 │  • PredictionLog & BlockedIP Collections (Traffic history & firewall)  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ SOC Defence Modules

1. **Command Center & Defence Topology**: Real-time visual status of 4 simulated sectors (`Command Centre HQ`, `Surveillance & Recon`, `Secure Communications`, `Military Base Logistics`). Supports simulated emergency sector containment isolation.
2. **Threat Prioritization Engine**: Automatically assigns priority levels:
   - `P1_CRITICAL`: Hostile intrusions targeting Tier 1 mission-critical assets or root exploits.
   - `P2_HIGH`: Malicious traffic targeting Tier 2 tactical sectors (surveillance / radar).
   - `P3_MEDIUM`: Intrusion attempts in secondary sectors.
   - `P4_LOW`: Routine legitimate network traffic.
3. **Incident Response Console**: Guided triage workflow where security analysts can add investigation notes, assign decisions (`CONTAINED`, `FALSE_POSITIVE`, `ESCALATED`), review automated mitigation commands, and grant explicit human approval for containment actions.
4. **Traffic Inspector & ML Engine**: Full 41-feature tabbed input form with live benchmark attack presets (Neptune SYN flood, Satan port scan, Smurf ICMP flood, FTP brute-force).
5. **Forensic Audit Trail**: Chronological event ledger recording every packet inspection, alert generation, zone isolation toggle, and operator intervention.

---

## 📂 Project Directory Structure

```text
ML--based-intrusion-detection-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback manager
│   ├── models/
│   │   ├── Alert.js              # Mongoose schema for incident alerts
│   │   ├── AuditTrail.js         # Mongoose schema for immutable audit logs
│   │   ├── BlockedIP.js          # Mongoose schema for firewall rules
│   │   ├── PredictionLog.js      # Mongoose schema for traffic predictions
│   │   ├── Preset.js             # Mongoose schema for attack traffic presets
│   │   └── Zone.js               # Mongoose schema for defence network sectors
│   ├── routes/
│   │   └── apiRoutes.js          # REST endpoints (/predict, /zones, /alerts, /audit-trail...)
│   ├── services/
│   │   ├── dataConstants.js      # 41 NSL-KDD feature metadata & attack presets
│   │   ├── mlEngine.js           # Decision Tree inference & risk evaluation engine
│   │   ├── prioritization.js     # Threat priority rules & sector criticality
│   │   └── store.js              # Persistence layer (MongoDB + in-memory fallback)
│   ├── model.json                # Lightweight Decision Tree & encoder model
│   ├── server.js                 # Express application entry point
│   ├── test_api.js               # Node.js automated test runner
│   ├── package.json              # Backend dependencies
│   ├── package-lock.json
│   ├── Procfile                  # Node web process configuration
│   └── .env.example              # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditTrailView.jsx          # Module 5: Immutable audit trail table
│   │   │   ├── BlockedIPsTable.jsx         # Human-in-the-loop firewall blocklist
│   │   │   ├── DatasetInfoModal.jsx        # NSL-KDD dataset reference dialog
│   │   │   ├── DefenceTopology.jsx         # Module 1: Network sector topology
│   │   │   ├── HistoryTable.jsx            # Audit history table with CSV export
│   │   │   ├── IncidentResponseConsole.jsx # Module 3: Analyst triage console
│   │   │   ├── Navbar.jsx                  # Module navigation bar & live health status
│   │   │   ├── PredictionResult.jsx        # SOC threat verdict & confidence panel
│   │   │   ├── PresetSelector.jsx          # 1-click attack benchmark selector
│   │   │   ├── SummaryCards.jsx            # KPI cards (scanned, normal, intrusions)
│   │   │   ├── ThreatPrioritization.jsx    # Module 2: Priority alerts list
│   │   │   └── TrafficForm.jsx             # 41-feature tabbed input form
│   │   ├── App.jsx                         # Main React application & state coordinator
│   │   ├── index.css                       # Cyber aesthetic and glow themes
│   │   └── main.jsx                        # React entry point
│   ├── package.json                        # Frontend dependencies
│   ├── package-lock.json
│   ├── vite.config.js                      # Vite build configuration
│   ├── tailwind.config.js                  # Tailwind color scheme
│   ├── postcss.config.js
│   ├── vercel.json                         # Vercel SPA rewrite configuration
│   └── .env.example
│
├── IDS_Model_Training.ipynb      # Google Colab model training notebook
├── package.json                  # Root workspace scripts & cloud build entry point
├── Procfile                      # Cloud deployment runner
├── .gitignore                    # Git ignore rules
└── README.md                     # Comprehensive project documentation
```

---

## 🔬 Model Training & Google Colab

The machine learning classifier is trained on the benchmark **NSL-KDD dataset** (derived from DARPA'98/KDD'99):
- The training process is documented in [`IDS_Model_Training.ipynb`](IDS_Model_Training.ipynb).
- It applies a `ColumnTransformer` (One-Hot Encoding for categorical features `protocol_type`, `service`, `flag`, and passthrough for 38 numeric features) paired with a `DecisionTreeClassifier`.
- The trained tree structure (569 nodes, max depth 20) is exported to [`backend/model.json`](backend/model.json) and executed in pure JavaScript for zero-latency, cross-platform deployment.

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- **Node.js**: Version 18 or higher (tested on Node.js 20 & 24)
- **MongoDB**: A free **MongoDB Atlas** connection string or local MongoDB instance on port `27017`.

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/rachnaa-s/ML--based-intrusion-detection-system.git
cd ML--based-intrusion-detection-system
npm run install:all
```
*(Installs dependencies for both `backend/` and `frontend/`)*.

---

### Step 2: Configure Environment Variables

Create your `.env` file inside the `backend/` directory:
```bash
# Inside backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ids_db
```

> **Using MongoDB Atlas (Free Cloud Database)**:
> Replace `MONGODB_URI` with your connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ids_db?retryWrites=true&w=majority`

---

### Step 3: Run Automated Test Suite

Verify that all endpoints and machine learning classifications are working:
```bash
npm test
```
All tests should pass with green 200 OK responses.

---

### Step 4: Start Development Servers

Start the backend and frontend simultaneously:

**Terminal 1 — Backend (Express + MongoDB + ML Engine):**
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 — Frontend (React + Vite):**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

Open **`http://localhost:5173`** in your browser to access the dashboard.

---

## 📡 Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `GET /health` | `GET` | Health check verifying model status, runtime, and MongoDB connectivity |
| `GET /schema` | `GET` | Returns 41 NSL-KDD feature names, categorical options, and tab groups |
| `GET /presets` | `GET` | Returns pre-configured benchmark attack and normal traffic samples |
| `POST /predict` | `POST` | Evaluates 41 features + sector, calculates threat priority, saves alert and prediction log |
| `GET /api/zones` | `GET` | Retrieves all simulated defence sectors and status |
| `POST /api/zones/:id/simulate-isolation` | `POST` | Toggles simulated containment isolation for a sector |
| `GET /api/alerts` | `GET` | Retrieves filtered list of defence security alerts |
| `GET /api/alerts/:id` | `GET` | Retrieves single alert details with full feature snapshot |
| `PATCH /api/alerts/:id` | `PATCH` | Updates analyst investigation notes and decision |
| `POST /api/alerts/:id/action` | `POST` | Records explicit human approval for containment actions |
| `GET /api/recommendations/:id` | `GET` | Generates response recommendations for an alert |
| `GET /api/audit-trail` | `GET` | Retrieves immutable chronological audit log records |
| `GET /api/history` | `GET` | Retrieves recent prediction audit records from MongoDB |
| `DELETE /api/history` | `DELETE` | Clears all prediction history records in MongoDB |
| `GET /api/blocked-ips` | `GET` | Retrieves active firewall blacklist rules from MongoDB |
| `POST /api/blocked-ips` | `POST` | Adds a new IP rule to the firewall blocklist in MongoDB |
| `DELETE /api/blocked-ips/:id`| `DELETE` | Removes an IP from the firewall blocklist |
| `GET /api/stats` | `GET` | Aggregated dashboard KPI metrics |

---

## 🌐 Cloud Deployment Guide

Because the backend is standard **Node.js + Express + MongoDB**, it deploys in minutes without large Python build times or version conflicts.

### Option A: Unified Full-Stack on Render (Single Web Service)

Deploy the entire MERN app as one service:

1. Push your code to GitHub.
2. Log in to [Render](https://render.com) and click **New +** > **Web Service**.
3. Select your repository: `ML--based-intrusion-detection-system`.
4. Configure service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
6. Click **Deploy Web Service**.
   - Render automatically builds the React frontend into `frontend/dist`.
   - The Express backend serves the React app and handles all API routes at your live `.onrender.com` URL.

---

### Option B: Decoupled (Frontend on Vercel + Backend on Render/Railway)

#### 1. Backend on Render or Railway:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
- Copy your backend URL (e.g. `https://ids-backend.onrender.com`).

#### 2. Frontend on Vercel:
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://ids-backend.onrender.com` (without trailing slash)
- Click **Deploy**!

---

### 🍃 Free MongoDB Atlas Setup (2 Minutes)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, click **Add IP Address** > Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** > **Drivers** > Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/ids_db?retryWrites=true&w=majority
   ```
6. Set this value as `MONGODB_URI` in your `.env` or cloud provider dashboard.

---

## 🎯 Attack Taxonomy Covered

| Attack Category | Threat Type | Example Attack | Detected Signature |
| :--- | :---: | :--- | :--- |
| **Denial of Service (DoS)** | Critical | Neptune (SYN Flood) | Flag `S0`, high `serror_rate` (1.0), private ports |
| **Denial of Service (DoS)** | Critical | Smurf (Broadcast Storm) | Protocol `icmp`, service `ecr_i`, connection `count: 511` |
| **Surveillance & Probing** | High | Satan (Port Scan) | Flag `REJ`, high `diff_srv_rate`, high `rerror_rate` |
| **Remote-to-Local (R2L)** | High | FTP Password Guess | Consecutive `num_failed_logins >= 2`, `is_guest_login: 1` |
| **User-to-Root (U2R)** | Critical | Buffer Overflow / Exploit | Flagged `root_shell: 1`, `num_root > 0`, `hot > 0` |
| **Legitimate Traffic** | Safe | Normal Web / Mail | Completed handshake (`SF`), normal error rates |

---

## 📄 License & Academic Attribution

This project is open-source and created for academic evaluation of Machine Learning in Cybersecurity based on the **NSL-KDD dataset**.
