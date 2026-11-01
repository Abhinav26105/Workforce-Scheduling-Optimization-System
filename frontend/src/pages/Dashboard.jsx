import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  Eye
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Dashboard({ 
  stats, 
  loading, 
  onNavigate, 
  onInspectCandidate 
}) {
  const COLORS = ['#3b82f6', '#06b6d4', '#6366f1', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Scheduling Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time optimization metrics, constraint satisfaction status, and AI shift assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('generate')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Schedule</span>
          </button>
          <button
            onClick={() => onNavigate('roster')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>View Roster</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Employees"
          value={stats?.total_employees ?? '--'}
          subtitle={`${stats?.available_employees ?? 0} currently available`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Shifts"
          value={stats?.total_shifts ?? '--'}
          subtitle="Configured this period"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Assigned Shifts"
          value={stats?.assigned_shifts ?? '--'}
          subtitle="Primary workers assigned"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Pending Shifts"
          value={stats?.pending_shifts ?? '--'}
          subtitle="Uncovered shifts"
          icon={AlertCircle}
          color={stats?.pending_shifts > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Coverage Rate"
          value={`${stats?.coverage_rate ?? 0}%`}
          subtitle="Shift fulfillment goal"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Employee Workload Distribution</h3>
              <p className="text-xs text-slate-500">Assigned hours vs 40h weekly limit</p>
            </div>
            <span className="text-xs font-medium text-slate-400">Hours / Week</span>
          </div>

          <div className="h-64 w-full">
            {stats?.workload_chart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.workload_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 48]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(val, name, item) => [`${val} hrs (${item.payload.department})`, 'Assigned Workload']}
                  />
                  <Bar dataKey="assigned_hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active schedule assignments. Click 'Generate Schedule' to start.
              </div>
            )}
          </div>
        </div>

        {/* Shift Type Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Shift Types Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution by time of day</p>

            <div className="h-44 w-full flex items-center justify-center">
              {stats?.shift_types?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.shift_types}
                      dataKey="count"
                      nameKey="shift_type"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {stats.shift_types.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No shift data available</div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            {stats?.shift_types?.map((st, i) => (
              <div key={st.shift_type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 capitalize">{st.shift_type.toLowerCase()}</span>
                </div>
                <span className="font-semibold text-slate-800">{st.count} shifts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Status / AI Recommendations Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Scheduling Engine Status
            </div>
            <h3 className="text-lg font-bold">
              {stats?.pending_shifts === 0 
                ? 'All Shifts Fully Optimized & Covered' 
                : `${stats?.pending_shifts} Shifts Need AI Generation`}
            </h3>
            <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
              Greedy Best-First Search with CSP forward-checking prioritizes high-difficulty shifts,
              while Bayes absence models and Dempster-Shafer reliability provide standby backup protection.
            </p>
          </div>
          <button
            onClick={() => onNavigate('generate')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-950 hover:bg-blue-50 font-semibold text-xs rounded-xl shadow transition-all self-start md:self-auto shrink-0"
          >
            <span>Run Schedule Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
