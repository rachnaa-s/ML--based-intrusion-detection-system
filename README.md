# 🛡️ Machine Learning-Based Intrusion Detection System (MERN Stack)

A full-stack cybersecurity prototype built on the **MERN architecture (MongoDB, Express, React, Node.js)** that classifies network traffic vectors as **Normal Traffic** or **Potential Intrusion** in real time using a high-performance Machine Learning engine trained on the benchmark **NSL-KDD dataset**.

---

## 🌟 What's New in Version 2.0 (MERN Migration)

- 🍃 **MongoDB & Mongoose Integration**: Persistent storage for all traffic prediction audit logs (`PredictionLog`), human-in-the-loop firewall rules (`BlockedIP`), and benchmark traffic presets (`Preset`).
- ⚡ **Pure Node.js Machine Learning Runtime**: The trained NSL-KDD Decision Tree classifier and OneHotEncoder preprocessing pipeline now run natively in Node.js.
  - Zero Python dependencies required in production.
  - Sub-millisecond inference (< 0.1ms per packet).
  - Eliminates Python version mismatches, heavy build times, and memory timeouts during deployment.
- 🚀 **Effortless 1-Click Deployment**: Designed specifically for easy hosting on **Render**, **Railway**, **Vercel**, **Heroku**, or **Fly.io** using a standard Node.js runtime and **MongoDB Atlas**.
- 🛡️ **Resilient Fallback Mode**: If MongoDB is not yet connected during initial development, the backend automatically operates with an in-memory repository without crashing.

---

## 🏗️ MERN Architecture Overview

```text
                        ┌───────────────────────────────────────────────┐
                        │              CLIENT LAYER (React)             │
                        │  • Tailwind Cyber UI Dashboard                │
                        │  • 1-Click Attack Benchmarks (DoS, Probe...)  │
                        │  • 41-Feature Tabbed Input Form               │
                        │  • Human Intervention Firewall Controls       │
                        └───────────────────────┬───────────────────────┘
                                                │ REST API (JSON)
                                                ▼
                        ┌───────────────────────────────────────────────┐
                        │             SERVER LAYER (Node/Express)       │
                        │  • Express Router (/predict, /history, ...)   │
                        │  • Embedded NSL-KDD ML Inference Engine       │
                        │  • Threat Classification & Risk Assessment    │
                        └───────────────────────┬───────────────────────┘
                                                │ Mongoose ODM
                                                ▼
                        ┌───────────────────────────────────────────────┐
                        │             DATABASE LAYER (MongoDB)          │
                        │  • PredictionLog (Audit trail & probabilities)│
                        │  • BlockedIP (Active firewall drop rules)     │
                        │  • Preset (Seeded benchmark attack traffic)   │
                        └───────────────────────────────────────────────┘
```

- **M — MongoDB**: MongoDB Atlas or local MongoDB for storing prediction history, threat analytics, and firewall rules.
- **E — Express.js**: REST API server handling request validation, cybersecurity metrics, and endpoint routing.
- **R — React.js**: Fast Vite-powered dashboard styled with Tailwind CSS in a dark navy and cyber emerald SOC theme.
- **N — Node.js**: Unified backend environment running both API services and ML inference.

---

## 📂 Project Directory Structure

```text
ML--based-intrusion-detection-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection manager & event handlers
│   ├── models/
│   │   ├── PredictionLog.js      # Mongoose schema for prediction history
│   │   ├── BlockedIP.js          # Mongoose schema for firewall rules
│   │   └── Preset.js             # Mongoose schema for traffic presets
│   ├── routes/
│   │   └── apiRoutes.js          # Express endpoints (/predict, /history, /blocked-ips...)
│   ├── services/
│   │   ├── dataConstants.js      # 41 NSL-KDD feature metadata & attack presets
│   │   ├── mlEngine.js           # Decision Tree inference & risk evaluation engine
│   │   └── store.js              # Data access layer (MongoDB + in-memory fallback)
│   ├── model.json                # Exported Decision Tree & preprocessing pipeline
│   ├── server.js                 # Express application entry point
│   ├── test_api.js               # Automated Node.js backend test suite
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variables template
│   └── Procfile                  # Node web process configuration
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
│   ├── vite.config.js                # Vite build configuration
│   └── tailwind.config.js            # Tailwind color scheme
│
├── package.json                      # Root workspace scripts & unified deployment
├── Procfile                          # Cloud deployment entry point
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- **Node.js**: Version 18 or higher (tested on Node.js 20 & 24)
- **MongoDB**: A free **MongoDB Atlas** connection URI, or a local MongoDB instance running on port `27017`.

---

### Step 1: Install Dependencies

From the project root directory, run:
```bash
npm run install:all
```
*(This automatically installs dependencies in both `backend/` and `frontend/`)*.

---

### Step 2: Configure Environment Variables

Create your `.env` file in the `backend/` directory:
```bash
# Inside backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ids_db
```

> **Using MongoDB Atlas (Recommended)**:
> Replace `MONGODB_URI` with your Atlas connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ids_db?retryWrites=true&w=majority`

