import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Award, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Briefcase
} from 'lucide-react';

export default function Employees({ currentIndustry, showToast }) {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    email: '',
    department: '',
    role: '',
    industry_id: currentIndustry || 'hospital',
    experience_years: 2.0,
    max_weekly_hours: 40.0,
    hourly_rate: 25.0,
    attendance_rate: 0.95,
    manager_rating: 0.90
  });

  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillProficiency, setSkillProficiency] = useState(7);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees(currentIndustry);
      setEmployees(data);
      const sData = await api.getSkills(currentIndustry);
      setSkills(sData);
    } catch (err) {
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentIndustry]);

  const handleOpenAdd = () => {
    setCurrentEmployee(null);
    setFormData({
      employee_code: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      department: '',
      role: '',
      industry_id: currentIndustry || 'hospital',
      experience_years: 2.0,
      max_weekly_hours: 40.0,
      hourly_rate: 28.0,
      attendance_rate: 0.95,
      manager_rating: 0.90
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setCurrentEmployee(emp);
    setFormData({
      employee_code: emp.employee_code,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      industry_id: emp.industry_id,
      experience_years: emp.experience_years,
      max_weekly_hours: emp.max_weekly_hours,
      hourly_rate: emp.hourly_rate,
      attendance_rate: emp.attendance_rate,
      manager_rating: emp.manager_rating
    });
    setIsEditModalOpen(true);
  };

  const handleOpenSkillModal = (emp) => {
    setCurrentEmployee(emp);
    if (skills.length > 0) {
      setSelectedSkillId(skills[0].id);
    }
    setSkillProficiency(7);
    setIsSkillModalOpen(true);
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    try {
      if (currentEmployee) {
        await api.updateEmployee(currentEmployee.id, formData);
        showToast('Employee updated successfully', 'success');
      } else {
        await api.createEmployee(formData);
        showToast('Employee created successfully', 'success');
      }
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast('Error saving employee', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.deleteEmployee(id);
      showToast('Employee deleted', 'success');
      fetchEmployees();
    } catch (err) {
      showToast('Failed to delete employee', 'error');
    }
  };

  const handleAssignSkill = async (e) => {
    e.preventDefault();
    if (!currentEmployee || !selectedSkillId) return;
    try {
      await api.setEmployeeSkill(currentEmployee.id, selectedSkillId, skillProficiency);
      showToast('Skill proficiency updated', 'success');
      setIsSkillModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast('Error assigning skill', 'error');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage workforce profiles, frame slot limits, experience, and verified skill proficiencies.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, code, department or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredEmployees.length}</strong> employees
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Skills & Proficiencies</th>
                <th className="py-3 px-4">Weekly Workload</th>
                <th className="py-3 px-4">D-S Reliability</th>
                <th className="py-3 px-4">Absence Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading workforce records...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp.employee_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{emp.department}</div>
                      <div className="text-[11px] text-slate-500">{emp.role} • {emp.experience_years}y exp</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {emp.skills?.map((s) => (
                          <span 
                            key={s.id} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {s.name}
                            <span className="bg-blue-200 text-blue-900 px-1 rounded-sm">{s.proficiency_level}/10</span>
                          </span>
                        ))}
                        <button
                          onClick={() => handleOpenSkillModal(emp)}
                          title="Assign Skill"
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              emp.current_workload > emp.max_weekly_hours * 0.8 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, (emp.current_workload / emp.max_weekly_hours) * 100)}%` }}
                          />
                        </div>
                        <span className="font-medium text-slate-700 text-[11px]">
                          {emp.current_workload}h / {emp.max_weekly_hours}h
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <ShieldCheck className="w-3 h-3" />
                        {emp.reliability_pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.absence_risk > 0.20
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : emp.absence_risk > 0.12
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {(emp.absence_risk * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmitEmployee} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee Code</label>
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Role</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Weekly Hours</label>
              <input
                type="number"
                step="1"
                required
                value={formData.max_weekly_hours}
                onChange={(e) => setFormData({ ...formData, max_weekly_hours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attendance Rate (0-1)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                required
                value={formData.attendance_rate}
                onChange={(e) => setFormData({ ...formData, attendance_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manager Rating (0-1)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                required
                value={formData.manager_rating}
                onChange={(e) => setFormData({ ...formData, manager_rating: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Skill Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title={`Assign Skill to ${currentEmployee?.name}`}
      >
        <form onSubmit={handleAssignSkill} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Skill</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Proficiency Level (1 - 10)</label>
              <span className="font-bold text-blue-600 text-sm">{skillProficiency} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={skillProficiency}
              onChange={(e) => setSkillProficiency(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 - Novice</span>
              <span>5 - Intermediate</span>
              <span>10 - Expert Lead</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSkillModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Update Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
