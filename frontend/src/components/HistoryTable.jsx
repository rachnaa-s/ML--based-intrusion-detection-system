import React from 'react';
import { History, Trash2, Download, ArrowRight, ShieldCheck, ShieldAlert, RotateCcw } from 'lucide-react';

export default function HistoryTable({ history, onClear, onLoadHistoryItem }) {
  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Prediction', 'Confidence', 'Protocol', 'Service', 'Flag', 'SrcBytes', 'DstBytes', 'Verdict'];
    const rows = history.map(item => [
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
    link.setAttribute('download', `ids_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl bg-[#0d162d] border border-[#1b2b4e] overflow-hidden shadow-xl">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-[#1b2b4e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a1226]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Traffic Prediction History Log
              <span className="text-xs font-mono font-normal text-slate-400 bg-[#162545] px-2 py-0.5 rounded border border-[#233863]">
                {history.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological audit log of all analyzed traffic packets in this session
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142142] hover:bg-[#1b2c59] border border-[#233766] text-xs font-medium text-slate-300 hover:text-white transition-colors"
              title="Export audit log to CSV for project report"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24131b] hover:bg-[#381a28] border border-rose-900/40 text-xs font-medium text-rose-300 hover:text-rose-100 transition-colors"
              title="Clear all session history records"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Log</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      {history.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 font-mono">
          No traffic predictions recorded yet. Submit a packet using the form above to populate the audit log.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a1122] border-b border-[#1b2b4e] text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Protocol / Srv</th>
                <th className="py-3 px-4">Flag</th>
                <th className="py-3 px-4">Payload (Src &rarr; Dst)</th>
                <th className="py-3 px-4">Verdict Summary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162342] font-mono">
              {history.map((item, index) => {
                const isIntrusion = item.prediction === 'Intrusion';
                return (
                  <tr
                    key={index}
                    className="hover:bg-[#111c38]/60 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500">{history.length - index}</td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{item.timestamp}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          isIntrusion
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isIntrusion ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold whitespace-nowrap">
                      {item.confidence_percent}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      <span className="text-cyan-400">{item.traffic_summary?.protocol}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-200">{item.traffic_summary?.service}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.traffic_summary?.flag === 'SF' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.traffic_summary?.flag || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {item.traffic_summary?.src_bytes ?? 0}B &rarr; {item.traffic_summary?.dst_bytes ?? 0}B
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={item.risk_assessment?.verdict}>
                      {item.risk_assessment?.verdict || 'Standard Audit'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {item.raw_input && (
                        <button
                          onClick={() => onLoadHistoryItem(item.raw_input)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#162547] hover:bg-[#203463] text-slate-300 hover:text-white border border-[#233866] text-[11px] transition-colors"
                          title="Reload this packet's features into the analysis form"
                        >
                          <RotateCcw className="w-3 h-3 text-cyan-400" />
                          <span>Load</span>
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
