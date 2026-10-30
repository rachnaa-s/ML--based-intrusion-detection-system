import React from 'react';
import { Zap, ShieldCheck, Flame, Search, AlertOctagon, Terminal, Target, Radio } from 'lucide-react';

export default function PresetSelector({ presets = [], activePresetId, onSelectPreset }) {
  const safePresets = Array.isArray(presets) ? presets : [];

  const getPresetIcon = (presetId) => {
    switch (presetId) {
      case 'preset_normal_http':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'preset_dos_neptune':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'preset_probe_portscan':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'preset_dos_smurf':
        return <AlertOctagon className="w-4 h-4 text-orange-400" />;
      case 'preset_r2l_ftp_brute':
        return <Terminal className="w-4 h-4 text-purple-400" />;
      default:
        return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#12203a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wide text-white uppercase flex items-center gap-2">
              <span>Benchmark Attack & Traffic Scenarios</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0a1428] text-cyan-400 border border-cyan-500/30">
                1-CLICK ARMED INJECTOR
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Select pre-calibrated NSL-KDD benchmark scenarios to evaluate the Node.js ML Decision Tree in real time
            </p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Injects all 41 NSL-KDD features
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {safePresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const isNormal = preset.expected === 'Normal';

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset && onSelectPreset(preset)}
              className={`hud-corner-card flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs font-mono ${
                isSelected
                  ? isNormal
                    ? 'bg-emerald-950/50 border-emerald-500 shadow-glow-green text-white scale-[1.01]'
                    : 'bg-rose-950/50 border-rose-500 shadow-glow-red text-white scale-[1.01]'
                  : 'bg-[#040813] border-[#13223d] text-slate-300 hover:bg-[#081024] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-1.5 font-bold font-mono text-white text-[11px]">
                  {getPresetIcon(preset.id)}
                  <span className="truncate">{preset.name}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    isNormal
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                  }`}
                >
                  {preset.expected}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
