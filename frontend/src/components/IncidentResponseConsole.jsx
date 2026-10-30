import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText, Lock, ShieldCheck, ChevronDown, ChevronUp, Send, CheckSquare, Clock, Cpu, User } from 'lucide-react';

export default function IncidentResponseConsole({ alert, onUpdateInvestigation, onApproveAction }) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [decision, setDecision] = useState('UNDER_INVESTIGATION');
  const [operatorCallsign, setOperatorCallsign] = useState('SOC_ANALYST_COLE');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Approval Modal State
  const [pendingAction, setPendingAction] = useState(null);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);
  const [approvalCallsign, setApprovalCallsign] = useState('SOC_SUPERVISOR_1');

  useEffect(() => {
    if (alert) {
      setNotes(alert.analyst_notes || '');
      setStatus(alert.status || 'UNDER_REVIEW');
      setDecision(alert.analyst_decision || 'UNDER_INVESTIGATION');
      setSaveSuccess(false);
    }
  }, [alert]);

  if (!alert) {
    return (
      <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] p-12 text-center text-xs font-mono text-slate-400">
        <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No Incident Alert Selected</h3>
        <p className="max-w-md mx-auto text-slate-400">
          Select an alert from the Threat Prioritization tab or analyze incoming traffic packets to initiate an incident response workflow.
        </p>
      </div>
    );
  }

  const rawFeatures = alert.raw_features || {};
  const isIntrusion = alert.prediction_code === 1;

  // Automated Response Recommendations
  const recommendations = [
    {
      id: 'REC-01',
      title: `Deploy Simulated Firewall Ingress Drop for ${alert.source_ip || 'Source IP'}`,
      action_type: 'SIMULATED_IP_DROP',
      description: 'Isolate source host in simulated perimeter firewall to sever half-open DoS/probe connection states.',
      urgency: alert.priority === 'P1_CRITICAL' ? 'Immediate (P1)' : 'High'
    },
    {
      id: 'REC-02',
      title: `Simulated Isolation of Target Sector [${alert.zone_id}]`,
      action_type: 'SIMULATED_ZONE_ISOLATE',
      description: 'Simulate compartmentalization of this network sector to prevent lateral movement of exploitation payloads.',
      urgency: alert.priority === 'P1_CRITICAL' ? 'Critical' : 'Elevated'
    },
    {
      id: 'REC-03',
      title: 'Engage SIEM Forensic Traffic Capture',
      action_type: 'SIMULATED_FORENSIC_CAPTURE',
      description: 'Preserve raw connection metrics and timestamped packet signatures in immutable audit trail for post-incident review.',
      urgency: 'Standard'
    }
  ];

  const handleSaveNotes = (e) => {
    e.preventDefault();
    onUpdateInvestigation(alert.id, status, notes, decision, operatorCallsign);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleConfirmAction = () => {
    if (pendingAction && approvalConfirmed) {
      onApproveAction(alert.id, pendingAction.action_type, approvalCallsign);
      setPendingAction(null);
      setApprovalConfirmed(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Incident Overview */}
      <div className="p-5 rounded-xl bg-[#0c1326] border border-[#1b2b4e] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-cyan-400 font-bold">{alert.id}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {alert.timestamp}
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500 text-[10px] font-bold">
                {alert.priority}
              </span>
            </div>
            <h2 className="text-base font-bold text-white font-mono mt-0.5">
              Incident Response Console // {alert.attack_type || alert.prediction}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block">AFFECTED SECTOR</span>
            <span className="text-cyan-300 font-bold uppercase">{alert.zone_id.replace('_', ' ')}</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block">ML CONFIDENCE</span>
            <span className="text-emerald-400 font-bold">{alert.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Telemetry & Recommendations (Left) vs Analyst Decision Center (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Telemetry & Response Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Reason & Attack Summary */}
          <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Automated Telemetry Assessment
            </h3>
            <div className="p-3.5 rounded-lg bg-[#080d1a] border border-[#182747] text-xs font-mono text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">RULE EVALUATION RATIONALE:</span>
              {alert.priority_reason}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-center">
              <div className="p-2.5 rounded-lg bg-[#080d1a] border border-[#182747]">
                <span className="text-slate-500 text-[10px] block">SOURCE IP</span>
                <span className="text-slate-200 font-bold">{alert.source_ip || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080d1a] border border-[#182747]">
                <span className="text-slate-500 text-[10px] block">PROTOCOL</span>
                <span className="text-cyan-300 font-bold">{rawFeatures.protocol_type || 'TCP'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080d1a] border border-[#182747]">
                <span className="text-slate-500 text-[10px] block">SERVICE</span>
                <span className="text-cyan-300 font-bold">{rawFeatures.service || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080d1a] border border-[#182747]">
                <span className="text-slate-500 text-[10px] block">TCP FLAG</span>
                <span className="text-rose-400 font-bold">{rawFeatures.flag || 'SF'}</span>
              </div>
            </div>
          </div>

          {/* Response Recommendations */}
          <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] p-5 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Response Recommendations (Human Review Required)
              </h3>
              <span className="text-[10px] font-mono text-amber-400">Explicit Approval Needed</span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-lg bg-[#090f20] border border-[#1a2c4e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#13203c] text-cyan-300 text-[10px] font-bold border border-[#23355e]">
                        {rec.id}
                      </span>
                      <h4 className="font-bold text-white">{rec.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setPendingAction(rec)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[11px] font-mono shadow-sm transition-all"
                  >
                    Review & Approve
                  </button>
                </div>
              ))}
            </div>

            {alert.approved_action && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Simulated containment action <strong>[{alert.approved_action}]</strong> was approved by {alert.approved_by || 'Operator'} at {alert.approved_at}.
                </span>
              </div>
            )}
          </div>

          {/* Full 41-Feature Telemetry Inspector (Collapsible Accordion) */}
          <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] overflow-hidden">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="w-full p-4 bg-[#0a1122] flex items-center justify-between text-xs font-mono font-bold text-slate-200 hover:bg-[#101933] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Raw NSL-KDD Feature Telemetry (41 Network Parameters)
              </span>
              {showAllFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAllFeatures && (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[10px] font-mono max-h-72 overflow-y-auto">
                {Object.entries(rawFeatures).map(([k, v]) => (
                  <div key={k} className="p-2 rounded bg-[#080d1a] border border-[#15223e]">
                    <span className="text-slate-500 block truncate">{k}</span>
                    <span className="text-slate-200 font-bold truncate block">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Analyst Investigation & Decision Center */}
        <div className="lg:col-span-5">
          <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b4e]">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Analyst Incident Log & Decision
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Human-in-the-Loop</span>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs font-mono">
              {/* Review Status */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">INCIDENT REVIEW STATUS:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e172e] border border-[#213561] text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="NEW">NEW (Unreviewed)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Investigation in Progress)</option>
                  <option value="CONTAINED_SIMULATED">CONTAINED_SIMULATED (Simulated Isolation Active)</option>
                  <option value="RESOLVED">RESOLVED (Mitigation Applied / Incident Closed)</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE (Legitimate Traffic Baseline)</option>
                </select>
              </div>

              {/* Analyst Decision */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">FORMAL ANALYST DECISION:</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e172e] border border-[#213561] text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="CONFIRMED_INTRUSION">CONFIRMED INTRUSION (Threat Validated)</option>
                  <option value="POLICY_VIOLATION">POLICY VIOLATION (Non-Compliant Traffic)</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE (Disregard Alert)</option>
                  <option value="SUSPICIOUS_UNDER_MONITORING">SUSPICIOUS (Keep Under Monitoring)</option>
                </select>
              </div>

              {/* Investigation Journal */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">INVESTIGATION NOTES & JOURNAL:</label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record investigative findings, attack verification notes, affected assets, and mitigation justification..."
                  className="w-full p-3 rounded-lg bg-[#0e172e] border border-[#213561] text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>

              {/* Operator Callsign */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">ANALYST CALLSIGN / ID:</label>
                <input
                  type="text"
                  value={operatorCallsign}
                  onChange={(e) => setOperatorCallsign(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0e172e] border border-[#213561] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Investigation updated and recorded in audit trail.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold text-xs font-mono shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Save Investigation & Record Decision</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Explicit Human Approval Modal for Simulated Containment Action */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1429] border border-cyan-500/50 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Human Approval: Simulated Containment
                </h3>
                <span className="text-[10px] font-mono text-cyan-300">Mandatory Human-in-the-Loop Sign-off</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              You are approving the simulated containment action: <strong className="text-white font-mono">{pendingAction.title}</strong> for Alert <strong>{alert.id}</strong>.
            </p>

            <div className="p-3.5 rounded-lg bg-[#080d1a] border border-[#1b2b4e] text-[11px] font-mono text-slate-400 mb-4 space-y-1.5">
              <div>&bull; Action Type: <span className="text-cyan-300 font-bold">{pendingAction.action_type}</span></div>
              <div>&bull; Sector: <span className="text-amber-300 font-bold">{alert.zone_id}</span></div>
              <div>&bull; Physical Network Impact: <span className="text-emerald-400 font-bold">NONE (Strictly Simulated)</span></div>
              <div>&bull; Regulatory / Audit: <span className="text-slate-300">Permanent record written to SQLite audit trail</span></div>
            </div>

            {/* Explicit Confirmation Checkbox (Requirement 3) */}
            <div className="p-3 rounded-lg bg-[#111c38] border border-[#20335e] mb-4">
              <label className="flex items-start gap-2.5 text-xs font-mono text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approvalConfirmed}
                  onChange={(e) => setApprovalConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>
                  I confirm this is a <strong>SIMULATED</strong> containment action recorded for academic incident response evaluation. No physical commands will be executed.
                </span>
              </label>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Authorizing Officer ID:</label>
              <input
                type="text"
                value={approvalCallsign}
                onChange={(e) => setApprovalCallsign(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#111c38] border border-[#20335e] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2b4e]">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 rounded-lg bg-[#142142] hover:bg-[#1b2b54] text-xs font-mono text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!approvalConfirmed}
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-lg font-bold font-mono text-xs shadow-lg transition-all ${
                  approvalConfirmed
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Confirm Simulated Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
