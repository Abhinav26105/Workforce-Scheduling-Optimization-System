import React from 'react';
import { 
  Building2, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ShoppingBag, 
  Headphones, 
  Factory,
  Database
} from 'lucide-react';

export default function Navbar({ 
  currentIndustry, 
  onSelectIndustry, 
  onResetSeed, 
  onGenerateClick,
  coverageRate = 0
}) {
  const industries = [
    { id: 'hospital', name: 'Hospital & Healthcare', icon: Activity },
    { id: 'retail', name: 'Retail Store', icon: ShoppingBag },
    { id: 'callcenter', name: 'Call Centre', icon: Headphones },
    { id: 'factory', name: 'Factory & Assembly', icon: Factory },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
      {/* Left: Brand & Industry Presets */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm tracking-tight leading-none">
              Workforce Scheduling
            </h1>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Optimization AI System
            </span>
          </div>
        </div>

        {/* Industry Switcher Buttons */}
        <div className="hidden lg:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {industries.map((ind) => {
            const Icon = ind.icon;
            const isSelected = currentIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => onSelectIndustry(ind.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                {ind.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Actions and Live Coverage Status */}
      <div className="flex items-center gap-3">
        {/* Coverage Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 border border-blue-200/60 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-900">Coverage: {coverageRate}%</span>
        </div>

        {/* Reset Database Seed Button */}
        <button
          onClick={onResetSeed}
          title="Reset sample seed database"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset Seed</span>
        </button>

        {/* Quick Generate AI Schedule */}
        <button
          onClick={onGenerateClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Schedule</span>
        </button>
      </div>
    </header>
  );
}
