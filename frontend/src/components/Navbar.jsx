import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Activity, Server, Radio, BookOpen, AlertCircle, FileText, Layers, Network, Database, Crosshair, Terminal, Clock, Cpu } from 'lucide-react';

export default function Navbar({
  backendStatus,
  onOpenDocs,
  onRefreshStatus,
  activeModule,
  onSelectModule,
  alertCount = 0
}) {
  const isHealthy = backendStatus?.status === 'healthy' && backendStatus?.model_loaded;
  const isMongoConnected = backendStatus?.mongodb?.connected;

  // Live Military Ticking Zulu Clock
  const [timeState, setTimeState] = useState({ zulu: '', local: '' });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const zulu = now.toISOString().slice(11, 19) + 'Z';
      const local = now.toTimeString().slice(0, 8);
      setTimeState({ zulu, local });
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine DEFCON status
  const defconLevel = alertCount > 0 ? (alertCount >= 3 ? 2 : 3) : 4;
  const defconInfo = {
    2: { name: 'DEFCON 2', posture: 'FAST PACE', color: 'text-rose-400 bg-rose-950/80 border-rose-500 shadow-glow-red animate-pulse' },
    3: { name: 'DEFCON 3', posture: 'ROUND HOUSE', color: 'text-amber-400 bg-amber-950/80 border-amber-500 shadow-glow-amber' },
    4: { name: 'DEFCON 4', posture: 'DOUBLE TAKE', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' }
  }[defconLevel];

  const modules = [
    { id: 'command_center', label: 'Command Center & Radar Topology', icon: <Network className="w-3.5 h-3.5" />, tag: 'TOC-01' },
    { id: 'threat_prioritization', label: 'Threat Prioritization Matrix', icon: <AlertCircle className="w-3.5 h-3.5" />, badge: alertCount, tag: 'TRG-02' },
    { id: 'incident_response', label: 'Incident Response & Containment', icon: <ShieldAlert className="w-3.5 h-3.5" />, tag: 'IR-03' },
    { id: 'traffic_inspector', label: 'Packet Dissector & ML Engine', icon: <Activity className="w-3.5 h-3.5" />, tag: 'SIG-04' },
    { id: 'audit_trail', label: 'Cryptographic Audit Ledger', icon: <FileText className="w-3.5 h-3.5" />, tag: 'LEDGER-05' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#040812]/95 backdrop-blur-md border-b border-[#15233c] transition-all">
      {/* 1. Tactical Security Classification Stripe */}
      <div className="bg-[#02050b] border-b border-[#0f1b2d] px-4 py-0.5 text-[10px] font-mono tracking-widest text-slate-500 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40">
            RESTRICTED // MIL-SPEC CYBER DEFENCE
          </span>
          <span className="hidden sm:inline text-slate-500">
            C4ISR TACTICAL NETWORK OPERATION CENTER &bull; NSL-KDD CLASSIFIER
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <strong className="text-cyan-300 font-mono tracking-wider">{timeState.zulu || '00:00:00Z'}</strong>
            <span className="text-[9px] text-slate-500">(ZULU)</span>
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <span>LOC:</span>
            <span className="text-slate-300 font-mono">{timeState.local || '00:00:00'}</span>
          </span>
        </div>
      </div>

      {/* 2. Main Command Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Defense Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#091224] border border-cyan-500/40 text-cyan-400 shadow-glow-cyan">
              <Crosshair className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
              <Shield className="w-4 h-4 text-emerald-400 absolute" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1">
                  AEGIS CYBER-SHIELD
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0b162c] border border-cyan-500/30 text-cyan-300">
                  SEC-LEVEL 4
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                MIL-DEFENCE <span className="text-emerald-400 font-medium text-sm">// INTRUSION DETECTION SYSTEM</span>
              </h1>
            </div>
          </div>

          {/* Mobile DEFCON Pill */}
          <div className="md:hidden">
            <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${defconInfo.color}`}>
              {defconInfo.name}
            </span>
          </div>
        </div>

        {/* Tactical Status Cluster */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-[#081020] border border-[#14233f] text-xs font-mono text-slate-300">
          {/* DEFCON Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">THREAT POSTURE:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${defconInfo.color}`}>
              {defconInfo.name} &bull; {defconInfo.posture}
            </span>
          </div>

          <div className="h-4 w-px bg-[#182744]"></div>

          {/* Callsign */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 text-[11px]">CALLSIGN:</span>
            <span className="text-white font-bold text-[11px]">WATCHDOG-HQ</span>
          </div>

          <div className="h-4 w-px bg-[#182744]"></div>

          {/* Database link */}
          <div className="flex items-center gap-1.5">
            <Database className={`w-3.5 h-3.5 ${isMongoConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-400 text-[11px]">DB:</span>
            <span className={`text-[11px] font-semibold ${isMongoConnected ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isMongoConnected ? 'MongoDB Online' : 'Memory Resilient'}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c162d] hover:bg-[#132247] border border-[#1b315b] text-xs font-mono text-slate-200 transition-all hover:border-cyan-400"
            title="Open NSL-KDD Architecture & Feature Matrix"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Tactical Docs</span>
          </button>

          {/* Backend Connection Indicator */}
          <div
            onClick={onRefreshStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
              isHealthy
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:shadow-glow-green'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:border-rose-400'
            }`}
            title="Click to refresh MERN backend status"
          >
            <span className="relative flex h-2 w-2">
              {isHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <div className="flex flex-col text-left">
              <span className="font-bold leading-none text-[11px]">
                {isHealthy ? 'SYS-HEALTH: OPTIMAL' : 'LINK SEVERED'}
              </span>
              <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                {isHealthy ? '41 Feat • Pure Node.js ML' : 'Port 5000 Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tactical Command Navigation Tabs */}
      <div className="border-t border-[#121f37] bg-[#03060e] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5">
          {modules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0f1d38] text-cyan-300 border border-cyan-500/60 shadow-glow-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#091124] border border-transparent font-medium'
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                )}
                {mod.icon}
                <span>{mod.label}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded ${isActive ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' : 'bg-[#0b1428] text-slate-500'}`}>
                  {mod.tag}
                </span>
                {mod.badge !== undefined && mod.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500 animate-pulse">
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
