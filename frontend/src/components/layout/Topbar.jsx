import React, { useState } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  Gauge, 
  Menu, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';
import LivePulse from '../brand/LivePulse';
import { acknowledgeAnomaly } from '../../services/api';

export default function Topbar({ 
  activeView, 
  onToggleMobileSidebar,
  onNavigateView 
}) {
  const { isDark, toggleTheme } = useTheme();
  const { 
    speedMultiplier, 
    changeSpeed, 
    isPaused, 
    togglePause, 
    recentAnomalies,
    unreadAlertsCount,
    setUnreadAlertsCount,
    addToast
  } = useSimulation();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  const viewTitles = {
    overview: 'Overview Dashboard',
    analytics: 'Energy Analytics',
    appliances: 'Appliance Management',
    insights: 'Smart Insights & Anomalies',
    billing: 'Electricity Bill Management',
    reports: 'Reports & Export',
    settings: 'System Settings',
  };

  const handleAcknowledge = async (id, e) => {
    e.stopPropagation();
    try {
      await acknowledgeAnomaly(id);
      setUnreadAlertsCount(prev => Math.max(0, prev - 1));
      addToast('Alert marked as acknowledged', 'success');
    } catch {
      // fallback
    }
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/80 dark:bg-brand-navy/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between">
      
      {/* Left: Mobile hamburger & View title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open mobile menu"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{viewTitles[activeView] || 'Dashboard'}</span>
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
            WattLume Digital Intelligence Platform • Simulated Smart Hub
          </p>
        </div>
      </div>

      {/* Right: Controls & Utilities */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        
        {/* Live Status Pulse */}
        <div className="hidden sm:block">
          <LivePulse isLive={!isPaused} label={isPaused ? "PAUSED" : "LIVE SIM"} />
        </div>

        {/* Simulation Speed & Pause Controls */}
        <div className="relative">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-navyLight p-1">
            <button
              onClick={togglePause}
              title={isPaused ? "Resume simulation" : "Pause simulation"}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                isPaused 
                  ? 'bg-amber-500/20 text-amber-500' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
              className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center gap-1"
            >
              <Gauge className="w-3.5 h-3.5 text-brand-cyan" />
              <span>{speedMultiplier}x</span>
            </button>
          </div>

          {/* Speed Selector Menu */}
          {speedDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    changeSpeed(s);
                    setSpeedDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 ${
                    speedMultiplier === s ? 'text-brand-cyan font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{s}x Speed</span>
                  {speedMultiplier === s && <Check className="w-3.5 h-3.5 text-brand-cyan" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-navyLight relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-coral text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-brand-coral" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Smart Anomaly Alerts
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {recentAnomalies.length} recorded
                </span>
              </div>

              <div className="py-2 divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                {recentAnomalies.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No active anomalies detected. Consumption within normal thresholds.
                  </p>
                ) : (
                  recentAnomalies.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setNotificationOpen(false);
                        onNavigateView('insights');
                      }}
                      className="py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-cyan transition-colors truncate max-w-[180px]">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-brand-coral font-bold tabular-nums">
                          +{item.percentage_deviation}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                        {item.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                        <span>{item.timestamp}</span>
                        {!item.acknowledged && (
                          <button
                            onClick={(e) => handleAcknowledge(item.id, e)}
                            className="text-brand-cyan hover:underline font-semibold"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 text-center">
                <button
                  onClick={() => {
                    setNotificationOpen(false);
                    onNavigateView('insights');
                  }}
                  className="text-xs font-bold text-brand-cyan hover:underline inline-flex items-center gap-1"
                >
                  <span>View All Alerts &amp; Baselines</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-navyLight transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-blue" />}
        </button>

        {/* Profile Badge */}
        <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white font-bold text-xs shadow-sm">
            WL
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Aravind S.
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Smart Home 3-BHK
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}
