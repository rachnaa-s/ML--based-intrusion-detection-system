import React, { useState } from 'react';
import { Sliders, RefreshCw, Send, HelpCircle, Layers, Shield, Terminal, Clock, Server, Check } from 'lucide-react';

export default function TrafficForm({
  formData,
  featureGroups,
  categoricalOptions,
  onChange,
  onReset,
  onSubmit,
  loading
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');

  const groupKeys = Object.keys(featureGroups);

  const getTabIcon = (index) => {
    switch (index) {
      case 0: return <Layers className="w-4 h-4 text-emerald-400" />;
      case 1: return <Terminal className="w-4 h-4 text-purple-400" />;
      case 2: return <Clock className="w-4 h-4 text-cyan-400" />;
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
    onChange(name, finalValue);
  };

  return (
    <div className="rounded-xl bg-[#0d162d] border border-[#1b2b4e] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-[#1b2b4e] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1226]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Network Traffic Feature Input
              <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                41 Features
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter network connection parameters or modify values from a benchmark preset
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Quick search feature..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#111c38] border border-[#20335e] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-40 sm:w-48 font-mono"
          />
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142142] hover:bg-[#1b2c59] border border-[#233766] text-xs font-medium text-slate-300 hover:text-white transition-colors"
            title="Reset form to default baseline values"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!searchFilter && (
        <div className="flex border-b border-[#1b2b4e] bg-[#0c1429] overflow-x-auto scrollbar-none">
          {groupKeys.map((groupName, idx) => {
            const count = featureGroups[groupName]?.length || 0;
            const isActive = activeTab === idx;
            return (
              <button
                key={groupName}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-400 bg-[#121e3d] text-emerald-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#101a35]'
                }`}
              >
                {getTabIcon(idx)}
                <span>{groupName}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-[#182647] text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-5 sm:p-6">
        {searchFilter ? (
          /* Filtered Results */
          <div>
            <div className="mb-4 text-xs font-mono text-slate-400">
              Showing matching features for: <span className="text-emerald-400 font-semibold">"{searchFilter}"</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(featureGroups).flat().filter(feat =>
                feat.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                feat.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
                feat.desc.toLowerCase().includes(searchFilter.toLowerCase())
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
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400 border-b border-[#162445] pb-2 font-mono">
              <span>Category: {groupKeys[activeTab]}</span>
              <span>{featureGroups[groupKeys[activeTab]]?.length} features in this group</span>
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

        {/* Submit Bar */}
        <div className="mt-8 pt-5 border-t border-[#1b2b4e] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            All 41 parameters validated for NSL-KDD pipeline inference
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg ${
              loading
                ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-300 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-glow-green hover:shadow-emerald-500/50 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Running ML Inference...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Traffic Packet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FeatureField({ feature, value, categoricalOptions, onChange }) {
  const isCategorical = feature.type === 'categorical';
  const isBinary = feature.type === 'binary';
  const options = isCategorical ? (categoricalOptions[feature.name] || feature.options) : feature.options;

  return (
    <div className="rounded-lg bg-[#0a1124] border border-[#1b2b4e] p-3.5 hover:border-[#2a4073] transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <label htmlFor={feature.name} className="text-xs font-medium text-slate-200">
          {feature.label}
        </label>
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help hover:text-slate-300" />
          <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 rounded bg-[#172445] border border-[#2b3e6d] text-[11px] text-slate-300 shadow-xl z-20 pointer-events-none">
            {feature.desc}
            <div className="mt-1 font-mono text-[10px] text-emerald-400">ID: {feature.name}</div>
          </div>
        </div>
      </div>

      <div className="font-mono text-[11px] text-slate-500 mb-2 truncate">
        {feature.name}
      </div>

      <div>
        {isCategorical ? (
          <select
            id={feature.name}
            value={value ?? feature.default}
            onChange={(e) => onChange(feature.name, e.target.value, 'categorical')}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#101b38] border border-[#223663] text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {options?.map((opt) => (
              <option key={opt} value={opt} className="bg-[#0e172e] text-slate-200">
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
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium border transition-all ${
                    isChecked
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-[#101a35] border-[#1f3056] text-slate-400 hover:bg-[#152347]'
                  }`}
                >
                  {val === 1 ? '1 (True)' : '0 (False)'}
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
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#101b38] border border-[#223663] text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        )}
      </div>
    </div>
  );
}
