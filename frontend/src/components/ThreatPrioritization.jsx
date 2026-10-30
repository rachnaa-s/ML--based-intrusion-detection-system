import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, ShieldCheck, Shield, Clock, ArrowRight, Filter, Search, Crosshair, Radar, Terminal, Compass, Layers, Zap } from 'lucide-react';

export default function ThreatPrioritization({ alerts = [], onInvestigateAlert, selectedAlertId }) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const filteredAlerts = safeAlerts.filter(alert => {
    if (!alert) return false;
    if (priorityFilter !== 'ALL' && alert.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    if (zoneFilter !== 'ALL' && alert.zone_id !== zoneFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (
        (alert.id && alert.id.toLowerCase().includes(q)) ||
        (alert.attack_type && alert.attack_type.toLowerCase().includes(q)) ||
        (alert.priority_reason && alert.priority_reason.toLowerCase().includes(q)) ||
        (alert.source_ip && alert.source_ip.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  const getMitreTag = (attackType = '') => {
    const t = attackType.toLowerCase();
    if (t.includes('dos') || t.includes('neptune') || t.includes('smurf')) {
      return { id: 'T1499.002', name: 'Network DoS Flooding', tactic: 'Impact' };
    }
    if (t.includes('probe') || t.includes('portscan') || t.includes('scan')) {
      return { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery' };
    }
    if (t.includes('r2l') || t.includes('ftp') || t.includes('guess') || t.includes('brute')) {
      return { id: 'T1110.001', name: 'Password Guessing', tactic: 'Credential Access' };
    }
    if (t.includes('u2r') || t.includes('buffer') || t.includes('rootkit')) {
      return { id: 'T1068', name: 'Privilege Escalation', tactic: 'Privilege Escalation' };
    }
    return { id: 'T1071', name: 'Application Layer Protocol', tactic: 'Command and Control' };
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'P1_CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500 shadow-glow-red flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            P1 CRITICAL // DIRECT INTERVENTION
          </span>
        );
      case 'P2_HIGH':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            P2 HIGH // ACTIVE THREAT
          </span>
        );
      case 'P3_MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            P3 MEDIUM // SUSPICIOUS
          </span>
        );
      case 'P4_LOW':
      default:
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            P4 LOW // MONITORING
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-pulse">TRIAGE REQUIRED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50">ANALYST ENGAGED</span>;
      case 'CONTAINED_SIMULATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-400">CONTAINMENT ACTIVE</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">RESOLVED</span>;
      case 'FALSE_POSITIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-600">CLEARED (FP)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] overflow-hidden shadow-2xl">
      {/* 1. Header with Tactical Triage Matrix */}
      <div className="p-5 border-b border-[#14233f] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#040812]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-glow-red">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2.5">
              <span>Tactical Threat Prioritization & Triage Matrix</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#0b1528] border border-cyan-500/30 text-cyan-300 font-normal">
                {safeAlerts.length} Incidents Ingested
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Rule-based triage weighting machine learning certainty, sector tier criticality, and MITRE ATT&CK vector
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alert ID, MITRE, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0a1224] border border-[#1c2e50] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* 2. Tactical Severity & Status Filters */}
      <div className="px-5 py-3 border-b border-[#14233f] bg-[#03060f] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] uppercase mr-1">Triage Tier:</span>
          {['ALL', 'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                priorityFilter === p
                  ? 'bg-rose-950 text-rose-200 border border-rose-500 shadow-glow-red'
                  : 'bg-[#0a1224] text-slate-400 hover:text-white border border-[#162540]'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] uppercase mr-1">Status:</span>
          {['ALL', 'NEW', 'UNDER_REVIEW', 'CONTAINED_SIMULATED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                statusFilter === st
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400 shadow-glow-cyan'
                  : 'bg-[#0a1224] text-slate-400 hover:text-white border border-[#162540]'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tactical Incident Feed */}
      <div className="divide-y divide-[#101b30] max-h-[620px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">NO HOSTILE ALERTS IN SECTOR QUEUE</h4>
            <p className="max-w-md mx-auto text-slate-400">
              Submit traffic packets via the Packet Dissector tab to test attack simulations against the Decision Tree classifier.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isIntrusion = alert.prediction_code === 1;
            const isSelected = selectedAlertId === alert.id;
            const mitre = getMitreTag(alert.attack_type);

            return (
              <div
                key={alert.id}
                className={`p-5 transition-all text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-[#0c1830] border-l-4 border-l-cyan-400 shadow-glow-cyan'
                    : 'hover:bg-[#070e1c]'
                }`}
              >
                {/* Left: Priority, MITRE ATT&CK & Sector Info */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getPriorityBadge(alert.priority)}
                    <span className="text-cyan-400 font-bold tracking-wider">{alert.id}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {alert.timestamp}
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    {getStatusBadge(alert.status)}
                  </div>

                  <div className="text-sm font-bold text-white flex items-center gap-2.5 flex-wrap">
                    <span className={isIntrusion ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {alert.attack_type || alert.prediction}
                    </span>
                    <span className="text-slate-500 font-normal">in sector</span>
                    <span className="px-2 py-0.5 rounded bg-[#091224] border border-cyan-500/30 text-cyan-300 text-xs">
                      {(alert.zone_id || 'sector').replace('_', ' ').toUpperCase()}
                    </span>
                    {/* MITRE ATT&CK Pill */}
                    <span className="px-2 py-0.5 rounded bg-[#150a18] border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                      MITRE: {mitre.id} &bull; {mitre.name}
                    </span>
                  </div>

                  {/* Priority Rule Reason Box */}
                  <div className="p-3 rounded-lg bg-[#040711] border border-[#121e35] text-[11px] text-slate-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">PRIORITIZATION JUSTIFICATION:</span>
                      <span>{alert.priority_reason}</span>
                    </div>
                  </div>

                  {/* Telemetry Metrics Row */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                    <span>
                      Model Verdict: <strong className={isIntrusion ? 'text-rose-400' : 'text-emerald-400'}>{alert.prediction}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Confidence: <strong className="text-cyan-300">{alert.confidence}%</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Target Source IP: <strong className="text-slate-100 font-mono">{alert.source_ip || 'N/A'}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action: Launch Incident Response Workflow */}
                <div className="shrink-0 flex sm:flex-col items-end gap-2">
                  <button
                    onClick={() => onInvestigateAlert(alert)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-red transition-all"
                  >
                    <span>LAUNCH INCIDENT WORKFLOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
                    Record Forensic Decision & Deploy Drop
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
