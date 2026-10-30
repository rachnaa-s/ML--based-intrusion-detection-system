import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, ShieldBan, TrendingUp, Radio, Cpu, Lock, Crosshair } from 'lucide-react';

export default function SummaryCards({ history = [], blockedIPsCount = 0 }) {
  const safeHistory = Array.isArray(history) ? history : [];
  const total = safeHistory.length;
  const normalCount = safeHistory.filter(item => item?.prediction === 'Normal').length;
  const intrusionCount = safeHistory.filter(item => item?.prediction === 'Intrusion').length;

  const normalPct = total > 0 ? ((normalCount / total) * 100).toFixed(1) : '0.0';
  const intrusionPct = total > 0 ? ((intrusionCount / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Signals Ingested */}
      <div className="hud-corner-card relative overflow-hidden rounded-xl bg-[#070e1c] border border-[#162746] p-5 shadow-xl transition-all hover:border-cyan-500/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Signals Ingested</span>
            </div>
            <h3 className="text-3xl font-bold font-mono text-white mt-1.5 tracking-tight flex items-baseline gap-2">
              {total}
              <span className="text-xs font-mono font-normal text-cyan-400">PKTS</span>
            </h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Tactical Telemetry Progress */}
        <div className="mt-4 pt-3 border-t border-[#12203b] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>DISSECTION BUFFER</span>
            <span className="text-cyan-300 font-bold">100% ONLINE</span>
          </div>
          <div className="h-1.5 w-full bg-[#0d1628] rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>GRID: NORTH-COMMAND</span>
            <span>41 NSL-KDD ATTRS</span>
          </div>
        </div>
      </div>

      {/* 2. Verified Benign Baseline */}
      <div className="hud-corner-card hud-corner-green relative overflow-hidden rounded-xl bg-[#070e1c] border border-emerald-900/40 p-5 shadow-xl transition-all hover:border-emerald-500/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Verified Benign</span>
            </div>
            <h3 className="text-3xl font-bold font-mono text-emerald-400 mt-1.5 tracking-tight flex items-baseline gap-2">
              {normalCount}
              <span className="text-xs font-mono font-normal text-emerald-300">SAFE</span>
            </h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-glow-green">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#12203b] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>BASELINE PURITY RATIO</span>
            <span className="text-emerald-300 font-bold">{normalPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#0d1628] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, normalPct))}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>NO THREAT SIGNATURE</span>
            <span>NORMAL TRAFFIC</span>
          </div>
        </div>
      </div>

      {/* 3. Hostile Intrusions Intercepted */}
      <div className="hud-corner-card hud-corner-red relative overflow-hidden rounded-xl bg-[#0e0712] border border-rose-900/50 p-5 shadow-xl transition-all hover:border-rose-500/60">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Hostile Intrusions</span>
            </div>
            <h3 className="text-3xl font-bold font-mono text-rose-400 mt-1.5 tracking-tight flex items-baseline gap-2">
              {intrusionCount}
              <span className="text-xs font-mono font-normal text-rose-300">DETECTED</span>
            </h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400 shadow-glow-red">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#22101e] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ANOMALY THREAT INDEX</span>
            <span className="text-rose-400 font-bold">{intrusionPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#180a15] rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, intrusionPct))}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>VECTOR: DoS / PROBE / R2L</span>
            <span>AUTOMATED TRIAGE</span>
          </div>
        </div>
      </div>

      {/* 4. Active Perimeter Firewall Rules */}
      <div className="hud-corner-card hud-corner-amber relative overflow-hidden rounded-xl bg-[#0e0c07] border border-amber-900/50 p-5 shadow-xl transition-all hover:border-amber-500/60">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Perimeter Drops</span>
            </div>
            <h3 className="text-3xl font-bold font-mono text-amber-400 mt-1.5 tracking-tight flex items-baseline gap-2">
              {blockedIPsCount}
              <span className="text-xs font-mono font-normal text-amber-300">RULES</span>
            </h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400 shadow-glow-amber">
            <ShieldBan className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#221c0e] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>HUMAN SIGN-OFF STATUS</span>
            <span className="text-amber-300 font-bold">{blockedIPsCount > 0 ? 'ENFORCING' : 'READY'}</span>
          </div>
          <div className="h-1.5 w-full bg-[#1c160b] rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, blockedIPsCount * 25))}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>FIREWALL: iptables / eBPF</span>
            <span>IMMUTABLE LOGGED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
