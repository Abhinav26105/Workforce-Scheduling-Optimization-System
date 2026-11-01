import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Award, Plus, Search, Tag, BookOpen, Layers } from 'lucide-react';

export default function Skills({ currentIndustry, showToast }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Medical',
    industry_id: currentIndustry || 'hospital',
    description: ''
  });

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await api.getSkills(currentIndustry);
      setSkills(data);
    } catch (err) {
      showToast('Failed to load skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    setFormData(prev => ({ ...prev, industry_id: currentIndustry || 'hospital' }));
  }, [currentIndustry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createSkill(formData);
      showToast('Skill created successfully', 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        category: 'General',
        industry_id: currentIndustry || 'hospital',
        description: ''
      });
      fetchSkills();
    } catch (err) {
      showToast('Failed to create skill', 'error');
    }
  };

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Skills & Domain Competencies</h2>
          <p className="text-xs text-slate-500 mt-1">
            Define mandatory and specialized competencies used by CSP constraint solvers and Fuzzy matchers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Skill</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills by name, category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredSkills.length}</strong> active competencies
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">No skills configured.</div>
        ) : (
          filteredSkills.map((skill) => (
            <div 
              key={skill.id} 
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                    <Tag className="w-3 h-3" />
                    {skill.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: #{skill.id}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{skill.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {skill.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Industry: <strong className="text-slate-700 capitalize">{skill.industry_id}</strong>
                </span>
                <span className="font-semibold text-blue-600">Active CSP Node</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Skill Competency"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Triage Life Support or CNC Metrology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                required
                placeholder="e.g., Clinical, Operations, Safety"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Preset</label>
              <select
                value={formData.industry_id}
                onChange={(e) => setFormData({ ...formData, industry_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="hospital">Hospital & Healthcare</option>
                <option value="retail">Retail Store</option>
                <option value="callcenter">Call Centre</option>
                <option value="factory">Factory & Assembly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Requirements</label>
            <textarea
              rows="3"
              placeholder="Describe requirements and operational scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
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
              Save Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
