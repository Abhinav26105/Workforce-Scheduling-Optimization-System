import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Calendar as CalendarIcon, 
  Download, 
  RotateCcw, 
  Filter, 
  Eye, 
  Clock, 
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function RosterCalendar({ 
  currentIndustry, 
  showToast, 
  onInspectCandidate, 
  onScheduleUpdated 
}) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentSchedule(currentIndustry);
      setSchedules(data);
    } catch (err) {
      showToast('Error loading schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentIndustry]);

  // Group schedules by date
  const groupedByDate = schedules.reduce((acc, curr) => {
    if (departmentFilter !== 'ALL' && curr.shift_dept !== departmentFilter) {
      return acc;
    }
    if (!acc[curr.date]) {
      acc[curr.date] = [];
    }
    acc[curr.date].push(curr);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort();

  // Unique departments for filter
  const departments = ['ALL', ...new Set(schedules.map(s => s.shift_dept).filter(Boolean))];

  const handleExportCsv = () => {
    const url = api.exportScheduleCsvUrl(currentIndustry);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Roster Calendar & Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly roster view showing assigned workers, standby coverage, and shift timings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-600">Morning (Day)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600">Afternoon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-slate-600">Night</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Backup Assigned</span>
          </div>
        </div>
      </div>

      {/* Calendar Columns by Date */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading roster calendar...</div>
      ) : dates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No Assignments on Record</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Navigate to 'AI Schedule Generator' to assign workforce staff using the AI engine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dates.map((dateStr) => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const items = groupedByDate[dateStr] || [];

            return (
              <div 
                key={dateStr}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Date Header */}
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-800">{dayName}</span>
                    <span className="text-xs text-slate-500 ml-1.5">{monthDay}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {items.length} Shifts
                  </span>
                </div>

                {/* Shift Cards */}
                <div className="p-3 space-y-2.5 flex-1">
                  {items.map((asgn) => {
                    const isMorning = asgn.shift_type === 'MORNING';
                    const isAfternoon = asgn.shift_type === 'AFTERNOON';
                    const isNight = asgn.shift_type === 'NIGHT';

                    const borderClass = isMorning 
                      ? 'border-l-amber-400' 
                      : isAfternoon 
                        ? 'border-l-blue-500' 
                        : 'border-l-indigo-600';

                    return (
                      <div
                        key={asgn.id}
                        className={`p-3 rounded-xl border border-slate-200/70 border-l-4 bg-slate-50/50 hover:bg-slate-50 transition-colors ${borderClass} space-y-2`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {asgn.shift_dept} • {asgn.shift_type}
                            </span>
                            <h5 className="font-semibold text-xs text-slate-800 leading-tight">
                              {asgn.shift_name}
                            </h5>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {asgn.start_time}-{asgn.end_time}
                          </span>
                        </div>

                        {/* Assignee Box */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {asgn.employee_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 flex items-center gap-1">
                                {asgn.employee_name}
                                {asgn.is_backup === 1 && (
                                  <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                                    BACKUP
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {asgn.employee_role}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onInspectCandidate(asgn.employee_id, asgn.shift_id)}
                            title="Inspect AI Decision"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
