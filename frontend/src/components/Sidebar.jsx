import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Users, 
  Award, 
  Clock, 
  CalendarOff, 
  CheckCheck,
  Building2,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generate', label: 'AI Schedule Generator', icon: Sparkles, highlight: true },
    { id: 'roster', label: 'Roster Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics & Risk Reports', icon: BarChart3 },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'skills', label: 'Skills & Proficiencies', icon: Award },
    { id: 'shifts', label: 'Shift Management', icon: Clock },
    { id: 'leaves', label: 'Availability & Leaves', icon: CalendarOff },
    { id: 'tests', label: 'AI Test Suite (Phase 7)', icon: CheckCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      {/* Menu List */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Navigation
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? 'text-blue-600' 
                    : item.highlight 
                      ? 'text-amber-500' 
                      : 'text-slate-400'
                }`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Info Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            AI Reasoning Engine
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Greedy Best-First, BFS, DFS, CSP, Logic, Bayes, Fuzzy, MYCIN, D-S & Frames.
          </p>
        </div>
      </div>
    </aside>
  );
}
