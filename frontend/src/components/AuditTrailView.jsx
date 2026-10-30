import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Shield, Clock, User, CheckCircle2, AlertTriangle, Cpu, Hash, Lock } from 'lucide-react';

export default function AuditTrailView({ auditTrail = [], onRefresh, loading }) {
  const [filterType, setFilterType] = useState('ALL');

  const safeTrail = Array.isArray(auditTrail) ? auditTrail : [];

  const filteredTrail = safeTrail.filter(item => {
    if (!item) return false;
    if (filterType !== 'ALL' && item.event_type !== filterType) return false;
    return true;
  });

  const getEventBadge = (type) => {
    switch (type) {
      case 'SIMULATED_CONTAINMENT_APPROVED':
      case 'SIMULATED_ZONE_ISOLATION_ACTIVATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-glow-cyan">CONTAINMENT DIRECTIVE</span>;
      case 'ALERT_GENERATED':
      case 'THREAT_PRIORITIZED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950 text-rose-300 border border-rose-500 shadow-glow-red">THREAT INTERCEPT</span>;
      case 'ANALYST_INVESTIGATION_UPDATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-300 border border-amber-500">ANALYST DECISION</span>;
      case 'MODEL_PREDICTION_EXECUTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50">ML INFERENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-900 text-slate-300 border border-slate-700">{type}</span>;
    }
  };

  const exportCSV = () => {
    if (safeTrail.length === 0) return;
    const headers = ['Event ID', 'Timestamp (UTC)', 'Event Category', 'Authorizing Actor', 'Zone ID', 'Alert Reference', 'Forensic Details'];
    const rows = safeTrail.map(item => [
      `"${item.id}"`,
      `"${item.timestamp}"`,
      `"${item.event_type}"`,
      `"${item.actor}"`,
      `"${item.zone_id || ''}"`,
      `"${item.alert_id || ''}"`,
      `"${(item.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `defence_ids_immutable_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] overflow-hidden shadow-2xl">
      {/* 1. Header */}
      <div className="p-5 border-b border-[#14233f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#040812]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>Immutable Defence Audit Ledger (MongoDB Atlas)</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#091326] border border-cyan-500/30 text-cyan-300 font-normal">
                {safeTrail.length} Sealed Records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Cryptographically timestamped chronological records of machine learning predictions, alert priorities, analyst decisions, and containment commands
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c162d] hover:bg-[#132247] border border-[#1b315b] text-xs font-mono font-bold text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
          {safeTrail.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09152b] hover:bg-[#10234a] border border-[#1a356b] text-xs font-mono font-bold text-cyan-300 hover:text-white transition-all shadow-sm"
              title="Download official forensic audit spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Ledger (.csv)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Row */}
      <div className="px-5 py-3 border-b border-[#14233f] bg-[#03060f] flex items-center gap-2 text-xs font-mono overflow-x-auto">
        <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">EVENT CATEGORY:</span>
        {['ALL', 'MODEL_PREDICTION_EXECUTED', 'ALERT_GENERATED', 'ANALYST_INVESTIGATION_UPDATED', 'SIMULATED_CONTAINMENT_APPROVED', 'SIMULATED_ZONE_ISOLATION_ACTIVATED'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-all ${
              filterType === t
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-400 shadow-glow-cyan'
                : 'bg-[#0a1224] text-slate-400 hover:text-white border border-[#162540]'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* 3. Table */}
      {filteredTrail.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">
          No audit records matching filter criteria. Operational events are sealed into MongoDB automatically.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#03060f] text-slate-400 border-b border-[#14233f] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">EVENT HASH ID</th>
                <th className="py-3 px-4">TIMESTAMP (ZULU)</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">ACTOR / CREDENTIAL</th>
                <th className="py-3 px-4">SECTOR / REF</th>
                <th className="py-3 px-4">ACTION TELEMETRY DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f1b30]">
              {filteredTrail.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#081022]/70 transition-colors">
                  <td className="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap tracking-wide">{ev.id}</td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-[11px]">{ev.timestamp}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{getEventBadge(ev.event_type)}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      {ev.actor && (ev.actor.includes('HUMAN') || ev.actor.includes('SOC') || ev.actor.includes('OFFICER')) ? (
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      {ev.actor}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                    {ev.zone_id ? (
                      <span className="px-2 py-0.5 rounded bg-[#091326] text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        {ev.zone_id}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                    {ev.alert_id && (
                      <span className="ml-1 text-[10px] text-slate-400 font-mono">[{ev.alert_id}]</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate font-sans text-xs" title={ev.details}>
                    {ev.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
