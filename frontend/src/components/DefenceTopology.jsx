import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldBan, Server, Radio, Eye, Lock, Unlock, AlertTriangle, ArrowRight, Activity, Crosshair, Radar, Terminal, Compass, Zap } from 'lucide-react';

const fallbackZone = {
  id: 'command_centre',
  name: 'Command Centre (HQ Core)',
  tier: 'Tier 1',
  criticality: 'Mission Critical',
  description: 'Primary military tactical command, control servers, and mission planning systems.',
  status: 'SECURE',
  traffic_count: 0,
  suspicious_count: 0,
  is_isolated: 0
};

export default function DefenceTopology({ zones = [], onToggleIsolation, selectedZoneId, onSelectZone, loading }) {
  const [confirmModalZone, setConfirmModalZone] = useState(null);
  const [operatorCallsign, setOperatorCallsign] = useState('SOC_DUTY_OFFICER');

  const safeZones = (Array.isArray(zones) && zones.length > 0) ? zones : [fallbackZone];
  const selectedZone = safeZones.find(z => z.id === selectedZoneId) || safeZones[0] || fallbackZone;

  const getStatusColor = (status, isIsolated) => {
    if (isIsolated) {
      return {
        border: 'border-cyan-400',
        bg: 'bg-cyan-950/40',
        text: 'text-cyan-300',
        badge: 'bg-cyan-900/80 text-cyan-200 border-cyan-400',
        radarBlip: 'bg-cyan-400 shadow-glow-cyan'
      };
    }
    if (status === 'UNDER_ATTACK') {
      return {
        border: 'border-rose-500 shadow-glow-red animate-pulse',
        bg: 'bg-rose-950/40',
        text: 'text-rose-400',
        badge: 'bg-rose-900 text-rose-200 border-rose-500',
        radarBlip: 'bg-rose-500 shadow-glow-red'
      };
    }
    if (status === 'ELEVATED') {
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        badge: 'bg-amber-900 text-amber-200 border-amber-500',
        radarBlip: 'bg-amber-400 shadow-glow-amber'
      };
    }
    return {
      border: 'border-emerald-500/40',
      bg: 'bg-[#0a1222]',
      text: 'text-emerald-400',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      radarBlip: 'bg-emerald-400 shadow-glow-green'
    };
  };

  const getZoneIcon = (id) => {
    switch (id) {
      case 'command_centre': return <Shield className="w-5 h-5" />;
      case 'surveillance': return <Eye className="w-5 h-5" />;
      case 'secure_comms': return <Radio className="w-5 h-5" />;
      case 'military_base': return <Server className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  const handleIsolationConfirm = () => {
    if (confirmModalZone && onToggleIsolation) {
      onToggleIsolation(confirmModalZone.id, operatorCallsign);
      setConfirmModalZone(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tactical Operations Center Disclaimer & Classification Banner */}
      <div className="hud-corner-card p-3.5 rounded-xl bg-[#060b16] border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong className="text-white">SIMULATED DEFENCE SECTOR ENVIRONMENT:</strong> Telemetry streams, sector packet counters, and electronic containment drops are executed in an academic laboratory prototype. Physical weapon or network hardware links are severed.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-[10px] font-bold text-amber-200">
            C4ISR CYBER LAB
          </span>
          <span className="text-slate-500 font-mono text-[10px]">SEC-AUTH: 994-T</span>
        </div>
      </div>

      {/* 2. Main Grid: Tactical Radar Scope & Selected Sector Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Interactive Tactical Radar Scope & Topology Grid (2 Columns) */}
        <div className="hud-corner-card lg:col-span-2 rounded-xl bg-[#060c18] border border-[#152542] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background radar circles and scanlines */}
          <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none"></div>

          <div>
            {/* Header with Radar Compass indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#132039] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-green">
                  <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                    <span>Defence Network Topology // Tactical Radar Array</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Active C4ISR military zones &bull; Select any sector node to inspect telemetry
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-cyan-400 px-2.5 py-1 rounded bg-[#091326] border border-cyan-500/30">
                  SECTORS ACTIVE: {safeZones.length} / 4
                </span>
              </div>
            </div>

            {/* Central Perimeter Gateway & Tactical Firewall Bar */}
            <div className="mb-6 flex justify-center relative z-10">
              <div className="px-5 py-2.5 rounded-xl bg-[#081224] border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-3 shadow-glow-cyan">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-bold tracking-wider">DEFENCE CORE PERIMETER FIREWALL // GATEWAY-01</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold">
                  ENFORCING
                </span>
              </div>
            </div>

            {/* 4 Interactive Sector Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {safeZones.map((zone) => {
                const colors = getStatusColor(zone.status, zone.is_isolated === 1);
                const isSelected = selectedZone?.id === zone.id;
                const isIsolated = zone.is_isolated === 1;

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectZone && onSelectZone(zone.id)}
                    className={`hud-corner-card cursor-pointer rounded-xl border p-4.5 transition-all text-left flex flex-col justify-between ${
                      colors.bg
                    } ${colors.border} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400/80 shadow-glow-cyan scale-[1.01]'
                        : 'hover:scale-[1.008] hover:border-slate-500'
                    }`}
                  >
                    <div>
                      {/* Top Bar of Sector Card */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg bg-[#040812] border border-[#182845] ${colors.text}`}>
                            {getZoneIcon(zone.id)}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">
                              {zone.tier} &bull; {zone.criticality}
                            </span>
                            <h4 className="text-xs font-bold text-white font-mono tracking-wide">{zone.name}</h4>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${colors.badge}`}>
                          {isIsolated ? 'CONTAINED (SIM)' : zone.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed font-sans">
                        {zone.description}
                      </p>
                    </div>

                    {/* Sector Telemetry Metrics Grid */}
                    <div className="mt-4 pt-3 border-t border-[#14233f] grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-[#030712] border border-[#111e33]">
                        <span className="text-slate-400 block text-[9px] uppercase">Throughput</span>
                        <span className="text-slate-100 font-bold">{zone.traffic_count || 0} packets</span>
                      </div>
                      <div className="p-2 rounded bg-[#030712] border border-[#111e33]">
                        <span className="text-slate-400 block text-[9px] uppercase">Threat Alerts</span>
                        <span className={`font-bold ${(zone.suspicious_count || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {zone.suspicious_count || 0} detected
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Telemetry Status Bar */}
          <div className="mt-6 pt-4 border-t border-[#12203b] text-[11px] text-slate-400 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target telemetry synchronized with Decision Tree (Depth 20).</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE SENSOR STREAM
            </span>
          </div>
        </div>

        {/* Right: Selected Sector Telemetry Inspector & Electronic Containment Controls */}
        <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Sector Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#14223b]">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                {getZoneIcon(selectedZone?.id)}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  SECTOR TELEMETRY INSPECTOR
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">{selectedZone?.name || 'Sector Telemetry'}</h3>
              </div>
            </div>

            {/* Tactical Parameter Panels */}
            <div className="mt-5 space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#040813] border border-[#121f37] space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">DEFENCE SECURITY TIER:</span>
                <span className="text-cyan-300 font-bold text-xs">{selectedZone?.tier || 'Tier 1'} — {selectedZone?.criticality || 'Standard'}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#040813] border border-[#121f37] space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">SECTOR STATUS EVALUATION:</span>
                <span className={`font-bold ${selectedZone?.is_isolated ? 'text-cyan-300' : (selectedZone?.status === 'UNDER_ATTACK' ? 'text-rose-400' : 'text-emerald-400')}`}>
                  {selectedZone?.is_isolated ? 'CONTAINED (SIMULATED AIR-GAP)' : (selectedZone?.status || 'SECURE')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-[#040813] border border-[#121f37]">
                  <span className="text-slate-400 text-[10px] block uppercase">PACKET VOLUME</span>
                  <span className="text-slate-100 font-bold text-base">{selectedZone?.traffic_count || 0}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#040813] border border-[#121f37]">
                  <span className="text-slate-400 text-[10px] block uppercase">THREAT INCIDENTS</span>
                  <span className={`font-bold text-base ${(selectedZone?.suspicious_count || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedZone?.suspicious_count || 0}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#040813] border border-[#121f37] text-[11px] leading-relaxed text-slate-300">
                {selectedZone?.description || 'Simulated sector telemetry is loaded.'}
              </div>

              {selectedZone?.is_isolated === 1 && (
                <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-400 text-cyan-200 text-[11px] flex items-start gap-2.5 shadow-glow-cyan animate-pulse">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">SIMULATED AIR-GAP ACTIVE:</span> All inbound traffic into this military sector is dropped. Threat isolation engaged.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Containment Action Trigger */}
          <div className="mt-6 pt-4 border-t border-[#14223b]">
            <button
              onClick={() => selectedZone && setConfirmModalZone(selectedZone)}
              className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
                selectedZone?.is_isolated === 1
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                  : 'bg-rose-700 hover:bg-rose-600 text-white shadow-glow-red'
              }`}
            >
              {selectedZone?.is_isolated === 1 ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>RESTORE SIMULATED CONNECTIVITY</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ENGAGE SIMULATED SECTOR CONTAINMENT</span>
                </>
              )}
            </button>
            <span className="text-[10px] font-mono text-slate-500 block text-center mt-2">
              Requires Operator Authorization &bull; Logged in MongoDB Audit Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Simulated Zone Isolation */}
      {confirmModalZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="hud-corner-card w-full max-w-md rounded-2xl bg-[#060c18] border border-amber-500/50 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-glow-amber">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  AUTHORIZE SIMULATED CONTAINMENT ACTION
                </h3>
                <span className="text-[10px] font-mono text-amber-300">Human Operator Dual-Signoff Protocol</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              You are authorizing to {confirmModalZone.is_isolated ? 'restore simulated connectivity for' : 'deploy simulated containment isolation to'}:{' '}
              <strong className="text-white font-mono">{confirmModalZone.name}</strong>.
            </p>

            <div className="p-3.5 rounded-lg bg-[#030611] border border-[#14233f] text-[11px] font-mono text-slate-300 mb-4 space-y-1.5">
              <div>&bull; Directive: <span className="text-cyan-300 font-bold">{confirmModalZone.is_isolated ? 'RESTORE_NETWORK_LINK' : 'SEVER_INBOUND_ROUTING (SIM)'}</span></div>
              <div>&bull; Environment: <span className="text-amber-300">C4ISR Simulated Cyber Lab</span></div>
              <div>&bull; Forensic Stamp: <span className="text-emerald-300 font-bold">Cryptographically saved in MongoDB</span></div>
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase font-bold">
                Operator Callsign Credentials:
              </label>
              <input
                type="text"
                value={operatorCallsign}
                onChange={(e) => setOperatorCallsign(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0b1428] border border-[#1e3258] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#14223b]">
              <button
                type="button"
                onClick={() => setConfirmModalZone(null)}
                className="px-4 py-2 rounded-lg bg-[#0e172a] hover:bg-[#182645] text-xs font-mono text-slate-300 transition-colors"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={handleIsolationConfirm}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs shadow-glow-amber transition-all"
              >
                Sign & Deploy Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
