import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Award,
  Filter
} from 'lucide-react';

export default function Shifts({ currentIndustry, showToast }) {
  const [shifts, setShifts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  const [formData, setFormData] = useState({
    shift_code: '',
    name: '',
    shift_type: 'MORNING',
    department: '',
    industry_id: currentIndustry || 'hospital',
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '16:30',
    duration_hours: 8.0,
    required_skill_id: '',
    min_proficiency: 6,
    required_headcount: 1,
    difficulty_score: 6.5
  });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await api.getShifts(currentIndustry, dateFilter);
      setShifts(data);
      const sData = await api.getSkills(currentIndustry);
      setSkills(sData);
      if (sData.length > 0 && !formData.required_skill_id) {
        setFormData(prev => ({ ...prev, required_skill_id: sData[0].id }));
      }
    } catch (err) {
      showToast('Failed to load shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    setFormData(prev => ({
      ...prev,
      industry_id: currentIndustry || 'hospital',
      shift_code: `SH-${Math.floor(100 + Math.random() * 900)}`
    }));
  }, [currentIndustry, dateFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createShift(formData);
      showToast('Shift created successfully', 'success');
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      showToast('Error creating shift', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift? This will also remove any schedule assignments for it.')) return;
    try {
      await api.deleteShift(id);
      showToast('Shift deleted', 'success');
      fetchShifts();
    } catch (err) {
      showToast('Failed to delete shift', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shift Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure operational shifts, required headcount, difficulty ratings, and minimum skill bars.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shift</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-blue-600 font-medium hover:underline ml-2"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{shifts.length}</strong> configured shifts
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Department & Type</th>
                <th className="py-3 px-4">Required Skill & Level</th>
                <th className="py-3 px-4">Difficulty Score</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Coverage Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading shifts...</td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">No shifts found.</td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{shift.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{shift.shift_code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{shift.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {shift.start_time} - {shift.end_time} ({shift.duration_hours}h)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{shift.department}</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        shift.shift_type === 'MORNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : shift.shift_type === 'AFTERNOON'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}>
                        {shift.shift_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        {shift.required_skill_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Min Proficiency: <strong className="text-blue-600">{shift.min_proficiency}/10</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        shift.difficulty_score >= 8.0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : shift.difficulty_score >= 6.0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {shift.difficulty_score} / 10
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {shift.assignments?.map((a) => (
                          <div key={a.id} className="flex items-center gap-1.5 text-[11px]">
                            <span className={`w-1.5 h-1.5 rounded-full ${a.is_backup ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className="font-medium text-slate-700">{a.employee_name}</span>
                            {a.is_backup === 1 && (
                              <span className="text-[9px] font-bold px-1 rounded bg-amber-100 text-amber-800">BACKUP</span>
                            )}
                          </div>
                        ))}
                        {(!shift.assignments || shift.assignments.length === 0) && (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {shift.is_covered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Covered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shift Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Shift"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Code</label>
              <input
                type="text"
                required
                value={formData.shift_code}
                onChange={(e) => setFormData({ ...formData, shift_code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Name</label>
              <input
                type="text"
                required
                placeholder="e.g. ICU Night Intensive"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Type</label>
              <select
                value={formData.shift_type}
                onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="MORNING">MORNING (Day)</option>
                <option value="AFTERNOON">AFTERNOON (Evening)</option>
                <option value="NIGHT">NIGHT (Overnight)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                placeholder="e.g. ICU or Checkout"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mandatory Skill</label>
              <select
                value={formData.required_skill_id}
                onChange={(e) => setFormData({ ...formData, required_skill_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Proficiency (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={formData.min_proficiency}
                onChange={(e) => setFormData({ ...formData, min_proficiency: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Headcount Needed</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={formData.required_headcount}
                onChange={(e) => setFormData({ ...formData, required_headcount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Difficulty Score (1.0 - 10.0)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                required
                value={formData.difficulty_score}
                onChange={(e) => setFormData({ ...formData, difficulty_score: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Save Shift
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
