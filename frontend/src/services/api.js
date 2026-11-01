/**
 * Frontend API Service Layer
 * Connects to Python Flask backend at /api
 */

const BASE_URL = '/api';

export const api = {
  // Industries
  getIndustries: async () => {
    const res = await fetch(`${BASE_URL}/industries`);
    return res.json();
  },

  // Dashboard Stats
  getDashboardStats: async (industry) => {
    const query = industry ? `?industry=${industry}` : '';
    const res = await fetch(`${BASE_URL}/dashboard/stats${query}`);
    return res.json();
  },

  // Employees
  getEmployees: async (industry) => {
    const query = industry ? `?industry=${industry}` : '';
    const res = await fetch(`${BASE_URL}/employees${query}`);
    return res.json();
  },

  createEmployee: async (data) => {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateEmployee: async (id, data) => {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  setEmployeeSkill: async (empId, skillId, proficiencyLevel) => {
    const res = await fetch(`${BASE_URL}/employees/${empId}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill_id: skillId, proficiency_level: proficiencyLevel })
    });
    return res.json();
  },

  // Skills
  getSkills: async (industry) => {
    const query = industry ? `?industry=${industry}` : '';
    const res = await fetch(`${BASE_URL}/skills${query}`);
    return res.json();
  },

  createSkill: async (data) => {
    const res = await fetch(`${BASE_URL}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Shifts
  getShifts: async (industry, date) => {
    const params = new URLSearchParams();
    if (industry) params.append('industry', industry);
    if (date) params.append('date', date);
    const res = await fetch(`${BASE_URL}/shifts?${params.toString()}`);
    return res.json();
  },

  createShift: async (data) => {
    const res = await fetch(`${BASE_URL}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteShift: async (id) => {
    const res = await fetch(`${BASE_URL}/shifts/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Leaves & Availability
  getLeaves: async (empId) => {
    const query = empId ? `?employee_id=${empId}` : '';
    const res = await fetch(`${BASE_URL}/leaves${query}`);
    return res.json();
  },

  createLeave: async (data) => {
    const res = await fetch(`${BASE_URL}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateLeaveStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/leaves/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  getAvailabilities: async (empId) => {
    const query = empId ? `?employee_id=${empId}` : '';
    const res = await fetch(`${BASE_URL}/availabilities${query}`);
    return res.json();
  },

  setAvailability: async (data) => {
    const res = await fetch(`${BASE_URL}/availabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // AI Schedule Generation
  generateSchedule: async (params) => {
    const res = await fetch(`${BASE_URL}/schedule/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  getCurrentSchedule: async (industry, date) => {
    const params = new URLSearchParams();
    if (industry) params.append('industry', industry);
    if (date) params.append('date', date);
    const res = await fetch(`${BASE_URL}/schedule/current?${params.toString()}`);
    return res.json();
  },

  clearSchedule: async (industry) => {
    const query = industry ? `?industry=${industry}` : '';
    const res = await fetch(`${BASE_URL}/schedule/clear${query}`, {
      method: 'POST'
    });
    return res.json();
  },

  exportScheduleCsvUrl: (industry) => {
    return `${BASE_URL}/schedule/export-csv${industry ? `?industry=${industry}` : ''}`;
  },

  // Candidate AI Explanation Inspector
  explainCandidate: async (employeeId, shiftId) => {
    const res = await fetch(`${BASE_URL}/ai/explain-candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId, shift_id: shiftId })
    });
    return res.json();
  },

  // Automated Test Suite
  runTests: async () => {
    const res = await fetch(`${BASE_URL}/tests/run`);
    return res.json();
  },

  // Reset database seed
  resetSeed: async () => {
    const res = await fetch(`${BASE_URL}/admin/reset-seed`, {
      method: 'POST'
    });
    return res.json();
  }
};
