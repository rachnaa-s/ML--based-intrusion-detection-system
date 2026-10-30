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
import { AlertCircle, RefreshCw, ShieldCheck, ShieldBan, Network, AlertTriangle, Database, Crosshair, Terminal } from 'lucide-react';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000' : '')
).replace(/\/$/, '');

const DEFAULT_ZONES = [
  {
    id: 'command_centre',
    name: 'Command Centre (HQ Core)',
    tier: 'Tier 1',
    criticality: 'Mission Critical',
    description: 'Primary military tactical command, control servers, and mission planning systems.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  },
  {
    id: 'surveillance',
    name: 'Surveillance & Reconnaissance',
    tier: 'Tier 2',
    criticality: 'Tactical High',
    description: 'Radar feeds, optical sensors, unmanned aerial reconnaissance (UAV), and perimeter monitoring networks.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  },
  {
    id: 'secure_comms',
    name: 'Secure Communications Network',
    tier: 'Tier 1',
    criticality: 'Confidential',
    description: 'Encrypted military tactical data links, encrypted SATCOM terminals, and secure field radio relays.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  },
  {
    id: 'military_base',
    name: 'Military Base Logistics & Admin',
    tier: 'Tier 3',
    criticality: 'Operational',
    description: 'Supply chain depots, facility access control, maintenance facilities, and administrative barracks network.',
    status: 'SECURE',
    traffic_count: 0,
    suspicious_count: 0,
    is_isolated: 0
  }
];

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

  // Defence Modules State with resilient default fallbacks
  const [zones, setZones] = useState(DEFAULT_ZONES);
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
      try {
        const healthRes = await fetch(`${API_BASE_URL}/health`);
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setBackendStatus(healthData);
        } else {
          setBackendStatus({ status: 'error', model_loaded: false });
        }
      } catch (e) {
        console.warn('Health check failed:', e);
      }

      // 2. Fetch Zones
      try {
        const zonesRes = await fetch(`${API_BASE_URL}/api/zones`);
        if (zonesRes.ok) {
          const zonesData = await zonesRes.json();
          if (zonesData.zones && zonesData.zones.length > 0) {
            setZones(zonesData.zones);
          }
        }
      } catch (e) {
        console.warn('Zones fetch failed:', e);
      }

      // 3. Fetch Alerts
      try {
        const alertsRes = await fetch(`${API_BASE_URL}/api/alerts`);
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          const loadedAlerts = alertsData.alerts || [];
          setAlerts(loadedAlerts);
          if (loadedAlerts.length > 0 && !selectedAlert) {
            setSelectedAlert(loadedAlerts[0]);
          }
        }
      } catch (e) {
        console.warn('Alerts fetch failed:', e);
      }

      // 4. Fetch Audit Trail
      try {
        const auditRes = await fetch(`${API_BASE_URL}/api/audit-trail`);
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditTrail(auditData.audit_trail || []);
        }
      } catch (e) {
        console.warn('Audit trail fetch failed:', e);
      }

      // 5. Fetch Schema
      try {
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
      } catch (e) {
        console.warn('Schema fetch failed:', e);
      }

      // 6. Fetch Presets
      try {
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
      } catch (e) {
        console.warn('Presets fetch failed:', e);
      }

      // 7. Fetch History & Blocked IPs from MongoDB
      try {
        const historyRes = await fetch(`${API_BASE_URL}/api/history?limit=50`);
        if (historyRes.ok) {
          const histData = await historyRes.json();
          if (histData.history && histData.history.length > 0) {
            setHistory(histData.history);
          }
        }
      } catch (e) {
        console.warn('Could not fetch remote history', e);
      }

      try {
        const blockedRes = await fetch(`${API_BASE_URL}/api/blocked-ips`);
        if (blockedRes.ok) {
          const bData = await blockedRes.json();
          if (bData.blocked_ips && bData.blocked_ips.length > 0) {
            setBlockedIPs(bData.blocked_ips);
          }
        }
      } catch (e) {
        console.warn('Could not fetch remote blocked IPs', e);
      }
    } catch (err) {
      console.error('Failed to communicate with MERN backend API:', err);
      setBackendStatus({ status: 'offline', model_loaded: false });
      setErrorMessage(`Could not connect to MERN backend at ${API_BASE_URL}. Ensure "npm start" is running in the backend directory.`);
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
      if (!res.ok) throw new Error(data.error || 'Failed to toggle isolation');

      setZones(prev => prev.map(z => z.id === zoneId ? data.zone : z));
      setNotification({
        type: 'info',
        message: data.message
      });
      handleRefreshAudit();
    } catch (err) {
      setNotification({ type: 'warning', message: err.message });
    }
  };

  // Investigate Alert -> Open Module 3
  const handleInvestigateAlert = (alert) => {
    setSelectedAlert(alert);
    setActiveModule('incident_response');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Alert Notes & Status (Module 3)
  const handleUpdateInvestigation = async (status, notes, decision) => {
    if (!selectedAlert) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/${selectedAlert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          analyst_notes: notes,
          analyst_decision: decision,
          actor: 'HUMAN_ANALYST'
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Update failed');

      setSelectedAlert(d.alert);
      setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? d.alert : a));
      setNotification({ type: 'success', message: `Alert ${selectedAlert.id} investigation saved to MongoDB.` });
      handleRefreshAudit();
    } catch (err) {
      setNotification({ type: 'warning', message: err.message });
    }
  };

  // Approve Response Action (Module 3)
  const handleApproveAction = async (actionType, approvedBy) => {
    if (!selectedAlert) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/${selectedAlert.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          confirmed: true,
          approved_by: approvedBy
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Action approval failed');

      setSelectedAlert(d.alert);
      setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? d.alert : a));

      // Also add to Blocked IPs if quarantine action
      if (actionType.includes('DROP') || actionType.includes('QUARANTINE')) {
        handleBlockIP(selectedAlert.source_ip, `Contained via Alert ${selectedAlert.id} [${actionType}]`);
      }

      setNotification({
        type: 'success',
        message: `Action recorded in MongoDB Audit Log: ${d.message}`
      });
      handleRefreshAudit();
    } catch (err) {
      setNotification({ type: 'warning', message: err.message });
    }
  };

  // IP Blocking / Unblocking Handlers (Human-in-the-Loop)
  const handleBlockIP = async (ip, reason = 'Intrusion detected by ML model') => {
    if (!ip) return;
    if (blockedIPs.some((b) => b.ip === ip)) {
      setNotification({ type: 'warning', message: `IP ${ip} is already registered in the perimeter drop table.` });
      return;
    }

    const newRule = {
      id: `FW-${Math.floor(1000 + Math.random() * 9000)}`,
      ip: ip,
      reason: reason,
      timestamp: new Date().toLocaleString()
    };

    setBlockedIPs((prev) => [newRule, ...prev]);

    try {
      await fetch(`${API_BASE_URL}/api/blocked-ips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason })
      });
    } catch (err) {
      console.warn('Could not persist blocked IP to MongoDB:', err);
    }

    setNotification({
      type: 'success',
      message: `Perimeter Drop Enforced: IP ${ip} blocked and recorded in MongoDB.`
    });
  };

  const handleUnblockIP = async (ip) => {
    setBlockedIPs((prev) => prev.filter((b) => b.ip !== ip));
    try {
      await fetch(`${API_BASE_URL}/api/blocked-ips/${ip}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not remove blocked IP from MongoDB:', err);
    }

    setNotification({
      type: 'info',
      message: `Perimeter Drop Lifted: IP ${ip} restored.`
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: formData,
          zone_id: targetZoneForTraffic,
          source_ip: formData.flag === 'S0' ? '198.51.100.22' : '192.168.1.105'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Server error occurred during prediction.');
      }

      const record = {
        ...data,
        raw_input: { ...formData }
      };

      setCurrentResult(record);
      setHistory((prev) => [record, ...prev]);

      // Refresh defence zones, alerts, and audit trail
      try {
        const [zRes, aRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/zones`),
          fetch(`${API_BASE_URL}/api/alerts`)
        ]);
        if (zRes.ok) {
          const zData = await zRes.json();
          if (zData.zones && zData.zones.length > 0) {
            setZones(zData.zones);
          }
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.alerts) {
            setAlerts(aData.alerts);
          }
        }
      } catch (e) {
        console.warn('Post-analysis refresh notice:', e);
      }

      handleRefreshAudit();

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

  const criticalAlertsCount = (alerts || []).filter(a => a?.priority === 'P1_CRITICAL' && a?.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-[#040810] text-slate-100 flex flex-col font-sans bg-tactical-grid relative">
      {/* Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
        onOpenDocs={() => setIsDocsOpen(true)}
        onRefreshStatus={fetchAllDefenceData}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        alertCount={criticalAlertsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Toast / Notification Banner for Firewall & Containment Events */}
        {notification && (
          <div className="hud-corner-card p-3.5 rounded-xl bg-[#061224] border border-cyan-500/60 text-cyan-200 flex items-center justify-between shadow-glow-cyan animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <ShieldBan className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
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
          <div className="hud-corner-card hud-corner-red p-4 rounded-xl bg-rose-950/50 border border-rose-500/60 text-rose-200 flex items-start justify-between gap-3 shadow-glow-red">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold font-mono text-rose-300 uppercase">SYSTEM DISCONNECT NOTICE</h4>
                <p className="text-xs text-rose-200/90 mt-1 font-sans">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={fetchAllDefenceData}
              className="px-3.5 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-xs font-mono font-bold text-rose-100 border border-rose-500/50 shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-engage Link</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 1: COMMAND CENTER & DEFENCE TOPOLOGY               */}
        {/* ========================================================= */}
        {activeModule === 'command_center' && (
          <div className="space-y-6 animate-fadeIn">
            <SummaryCards history={history} blockedIPsCount={(blockedIPs || []).length} />
            <DefenceTopology
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onToggleIsolation={handleToggleIsolation}
            />
            {/* Quick packet inspector preview */}
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
        {/* MODULE 4: TRAFFIC ANALYSIS & NSL-KDD 41-FEATURE INSPECTOR */}
        {/* ========================================================= */}
        {activeModule === 'traffic_inspector' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="hud-corner-card flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#060c18] border border-[#152542] text-xs font-mono gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="uppercase font-bold tracking-wider">Target Sector for Signal Telemetry:</span>
              </div>
              <select
                value={targetZoneForTraffic}
                onChange={(e) => setTargetZoneForTraffic(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#0a1224] border border-[#1d3159] text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 font-mono"
              >
                {(zones || []).map(z => (
                  <option key={z.id} value={z.id}>[{z.tier}] {z.name}</option>
                ))}
              </select>
            </div>

            {(presets || []).length > 0 && (
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
              onClear={async () => {
                setHistory([]);
                try {
                  localStorage.removeItem('ids_prediction_history');
                  await fetch(`${API_BASE_URL}/api/history`, { method: 'DELETE' });
                } catch (e) {
                  console.warn(e);
                }
              }}
              onLoadHistoryItem={(raw) => {
                setFormData(raw);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 5: IMMUTABLE AUDIT TRAIL (MONGODB)                 */}
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

      {/* Tactical Footer */}
      <footer className="border-t border-[#121f37] bg-[#02050c] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>AEGIS DEFENCE C4ISR &bull; TACTICAL CYBER INTRUSION DETECTION SYSTEM</span>
          </div>
          <div className="text-slate-400">
            Trained on NSL-KDD Benchmark &bull; MongoDB Atlas Cryptographic Ledger &bull; Pure Node.js ML Engine
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
