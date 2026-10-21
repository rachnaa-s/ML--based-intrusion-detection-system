import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Info, ArrowUpRight, Cpu, Clock, Terminal, ShieldBan, ShieldOff } from 'lucide-react';

export default function PredictionResult({ result, blockedIPs = [], onBlockIP, onUnblockIP }) {
  if (!result) {
    return (
      <div className="rounded-xl bg-[#0d162d] border border-[#1b2b4e] p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl bg-[#121f3d] border border-[#223561] flex items-center justify-center text-slate-500 mb-4">
          <Terminal className="w-8 h-8 text-emerald-400/50" />
        </div>
        <h3 className="text-base font-semibold text-white">Awaiting Traffic Packet Submission</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Select a benchmark preset above or enter custom features, then click <span className="text-emerald-400 font-medium">"Analyze Traffic Packet"</span> to view the model classification.
        </p>
      </div>
    );
  }

  const isIntrusion = result.is_intrusion || result.prediction === 'Intrusion';
  const confidence = result.confidence_percent || 100.0;
  const probs = result.probabilities || { normal: isIntrusion ? 0 : 100, intrusion: isIntrusion ? 100 : 0 };
  const risk = result.risk_assessment || {};
  const summary = result.traffic_summary || {};

  // Derive realistic IP for this packet (or use provided IP)
  const packetIP = result.source_ip || (
    isIntrusion
      ? (summary.service === 'private' ? '192.168.1.105' : (summary.protocol === 'icmp' ? '172.16.4.88' : '10.0.0.64'))
      : '192.168.1.42'
  );

  const isBlocked = blockedIPs.some(b => b.ip === packetIP);

  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden shadow-2xl ${
        isIntrusion
          ? 'bg-[#150d18] border-rose-500/50 glow-box-red'
          : 'bg-[#0b171c] border-emerald-500/50 glow-box-green'
      }`}
    >
      {/* Top Banner */}
      <div
        className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          isIntrusion
            ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
            : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isIntrusion
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-glow-red'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-glow-green'
            }`}
          >
            {isIntrusion ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              ML Inference Verdict
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {isIntrusion ? 'INTRUSION DETECTED' : 'NORMAL TRAFFIC'}
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                  isIntrusion
                    ? 'bg-rose-900/80 text-rose-200 border border-rose-500/50'
                    : 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
                }`}
              >
                Class {result.prediction_code ?? (isIntrusion ? 1 : 0)}
              </span>
            </h2>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{result.timestamp || new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        {/* Confidence & Probability Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Confidence Score */}
          <div className="rounded-lg bg-[#0a1122] border border-[#1b2b4e] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>Model Confidence</span>
              <span className={`font-bold text-sm ${isIntrusion ? 'text-rose-400' : 'text-emerald-400'}`}>
                {confidence}%
              </span>
            </div>
            {/* Bar */}
            <div className="w-full bg-[#14203d] rounded-full h-3 overflow-hidden p-0.5 border border-[#21345e]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isIntrusion ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                }`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>DecisionTree Certainty</span>
              <span>Class: {result.prediction}</span>
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="rounded-lg bg-[#0a1122] border border-[#1b2b4e] p-4 space-y-2">
            <span className="text-xs text-slate-400 font-mono block">Probability Distribution:</span>
            {/* Normal Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400">Normal (0)</span>
                <span className="text-slate-300">{probs.normal}%</span>
              </div>
              <div className="w-full bg-[#14203d] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${probs.normal}%` }}
                ></div>
              </div>
            </div>

            {/* Intrusion Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-rose-400">Intrusion (1)</span>
                <span className="text-slate-300">{probs.intrusion}%</span>
              </div>
              <div className="w-full bg-[#14203d] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${probs.intrusion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* HUMAN-IN-THE-LOOP IP BLOCK INTERVENTION BANNER */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isBlocked
            ? 'bg-rose-950/60 border-rose-500/60 shadow-glow-red'
            : isIntrusion
            ? 'bg-rose-950/30 border-rose-500/40'
            : 'bg-[#0f1b33] border-[#20345f]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isBlocked
                ? 'bg-rose-600 text-white shadow-glow-red'
                : isIntrusion
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            }`}>
              <ShieldBan className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Source IP Address Evaluation
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold font-mono text-white tracking-wide">{packetIP}</span>
                {isBlocked ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-600 text-white border border-rose-400 animate-pulse">
                    CURRENTLY BLOCKED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-[#162545] border border-[#233866]">
                    Active Host
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button for Human Operator */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isBlocked ? (
              <button
                type="button"
                onClick={() => onUnblockIP(packetIP)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#27151e] hover:bg-[#3d1a2c] text-rose-300 hover:text-white border border-rose-900/60 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldOff className="w-4 h-4 text-rose-400" />
                <span>Unblock IP Address</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onBlockIP(packetIP, risk.verdict || 'Intrusion detected by ML model')}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isIntrusion
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-red hover:shadow-rose-500/50'
                    : 'bg-[#182a52] hover:bg-rose-900 text-slate-200 hover:text-white border border-[#2b4175]'
                }`}
              >
                <ShieldBan className="w-4 h-4" />
                <span>{isIntrusion ? 'Block IP Address (Human Action)' : 'Add IP to Blocklist'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Risk Verdict & SOC Explanation */}
        <div className="rounded-xl bg-[#0a1122] border border-[#1b2b4e] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className={`w-4 h-4 ${isIntrusion ? 'text-rose-400' : 'text-emerald-400'}`} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              Threat Evaluation & Academic Analysis
            </h4>
          </div>

          <div className="text-sm font-semibold text-white">
            {risk.verdict || (isIntrusion ? 'Intrusion Traffic' : 'Normal Traffic')}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#101b35] p-3 rounded-lg border border-[#1e2f56]">
            {risk.explanation || 'Analyzed connection parameters matched baseline distributions trained on the NSL-KDD benchmark.'}
          </p>

          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="font-semibold text-slate-300">Recommended Action:</span>
              <span className={isIntrusion ? 'text-rose-300' : 'text-emerald-300'}>
                {risk.recommended_action || (isIntrusion ? 'Block IP and review logs.' : 'Allow traffic.')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Pipeline: ColumnTransformer + DecisionTree</span>
            </div>
          </div>
        </div>

        {/* Packet Signature Feature Highlights */}
        <div>
          <span className="text-xs font-mono text-slate-400 block mb-2">Key Network Packet Parameters Analyzed:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <SummaryChip label="Protocol" value={summary.protocol || 'N/A'} highlight="cyan" />
            <SummaryChip label="Service" value={summary.service || 'N/A'} highlight="cyan" />
            <SummaryChip label="Status Flag" value={summary.flag || 'N/A'} highlight={summary.flag === 'SF' ? 'green' : 'red'} />
            <SummaryChip label="Src Bytes" value={summary.src_bytes ?? '0'} />
            <SummaryChip label="Dst Bytes" value={summary.dst_bytes ?? '0'} />
            <SummaryChip label="Count (2s)" value={summary.connection_count ?? '0'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, highlight }) {
  let colorClass = 'text-slate-200 border-[#1c2e55]';
  if (highlight === 'green') colorClass = 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30';
  if (highlight === 'red') colorClass = 'text-rose-300 border-rose-500/40 bg-rose-950/30';
  if (highlight === 'cyan') colorClass = 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30';

  return (
    <div className={`p-2.5 rounded-lg bg-[#0c1429] border ${colorClass} flex flex-col font-mono text-center`}>
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-xs font-semibold mt-0.5 truncate">{value}</span>
    </div>
  );
}
