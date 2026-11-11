
import React, { useState } from 'react';
import {
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';
import {
  resetSimulation,
  updateSimulationControl
} from '../../services/api';

export default function SettingsView() {
  const { isDark, toggleTheme } = useTheme();

  const {
    speedMultiplier,
    changeSpeed,
    isPaused,
    togglePause,
    addToast,
    refreshLive
  } = useSimulation();

  const [sensitivity, setSensitivity] = useState(1.3);
  const [resetting, setResetting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleSensitivityChange = async (val) => {
    setSensitivity(val);

    try {
      await updateSimulationControl({ anomaly_sensitivity: val });
      addToast(
        `Anomaly detection threshold adjusted to +${Math.round((val - 1.0) * 100)}%`,
        'info'
      );
    } catch {
      // Preserve existing fallback behavior.
    }
  };

  const handleResetData = async () => {
    if (!window.confirm(
      'Are you sure you want to re-seed the simulation database? This will purge all existing records and regenerate a pristine 60-day historical dataset in SQLite.'
    )) {
      return;
    }

    setResetting(true);

    try {
      await resetSimulation();
      addToast(
        'Database re-seeded with fresh 60 days of telemetry data',
        'success'
      );
      refreshLive();
    } catch {
      addToast('Failed to reset database', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-4xl mx-auto">

      {/* Header */}
      <div className="border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
        <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
          Preferences
        </span>

        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings &amp; Controls
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your dashboard, simulation and energy monitoring preferences.
        </p>
      </div>

      <div className="space-y-5">

        {/* Simulation Speed */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Simulation Speed
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control how quickly simulated energy readings update.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                  speedMultiplier === s
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan font-bold font-mono shadow-sm'
                    : 'border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] font-mono'
                }`}
              >
                <span className="text-lg font-bold block">{s}x</span>

                <span className="text-[10px] block text-slate-400 mt-0.5">
                  {s === 1 ? 'Real-time' : `${s}× Speed`}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-white/[0.07]">
            <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              ENGINE STATUS:{' '}
              <strong className={isPaused ? 'text-amber-500' : 'text-brand-emerald'}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </strong>
            </span>

            <button
              onClick={togglePause}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all ${
                isPaused
                  ? 'bg-amber-500 text-white'
                  : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              {isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            </button>
          </div>
        </div>

        {/* Anomaly Sensitivity */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Anomaly Sensitivity
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust how sensitive the system is when detecting unusual energy consumption.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Active Threshold:</span>

              <span className="text-brand-coral font-bold">
                +{Math.round((sensitivity - 1.0) * 100)}% above baseline
              </span>
            </div>

            <input
              type="range"
              min="1.15"
              max="1.70"
              step="0.05"
              value={sensitivity}
              onChange={(e) =>
                handleSensitivityChange(parseFloat(e.target.value))
              }
              className="w-full accent-slate-900 dark:accent-brand-cyan cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>+15% Strict</span>
              <span>+30% Recommended</span>
              <span>+70% Severe</span>
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Appearance &amp; Accessibility
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalise how WattLume looks and behaves.
            </p>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/[0.07] text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Colour Theme
              </p>

              <p className="text-[11px] text-slate-400">
                Switch between light and charcoal dark mode.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-full glass-pill font-mono font-medium flex items-center gap-2 hover:border-slate-300 dark:hover:border-white/20"
            >
              {isDark
                ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5 text-slate-700" />}

              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between py-2 text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Reduced Motion
              </p>

              <p className="text-[11px] text-slate-400">
                Accessibility preference for reduced animations.
              </p>
            </div>

            <button
              onClick={() => {
                setReducedMotion(!reducedMotion);
                addToast(
                  reducedMotion
                    ? 'Animations restored'
                    : 'Reduced motion activated',
                  'info'
                );
              }}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold border transition-all ${
                reducedMotion
                  ? 'border-brand-emerald bg-brand-emerald/15 text-brand-emerald'
                  : 'glass-pill text-slate-400'
              }`}
            >
              {reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Reset Simulation Data */}
        <div className="p-6 rounded-3xl glass-panel space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Reset Simulation Data
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Regenerate the historical energy dataset used by the dashboard.
            </p>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            This resets existing simulation records and creates a fresh 60-day
            dataset with appliance readings and benchmark anomalies.
          </p>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-5 py-2.5 rounded-full
              bg-slate-900 hover:bg-slate-800
              dark:bg-[#F4F5F6] dark:hover:bg-white
              text-white dark:text-[#17191D]
              text-xs font-mono font-bold tracking-tight
              flex items-center gap-2 transition-all
              disabled:opacity-50 shadow-sm active:scale-95"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`}
            />

            <span>
              {resetting ? 'Re-seeding...' : 'Reset Simulation Data'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
