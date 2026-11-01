import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  CheckCheck, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  Cpu,
  BarChart2,
  Brain
} from 'lucide-react';

export default function TestingSuite({ showToast }) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);

  const runTests = async () => {
    setLoading(true);
    try {
      const data = await api.runTests();
      setTestData(data);
      setLastRunTime(new Date().toLocaleTimeString());
      if (data.all_passed) {
        showToast('All 8 Phase 7 tests passed successfully!', 'success');
      } else {
        showToast(`Test suite finished: ${data.passed_count}/${data.total_tests} passed`, 'info');
      }
    } catch (err) {
      showToast('Error running test suite', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Testing & Validation Suite (Phase 7)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated verification of the 8 mandatory test cases defined in the PBL Report.
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Executing Tests...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Automated Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Status Banner */}
      <div className={`p-6 rounded-2xl border ${
        testData?.all_passed 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      } shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              testData?.all_passed ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
            }`}>
              {testData?.all_passed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {testData?.all_passed 
                  ? 'All 8 Specification Tests PASSED' 
                  : `${testData?.passed_count ?? 0} of ${testData?.total_tests ?? 8} Tests Passed`}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                Exact numerical matching for Fuzzy (66.7), Certainty Factors (0.81), Bayes (0.182), CSP constraints, and zero invalid assignments.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-semibold block opacity-70">
              {lastRunTime ? `Last executed at ${lastRunTime}` : 'Executing...'}
            </span>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-white/80 shadow-sm">
              Status: {testData?.all_passed ? '100% VERIFIED' : 'ATTENTION NEEDED'}
            </span>
          </div>
        </div>
      </div>

      {/* Test Cases Cards List */}
      <div className="space-y-3">
        {testData?.results?.map((t, idx) => (
          <div
            key={t.test_id || idx}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {t.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {idx + 1}. {t.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    [{t.test_id}]
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {t.details}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                t.passed 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {t.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Numerical Benchmark Verification Note */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          PBL Report Numerical Proof Reference:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-blue-600 font-bold block">Fuzzy Logic Test</span>
            Skill 7, Workload 24h &rarr; <strong>66.7</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-purple-600 font-bold block">Certainty Factor Test</span>
            Combined CF &rarr; <strong>0.81</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-amber-600 font-bold block">Bayes Theorem Test</span>
            P(A | E) &rarr; <strong>0.182</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
