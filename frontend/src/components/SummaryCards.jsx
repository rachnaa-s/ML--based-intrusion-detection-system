import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, ShieldBan, TrendingUp } from 'lucide-react';

export default function SummaryCards({ history, blockedIPsCount = 0 }) {
  const total = history.length;
  const normalCount = history.filter(item => item.prediction === 'Normal').length;
  const intrusionCount = history.filter(item => item.prediction === 'Intrusion').length;

  const normalPct = total > 0 ? ((normalCount / total) * 100).toFixed(1) : '0.0';
  const intrusionPct = total > 0 ? ((intrusionCount / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Analyzed Traffic */}
      <div className="relative overflow-hidden rounded-xl bg-[#0d162d] border border-[#1b2b4e] p-5 shadow-lg transition-all hover:border-[#2b4175]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Analyzed</p>
            <h3 className="text-3xl font-bold font-mono text-white mt-1.5">{total}</h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-[#192746] pt-3">
          <span className="flex items-center gap-1 font-mono text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Live Session Packets
          </span>
          <span className="font-mono text-cyan-400">NSL-KDD</span>
        </div>
      </div>

      {/* 2. Normal Traffic */}
      <div className="relative overflow-hidden rounded-xl bg-[#0d162d] border border-emerald-900/40 p-5 shadow-lg transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400/80">Normal Traffic</p>
            <h3 className="text-3xl font-bold font-mono text-emerald-400 mt-1.5">{normalCount}</h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-glow-green">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-[#192746] pt-3">
          <span className="font-mono text-slate-300">Safe Baseline Ratio</span>
          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            {normalPct}%
          </span>
        </div>
      </div>

      {/* 3. Potential Intrusions */}
      <div className="relative overflow-hidden rounded-xl bg-[#0d162d] border border-rose-900/40 p-5 shadow-lg transition-all hover:border-rose-500/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-rose-400/80">Potential Intrusions</p>
            <h3 className="text-3xl font-bold font-mono text-rose-400 mt-1.5">{intrusionCount}</h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-glow-red">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-[#192746] pt-3">
          <span className="font-mono text-slate-300">Anomaly Rate</span>
          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
            {intrusionPct}%
          </span>
        </div>
      </div>

      {/* 4. Blocked Threat IPs (Human Intervention) */}
      <div className="relative overflow-hidden rounded-xl bg-[#0d162d] border border-amber-900/40 p-5 shadow-lg transition-all hover:border-amber-500/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-400/80">Blocked Threat IPs</p>
            <h3 className="text-3xl font-bold font-mono text-amber-300 mt-1.5">{blockedIPsCount}</h3>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldBan className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-[#192746] pt-3">
          <span className="font-mono text-slate-300">Firewall Rules</span>
          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
            {blockedIPsCount > 0 ? `${blockedIPsCount} Active Drops` : '0 Rules'}
          </span>
        </div>
      </div>
    </div>
  );
}
