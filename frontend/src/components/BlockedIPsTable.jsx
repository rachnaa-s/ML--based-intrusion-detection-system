import React, { useState } from 'react';
import { ShieldBan, Trash2, Plus, Download, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function BlockedIPsTable({ blockedIPs, onUnblockIP, onBlockIP }) {
  const [manualIP, setManualIP] = useState('');
  const [manualReason, setManualReason] = useState('Manual SOC Intervention');
  const [inputError, setInputError] = useState('');

  const handleManualAdd = (e) => {
    e.preventDefault();
    const trimmed = manualIP.trim();
    if (!trimmed) {
      setInputError('Please enter a valid IP address.');
      return;
    }
    // Simple IP regex check
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(trimmed)) {
      setInputError('Format must be a valid IPv4 (e.g. 192.168.1.105)');
      return;
    }
    if (blockedIPs.some(b => b.ip === trimmed)) {
      setInputError('This IP is already in the blocked blacklist.');
      return;
    }

    setInputError('');
    onBlockIP(trimmed, manualReason);
    setManualIP('');
  };

  const exportRules = () => {
    if (blockedIPs.length === 0) return;
    const ruleText = blockedIPs.map(r => `iptables -A INPUT -s ${r.ip} -j DROP # Rule: ${r.id} | Reason: ${r.reason} | Blocked: ${r.timestamp}`).join('\n');
    const blob = new Blob([ruleText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firewall_rules_${new Date().toISOString().slice(0, 10)}.rules`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-xl bg-[#0d162d] border border-[#1b2b4e] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-[#1b2b4e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a1226]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldBan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Firewall Blacklist & Human-in-the-Loop IP Blocker
              <span className="text-xs font-mono font-normal text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                {blockedIPs.length} Blocked
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Human analyst intervention console: block malicious IPs after ML detection or add manual drop rules
            </p>
          </div>
        </div>

        {blockedIPs.length > 0 && (
          <button
            onClick={exportRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142142] hover:bg-[#1b2c59] border border-[#233766] text-xs font-medium text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
            title="Export Linux iptables firewall rules file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Firewall Rules</span>
          </button>
        )}
      </div>

      {/* Manual Add IP Form */}
      <div className="p-4 bg-[#0a1021] border-b border-[#182647]">
        <form onSubmit={handleManualAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter IP to block (e.g. 192.168.1.150)..."
              value={manualIP}
              onChange={(e) => { setManualIP(e.target.value); setInputError(''); }}
              className="w-full px-3 py-2 rounded-lg bg-[#111c38] border border-[#20335e] text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="sm:w-64">
            <input
              type="text"
              placeholder="Reason (e.g. Suspected DoS attack)..."
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111c38] border border-[#20335e] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-glow-red transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block Rule</span>
          </button>
        </form>
        {inputError && (
          <p className="text-[11px] font-mono text-rose-400 mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {inputError}
          </p>
        )}
      </div>

      {/* Table of Blocked IPs */}
      {blockedIPs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 font-mono">
          No IPs are currently blocked. When an intrusion is detected above, you can click <span className="text-rose-400 font-semibold">"Block IP Address"</span> to deploy a firewall rule.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090f1f] text-slate-400 border-b border-[#1b2b4e] uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Blocked IP</th>
                <th className="py-3 px-4">Threat / Reason</th>
                <th className="py-3 px-4">Enforcement Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Human Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162342]">
              {blockedIPs.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#111c38]/60 transition-colors">
                  <td className="py-3 px-4 text-cyan-400">{rule.id}</td>
                  <td className="py-3 px-4 font-bold text-rose-300 flex items-center gap-2">
                    <ShieldBan className="w-4 h-4 text-rose-500" />
                    <span>{rule.ip}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={rule.reason}>
                    {rule.reason}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                      DROP (Firewall Active)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{rule.timestamp}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onUnblockIP(rule.ip)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2a1520] hover:bg-[#3d1b2c] text-rose-300 hover:text-white border border-rose-900/50 text-[11px] transition-colors"
                      title="Unblock this IP and remove firewall drop rule"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>Unblock IP</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
