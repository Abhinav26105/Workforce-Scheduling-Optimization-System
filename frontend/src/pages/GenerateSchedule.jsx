import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  Cpu, 
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function GenerateSchedule({ 
  currentIndustry, 
  showToast, 
  onInspectCandidate, 
  onScheduleGenerated 
}) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingShifts, setFetchingShifts] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('greedy');
  const [assignBackups, setAssignBackups] = useState(true);
  const [balanceWorkload, setBalanceWorkload] = useState(true);
  const [lastResult, setLastResult] = useState(null);

  const fetchShifts = async () => {
    setFetchingShifts(true);
    try {
      const data = await api.getShifts(currentIndustry);
      setShifts(data);
    } catch (err) {
      showToast('Error loading shifts', 'error');
    } finally {
      setFetchingShifts(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [currentIndustry]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await api.generateSchedule({
        industry_id: currentIndustry,
        algorithm: selectedAlgorithm,
        assign_backups: assignBackups,
        balance_workload: balanceWorkload
      });

      setLastResult(result);
      showToast(`Generated ${result.assigned_count} assignments successfully!`, 'success');
      if (onScheduleGenerated) {
        onScheduleGenerated();
      }
      fetchShifts();
    } catch (err) {
      showToast('Scheduling failed: ' + (err.message || 'Server error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all schedule assignments for this industry?')) return;
    try {
      await api.clearSchedule(currentIndustry);
      setLastResult(null);
      showToast('Schedule assignments cleared', 'success');
      if (onScheduleGenerated) onScheduleGenerated();
      fetchShifts();
    } catch (err) {
      showToast('Failed to clear schedule', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Schedule Generation Engine</h2>
          <p className="text-xs text-slate-500 mt-1">
            Solves multi-constraint workforce allocation using Greedy Best-First, BFS, DFS, and statistical uncertainty modeling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Assignments</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-md transition-all ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Schedule Optimizer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Configuration & Pipeline Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Algorithm Selector & Settings */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              1. Search Algorithm Selection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose search strategy to explore assignment search space</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Greedy Best-First Search */}
            <div
              onClick={() => setSelectedAlgorithm('greedy')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedAlgorithm === 'greedy'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">Greedy Best-First</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Primary</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Prioritizes difficult shifts with smallest eligible domains (MRV), assigning highest heuristic score.
              </p>
            </div>

            {/* Breadth-First Search (BFS) */}
            <div
              onClick={() => setSelectedAlgorithm('bfs')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedAlgorithm === 'bfs'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">BFS Search</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Level-wise</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Systematically explores employee combinations across shifts level-by-level for shallow optimal coverage.
              </p>
            </div>

            {/* Depth-First Search (DFS) */}
            <div
              onClick={() => setSelectedAlgorithm('dfs')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedAlgorithm === 'dfs'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">DFS + Backtrack</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Deep</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Explores complete assignment paths deeply with backtracking on constraint violation.
              </p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={assignBackups}
                onChange={(e) => setAssignBackups(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-800">Dynamic Standby Backups</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Designate second-best qualified backup worker for high-risk or critical shifts (Bayes absence &gt; 15%).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={balanceWorkload}
                onChange={(e) => setBalanceWorkload(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-800">Fair Workload Balancing</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Applies Expert System fairness penalties to prevent worker burnout and distribute hours equally.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Col: AI Pipeline Flow */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <Layers className="w-4 h-4" />
              AI Execution Pipeline
            </div>
            <ol className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/80 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-semibold text-white">CSP Hard Filtering</span>
                  <p className="text-[11px] text-slate-400">Skills, Leave, Availability, Max 40h</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/80 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-semibold text-white">Fuzzy Logic & Certainty Factor</span>
                  <p className="text-[11px] text-slate-400">Suitability (0-100) + MYCIN rule belief</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/80 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-semibold text-white">Bayes & Dempster-Shafer</span>
                  <p className="text-[11px] text-slate-400">Absence risk & multi-source reliability</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/80 text-[11px] font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="font-semibold text-white">Best-First Search Assignment</span>
                  <p className="text-[11px] text-slate-400">MRV heuristic with backup delegation</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Current Target: <strong>{shifts.length}</strong> shifts in <strong>{currentIndustry}</strong>
          </div>
        </div>
      </div>

      {/* Generated Assignments Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Generated AI Assignments</h3>
            <p className="text-xs text-slate-500">Live roster assignments backed by statistical proof</p>
          </div>
          {lastResult && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {lastResult.assigned_count} Assigned Successfully
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3 px-4">Shift Details</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4">Role / Type</th>
                <th className="py-3 px-4">Fuzzy Suitability</th>
                <th className="py-3 px-4">Certainty Factor</th>
                <th className="py-3 px-4">Absence Risk</th>
                <th className="py-3 px-4">D-S Reliability</th>
                <th className="py-3 px-4 text-right">Mathematical Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lastResult?.assigned?.length > 0 ? (
                lastResult.assigned.map((asgn, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{asgn.shift_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {asgn.date} • {asgn.shift_type} • {asgn.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{asgn.employee_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{asgn.employee_code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        asgn.is_backup === 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {asgn.is_backup === 1 ? 'Standby Backup' : 'Primary Assignee'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      {asgn.suitability_score} / 100
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-purple-700">
                      {asgn.certainty_factor}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        asgn.absence_risk > 0.18 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'
                      }`}>
                        {(asgn.absence_risk * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {asgn.reliability_score}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onInspectCandidate(asgn.employee_id, asgn.shift_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect AI</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Click <strong>'Run Schedule Optimizer'</strong> to generate shifts using the AI engine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unassigned Shifts / Rejections Audit */}
      {lastResult?.unassigned_shifts?.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Unassigned Shifts Audit & Disqualification Explanations
          </div>
          <div className="space-y-2 text-xs">
            {lastResult.unassigned_shifts.map((un, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-rose-100">
                <div className="font-semibold text-slate-800">{un.shift.name} ({un.shift.shift_code}) - {un.shift.date}</div>
                <div className="text-slate-500 mt-1">Rejection reasons:</div>
                <ul className="list-disc list-inside text-rose-700 mt-1 space-y-0.5">
                  {un.rejection_reasons?.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
