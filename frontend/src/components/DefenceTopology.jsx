import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldBan, Server, Radio, Eye, Lock, Unlock, AlertTriangle, ArrowRight, Activity, Info } from 'lucide-react';

export default function DefenceTopology({ zones, onToggleIsolation, selectedZoneId, onSelectZone, loading }) {
  const [confirmModalZone, setConfirmModalZone] = useState(null);
  const [operatorCallsign, setOperatorCallsign] = useState('SOC_DUTY_OFFICER');

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  const getStatusColor = (status, isIsolated) => {
    if (isIsolated) return { border: 'border-cyan-400', bg: 'bg-cyan-950/40', text: 'text-cyan-300', badge: 'bg-cyan-900 text-cyan-200 border-cyan-400' };
    if (status === 'UNDER_ATTACK') return { border: 'border-rose-500 shadow-glow-red animate-pulse', bg: 'bg-rose-950/40', text: 'text-rose-400', badge: 'bg-rose-900 text-rose-200 border-rose-500' };
    if (status === 'ELEVATED') return { border: 'border-amber-500', bg: 'bg-amber-950/40', text: 'text-amber-400', badge: 'bg-amber-900 text-amber-200 border-amber-500' };
    return { border: 'border-emerald-500/40', bg: 'bg-emerald-950/20', text: 'text-emerald-400', badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40' };
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
    if (confirmModalZone) {
      onToggleIsolation(confirmModalZone.id, operatorCallsign);
      setConfirmModalZone(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-[#0b1426] border border-amber-500/30 text-amber-300/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SIMULATED DEFENCE NETWORK ENVIRONMENT:</strong> All zones, sector traffic counts, and containment actions are strictly simulated for academic evaluation. No physical network commands are executed.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-[10px] font-bold text-amber-200 shrink-0 self-start sm:self-auto">
          ACADEMIC LAB PROTOTYPE
        </span>
      </div>

      {/* Main Grid: Interactive Topology Diagram + Zone Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Network Topology Map (2 Columns) */}
        <div className="lg:col-span-2 rounded-xl bg-[#0c1326] border border-[#1b2b4e] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Defence Network Topology (Simulated Architecture)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Click any zone node to inspect telemetry or engage simulated isolation
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 px-2 py-1 rounded bg-[#101b38] border border-[#1f325e]">
                Interconnected Sectors: {zones.length}
              </span>
            </div>

            {/* Central Gateway Node */}
            <div className="mb-6 flex justify-center">
              <div className="px-5 py-2.5 rounded-xl bg-[#0e1933] border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2.5 shadow-glow-cyan">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">DEFENCE PERIMETER FIREWALL & CORE GATEWAY</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* 4 Interconnected Zone Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {zones.map((zone) => {
                const colors = getStatusColor(zone.status, zone.is_isolated === 1);
                const isSelected = selectedZone?.id === zone.id;
                const isIsolated = zone.is_isolated === 1;

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectZone(zone.id)}
                    className={`cursor-pointer rounded-xl border p-4.5 transition-all text-left flex flex-col justify-between ${
                      colors.bg
                    } ${colors.border} ${
                      isSelected ? 'ring-2 ring-emerald-400/80 shadow-glow-green scale-[1.01]' : 'hover:scale-[1.008]'
                    }`}
                  >
                    <div>
                      {/* Node Top Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-[#0a1020] border border-[#1b2b4e] ${colors.text}`}>
                            {getZoneIcon(zone.id)}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                              {zone.tier} &bull; {zone.criticality}
                            </span>
                            <h4 className="text-xs font-bold text-white font-mono">{zone.name}</h4>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${colors.badge}`}>
                          {isIsolated ? 'ISOLATED (SIM)' : zone.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {zone.description}
                      </p>
                    </div>

                    {/* Node Telemetry Metrics */}
                    <div className="mt-4 pt-3 border-t border-[#182747] grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Traffic Volume:</span>
                        <span className="text-slate-200 font-semibold">{zone.traffic_count} packets</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Suspicious Alerts:</span>
                        <span className={`font-semibold ${zone.suspicious_count > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                          {zone.suspicious_count} detected
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#162340] text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Click any node above to manage simulated sector defense policy.</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Model Telemetry Feed Active
            </span>
          </div>
        </div>

        {/* Right: Selected Zone Inspector & Simulated Containment Action */}
        <div className="rounded-xl bg-[#0c1326] border border-[#1b2b4e] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#1b2b4e]">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {getZoneIcon(selectedZone.id)}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Sector Telemetry Inspector
                </span>
                <h3 className="text-sm font-bold text-white font-mono">{selectedZone.name}</h3>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#080d1c] border border-[#172545] space-y-1">
                <span className="text-slate-400 text-[10px] block">SECURITY TIER:</span>
                <span className="text-cyan-300 font-bold">{selectedZone.tier} — {selectedZone.criticality}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#080d1c] border border-[#172545] space-y-1">
                <span className="text-slate-400 text-[10px] block">STATUS EVALUATION:</span>
                <span className={`font-bold ${selectedZone.is_isolated ? 'text-cyan-300' : (selectedZone.status === 'UNDER_ATTACK' ? 'text-rose-400' : 'text-emerald-400')}`}>
                  {selectedZone.is_isolated ? 'SIMULATED ISOLATION (CONTAINMENT)' : selectedZone.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-[#080d1c] border border-[#172545]">
                  <span className="text-slate-400 text-[10px] block">TOTAL TRAFFIC:</span>
                  <span className="text-slate-100 font-bold text-base">{selectedZone.traffic_count}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#080d1c] border border-[#172545]">
                  <span className="text-slate-400 text-[10px] block">THREAT ALERTS:</span>
                  <span className={`font-bold text-base ${selectedZone.suspicious_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedZone.suspicious_count}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080d1c] border border-[#172545] text-[11px] leading-relaxed text-slate-300">
                {selectedZone.description}
              </div>

              {selectedZone.is_isolated === 1 && (
                <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-[11px] flex items-start gap-2">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">SIMULATED CONTAINMENT ACTIVE:</span> Ingress traffic into this sector is flagged as dropped in simulation.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simulated Containment Action Trigger */}
          <div className="mt-6 pt-4 border-t border-[#1b2b4e]">
            <button
              onClick={() => setConfirmModalZone(selectedZone)}
              className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                selectedZone.is_isolated === 1
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                  : 'bg-rose-700 hover:bg-rose-600 text-white shadow-glow-red'
              }`}
            >
              {selectedZone.is_isolated === 1 ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Restore Simulated Connectivity</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Engage Simulated Zone Isolation</span>
                </>
              )}
            </button>
            <span className="text-[10px] font-mono text-slate-500 block text-center mt-1.5">
              Requires human operator approval &bull; Logged in immutable audit trail
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Simulated Zone Isolation */}
      {confirmModalZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1429] border border-amber-500/40 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Confirm Simulated Containment Action
                </h3>
                <span className="text-[10px] font-mono text-amber-300">Human Approval Sign-Off</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              You are about to {confirmModalZone.is_isolated ? 'restore simulated connectivity for' : 'apply simulated containment isolation to'}:{' '}
              <strong className="text-white font-mono">{confirmModalZone.name}</strong>.
            </p>

            <div className="p-3 rounded-lg bg-[#080d1a] border border-[#1b2b4e] text-[11px] font-mono text-slate-400 mb-4 space-y-1">
              <div>&bull; Action: <span className="text-cyan-300">{confirmModalZone.is_isolated ? 'RESTORE_SIMULATED_NETWORK' : 'SIMULATED_ISOLATION_DROP'}</span></div>
              <div>&bull; Environment: <span className="text-amber-300">Simulated Lab Sector</span></div>
              <div>&bull; Audit Record: <span className="text-emerald-300">Will be permanently saved in SQLite DB</span></div>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Operator Callsign:</label>
              <input
                type="text"
                value={operatorCallsign}
                onChange={(e) => setOperatorCallsign(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#111c38] border border-[#20335e] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2b4e]">
              <button
                type="button"
                onClick={() => setConfirmModalZone(null)}
                className="px-4 py-2 rounded-lg bg-[#142142] hover:bg-[#1b2b54] text-xs font-mono text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIsolationConfirm}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs shadow-lg transition-all"
              >
                Approve Simulated Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
