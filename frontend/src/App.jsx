import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import DefenceTopology from './components/DefenceTopology';
import ThreatPrioritization from './components/ThreatPrioritization';
import IncidentResponseConsole from './components/IncidentResponseConsole';
import PresetSelector from './components/PresetSelector';
import TrafficForm from './components/TrafficForm';
import PredictionResult from './components/PredictionResult';
import BlockedIPsTable from './components/BlockedIPsTable';
import HistoryTable from './components/HistoryTable';
import AuditTrailView from './components/AuditTrailView';
import DatasetInfoModal from './components/DatasetInfoModal';
import { AlertCircle, RefreshCw, ShieldCheck, ShieldBan, Network, AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [activeModule, setActiveModule] = useState('command_center');
  const [backendStatus, setBackendStatus] = useState(null);
  const [featureGroups, setFeatureGroups] = useState({});
  const [categoricalOptions, setCategoricalOptions] = useState({});
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  // Defence Modules State
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('command_centre');
  const [targetZoneForTraffic, setTargetZoneForTraffic] = useState('command_centre');
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

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

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ids_prediction_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ids_prediction_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('ids_blocked_ips', JSON.stringify(blockedIPs));
    } catch (e) {
      console.warn('Could not save blocked IPs to localStorage', e);
    }
  }, [blockedIPs]);

  // Auto-dismiss toast
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch initial defence data
  const fetchAllDefenceData = async () => {
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

      // 2. Fetch Zones
      const zonesRes = await fetch(`${API_BASE_URL}/api/zones`);
      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData.zones || []);
      }

      // 3. Fetch Alerts
      const alertsRes = await fetch(`${API_BASE_URL}/api/alerts`);
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
        if (alertsData.alerts?.length > 0 && !selectedAlert) {
          setSelectedAlert(alertsData.alerts[0]);
        }
      }

      // 4. Fetch Audit Trail
      const auditRes = await fetch(`${API_BASE_URL}/api/audit-trail`);
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditTrail(auditData.audit_trail || []);
      }

      // 5. Fetch Schema
      const schemaRes = await fetch(`${API_BASE_URL}/schema`);
      if (schemaRes.ok) {
        const schemaData = await schemaRes.json();
        setFeatureGroups(schemaData.feature_groups || {});
        setCategoricalOptions(schemaData.categorical_options || {});

        const defaults = {};
        Object.values(schemaData.feature_groups || {}).forEach((group) => {
          group.forEach((feat) => {
            defaults[feat.name] = feat.default;
          });
        });
        setFormData((prev) => (Object.keys(prev).length === 0 ? defaults : prev));
      }

      // 6. Fetch Presets
      const presetsRes = await fetch(`${API_BASE_URL}/presets`);
      if (presetsRes.ok) {
        const presetsData = await presetsRes.json();
        setPresets(presetsData.presets || []);
        if (presetsData.presets?.length > 0 && Object.keys(formData).length === 0) {
          const first = presetsData.presets[0];
          setActivePresetId(first.id);
          setFormData(first.features);
        }
      }
    } catch (err) {
      console.error('Failed to communicate with Defence API:', err);
      setBackendStatus({ status: 'offline', model_loaded: false });
      setErrorMessage('Could not connect to Flask backend at http://localhost:5000. Ensure "python app.py" is running in backend directory.');
    }
  };

  useEffect(() => {
    fetchAllDefenceData();
  }, []);

  // Poll audit trail
  const handleRefreshAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/audit-trail`);
      if (res.ok) {
        const d = await res.json();
        setAuditTrail(d.audit_trail || []);
      }
    } catch (e) {
      console.error('Audit refresh failed', e);
    } finally {
      setAuditLoading(false);
    }
  };

  // Toggle Simulated Zone Isolation (Module 1 & 4)
  const handleToggleIsolation = async (zoneId, actor) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/zones/${zoneId}/simulate-isolation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, confirm_simulated_action: true })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: data.message
        });
        fetchAllDefenceData();
      } else {
        throw new Error(data.message || data.error);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Investigate Alert (Module 2 -> 3)
  const handleInvestigateAlert = (alert) => {
    setSelectedAlert(alert);
    setActiveModule('incident_response');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Alert Investigation (Module 3)
  const handleUpdateInvestigation = async (alertId, status, notes, decision, actor) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, analyst_notes: notes, analyst_decision: decision, actor })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Alert [${alertId}] investigation updated by ${actor}.`
        });
        fetchAllDefenceData();
        setSelectedAlert(data.alert);
      } else {
        throw new Error(data.message || data.error);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Approve Simulated Action (Module 3)
  const handleApproveAction = async (alertId, actionType, approvedBy) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType, approved_by: approvedBy, confirm_action: true })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Simulated containment action '${actionType}' approved by ${approvedBy}.`
        });
        fetchAllDefenceData();
        setSelectedAlert(data.alert);
      } else {
        throw new Error(data.message || data.error);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

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
        body: JSON.stringify({
          features: formData,
          zone_id: targetZoneForTraffic
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Server error occurred during prediction.');
      }

      const record = {
        ...data,
        raw_input: { ...formData },
        target_zone: targetZoneForTraffic
      };

      setCurrentResult(record);
      setHistory((prev) => [record, ...prev]);

      // Refetch defence data to reflect new alerts, zone counts, and audit logs
      fetchAllDefenceData();

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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
        onOpenDocs={() => setIsDocsOpen(true)}
        onRefreshStatus={fetchAllDefenceData}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        alertCount={alerts.filter(a => a.status === 'NEW').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Toast / Notification Banner */}
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

        {/* Error Notification Banner if disconnected */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold font-mono text-rose-300">Connection Notice</h4>
                <p className="text-xs text-rose-200/90 mt-1">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={fetchAllDefenceData}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-mono font-medium text-rose-100 border border-rose-500/40 shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Global KPI Summary Cards */}
        <SummaryCards history={history} blockedIPsCount={blockedIPs.length} />

        {/* ========================================================= */}
        {/* MODULE 1 & 4: COMMAND CENTRE & NETWORK TOPOLOGY           */}
        {/* ========================================================= */}
        {activeModule === 'command_center' && (
          <div className="space-y-6 animate-fadeIn">
            <DefenceTopology
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onToggleIsolation={handleToggleIsolation}
            />

            {/* Quick Presets & Form Injection directly into Selected Sector */}
            <div className="p-5 rounded-xl bg-[#0c1326] border border-[#1b2b4e]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  Simulate Sector Traffic Ingestion
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Target Ingress Sector:</span>
                  <select
                    value={targetZoneForTraffic}
                    onChange={(e) => setTargetZoneForTraffic(e.target.value)}
                    className="px-2.5 py-1 rounded bg-[#101b38] border border-[#213563] text-cyan-300 text-xs font-mono focus:outline-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {presets.length > 0 && (
                <PresetSelector
                  presets={presets}
                  activePresetId={activePresetId}
                  onSelectPreset={handleSelectPreset}
                />
              )}
            </div>

            {/* Prediction Result Display */}
            <div id="prediction-section">
              <PredictionResult
                result={currentResult}
                blockedIPs={blockedIPs}
                onBlockIP={handleBlockIP}
                onUnblockIP={handleUnblockIP}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 2: THREAT PRIORITIZATION & INCIDENT ALERTS         */}
        {/* ========================================================= */}
        {activeModule === 'threat_prioritization' && (
          <div className="space-y-6 animate-fadeIn">
            <ThreatPrioritization
              alerts={alerts}
              onInvestigateAlert={handleInvestigateAlert}
              selectedAlertId={selectedAlert?.id}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 3: INCIDENT RESPONSE WORKFLOW CONSOLE              */}
        {/* ========================================================= */}
        {activeModule === 'incident_response' && (
          <div className="space-y-6 animate-fadeIn">
            <IncidentResponseConsole
              alert={selectedAlert}
              onUpdateInvestigation={handleUpdateInvestigation}
              onApproveAction={handleApproveAction}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE: TRAFFIC ANALYSIS & NSL-KDD 41-FEATURE INSPECTOR   */}
        {/* ========================================================= */}
        {activeModule === 'traffic_inspector' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0c1326] border border-[#1b2b4e] text-xs font-mono">
              <span className="text-slate-300">
                Select simulated sector for traffic analysis:
              </span>
              <select
                value={targetZoneForTraffic}
                onChange={(e) => setTargetZoneForTraffic(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#111c38] border border-[#233766] text-cyan-300 font-bold focus:outline-none"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>[{z.tier}] {z.name}</option>
                ))}
              </select>
            </div>

            {presets.length > 0 && (
              <PresetSelector
                presets={presets}
                activePresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
              />
            )}

            <div id="prediction-section">
              <PredictionResult
                result={currentResult}
                blockedIPs={blockedIPs}
                onBlockIP={handleBlockIP}
                onUnblockIP={handleUnblockIP}
              />
            </div>

            <TrafficForm
              formData={formData}
              featureGroups={featureGroups}
              categoricalOptions={categoricalOptions}
              onChange={handleFieldChange}
              onReset={handleReset}
              onSubmit={handleAnalyze}
              loading={loading}
            />

            <BlockedIPsTable
              blockedIPs={blockedIPs}
              onBlockIP={handleBlockIP}
              onUnblockIP={handleUnblockIP}
            />

            <HistoryTable
              history={history}
              onClear={() => setHistory([])}
              onLoadHistoryItem={(raw) => {
                setFormData(raw);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 5: IMMUTABLE AUDIT TRAIL (SQLITE)                  */}
        {/* ========================================================= */}
        {activeModule === 'audit_trail' && (
          <div className="space-y-6 animate-fadeIn">
            <AuditTrailView
              auditTrail={auditTrail}
              onRefresh={handleRefreshAudit}
              loading={auditLoading}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#162340] bg-[#060a12] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Defence Network Security Monitoring & Incident Response System &bull; Academic Prototype
          </div>
          <div className="text-slate-400">
            Trained on NSL-KDD Dataset &bull; SQLite Audit Trail &bull; React + Vite + Flask
          </div>
        </div>
      </footer>

      {/* Dataset Docs Reference Modal */}
      <DatasetInfoModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
