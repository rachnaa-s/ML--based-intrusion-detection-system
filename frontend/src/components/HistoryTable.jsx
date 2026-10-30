import React from 'react';
import { History, Trash2, Download, ArrowRight, ShieldCheck, ShieldAlert, RotateCcw, Crosshair, Terminal } from 'lucide-react';

export default function HistoryTable({ history = [], onClear, onLoadHistoryItem }) {
  const safeHistory = Array.isArray(history) ? history : [];

  const exportCSV = () => {
    if (safeHistory.length === 0) return;
    const headers = ['Timestamp', 'Prediction', 'Confidence', 'Protocol', 'Service', 'Flag', 'SrcBytes', 'DstBytes', 'Verdict'];
    const rows = safeHistory.map(item => [
      `"${item.timestamp}"`,
      `"${item.prediction}"`,
      `"${item.confidence_percent}%"`,
      `"${item.traffic_summary?.protocol || ''}"`,
      `"${item.traffic_summary?.service || ''}"`,
      `"${item.traffic_summary?.flag || ''}"`,
      `"${item.traffic_summary?.src_bytes || 0}"`,
      `"${item.traffic_summary?.dst_bytes || 0}"`,
      `"${(item.risk_assessment?.verdict || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `defence_ids_session_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] overflow-hidden shadow-2xl">
      {/* 1. Header */}
      <div className="p-5 border-b border-[#14233f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#040812]">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <span>Tactical Signal History Ledger</span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-[#091326] px-2.5 py-0.5 rounded border border-[#172b4f]">
                {safeHistory.length} Frames
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Chronological capture of all analyzed network transmissions during this tactical session
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {safeHistory.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c162d] hover:bg-[#132247] border border-[#1b315b] text-xs font-mono font-semibold text-cyan-300 hover:text-white transition-all shadow-sm"
              title="Export audit log to CSV for project report"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#200f18] hover:bg-[#341424] border border-rose-900/50 text-xs font-mono font-semibold text-rose-300 hover:text-rose-100 transition-colors"
              title="Purge session history"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge Ledger</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Table */}
      {safeHistory.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 font-mono">
          No signal frames recorded in this session. Dissect an incoming packet above to populate the ledger.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#03060f] border-b border-[#14233f] text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">VERDICT</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4">PROTO / SRV</th>
                <th className="py-3 px-4">FLAG</th>
                <th className="py-3 px-4">PAYLOAD (SRC &rarr; DST)</th>
                <th className="py-3 px-4">ASSESSMENT</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f1b30]">
              {safeHistory.map((item, index) => {
                const isIntrusion = item.prediction === 'Intrusion';
                return (
                  <tr
                    key={index}
                    className="hover:bg-[#081022]/70 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 font-bold">{safeHistory.length - index}</td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-[11px]">{item.timestamp}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isIntrusion
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                        }`}
                      >
                        {isIntrusion ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-100 font-bold whitespace-nowrap">
                      {item.confidence_percent}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      <span className="text-cyan-400 font-bold">{item.traffic_summary?.protocol}</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-slate-200">{item.traffic_summary?.service}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.traffic_summary?.flag === 'SF' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {item.traffic_summary?.flag || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300 text-[11px]">
                      {item.traffic_summary?.src_bytes ?? 0}B &rarr; {item.traffic_summary?.dst_bytes ?? 0}B
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={item.risk_assessment?.verdict}>
                      {item.risk_assessment?.verdict || 'Standard Audit'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {item.raw_input && (
                        <button
                          onClick={() => onLoadHistoryItem && onLoadHistoryItem(item.raw_input)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0b1428] hover:bg-[#132247] text-cyan-300 hover:text-white border border-[#182a4d] text-[11px] transition-colors"
                          title="Reload this packet's features into the analysis form"
                        >
                          <RotateCcw className="w-3 h-3 text-cyan-400" />
                          <span>Reload</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
