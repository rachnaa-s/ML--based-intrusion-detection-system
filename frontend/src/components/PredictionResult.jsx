import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Info, ArrowUpRight, Cpu, Clock, Terminal, ShieldBan, ShieldOff, Crosshair, Radar, Activity } from 'lucide-react';

export default function PredictionResult({ result, blockedIPs = [], onBlockIP, onUnblockIP }) {
  if (!result) {
    return (
      <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] p-10 text-center flex flex-col items-center justify-center min-h-[320px] shadow-2xl relative overflow-hidden">
        {/* Animated Radar Scanning Scope Effect in Awaiting State */}
        <div className="relative w-28 h-28 rounded-full border-2 border-cyan-500/30 flex items-center justify-center mb-5 overflow-hidden bg-[#040812]">
          <div className="absolute inset-0 radar-sweep-beam rounded-full"></div>
          <div className="w-16 h-16 rounded-full border border-cyan-500/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border border-cyan-500/40"></div>
          </div>
          <Crosshair className="w-6 h-6 text-cyan-400/70 z-10 animate-pulse" />
        </div>
        <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
          AWAITING SIGNAL TELEMETRY DISSECTION
        </h3>
        <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed font-sans">
          Arm a scenario from the benchmark presets above or adjust the 41 connection attributes below, then click <strong className="text-cyan-400 font-mono font-bold">"EXECUTE SIGNAL DISSECTION"</strong> to run inference on the Node.js ML model.
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
      className={`hud-corner-card rounded-xl border transition-all overflow-hidden shadow-2xl ${
        isIntrusion
          ? 'bg-[#0e0712] border-rose-500/60 glow-box-red'
          : 'bg-[#060e15] border-emerald-500/60 glow-box-green'
      }`}
    >
      {/* 1. Tactical Verdict Header */}
      <div
        className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          isIntrusion
            ? 'bg-rose-950/60 border-rose-900/60 text-rose-300'
            : 'bg-emerald-950/60 border-emerald-900/60 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isIntrusion
                ? 'bg-rose-950/80 border border-rose-500/60 text-rose-400 shadow-glow-red animate-pulse'
                : 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 shadow-glow-green'
            }`}
          >
            {isIntrusion ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <span>ML CLASSIFIER INFERENCE // TACTICAL VERDICT</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isIntrusion ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`}></span>
            </div>
            <h2 className="text-xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5 mt-0.5">
              {isIntrusion ? 'HOSTILE INTRUSION DETECTED' : 'VERIFIED BENIGN (NORMAL)'}
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase ${
                  isIntrusion
                    ? 'bg-rose-900 text-rose-200 border border-rose-500'
                    : 'bg-emerald-900 text-emerald-200 border border-emerald-500'
                }`}
              >
                CLASS {result.prediction_code ?? (isIntrusion ? 1 : 0)}
              </span>
            </h2>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">{result.timestamp || new Date().toISOString().slice(11, 19) + 'Z'}</span>
        </div>
      </div>

      {/* 2. Main Analytics Body */}
      <div className="p-6 space-y-6">
        {/* Confidence & Probability Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Confidence Score */}
          <div className="hud-corner-card rounded-xl bg-[#040813] border border-[#14233f] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="uppercase font-bold">MODEL PREDICTION CONFIDENCE</span>
              <span className={`font-bold text-base ${isIntrusion ? 'text-rose-400' : 'text-emerald-400'}`}>
                {confidence}%
              </span>
            </div>
            {/* Bar */}
            <div className="w-full bg-[#0a1224] rounded-full h-3 overflow-hidden p-0.5 border border-[#162746]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isIntrusion ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                }`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>DecisionTree Depth: 20</span>
              <span className="font-bold text-white">Verdict: {result.prediction}</span>
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="hud-corner-card rounded-xl bg-[#040813] border border-[#14233f] p-4 space-y-2.5">
            <span className="text-xs text-slate-400 font-mono uppercase font-bold block">BAYESIAN PROBABILITY SPREAD:</span>
            {/* Normal Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">Normal Purity (0)</span>
                <span className="text-slate-300 font-bold">{probs.normal}%</span>
              </div>
              <div className="w-full bg-[#0a1224] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${probs.normal}%` }}
                ></div>
              </div>
            </div>

            {/* Intrusion Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-rose-400 font-bold">Hostile Anomaly (1)</span>
                <span className="text-slate-300 font-bold">{probs.intrusion}%</span>
              </div>
              <div className="w-full bg-[#0a1224] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${probs.intrusion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* HUMAN-IN-THE-LOOP IP BLOCK INTERVENTION BANNER */}
        <div className={`hud-corner-card p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isBlocked
            ? 'bg-rose-950/70 border-rose-500 shadow-glow-red'
            : isIntrusion
            ? 'bg-rose-950/30 border-rose-500/50'
            : 'bg-[#081124] border-[#162747]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isBlocked
                ? 'bg-rose-600 text-white shadow-glow-red'
                : isIntrusion
                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
            }`}>
              <ShieldBan className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                PERIMETER INGRESS HOST INSPECTOR
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold font-mono text-white tracking-wide">{packetIP}</span>
                {isBlocked ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-600 text-white border border-rose-400 animate-pulse">
                    FIREWALL DROP ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-[#0c162d] border border-[#1b2b4e]">
                    Host Monitored
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
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#24111a] hover:bg-[#381628] text-rose-300 hover:text-white border border-rose-900/60 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldOff className="w-4 h-4 text-rose-400" />
                <span>RESTORE IP INGRESS</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onBlockIP(packetIP, risk.verdict || 'Intrusion detected by ML model')}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isIntrusion
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-red hover:shadow-rose-500/60'
                    : 'bg-[#12203d] hover:bg-rose-900 text-slate-200 hover:text-white border border-[#233863]'
                }`}
              >
                <ShieldBan className="w-4 h-4" />
                <span>{isIntrusion ? 'DEPLOY FIREWALL DROP (OPERATOR SIGN-OFF)' : 'MANUAL INGRESS DROP'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Risk Verdict & SOC Explanation */}
        <div className="hud-corner-card rounded-xl bg-[#040813] border border-[#14233f] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className={`w-4 h-4 ${isIntrusion ? 'text-rose-400' : 'text-emerald-400'}`} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              Tactical Threat Assessment & Academic Diagnostic
            </h4>
          </div>

          <div className="text-sm font-bold font-mono text-white">
            {risk.verdict || (isIntrusion ? 'Hostile Anomaly' : 'Normal Baseline')}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#060b18] p-3.5 rounded-lg border border-[#111e35] font-sans">
            {risk.explanation || 'Analyzed connection parameters matched baseline distributions trained on the NSL-KDD benchmark.'}
          </p>

          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="font-bold text-slate-300 uppercase">DIRECTIVE:</span>
              <span className={isIntrusion ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                {risk.recommended_action || (isIntrusion ? 'Enforce ingress drop and alert duty officer.' : 'Allow packet forward.')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Pipeline: Pure Node.js ColumnTransformer + DecisionTree</span>
            </div>
          </div>
        </div>

        {/* Packet Signature Feature Highlights */}
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase font-bold block mb-2.5">
            Key Network Dissection Parameters:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono">
            <SummaryChip label="PROTOCOL" value={summary.protocol || 'N/A'} highlight="cyan" />
            <SummaryChip label="SERVICE" value={summary.service || 'N/A'} highlight="cyan" />
            <SummaryChip label="STATUS FLAG" value={summary.flag || 'N/A'} highlight={summary.flag === 'SF' ? 'green' : 'red'} />
            <SummaryChip label="SRC BYTES" value={`${summary.src_bytes ?? 0}B`} />
            <SummaryChip label="DST BYTES" value={`${summary.dst_bytes ?? 0}B`} />
            <SummaryChip label="RATE (2s)" value={summary.connection_count ?? '0'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, highlight }) {
  let colorClass = 'text-slate-200 border-[#14233f]';
  if (highlight === 'green') colorClass = 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40 shadow-glow-green';
  if (highlight === 'red') colorClass = 'text-rose-300 border-rose-500/40 bg-rose-950/40 shadow-glow-red';
  if (highlight === 'cyan') colorClass = 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40 shadow-glow-cyan';

  return (
    <div className={`p-2.5 rounded-lg bg-[#040813] border ${colorClass} flex flex-col font-mono text-center`}>
      <span className="text-[10px] text-slate-500 uppercase">{label}</span>
      <span className="text-xs font-bold mt-0.5 truncate">{value}</span>
    </div>
  );
}
