import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Play,
  Pause,
  Menu,
  Check,
  TrendingUp,
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';
import LivePulse from '../brand/LivePulse';
import { acknowledgeAnomaly } from '../../services/api';

const iconBtn =
  'relative w-9 h-9 rounded-lg flex items-center justify-center ' +
  'text-slate-600 dark:text-slate-300 bg-white dark:bg-[#202328] ' +
  'border border-slate-200 dark:border-white/[0.08] ' +
  'hover:border-brand-royal/40 dark:hover:border-brand-cyan/40 ' +
  'hover:text-brand-royal dark:hover:text-brand-cyan transition-colors duration-200';

const popover =
  'wd-pop absolute right-0 mt-2 z-50 rounded-xl ' +
  'bg-white dark:bg-[#202328] border border-slate-200 dark:border-white/[0.08] ' +
  'shadow-[0_16px_40px_rgba(16,27,45,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]';

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

  const notifRef = useRef(null);
  const speedRef = useRef(null);

  // Close popovers on outside click or Escape
  useEffect(() => {
    const onDown = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationOpen(false);
      if (speedRef.current && !speedRef.current.contains(e.target)) setSpeedDropdownOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setNotificationOpen(false);
        setSpeedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const viewTitles = {
    overview: 'Overview',
    analytics: 'Analytics',
    appliances: 'Appliances',
    insights: 'Smart Insights',
    bills: 'Bills & Tariffs',
    reports: 'Compliance Reports',
    settings: 'Settings & Controls',
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
      // Preserve existing fallback behavior.
    }
  };

  return (
    <header
      className="sticky top-0 z-20 h-16
        bg-white/80 dark:bg-[#17191D]/90
        backdrop-blur-xl
        border-b border-slate-200/70 dark:border-white/[0.08]
        px-4 sm:px-6
        flex items-center justify-between"
    >
      {/* Left: Mobile Menu and Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open mobile navigation menu"
          className="lg:hidden p-2 rounded-lg
            text-slate-500 dark:text-slate-300
            hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.07]
            transition-colors duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-[#858B94] font-mono hidden sm:inline">
            WattLume /
          </span>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            {viewTitles[activeView] || 'Overview'}
          </h1>
        </div>
      </div>

      {/* Right: Simulation and Utility Controls */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Live Simulation Indicator */}
        <div className="hidden sm:block">
          <LivePulse
            isLive={!isPaused}
            label={isPaused ? 'PAUSED' : 'SIMULATED TELEMETRY'}
          />
        </div>

        {/* Pause + Speed (segmented control) */}
        <div className="relative" ref={speedRef}>
          <div className="flex items-center rounded-lg p-0.5 bg-white dark:bg-[#202328] border border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={togglePause}
              title={isPaused ? 'Resume simulation' : 'Pause simulation'}
              aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}
              className={`p-1.5 rounded-md flex items-center transition-colors duration-200 ${
                isPaused
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.07]'
              }`}
            >
              {isPaused
                ? <Play className="w-3.5 h-3.5 fill-current" />
                : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <span className="w-px h-4 mx-0.5 bg-slate-200 dark:bg-white/[0.08]" />

            <button
              onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
              title="Simulation speed multiplier"
              aria-haspopup="listbox"
              aria-expanded={speedDropdownOpen}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold tabular-nums
                text-slate-700 dark:text-slate-300
                hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.07]
                transition-colors"
            >
              {speedMultiplier}x
            </button>
          </div>

          {speedDropdownOpen && (
            <div className={`${popover} w-40 py-1.5`} role="listbox">
              <div className="px-3 py-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-200/70 dark:border-white/[0.08]">
                Simulation Speed
              </div>

              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  role="option"
                  aria-selected={speedMultiplier === s}
                  onClick={() => {
                    changeSpeed(s);
                    setSpeedDropdownOpen(false);
                    addToast(`Simulation accelerated to ${s}x real-time`, 'info');
                  }}
                  className={`w-full px-3 py-2 text-xs text-left font-mono flex items-center justify-between transition-colors ${
                    speedMultiplier === s
                      ? 'text-brand-blue dark:text-brand-cyan font-bold bg-brand-royal/5 dark:bg-white/[0.05]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{s}x realtime</span>
                  {speedMultiplier === s && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            aria-label="View notifications"
            aria-expanded={notificationOpen}
            className={iconBtn}
          >
            <Bell className="w-4 h-4" />

            {unreadAlertsCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full
                  bg-brand-coral text-white text-[9px] font-mono font-bold
                  flex items-center justify-center ring-2 ring-white dark:ring-[#17191D]"
              >
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className={`${popover} w-80 sm:w-96 p-3`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-white/[0.08]">
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

              <div className="max-h-64 overflow-y-auto pt-1 divide-y divide-slate-200/60 dark:divide-white/[0.06]">
                {recentAnomalies.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No active anomalies detected. All circuits operating within baseline.
                  </div>
                ) : (
                  recentAnomalies.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      className={`py-3 space-y-1 text-xs ${item.acknowledged ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 min-w-0">
                          {!item.acknowledged && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-coral shrink-0" aria-label="Unacknowledged" />
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                        </span>

                        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                          bg-brand-coral/10 text-brand-coral font-mono text-[10px] font-bold">
                          <TrendingUp className="w-3 h-3" />
                          +{item.percentage_deviation}%
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
                        <span className="font-mono">{item.timestamp}</span>

                        {!item.acknowledged ? (
                          <button
                            onClick={(e) => handleAcknowledge(item.id, e)}
                            className="text-brand-royal dark:text-brand-cyan hover:underline font-semibold"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="font-mono">Acknowledged</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className={iconBtn}
        >
          {isDark
            ? <Sun className="w-4 h-4 text-amber-300" />
            : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}