import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import PresetSelector from './components/PresetSelector';
import TrafficForm from './components/TrafficForm';
import PredictionResult from './components/PredictionResult';
import BlockedIPsTable from './components/BlockedIPsTable';
import HistoryTable from './components/HistoryTable';
import DatasetInfoModal from './components/DatasetInfoModal';
import { AlertCircle, RefreshCw, ShieldCheck, ShieldBan } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [featureGroups, setFeatureGroups] = useState({});
  const [categoricalOptions, setCategoricalOptions] = useState({});
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ids_prediction_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Human-in-the-loop Blocked IPs state
  const [blockedIPs, setBlockedIPs] = useState(() => {
    try {
      const saved = localStorage.getItem('ids_blocked_ips');
      return saved ? JSON.parse(saved) : [
        {
          id: 'FW-1092',
          ip: '203.0.113.45',
          reason: 'Known external botnet scanner (Pre-configured sample)',
          timestamp: '2026-10-21 14:15:00'
        }
      ];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ids_prediction_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  // Sync blocked IPs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ids_blocked_ips', JSON.stringify(blockedIPs));
    } catch (e) {
      console.warn('Could not save blocked IPs to localStorage', e);
    }
  }, [blockedIPs]);

  // Auto-dismiss toast notification after 5s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch backend status, schema, and presets on load
  const fetchInitialData = async () => {
    setErrorMessage(null);
    try {
      // 1. Health check
      const healthRes = await fetch(`${API_BASE_URL}/health`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setBackendStatus(healthData);
      } else {
        setBackendStatus({ status: 'error', model_loaded: false });
      }

      // 2. Fetch schema
      const schemaRes = await fetch(`${API_BASE_URL}/schema`);
      if (schemaRes.ok) {
        const schemaData = await schemaRes.json();
        setFeatureGroups(schemaData.feature_groups || {});
        setCategoricalOptions(schemaData.categorical_options || {});

        // Build default formData from schema
        const defaults = {};
        Object.values(schemaData.feature_groups || {}).forEach((group) => {
          group.forEach((feat) => {
            defaults[feat.name] = feat.default;
          });
        });
        setFormData((prev) => (Object.keys(prev).length === 0 ? defaults : prev));
      }

      // 3. Fetch presets
      const presetsRes = await fetch(`${API_BASE_URL}/presets`);
      if (presetsRes.ok) {
        const presetsData = await presetsRes.json();
        setPresets(presetsData.presets || []);
        // Automatically preselect normal preset if empty
        if (presetsData.presets?.length > 0 && Object.keys(formData).length === 0) {
          const first = presetsData.presets[0];
          setActivePresetId(first.id);
          setFormData(first.features);
        }
      }
    } catch (err) {
      console.error('Failed to communicate with backend API:', err);
      setBackendStatus({ status: 'offline', model_loaded: false });
      setErrorMessage('Could not connect to Flask backend at http://localhost:5000. Ensure "python app.py" is running in the backend directory.');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // IP Blocking / Unblocking Handlers (Human-in-the-Loop)
  const handleBlockIP = (ip, reason = 'Intrusion detected by ML model') => {
    if (!ip) return;
    if (blockedIPs.some((b) => b.ip === ip)) {
      setNotification({ type: 'warning', message: `IP ${ip} is already blocked in firewall.` });
      return;
    }

    const newRule = {
      id: `FW-${Math.floor(1000 + Math.random() * 9000)}`,
      ip: ip,
      reason: reason,
      timestamp: new Date().toLocaleString()
    };

    setBlockedIPs((prev) => [newRule, ...prev]);
    setNotification({
      type: 'success',
      message: `Firewall Drop Rule Activated: IP ${ip} has been blocked by Human Operator.`
    });
  };

  const handleUnblockIP = (ip) => {
    setBlockedIPs((prev) => prev.filter((b) => b.ip !== ip));
    setNotification({
      type: 'info',
      message: `Firewall Rule Removed: IP ${ip} is now unblocked and allowed.`
    });
  };

  // Preset Selection
  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setFormData({ ...preset.features });
    setErrorMessage(null);
  };

  // Form Field Change
  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setActivePresetId(null);
  };

  // Reset form to default baseline
  const handleReset = () => {
    const defaults = {};
    Object.values(featureGroups).forEach((group) => {
      group.forEach((feat) => {
        defaults[feat.name] = feat.default;
      });
    });
    setFormData(defaults);
    setActivePresetId(null);
    setErrorMessage(null);
  };

  // Submit Traffic Packet to Backend ML API
  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ features: formData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Server error occurred during prediction.');
      }

      // Attach raw input snapshot for history reloading
      const record = {
        ...data,
        raw_input: { ...formData }
      };

      setCurrentResult(record);
      setHistory((prev) => [record, ...prev]);

      // Scroll to result view
      const resultElem = document.getElementById('prediction-section');
      if (resultElem) {
        resultElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      console.error('Prediction failed:', err);
      setErrorMessage(err.message || 'Failed to connect to backend inference engine.');
    } finally {
      setLoading(false);
    }
  };

  // Clear Audit Log History
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('ids_prediction_history');
    } catch (e) {
      console.warn(e);
    }
  };

  // Reload an audit log item into form
  const handleLoadHistoryItem = (rawInput) => {
    if (rawInput) {
      setFormData({ ...rawInput });
      setActivePresetId(null);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
        onOpenDocs={() => setIsDocsOpen(true)}
        onRefreshStatus={fetchInitialData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Toast / Notification Banner for Firewall Events */}
        {notification && (
          <div className="p-3.5 rounded-xl bg-[#0e1c36] border border-cyan-500/40 text-cyan-200 flex items-center justify-between shadow-glow-cyan animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <ShieldBan className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white text-xs font-mono ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Error Notification Banner if backend disconnected */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold font-mono text-rose-300">Connection / Inference Notice</h4>
                <p className="text-xs text-rose-200/90 mt-1">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={fetchInitialData}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-mono font-medium text-rose-100 border border-rose-500/40 shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* 1. Summary Cards */}
        <SummaryCards history={history} blockedIPsCount={blockedIPs.length} />

        {/* 2. Benchmark Presets */}
        {presets.length > 0 && (
          <PresetSelector
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* 3. Prediction Result Section (with Human IP Block Action) */}
        <div id="prediction-section">
          <PredictionResult
            result={currentResult}
            blockedIPs={blockedIPs}
            onBlockIP={handleBlockIP}
            onUnblockIP={handleUnblockIP}
          />
        </div>

        {/* 4. Traffic Input Form */}
        <TrafficForm
          formData={formData}
          featureGroups={featureGroups}
          categoricalOptions={categoricalOptions}
          onChange={handleFieldChange}
          onReset={handleReset}
          onSubmit={handleAnalyze}
          loading={loading}
        />

        {/* 5. Human Intervention Firewall Blocklist Table */}
        <BlockedIPsTable
          blockedIPs={blockedIPs}
          onBlockIP={handleBlockIP}
          onUnblockIP={handleUnblockIP}
        />

        {/* 6. History Audit Log Table */}
        <HistoryTable
          history={history}
          onClear={handleClearHistory}
          onLoadHistoryItem={handleLoadHistoryItem}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#162340] bg-[#060a12] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Machine Learning Intrusion Detection System (IDS) &bull; College Project Prototype
          </div>
          <div className="text-slate-400">
            Trained on NSL-KDD Dataset &bull; React + Vite + Flask + Scikit-Learn
          </div>
        </div>
      </footer>

      {/* Dataset Info Modal */}
      <DatasetInfoModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
