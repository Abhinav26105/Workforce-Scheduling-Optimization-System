import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import CandidateInspectorModal from './components/CandidateInspectorModal';

import Dashboard from './pages/Dashboard';
import GenerateSchedule from './pages/GenerateSchedule';
import RosterCalendar from './pages/RosterCalendar';
import Analytics from './pages/Analytics';
import Employees from './pages/Employees';
import Skills from './pages/Skills';
import Shifts from './pages/Shifts';
import AvailabilityLeave from './pages/AvailabilityLeave';
import TestingSuite from './pages/TestingSuite';

import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentIndustry, setCurrentIndustry] = useState('hospital');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Candidate Inspector Modal
  const [inspectorData, setInspectorData] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await api.getDashboardStats(currentIndustry);
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentIndustry]);

  const handleInspectCandidate = async (employeeId, shiftId) => {
    setIsInspectorOpen(true);
    setInspectorLoading(true);
    try {
      const data = await api.explainCandidate(employeeId, shiftId);
      setInspectorData(data);
    } catch (err) {
      showToast('Error loading candidate inspection', 'error');
      setIsInspectorOpen(false);
    } finally {
      setInspectorLoading(false);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset the database to clean sample data for all 4 industries?')) return;
    try {
      await api.resetSeed();
      showToast('Database reset with sample data for all 4 industries', 'success');
      fetchStats();
    } catch (err) {
      showToast('Failed to reset database', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        currentIndustry={currentIndustry}
        onSelectIndustry={setCurrentIndustry}
        onResetSeed={handleResetSeed}
        onGenerateClick={() => setCurrentTab('generate')}
        coverageRate={stats?.coverage_rate || 0}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              loading={statsLoading}
              onNavigate={setCurrentTab}
              onInspectCandidate={handleInspectCandidate}
            />
          )}

          {currentTab === 'generate' && (
            <GenerateSchedule
              currentIndustry={currentIndustry}
              showToast={showToast}
              onInspectCandidate={handleInspectCandidate}
              onScheduleGenerated={fetchStats}
            />
          )}

          {currentTab === 'roster' && (
            <RosterCalendar
              currentIndustry={currentIndustry}
              showToast={showToast}
              onInspectCandidate={handleInspectCandidate}
              onScheduleUpdated={fetchStats}
            />
          )}

          {currentTab === 'analytics' && (
            <Analytics
              currentIndustry={currentIndustry}
              showToast={showToast}
            />
          )}

          {currentTab === 'employees' && (
            <Employees
              currentIndustry={currentIndustry}
              showToast={showToast}
            />
          )}

          {currentTab === 'skills' && (
            <Skills
              currentIndustry={currentIndustry}
              showToast={showToast}
            />
          )}

          {currentTab === 'shifts' && (
            <Shifts
              currentIndustry={currentIndustry}
              showToast={showToast}
            />
          )}

          {currentTab === 'leaves' && (
            <AvailabilityLeave
              currentIndustry={currentIndustry}
              showToast={showToast}
            />
          )}

          {currentTab === 'tests' && (
            <TestingSuite
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Candidate Mathematical Proof Inspector Modal */}
      <CandidateInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        data={inspectorData}
        loading={inspectorLoading}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
