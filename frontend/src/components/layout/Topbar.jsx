import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Play,
  Pause,
  Menu,
  Check,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Settings,
  X,
  RotateCcw,
  Zap,
  Info,
  Home
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';
import LivePulse from '../brand/LivePulse';
import { acknowledgeAnomaly, resetSimulation, updateSimulationControl } from '../../services/api';

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
    addToast,
    refreshLive
  } = useSimulation();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sensitivity, setSensitivity] = useState(1.3);
  const [resetting, setResetting] = useState(false);

  const viewTitles = {
    overview: 'Overview',
    analytics: 'Analytics',
    appliances: 'Appliances',
    insights: 'Smart Insights',
    bills: 'Bills & Tariffs',
    reports: 'Compliance Reports',
    settings: 'Settings & Controls',
    // aliases
    usage: 'Analytics',
    billing: 'Bills & Tariffs',
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

  const handleSensitivityChange = async (val) => {
    setSensitivity(val);
    try {
      await updateSimulationControl({ anomaly_sensitivity: val });
      addToast(`Anomaly detection threshold adjusted to +${Math.round((val - 1.0) * 100)}%`, 'info');
    } catch {
      // fallback
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to re-seed the simulation database? This will purge all records and regenerate 60 days of realistic simulated energy data in SQLite.")) {
      return;
    }
    setResetting(true);
    try {
      await resetSimulation();
      addToast("Database re-seeded with fresh 60 days of simulated energy telemetry", "success");
      refreshLive();
      setSettingsOpen(false);
    } catch (err) {
      addToast("Failed to reset database", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/60 dark:bg-[#101B2D]/75 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_10px_rgba(0,0,0,0.02)]">

      {/* Left: Mobile Menu & View title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open mobile navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">WattLume /</span>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              {viewTitles[activeView] || 'Overview'}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Controls & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Live Simulation Badge */}
        <div className="hidden sm:block">
          <LivePulse isLive={!isPaused} label={isPaused ? "PAUSED" : "SIMULATED TELEMETRY"} />
        </div>

        {/* Simulation Speed Controls */}
        <div className="relative">
          <div className="flex items-center rounded-full glass-pill p-0.5">
            <button
              onClick={togglePause}
              title={isPaused ? "Resume simulation" : "Pause simulation"}
              className={`p-1.5 rounded-full text-xs font-semibold flex items-center transition-colors ${
                isPaused
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
              className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 flex items-center gap-1"
              title="Simulation speed multiplier"
            >
              <span>{speedMultiplier}x</span>
            </button>
          </div>

          {/* Speed Selector Dropdown */}
          {speedDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-2xl glass-panel-elevated py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-xl border border-white/60 dark:border-white/10">
              <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                Sim Speed
              </div>
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    changeSpeed(s);
                    setSpeedDropdownOpen(false);
                    addToast(`Simulation accelerated to ${s}x real-time`, 'info');
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left font-mono flex items-center justify-between ${
                    speedMultiplier === s
                      ? 'text-brand-blue dark:text-brand-cyan font-bold bg-slate-900/5 dark:bg-white/5'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{s}x realtime</span>
                  {speedMultiplier === s && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications / Anomaly Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            aria-label="View notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-coral text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-elevated p-3 z-50 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-100 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                  Active Energy Alerts
                </span>
                <button
                  onClick={() => {
                    setNotificationOpen(false);
                    onNavigateView('insights');
                  }}
                  className="text-[11px] text-brand-blue dark:text-brand-cyan hover:underline font-semibold"
                >
                  View all in Insights →
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {recentAnomalies.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No active anomalies detected. All circuits operating within baseline.
                  </div>
                ) : (
                  recentAnomalies.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {item.title}
                        </span>
                        <span className="font-mono text-[10px] text-brand-coral font-bold">
                          +{item.percentage_deviation}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.message}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span className="font-mono">{item.timestamp}</span>
                        {!item.acknowledged ? (
                          <button
                            onClick={(e) => handleAcknowledge(item.id, e)}
                            className="text-brand-cyan hover:underline font-semibold"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono">Acknowledged</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

      </div>
    </header>
  );
}
