# Machine Learning-Based Intrusion Detection System (IDS)

An academic cybersecurity prototype that evaluates network traffic feature vectors and classifies them as **Normal Traffic** or **Potential Intrusion** in real time using a Scikit-Learn machine learning model trained on the benchmark **NSL-KDD dataset**.

---

## 🛡️ Project Overview & Architecture

This project is built from scratch with a decoupled full-stack architecture:

- **Frontend (`/frontend`)**: Modern React + Vite cybersecurity dashboard styled with Tailwind CSS in a defense-inspired dark navy and cyber emerald theme. Features summary KPI cards, 1-click benchmark attack presets, full 41-feature input tabs, real-time threat verdicts, and an audit history log with CSV export.
- **Backend (`/backend`)**: Python Flask REST API with CORS enabled. Hosts `/health`, `/schema`, `/presets`, and `/predict` endpoints.
- **Machine Learning**: Loads the pre-trained `ids_model.pkl` pipeline using `joblib` and `scikit-learn`. The pipeline combines a `ColumnTransformer` (One-Hot Encoding for categorical features and passthrough for numeric features) with a `DecisionTreeClassifier`.

> **Academic Prototype Notice**: This system is designed for educational evaluation. It does not automatically sniff real network hardware interfaces; users analyze traffic packets by submitting 41 network connection attributes or selecting benchmark attack presets.

---

## 📂 Project Directory Structure

```text
zealous-bell/
├── backend/
│   ├── ids_model.pkl           # Trained NSL-KDD Machine Learning pipeline
│   ├── app.py                  # Flask REST API server (/health, /predict, etc.)
│   ├── features.py             # Feature definitions, metadata, and attack presets
│   ├── test_api.py             # Automated end-to-end API test suite
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header with live Flask health monitor
│   │   │   ├── SummaryCards.jsx      # Analyzed, normal, intrusion KPI cards
│   │   │   ├── PresetSelector.jsx    # 1-click attack benchmark presets
│   │   │   ├── TrafficForm.jsx       # 41-feature tabbed input form
│   │   │   ├── PredictionResult.jsx  # SOC threat verdict & confidence panel
│   │   │   ├── HistoryTable.jsx      # Audit history table with CSV export
│   │   │   └── DatasetInfoModal.jsx  # NSL-KDD dataset reference dialog
│   │   ├── App.jsx                   # Main React dashboard component
│   │   ├── index.css                 # Cyber aesthetic and glow themes
│   │   └── main.jsx                  # React application entry point
│   ├── index.html                    # HTML document
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite build configuration
│   └── tailwind.config.js            # Tailwind color scheme
│
└── README.md                         # Project documentation and guide
```

---

## 📍 Model File Placement

The trained machine learning model file must be placed at:

```text
backend/ids_model.pkl
```

> **Note**: If you already downloaded `ids_model.pkl` to your `Downloads` folder, it has already been automatically discovered and copied to `backend/ids_model.pkl`.
>
> If you ever train a new model or re-download it, simply copy your `ids_model.pkl` file into the `backend/` folder. The Flask server will load it automatically upon startup.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Version 3.9 or higher (tested with Python 3.10+)
- **Node.js**: Version 18 or higher & `npm`

---

### Step 1: Start the Backend (Flask API)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify the backend and model by running the automated test suite:
   ```bash
   python test_api.py
   ```
   *(All tests should pass with green 200 OK responses)*

5. Start the Flask server:
   ```bash
   python app.py
   ```
   The backend API will start on: **`http://localhost:5000`**

---

### Step 2: Start the Frontend (React + Vite)

1. Open a **second terminal** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 📡 Backend API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `GET /` | `GET` | System welcome message and endpoint index |
| `GET /health` | `GET` | Health check verifying model status, classes, and expected features |
| `GET /schema` | `GET` | Returns the 41 feature names, categorical options, and tab groups |
| `GET /presets` | `GET` | Returns pre-configured benchmark attack and normal traffic samples |
| `POST /predict` | `POST` | Accepts 41 features in JSON and returns prediction (`Normal` or `Intrusion`), confidence, probabilities, and SOC threat assessment |