---

### Step 3: Verify with Automated Test Suite

Run the backend test suite:
```bash
npm test
```
*(Tests `/health`, `/schema`, `/presets`, `/predict`, `/history`, `/blocked-ips`, and `/stats`)*.

---

### Step 4: Start the Application

You can start the backend and frontend simultaneously:

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

Open **`http://localhost:5173`** in your browser.

---

## 📡 Backend API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `GET /health` | `GET` | Health check verifying model status, runtime, and MongoDB connectivity |
| `GET /schema` | `GET` | Returns the 41 NSL-KDD feature names, categorical options, and tab groups |
| `GET /presets` | `GET` | Returns pre-configured benchmark attack and normal traffic samples |
| `POST /predict` | `POST` | Evaluates 41 features, returns prediction (`Normal` or `Intrusion`), confidence, risk verdict, and saves audit log to MongoDB |
| `GET /api/history` | `GET` | Retrieves recent prediction audit records from MongoDB |
| `DELETE /api/history` | `DELETE` | Clears all prediction history records in MongoDB |
| `GET /api/blocked-ips` | `GET` | Retrieves active firewall blacklist rules from MongoDB |
| `POST /api/blocked-ips` | `POST` | Adds a new IP rule to the firewall blocklist in MongoDB |
| `DELETE /api/blocked-ips/:id`| `DELETE` | Removes an IP from the firewall blocklist |
| `GET /api/stats` | `GET` | Aggregated dashboard KPI metrics (total scans, intrusion count, normal count) |

---

## 🌐 Easy Deployment Guide

Because the backend is now standard **Node.js + Express + MongoDB**, it deploys cleanly in minutes without the large Python C-library sizes or version issues.

### Option A: Unified Full-Stack Deployment on Render (Easiest)

You can host both the frontend and backend together as a single Web Service on Render:

1. Push your repository to GitHub.
2. Sign up / Log in to [Render](https://render.com).
3. Click **New +** > **Web Service**.
4. Select your repository: `ML--based-intrusion-detection-system`.
5. Configure the deployment settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
7. Click **Deploy Web Service**.
   - Render will build the React frontend into `frontend/dist`.
   - The Express backend will start and automatically serve the React frontend at your live `.onrender.com` URL!

---

### Option B: Decoupled Deployment (Frontend on Vercel + Backend on Render)

#### 1. Backend on Render:
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
  - `VITE_API_BASE_URL`: `https://ids-backend.onrender.com` (no trailing slash)
- Click **Deploy**!

---

### Setting Up a Free MongoDB Atlas Database (2 Minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a user (e.g. `ids_user`) with a password.
4. Under **Network Access**, click **Add IP Address** > Choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** > **Drivers** > Copy the connection string:
   ```text
   mongodb+srv://ids_user:<password>@cluster0.mongodb.net/ids_db?retryWrites=true&w=majority
   ```
6. Paste this URI into your deployment environment variables as `MONGODB_URI`.

---

## 📊 Features & Attack Scenarios Included

The system classifies traffic using all **41 NSL-KDD attributes**:

- **Categorical Features**: `protocol_type` (tcp, udp, icmp), `service` (70 services: http, smtp, ftp, private, etc.), `flag` (SF, S0, REJ, etc.)
- **Numerical Features**: `duration`, `src_bytes`, `dst_bytes`, `count`, `srv_count`, `serror_rate`, `rerror_rate`, `same_srv_rate`, `diff_srv_rate`, etc.

### 1-Click Evaluation Presets
- **Normal HTTP Web Traffic**: Completed 3-way handshake (`SF`), active data payload exchange. Result: `Normal` (Class 0).
- **SYN Flood Attack (Neptune DoS)**: High volume of half-open SYN packets (`S0`), `serror_rate: 1.0`. Result: `Intrusion` (Class 1).
- **Port Scan / Reconnaissance (Satan Probe)**: Rapid connection attempts resulting in rejected connections (`REJ`). Result: `Intrusion` (Class 1).
- **Smurf ICMP Flood Attack**: Broadcast amplification over `icmp` with max frequency (`count: 511`). Result: `Intrusion` (Class 1).
- **FTP Password Guess / Brute Force (R2L)**: Multiple consecutive failed logins (`num_failed_logins: 4`). Result: `Intrusion` (Class 1).

---

## 📄 License & Academic Attribution

This project is created for educational and academic evaluation of Machine Learning in Cybersecurity based on the **NSL-KDD dataset**.
