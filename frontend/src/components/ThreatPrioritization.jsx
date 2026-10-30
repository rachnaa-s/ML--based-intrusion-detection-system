import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, ShieldCheck, Shield, Clock, ArrowRight, Filter, Search } from 'lucide-react';

export default function ThreatPrioritization({ alerts, onInvestigateAlert, selectedAlertId }) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    if (priorityFilter !== 'ALL' && alert.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    if (zoneFilter !== 'ALL' && alert.zone_id !== zoneFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (
        alert.id.toLowerCase().includes(q) ||
        alert.attack_type.toLowerCase().includes(q) ||
        alert.priority_reason.toLowerCase().includes(q) ||
        (alert.source_ip && alert.source_ip.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'P1_CRITICAL':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500 shadow-glow-red">P1 CRITICAL</span>;
      case 'P2_HIGH':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-500">P2 HIGH</span>;
      case 'P3_MEDIUM':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500">P3 MEDIUM</span>;
      case 'P4_LOW':
      default:
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">P4 LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse">NEW ALERT</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">UNDER REVIEW</span>;
      case 'CONTAINED_SIMULATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-400">CONTAINED (SIM)</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">RESOLVED</span>;
      case 'FALSE_POSITIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-600">FALSE POSITIVE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-[#1b2b4e] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1122]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Threat Prioritization Console
              <span className="text-xs px-2 py-0.5 rounded bg-[#162545] border border-[#233863] text-slate-300 font-normal">
                {alerts.length} Total Incidents
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Alerts prioritized by model prediction confidence, sector criticality, and attack severity
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alert, attack, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#111c38] border border-[#20335e] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-3 border-b border-[#1b2b4e] bg-[#090f20] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1">Severity:</span>
          {['ALL', 'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                priorityFilter === p
                  ? 'bg-rose-900 text-rose-200 border border-rose-500'
                  : 'bg-[#111c38] text-slate-400 hover:text-white border border-[#1e2f56]'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1">Status:</span>
          {['ALL', 'NEW', 'UNDER_REVIEW', 'CONTAINED_SIMULATED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-900 text-cyan-200 border border-cyan-400'
                  : 'bg-[#111c38] text-slate-400 hover:text-white border border-[#1e2f56]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards Feed */}
      <div className="divide-y divide-[#172545] max-h-[580px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 font-mono">
            No incident alerts match your filter criteria. Analyze incoming traffic packets to generate alerts.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isIntrusion = alert.prediction_code === 1;
            const isSelected = selectedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                className={`p-5 transition-all text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected ? 'bg-[#141f3d] border-l-4 border-l-rose-500' : 'hover:bg-[#0e172e]'
                }`}
              >
                {/* Left: Priority & Core Identifiers */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getPriorityBadge(alert.priority)}
                    <span className="text-cyan-400 font-bold">{alert.id}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.timestamp}
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    {getStatusBadge(alert.status)}
                  </div>

                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className={isIntrusion ? 'text-rose-400' : 'text-emerald-400'}>
                      {alert.attack_type || alert.prediction}
                    </span>
                    <span className="text-slate-500 font-normal">in</span>
                    <span className="px-2 py-0.5 rounded bg-[#101b38] border border-[#20335e] text-cyan-300 text-xs">
                      {alert.zone_id.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Priority Rule Justification (Documented Rule Requirement) */}
                  <div className="p-2.5 rounded-lg bg-[#080d1a] border border-[#182747] text-[11px] text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{alert.priority_reason}</span>
                  </div>

                  {/* Distinction: Prediction vs Severity vs Confidence */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>
                      Model Prediction: <strong className={isIntrusion ? 'text-rose-400' : 'text-emerald-400'}>{alert.prediction}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Certainty: <strong className="text-cyan-300">{alert.confidence}%</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Source IP: <strong className="text-slate-200">{alert.source_ip || 'N/A'}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action: Open in Incident Response Console */}
                <div className="shrink-0 flex sm:flex-col items-end gap-2">
                  <button
                    onClick={() => onInvestigateAlert(alert)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950 transition-all"
                  >
                    <span>Investigate Incident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-500 hidden sm:block">
                    Review telemetry & record decision
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
