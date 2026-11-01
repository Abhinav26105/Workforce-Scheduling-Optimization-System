import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { 
  CalendarOff, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  UserCheck, 
  AlertTriangle 
} from 'lucide-react';

export default function AvailabilityLeave({ currentIndustry, showToast }) {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'APPROVED'
  });

  const [availForm, setAvailForm] = useState({
    employee_id: '',
    day_of_week: 0,
    preferred_shift_type: 'ANY'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lData, eData, aData] = await Promise.all([
        api.getLeaves(),
        api.getEmployees(currentIndustry),
        api.getAvailabilities()
      ]);
      setLeaves(lData);
      setEmployees(eData);
      setAvailabilities(aData);
      if (eData.length > 0) {
        setLeaveForm(prev => ({ ...prev, employee_id: eData[0].id }));
        setAvailForm(prev => ({ ...prev, employee_id: eData[0].id }));
      }
    } catch (err) {
      showToast('Error loading leave and availability data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentIndustry]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      await api.createLeave(leaveForm);
      showToast('Leave request recorded', 'success');
      setIsLeaveModalOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to record leave', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateLeaveStatus(id, status);
      showToast(`Leave status marked as ${status}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleSubmitAvail = async (e) => {
    e.preventDefault();
    try {
      await api.setAvailability(availForm);
      showToast('Availability rule updated', 'success');
      setIsAvailModalOpen(false);
      fetchData();
    } catch (err) {
      showToast('Error saving availability', 'error');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Availability & Leave Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain active leave requests and shift preference constraints enforced by the CSP engine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <CalendarOff className="w-3.5 h-3.5" />
            <span>Record Leave</span>
          </button>
          <button
            onClick={() => setIsAvailModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Set Availability</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Leave Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Approved & Pending Leave Requests</h3>
            <span className="text-xs text-slate-400">Hard CSP Constraint</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">CSP Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No active leave requests.</td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/75">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{leave.employee_name}</div>
                        <div className="text-[11px] text-slate-400">{leave.department} ({leave.employee_code})</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {leave.start_date} <span className="text-slate-400">to</span> {leave.end_date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {leave.reason || 'Personal / General Leave'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          leave.status === 'APPROVED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : leave.status === 'REJECTED'
                              ? 'bg-slate-50 text-slate-600 border border-slate-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {leave.status === 'APPROVED' && <XCircle className="w-3 h-3 text-rose-600" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {leave.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                          {leave.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-[10px]"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right col: Weekly Availability Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Availability Preferences</h3>
              <p className="text-xs text-slate-500">Day-of-week shift type filters</p>
            </div>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {availabilities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No specific restrictions set.</p>
            ) : (
              availabilities.map((avail) => {
                const emp = employees.find(e => e.id === avail.employee_id);
                return (
                  <div key={avail.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{emp?.name || `Emp #${avail.employee_id}`}</div>
                      <div className="text-[11px] text-slate-500">{daysOfWeek[avail.day_of_week]}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      avail.preferred_shift_type === 'UNAVAILABLE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {avail.preferred_shift_type}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Record Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Record Employee Leave Request"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee</label>
            <select
              value={leaveForm.employee_id}
              onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code} - {emp.department})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={leaveForm.start_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={leaveForm.end_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Leave Reason</label>
            <input
              type="text"
              placeholder="e.g. Medical Appointment or Annual Leave"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Approval Status</label>
            <select
              value={leaveForm.status}
              onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="APPROVED">APPROVED (Active CSP Ineligibility)</option>
              <option value="PENDING">PENDING (Review needed)</option>
              <option value="REJECTED">REJECTED (Candidate remains available)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
            >
              Confirm Leave
            </button>
          </div>
        </form>
      </Modal>

      {/* Set Availability Modal */}
      <Modal
        isOpen={isAvailModalOpen}
        onClose={() => setIsAvailModalOpen(false)}
        title="Set Employee Availability Preference"
      >
        <form onSubmit={handleSubmitAvail} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee</label>
            <select
              value={availForm.employee_id}
              onChange={(e) => setAvailForm({ ...availForm, employee_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
              <select
                value={availForm.day_of_week}
                onChange={(e) => setAvailForm({ ...availForm, day_of_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {daysOfWeek.map((d, idx) => (
                  <option key={idx} value={idx}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Type Preference</label>
              <select
                value={availForm.preferred_shift_type}
                onChange={(e) => setAvailForm({ ...availForm, preferred_shift_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="ANY">ANY (Available for all)</option>
                <option value="MORNING">MORNING Only</option>
                <option value="AFTERNOON">AFTERNOON Only</option>
                <option value="NIGHT">NIGHT Only</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Cannot work)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAvailModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Save Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
