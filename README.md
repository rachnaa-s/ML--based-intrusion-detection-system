# 🛡️ CyberShield IDS — Machine Learning Intrusion Detection System (MERN Stack)

<div align="center">

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Mongoose-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-REST%20API-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React%2018-Vite%20Dashboard-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20Runtime-339933?logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Cyber_Navy_Theme-38B2AC?logo=tailwind-css&logoColor=white)
![Dataset](https://img.shields.io/badge/Dataset-NSL--KDD%20(41%20Features)-blue)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

**An academic cybersecurity prototype and full-stack Security Operations Center (SOC) dashboard that evaluates network connection vectors and classifies them as Normal Traffic or Hostile Intrusions in real time.**

[Architecture](#-mern-architecture) • [Features](#-key-features) • [Quick Start](#-quick-start-guide) • [API Docs](#-backend-api-endpoints) • [Deployment](#-cloud-deployment-guide) • [Attack Taxonomy](#-attack-taxonomy-covered)

</div>

---

## 🌟 What's New in Version 2.0 (MERN Migration)

- 🍃 **MongoDB & Mongoose Database**: Full persistent database integration with MongoDB Atlas & Mongoose:
  - `PredictionLog`: Stores every analyzed traffic packet, class probabilities, threat verdict, and raw 41-feature inputs.
  - `BlockedIP`: Stores operator-enforced firewall quarantine rules.
  - `Preset`: Pre-seeded benchmark traffic scenarios stored in database.
- ⚡ **Pure Node.js Machine Learning Runtime**: The trained NSL-KDD Decision Tree classifier (depth 20, 569 nodes) and OneHotEncoder preprocessing pipeline now execute natively in Node.js.
  - **Zero Python dependencies** required for deployment.
  - **Sub-millisecond inference** (< 0.1ms per packet).
  - Eliminates heavy C-compilation errors (`numpy`, `scipy`, `pandas`) and Python version mismatches on cloud platforms.
- 🚀 **Effortless 1-Click Deployment**: Production-ready for **Render**, **Vercel**, **Railway**, and **Heroku**.
- 🛡️ **Graceful Fallback Mode**: If MongoDB is not yet connected during local testing, the backend seamlessly operates with an in-memory repository without crashing.

---

## 🏗️ MERN Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      CLIENT LAYER (React + Vite)                       │
 │  • Cyber SOC Dashboard (Dark Navy & Cyber Emerald Theme)              │
 │  • 1-Click Benchmark Attack Presets (DoS, Port Scan, Smurf...)        │
 │  • 41-Feature Tabbed Input Form with Live Validation                   │
 │  • Human-in-the-Loop Firewall Table & iptables Rule Exporter          │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API (JSON)
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    SERVER LAYER (Node.js + Express)                    │
 │  • Express REST Endpoints (/predict, /history, /blocked-ips...)        │
 │  • Embedded NSL-KDD ML Inference Engine (Decision Tree)                │
 │  • Cybersecurity Threat Classification & Risk Assessment               │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ Mongoose ODM
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     DATABASE LAYER (MongoDB Atlas)                     │
 │  • PredictionLog Collection (Audit trail, timestamps, probabilities)   │
 │  • BlockedIP Collection (Human operator firewall drop rules)          │
 │  • Preset Collection (Pre-seeded benchmark attack signatures)          │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Features

- **Real-Time ML Classification**: Evaluates all 41 NSL-KDD connection features and classifies traffic into `Normal (0)` or `Intrusion (1)` with exact probability distributions.
- **Explainable Cybersecurity Verdicts**: Automatically generates academic threat assessments, identifying specific attack mechanisms (e.g. *SYN Flood / Neptune*, *Satan Port Scan*, *Smurf ICMP Flood*, *FTP Brute Force*).
- **Human-in-the-Loop Quarantine**: Security analysts can manually quarantine malicious IP addresses with one click and export generated `iptables` drop rules.
- **Audit Logging & CSV Export**: Complete historical log of evaluated packets with timestamped CSV export for forensic auditing.
- **Pre-Configured 1-Click Presets**: Instant evaluation of benchmark attack vectors without manually typing all 41 features.
- **Unified & Decoupled Deployability**: Can be hosted as a single combined web service on Render/Railway or as a decoupled app (Frontend on Vercel + Backend on Render/Railway).

---

## 📂 Project Directory Structure

```text
ML--based-intrusion-detection-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback manager
│   ├── models/
│   │   ├── BlockedIP.js          # Mongoose schema for firewall rules
│   │   ├── PredictionLog.js      # Mongoose schema for prediction history
│   │   └── Preset.js             # Mongoose schema for attack traffic presets
│   ├── routes/
│   │   └── apiRoutes.js          # REST endpoints (/predict, /history, /blocked-ips...)
│   ├── services/
│   │   ├── dataConstants.js      # 41 NSL-KDD feature metadata & attack presets
│   │   ├── mlEngine.js           # Decision Tree inference & risk evaluation engine
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
│   │   │   ├── Navbar.jsx            # Header with live MERN & DB status monitor
│   │   │   ├── SummaryCards.jsx      # Analyzed, normal, intrusion KPI cards
│   │   │   ├── PresetSelector.jsx    # 1-click attack benchmark selector
│   │   │   ├── TrafficForm.jsx       # 41-feature tabbed input form
│   │   │   ├── PredictionResult.jsx  # SOC threat verdict & confidence panel
│   │   │   ├── BlockedIPsTable.jsx   # Human-in-the-loop firewall blocklist
│   │   │   ├── HistoryTable.jsx      # Audit history table with CSV export
│   │   │   └── DatasetInfoModal.jsx  # NSL-KDD dataset reference dialog
│   │   ├── App.jsx                   # Main React dashboard component
│   │   ├── index.css                 # Cyber aesthetic and glow themes
│   │   └── main.jsx                  # React application entry point
│   ├── package.json                  # Frontend dependencies
│   ├── package-lock.json
│   ├── vite.config.js                # Vite build configuration
│   ├── tailwind.config.js            # Tailwind color scheme
│   ├── postcss.config.js             # PostCSS plugins
│   ├── vercel.json                   # Vercel SPA rewrite configuration
│   └── .env.example
│
├── package.json                      # Root workspace scripts & cloud build entry point
├── Procfile                          # Cloud deployment runner
├── .gitignore                        # Git ignore rules
└── README.md                         # Project documentation
```

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
| `POST /predict` | `POST` | Evaluates 41 features, returns prediction (`Normal` or `Intrusion`), confidence, risk verdict, and saves audit log to MongoDB |
| `GET /api/history` | `GET` | Retrieves recent prediction audit records from MongoDB |
| `DELETE /api/history` | `DELETE` | Clears all prediction history records in MongoDB |
| `GET /api/blocked-ips` | `GET` | Retrieves active firewall blacklist rules from MongoDB |
| `POST /api/blocked-ips` | `POST` | Adds a new IP rule to the firewall blocklist in MongoDB |
| `DELETE /api/blocked-ips/:id`| `DELETE` | Removes an IP from the firewall blocklist |
| `GET /api/stats` | `GET` | Aggregated dashboard KPI metrics (total scans, intrusion count, normal count) |

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
