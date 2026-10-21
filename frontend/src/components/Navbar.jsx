import React from 'react';
import { Shield, ShieldAlert, Activity, Server, Radio, BookOpen, AlertCircle, FileText, Layers, Network } from 'lucide-react';

export default function Navbar({
  backendStatus,
  onOpenDocs,
  onRefreshStatus,
  activeModule,
  onSelectModule,
  alertCount = 0
}) {
  const isHealthy = backendStatus?.status === 'healthy' && backendStatus?.model_loaded;

  const modules = [
    { id: 'command_center', label: 'Command Center & Topology', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'threat_prioritization', label: 'Threat Prioritization', icon: <AlertCircle className="w-3.5 h-3.5" />, badge: alertCount },
    { id: 'incident_response', label: 'Incident Response', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'traffic_inspector', label: 'Traffic Inspector & ML', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'audit_trail', label: 'Audit Trail', icon: <FileText className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080e1d]/95 backdrop-blur-md border-b border-[#1b2a4a] transition-all">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 text-emerald-400 shadow-glow-green">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                DEFENCE NETWORK SOC
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono">
                SIMULATED PROTOTYPE
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              CyberShield <span className="text-emerald-400 font-light text-base">// Incident Response System</span>
            </h1>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121d38] hover:bg-[#1a2b54] border border-[#223561] text-xs font-medium text-slate-200 transition-colors"
            title="View NSL-KDD Feature Guide & Model Details"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-xs">Dataset Docs</span>
          </button>

          {/* Backend Connection Indicator */}
          <div
            onClick={onRefreshStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
              isHealthy
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300 hover:border-rose-500/70'
            }`}
            title="Click to refresh Flask backend status"
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
                {isHealthy ? 'Flask API Online' : 'Backend Disconnected'}
              </span>
              <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                {isHealthy ? 'ids_model.pkl loaded' : 'Check port 5000'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs Bar */}
      <div className="border-t border-[#16233d] bg-[#070c18] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
          {modules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#142345] text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e172e] border border-transparent'
                }`}
              >
                {mod.icon}
                <span>{mod.label}</span>
                {mod.badge !== undefined && mod.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-900 text-rose-200 border border-rose-500">
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
