import React from 'react';
import { Shield, ShieldAlert, Activity, Server, Radio, BookOpen, Database } from 'lucide-react';

export default function Navbar({ backendStatus, onOpenDocs, onRefreshStatus }) {
  const isHealthy = backendStatus?.status === 'healthy' && backendStatus?.model_loaded;
  const isMongoConnected = backendStatus?.mongodb?.connected;

  return (
    <header className="sticky top-0 z-50 bg-[#080e1d]/90 backdrop-blur-md border-b border-[#1b2a4a] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-glow-green">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">SOC Defense AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#162544] border border-[#233863] text-cyan-300 font-mono">MERN Edition</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              CyberShield <span className="text-emerald-400 font-mono text-lg font-light">// IDS</span>
            </h1>
          </div>
        </div>

        {/* Center / Stats info */}
        <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 rounded-lg bg-[#0e172e] border border-[#1d2f55] text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">Stack:</span>
            <span className="text-cyan-300 font-medium">MERN + ML Engine</span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <Database className={`w-3.5 h-3.5 ${isMongoConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-400">DB:</span>
            <span className={isMongoConnected ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'}>
              {isMongoConnected ? 'MongoDB Connected' : 'MongoDB Ready (Fallback)'}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Classifier:</span>
            <span className="text-emerald-300 font-medium">DecisionTree (41 Feat)</span>
          </div>
        </div>

        {/* System Backend Health Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121d38] hover:bg-[#1a2b54] border border-[#223561] text-xs font-medium text-slate-200 transition-colors"
            title="View NSL-KDD Feature Guide & Architecture"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dataset Docs</span>
          </button>

          <div
            onClick={onRefreshStatus}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
              isHealthy
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300 hover:border-rose-500/70'
            }`}
            title="Click to refresh backend status"
          >
            <span className="relative flex h-2.5 w-2.5">
              {isHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </>
              )}
            </span>
            <div className="flex flex-col text-left">
              <span className="font-semibold leading-none">
                {isHealthy ? (backendStatus?.runtime?.includes('MERN') ? 'MERN API Online' : 'IDS API Online') : 'Backend Disconnected'}
              </span>
              <span className="text-[10px] text-slate-400 leading-none mt-1">
                {isHealthy ? (isMongoConnected ? 'MongoDB Atlas Connected' : 'ML Engine Online • MERN') : 'Check port 5000'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
