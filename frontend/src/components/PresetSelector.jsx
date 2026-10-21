import React from 'react';
import { Zap, ShieldCheck, Flame, Search, AlertOctagon, Terminal } from 'lucide-react';

export default function PresetSelector({ presets, activePresetId, onSelectPreset }) {
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
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-xl bg-[#0d162d] border border-[#1b2b4e] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold font-mono tracking-wide text-white uppercase">
            1-Click Benchmark Attack & Traffic Scenarios
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Click any preset to auto-fill all 41 NSL-KDD features
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {presets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const isNormal = preset.expected === 'Normal';

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex flex-col text-left p-3.5 rounded-lg border transition-all text-xs ${
                isSelected
                  ? isNormal
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-glow-green text-white'
                    : 'bg-rose-950/40 border-rose-500 shadow-glow-red text-white'
                  : 'bg-[#101a35] border-[#1f3056] text-slate-300 hover:bg-[#152347] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-medium">
                  {getPresetIcon(preset.id)}
                  <span className="font-semibold">{preset.title.split('(')[0].trim()}</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isNormal
                      ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-900/50 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {preset.expected}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
