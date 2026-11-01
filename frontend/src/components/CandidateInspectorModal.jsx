import React from 'react';
import Modal from './Modal';
import { 
  CheckCircle2, 
  XCircle, 
  Brain, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  BarChart2,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';

export default function CandidateInspectorModal({ isOpen, onClose, data, loading }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Scheduling Decision & Mathematical Inspector" maxWidth="max-w-4xl">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Executing AI Reasoning Engine & Solvers...</p>
        </div>
      ) : !data ? (
        <p className="text-sm text-slate-500 py-6 text-center">No audit data available for this candidate.</p>
      ) : (
        <div className="space-y-6">
          {/* Top Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            data.is_eligible 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {data.is_eligible ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-semibold text-base">
                  {data.is_eligible ? 'Eligible Candidate for Assignment' : 'Candidate Ineligible / Disqualified'}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  {data.is_eligible 
                    ? 'All CSP hard constraints and propositional logic clauses satisfied.' 
                    : `Violations: ${data.violations?.join(', ')}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider block opacity-70">Expert Verdict</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/80 shadow-sm mt-1">
                {data.expert_system?.recommendation || 'VERIFIED'}
              </span>
            </div>
          </div>

          {/* Grid: CSP vs Propositional Logic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSP Constraints */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h5 className="text-sm font-bold text-slate-800">1. CSP Constraint Filtering</h5>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  {data.satisfactions?.skill ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span><strong>Skill Match:</strong> {data.satisfactions?.skill || data.violations?.find(v => v.includes('skill'))}</span>
                </li>
                <li className="flex items-start gap-2">
                  {data.satisfactions?.leave ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span><strong>Leave Constraint:</strong> {data.satisfactions?.leave || data.violations?.find(v => v.includes('leave'))}</span>
                </li>
                <li className="flex items-start gap-2">
                  {data.satisfactions?.availability ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span><strong>Availability:</strong> {data.satisfactions?.availability || data.violations?.find(v => v.includes('avail'))}</span>
                </li>
                <li className="flex items-start gap-2">
                  {data.satisfactions?.hours ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span><strong>Max Working Hours:</strong> {data.satisfactions?.hours || data.violations?.find(v => v.includes('Workload'))}</span>
                </li>
              </ul>
            </div>

            {/* Propositional Logic */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-indigo-600" />
                <h5 className="text-sm font-bold text-slate-800">2. Propositional Logic Verification</h5>
              </div>
              <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 mb-2">
                {data.propositional_logic?.formula}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {Object.entries(data.propositional_logic?.truth_assignment || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100">
                    <span className="text-slate-600">{key}:</span>
                    <span className={`font-semibold ${val ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {val ? 'TRUE' : 'FALSE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistical Reasoning Grid */}
          <div className="border-t border-slate-200 pt-4">
            <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              3. Statistical & Probabilistic Reasoning Outputs
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Fuzzy Score */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-700 uppercase">Fuzzy Suitability</span>
                <div className="mt-1 text-2xl font-black text-blue-900">
                  {data.fuzzy_logic?.suitability_score} <span className="text-xs font-normal text-blue-600">/ 100</span>
                </div>
                <p className="text-[11px] text-blue-700/80 mt-1">
                  Inputs: Skill {data.fuzzy_logic?.input_skill}/10, Workload {data.fuzzy_logic?.input_workload}h
                </p>
              </div>

              {/* Certainty Factor */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="text-[11px] font-semibold text-purple-700 uppercase">Certainty Factor (MYCIN)</span>
                <div className="mt-1 text-2xl font-black text-purple-900">
                  {data.certainty_factor?.value}
                </div>
                <p className="text-[11px] text-purple-700/80 mt-1">
                  Rule confidence combined
                </p>
              </div>

              {/* Bayes Absence */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700 uppercase">Bayes Absence Prob</span>
                <div className="mt-1 text-2xl font-black text-amber-900">
                  {(data.bayes_absence?.absence_probability * 100).toFixed(1)}%
                </div>
                <p className="text-[11px] text-amber-700/80 mt-1">
                  Prior absence updated by evidence
                </p>
              </div>

              {/* Dempster-Shafer */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase">D-S Reliability</span>
                <div className="mt-1 text-2xl font-black text-emerald-900">
                  {data.dempster_shafer?.reliability_pct}%
                </div>
                <p className="text-[11px] text-emerald-700/80 mt-1">
                  Belief: {data.dempster_shafer?.belief}, Plaus: {data.dempster_shafer?.plausibility}
                </p>
              </div>
            </div>
          </div>

          {/* Bayesian Network Risk Analysis */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              4. Bayesian Network Shift Uncovered Risk
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500">Uncovered Risk WITHOUT Backup:</span>
                <div className="text-lg font-bold text-rose-600 mt-1">
                  {(data.bayesian_network?.risk_uncovered_no_backup * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-400">Shift remains vulnerable if primary worker is absent</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500">Uncovered Risk WITH Backup Assigned:</span>
                <div className="text-lg font-bold text-emerald-600 mt-1">
                  {(data.bayesian_network?.risk_uncovered_with_backup * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-400">Backup worker mitigates shift uncovered vulnerability</span>
              </div>
            </div>
          </div>

          {/* Frame Representation & Expert Rules */}
          <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expert System Rules */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Expert System Rule Activations
              </h5>
              <div className="space-y-2">
                {data.expert_system?.fired_rules?.map((rule, idx) => (
                  <div key={idx} className="text-xs p-2 rounded bg-slate-50 border border-slate-100 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{rule.rule_name}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">{rule.explanation}</p>
                    </div>
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      rule.delta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rule.delta >= 0 ? `+${rule.delta}` : rule.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Slots */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                Frame Knowledge Representation
              </h5>
              <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Frame Name:</span>
                  <span className="font-bold text-slate-800">{data.frame_representation?.employee_frame?.frame_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Max Hours (Facet):</span>
                  <span>{data.frame_representation?.employee_frame?.slots?.max_weekly_hours}h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Current Workload:</span>
                  <span>{data.frame_representation?.employee_frame?.slots?.current_workload}h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Remaining Hours (if-needed):</span>
                  <span className="text-blue-600 font-bold">{data.frame_representation?.employee_frame?.slots?.remaining_hours}h</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Dynamic Fatigue (if-needed):</span>
                  <span className="text-amber-600">{Number(data.frame_representation?.employee_frame?.slots?.fatigue_index || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
