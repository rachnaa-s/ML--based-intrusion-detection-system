import React, { useState } from 'react';
import { Sliders, RefreshCw, Send, HelpCircle, Layers, Shield, Terminal, Clock, Server, Check, Crosshair, Binary, Zap } from 'lucide-react';

export default function TrafficForm({
  formData = {},
  featureGroups = {},
  categoricalOptions = {},
  onChange,
  onReset,
  onSubmit,
  loading
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');

  const groupKeys = Object.keys(featureGroups || {});

  const getTabIcon = (index) => {
    switch (index) {
      case 0: return <Layers className="w-4 h-4 text-cyan-400" />;
      case 1: return <Terminal className="w-4 h-4 text-purple-400" />;
      case 2: return <Clock className="w-4 h-4 text-emerald-400" />;
      case 3: return <Server className="w-4 h-4 text-amber-400" />;
      default: return <Sliders className="w-4 h-4" />;
    }
  };

  const handleInputChange = (name, value, type) => {
    let finalValue = value;
    if (type === 'numeric') {
      finalValue = value === '' ? '' : Number(value);
    } else if (type === 'binary') {
      finalValue = Number(value);
    }
    if (onChange) onChange(name, finalValue);
  };

  return (
    <div className="hud-corner-card rounded-xl bg-[#060c18] border border-[#152542] overflow-hidden shadow-2xl">
      {/* 1. Header with Tactical Dissector Branding */}
      <div className="p-5 border-b border-[#14233f] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#040812]">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>MIL-STD Network Signal & Packet Dissector</span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded">
                41 Attributes
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Calibrate raw network transmission parameters for immediate pure Node.js ML model evaluation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Search telemetry attribute..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#0a1224] border border-[#1c2e50] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56 font-mono"
          />
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e172a] hover:bg-[#182645] border border-[#1b2b4d] text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all"
            title="Reset form to default baseline values"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Baseline</span>
          </button>
        </div>
      </div>

      {/* 2. Simulated Hex Packet Frame Stream Bar */}
      <div className="px-5 py-2 bg-[#02050c] border-b border-[#0f1b2f] flex items-center justify-between text-[10px] font-mono text-slate-500 overflow-x-auto select-none">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">FRAME DUMP:</span>
          <span className="text-slate-400 tracking-wider">
            {"45 00 00 3c 1c 46 40 00 40 06 b1 e6 c0 a8 01 69 c0 a8 01 01 04 d2 00 50 ... [E..<.@.@....i...P]"}
          </span>
        </div>
        <span className="text-emerald-400 font-bold shrink-0 ml-4">
          DISSECTOR PARSING: ACTIVE
        </span>
      </div>

      {/* 3. Category Channel Tabs */}
      {!searchFilter && groupKeys.length > 0 && (
        <div className="flex border-b border-[#14233f] bg-[#040813] overflow-x-auto scrollbar-none">
          {groupKeys.map((groupName, idx) => {
            const count = featureGroups[groupName]?.length || 0;
            const isActive = activeTab === idx;
            return (
              <button
                key={groupName}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 bg-[#091326] text-cyan-300 shadow-glow-cyan'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#070e1c]'
                }`}
              >
                {getTabIcon(idx)}
                <span>{groupName}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-[#0e182e] text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Form Body */}
      <form onSubmit={(e) => { e.preventDefault(); if (onSubmit) onSubmit(); }} className="p-5 sm:p-6">
        {searchFilter ? (
          /* Filtered Results */
          <div>
            <div className="mb-4 text-xs font-mono text-slate-400">
              Showing matching telemetry for: <span className="text-cyan-400 font-bold">"{searchFilter}"</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(featureGroups || {}).flat().filter(feat =>
                feat?.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                feat?.label?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                feat?.desc?.toLowerCase().includes(searchFilter.toLowerCase())
              ).map((feature) => (
                <FeatureField
                  key={feature.name}
                  feature={feature}
                  value={formData[feature.name]}
                  categoricalOptions={categoricalOptions}
                  onChange={handleInputChange}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Tabbed View */
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400 border-b border-[#111e35] pb-2 font-mono">
              <span className="uppercase font-bold text-slate-300">CHANNEL: {groupKeys[activeTab]}</span>
              <span className="text-cyan-400">{featureGroups[groupKeys[activeTab]]?.length || 0} Telemetry Parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureGroups[groupKeys[activeTab]]?.map((feature) => (
                <FeatureField
                  key={feature.name}
                  feature={feature}
                  value={formData[feature.name]}
                  categoricalOptions={categoricalOptions}
                  onChange={handleInputChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* 5. Submit Execution Bar */}
        <div className="mt-8 pt-5 border-t border-[#14233f] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All 41 parameters validated for Decision Tree ML inference
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl ${
              loading
                ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-cyan-500 via-cyan-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-glow-cyan active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>EXECUTING INFERENCE PIPELINE...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>EXECUTE SIGNAL DISSECTION</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FeatureField({ feature, value, categoricalOptions, onChange }) {
  if (!feature) return null;
  const isCategorical = feature.type === 'categorical';
  const isBinary = feature.type === 'binary';
  const options = isCategorical ? (categoricalOptions[feature.name] || feature.options) : feature.options;

  return (
    <div className="rounded-xl bg-[#040813] border border-[#14233f] p-3.5 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-1 mb-1">
        <label htmlFor={feature.name} className="text-xs font-bold text-slate-200 font-mono">
          {feature.label}
        </label>
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help hover:text-cyan-400" />
          <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-52 p-2.5 rounded-lg bg-[#091326] border border-[#1d3159] text-[11px] text-slate-300 shadow-2xl z-20 pointer-events-none font-sans">
            {feature.desc}
            <div className="mt-1 font-mono text-[10px] text-cyan-400 font-bold">ID: {feature.name}</div>
          </div>
        </div>
      </div>

      <div className="font-mono text-[10px] text-slate-500 mb-2 truncate">
        {feature.name}
      </div>

      <div>
        {isCategorical ? (
          <select
            id={feature.name}
            value={value ?? feature.default}
            onChange={(e) => onChange(feature.name, e.target.value, 'categorical')}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#070e1c] border border-[#1a2d4f] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {options?.map((opt) => (
              <option key={opt} value={opt} className="bg-[#050b16] text-slate-200">
                {opt}
              </option>
            ))}
          </select>
        ) : isBinary ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((val) => {
              const isChecked = Number(value) === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange(feature.name, val, 'binary')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold border transition-all ${
                    isChecked
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-glow-cyan'
                      : 'bg-[#070e1c] border-[#162747] text-slate-400 hover:bg-[#0c172d]'
                  }`}
                >
                  {val === 1 ? '1 (TRUE)' : '0 (FALSE)'}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            id={feature.name}
            type="number"
            step={feature.step || 'any'}
            min={feature.min !== undefined ? feature.min : undefined}
            max={feature.max !== undefined ? feature.max : undefined}
            value={value ?? feature.default}
            onChange={(e) => onChange(feature.name, e.target.value, 'numeric')}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#070e1c] border border-[#1a2d4f] text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        )}
      </div>
    </div>
  );
}