### Example Prediction Request
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "duration": 0,
      "protocol_type": "tcp",
      "service": "http",
      "flag": "SF",
      "src_bytes": 232,
      "dst_bytes": 8153,
      "land": 0,
      "wrong_fragment": 0,
      "urgent": 0,
      "hot": 0,
      "num_failed_logins": 0,
      "logged_in": 1,
      "num_compromised": 0,
      "root_shell": 0,
      "su_attempted": 0,
      "num_root": 0,
      "num_file_creations": 0,
      "num_shells": 0,
      "num_access_files": 0,
      "num_outbound_cmds": 0,
      "is_host_login": 0,
      "is_guest_login": 0,
      "count": 5,
      "srv_count": 5,
      "serror_rate": 0.0,
      "srv_serror_rate": 0.0,
      "rerror_rate": 0.0,
      "srv_rerror_rate": 0.0,
      "same_srv_rate": 1.0,
      "diff_srv_rate": 0.0,
      "srv_diff_host_rate": 0.0,
      "dst_host_count": 30,
      "dst_host_srv_count": 255,
      "dst_host_same_srv_rate": 1.0,
      "dst_host_diff_srv_rate": 0.0,
      "dst_host_same_src_port_rate": 0.03,
      "dst_host_srv_diff_host_rate": 0.04,
      "dst_host_serror_rate": 0.0,
      "dst_host_srv_serror_rate": 0.0,
      "dst_host_rerror_rate": 0.0,
      "dst_host_srv_rerror_rate": 0.0
    }
  }'
```

---

## 📊 Features & Benchmark Attack Scenarios

The model expects the exact **41 features** of the NSL-KDD dataset:

1. **Categorical Features (3)**:
   - `protocol_type`: `tcp`, `udp`, `icmp`
   - `service`: `http`, `ftp`, `smtp`, `private`, `telnet`, `ssh`, etc. (70 services)
   - `flag`: `SF` (Normal established), `S0` (SYN error), `REJ` (Rejected), `RSTO`, etc.
2. **Numerical Features (38)**:
   - Basic connection features (`duration`, `src_bytes`, `dst_bytes`, `land`, `wrong_fragment`, `urgent`)
   - Content features (`hot`, `num_failed_logins`, `logged_in`, `root_shell`, `su_attempted`, etc.)
   - Time-based traffic metrics (`count`, `srv_count`, `serror_rate`, `same_srv_rate`, etc.)
   - Host-based traffic metrics (`dst_host_count`, `dst_host_srv_count`, `dst_host_same_srv_rate`, etc.)

### 1-Click Attack Scenarios Included in UI
- **Normal HTTP Web Traffic**: Completed 3-way handshake (`SF`), active data payload exchange, normal error rates. Result: `Normal` (Class 0).
- **SYN Flood Attack (Neptune DoS)**: High volume of half-open SYN packets (`S0`), `serror_rate: 1.0`, targeting private ports. Result: `Intrusion` (Class 1).
- **Port Scan / Reconnaissance (Satan Probe)**: Rapid connection attempts across distinct ports resulting in rejected connections (`REJ`) and high `diff_srv_rate`. Result: `Intrusion` (Class 1).
- **Smurf ICMP Flood Attack**: Broadcast amplification attack over `icmp` with max connection frequency (`count: 511`). Result: `Intrusion` (Class 1).
- **FTP Password Guess / Brute Force (R2L)**: Multiple consecutive failed logins (`num_failed_logins: 4`, `guest_login: 1`). Result: `Intrusion` (Class 1).

---

## 🧪 Testing & Verification

- **Automated API Test**: Run `python backend/test_api.py` to test all routes and model inference with real payloads.
- **Frontend Build Test**: Run `npm run build` in `frontend/` to verify production assets compile without errors.
- **Live UI Testing**:
  1. Open `http://localhost:5173`.
  2. Verify the top right status badge displays **"Flask API Online"**.
  3. Click any of the 1-click attack presets.
  4. Click **"Analyze Traffic Packet"**.
  5. Inspect the animated confidence bar, probability breakdown, and threat evaluation.
  6. Click **"Export CSV"** in the History table to download your test session report.
