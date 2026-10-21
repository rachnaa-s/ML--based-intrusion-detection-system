import React from 'react';
import { X, BookOpen, Layers, Shield, Cpu, ExternalLink, CheckCircle } from 'lucide-react';

export default function DatasetInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0c1429] border border-[#1e3059] shadow-2xl p-6 sm:p-8 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#142142] hover:bg-[#1b2b54] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
              Project Architecture & Dataset Reference
            </span>
            <h2 className="text-xl font-bold text-white">
              NSL-KDD Machine Learning Intrusion Detection
            </h2>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-xs leading-relaxed text-slate-300">
          {/* 1. Dataset Overview */}
          <div className="p-4 rounded-xl bg-[#080d1a] border border-[#172545]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2 font-mono">
              <Layers className="w-4 h-4 text-cyan-400" />
              1. The NSL-KDD Benchmark Dataset
            </h3>
            <p>
              The <strong>NSL-KDD</strong> dataset is an improved benchmark revision of the DARPA / KDD Cup 99 dataset, developed by the University of New Brunswick (UNB). It eliminated redundant and duplicate records that previously biased machine learning classifiers toward frequent records, providing a reliable standard for IDS evaluation.
            </p>
          </div>

          {/* 2. 41 Features Breakdown */}
          <div className="p-4 rounded-xl bg-[#080d1a] border border-[#172545]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2 font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              2. Feature Composition (41 Features Total)
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Basic Connection Features (9):</strong> Protocol type (tcp/udp/icmp), Service (70 types), Flag (11 connection statuses), Duration, Source & Dest Bytes, Land flag, Wrong fragments, Urgent packets.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Content Features (13):</strong> Failed logins, logged_in status, root shell attempts, su commands, file creations, guest logins, compromised status.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Time-Based Traffic Features (9):</strong> Past 2-second connection counts, SYN error rate (serror_rate), REJ error rate, same-service and diff-service rates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Host-Based Traffic Features (10):</strong> 100-connection window metrics including destination host counts, same-source port rates, and host-level error distributions.</span>
              </li>
            </ul>
          </div>

          {/* 3. Machine Learning Pipeline */}
          <div className="p-4 rounded-xl bg-[#080d1a] border border-[#172545]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2 font-mono">
              <Cpu className="w-4 h-4 text-indigo-400" />
              3. Trained Model Pipeline Architecture
            </h3>
            <p className="mb-2">
              The model file <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded">ids_model.pkl</code> consists of an end-to-end Scikit-Learn Pipeline:
            </p>
            <div className="p-3 rounded-lg bg-[#0f172a] font-mono text-[11px] text-slate-300 space-y-1">
              <div>&bull; Step 1: <span className="text-cyan-300">preprocessing (ColumnTransformer)</span></div>
              <div className="pl-4">&rarr; OneHotEncoder for 3 categorical features (<code className="text-emerald-400">protocol_type</code>, <code className="text-emerald-400">service</code>, <code className="text-emerald-400">flag</code>)</div>
              <div className="pl-4">&rarr; Passthrough for 38 numerical features</div>
              <div>&bull; Step 2: <span className="text-cyan-300">classifier (DecisionTreeClassifier)</span></div>
              <div className="pl-4">&rarr; Binary classification: <span className="text-emerald-400">0 (Normal)</span> vs <span className="text-rose-400">1 (Intrusion)</span></div>
            </div>
          </div>

          {/* 4. Academic Prototype Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90">
            <span className="font-bold text-amber-400 block mb-1 font-mono uppercase">
              Notice: Academic Prototype
            </span>
            This application is an educational and laboratory prototype designed to evaluate machine learning intrusion detection algorithms on benchmark network feature vectors. It does not automatically sniff real hardware network interfaces.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-[#1b2b4e] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-glow-green transition-all"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
