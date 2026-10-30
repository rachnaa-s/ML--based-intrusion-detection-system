import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Shield, Clock, User, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export default function AuditTrailView({ auditTrail = [], onRefresh, loading }) {
  const [filterType, setFilterType] = useState('ALL');

  const filteredTrail = auditTrail.filter(item => {
    if (filterType !== 'ALL' && item.event_type !== filterType) return false;
    return true;
  });

  const getEventBadge = (type) => {
    switch (type) {
      case 'SIMULATED_CONTAINMENT_APPROVED':
      case 'SIMULATED_ZONE_ISOLATION_ACTIVATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-400">CONTAINMENT</span>;
      case 'ALERT_GENERATED':
      case 'THREAT_PRIORITIZED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950 text-rose-300 border border-rose-500">THREAT ALERT</span>;
      case 'ANALYST_INVESTIGATION_UPDATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-300 border border-amber-500">ANALYST DECISION</span>;
      case 'MODEL_PREDICTION_EXECUTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">ML INFERENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-900 text-slate-300 border border-slate-700">{type}</span>;
    }
  };

  const exportCSV = () => {
    if (auditTrail.length === 0) return;
    const headers = ['Event ID', 'Timestamp', 'Event Type', 'Actor', 'Zone', 'Alert ID', 'Details'];
    const rows = auditTrail.map(item => [
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
    link.setAttribute('download', `defence_ids_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-[#1b2b4e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a1122]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Immutable Defence Audit Trail (SQLite)
              <span className="text-xs px-2 py-0.5 rounded bg-[#162545] border border-[#233863] text-slate-300 font-normal">
                {auditTrail.length} Logged Events
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically timestamped chronological records of predictions, alert priorities, decisions, and simulated actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142142] hover:bg-[#1b2c59] border border-[#233766] text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit DB</span>
          </button>
          {auditTrail.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101b38] hover:bg-[#17254d] border border-[#213563] text-xs font-mono font-medium text-cyan-300 hover:text-white transition-colors"
              title="Download audit trail spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-5 py-3 border-b border-[#1b2b4e] bg-[#090f20] flex items-center gap-2 text-xs font-mono overflow-x-auto">
        <span className="text-slate-400 text-[11px] mr-1">Event Category:</span>
        {['ALL', 'MODEL_PREDICTION_EXECUTED', 'ALERT_GENERATED', 'ANALYST_INVESTIGATION_UPDATED', 'SIMULATED_CONTAINMENT_APPROVED', 'SIMULATED_ZONE_ISOLATION_ACTIVATED'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${
              filterType === t
                ? 'bg-emerald-900 text-emerald-200 border border-emerald-500'
                : 'bg-[#111c38] text-slate-400 hover:text-white border border-[#1e2f56]'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredTrail.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 font-mono">
          No audit records found matching criteria. Events are automatically recorded when actions take place.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090f1f] text-slate-400 border-b border-[#1b2b4e] uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Actor / Origin</th>
                <th className="py-3 px-4">Sector / Alert Ref</th>
                <th className="py-3 px-4">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162342]">
              {filteredTrail.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#111c38]/60 transition-colors">
                  <td className="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">{ev.id}</td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{ev.timestamp}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{getEventBadge(ev.event_type)}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-200 font-semibold">
                    <span className="flex items-center gap-1.5">
                      {ev.actor.includes('HUMAN') || ev.actor.includes('SOC') || ev.actor.includes('OFFICER') ? (
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {ev.actor}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                    {ev.zone_id ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#101a35] text-cyan-300 border border-[#1e2f56] text-[10px]">
                        {ev.zone_id}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                    {ev.alert_id && (
                      <span className="ml-1 text-[10px] text-slate-400">[{ev.alert_id}]</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate" title={ev.details}>
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
