import React, { useState } from 'react';
import {
  Gauge,
  RotateCcw,
  Moon,
  Sun,
  ShieldAlert,
  Sliders,
  Check,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';
import { resetSimulation, updateSimulationControl } from '../../services/api';

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
      addToast(`Anomaly detection threshold adjusted to +${Math.round((val - 1.0) * 100)}%`, 'info');
    } catch {
      // fallback
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to re-seed the simulation database? This will purge all existing records and regenerate a pristine 60-day historical dataset in SQLite.")) {
      return;
    }
    setResetting(true);
    try {
      await resetSimulation();
      addToast("Database re-seeded with fresh 60 days of telemetry data", "success");
      refreshLive();
    } catch (err) {
      addToast("Failed to reset database", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-4xl mx-auto">

      {/* Header */}
      <div className="border-b border-slate-200/70 dark:border-white/10 pb-4">
        <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
          Engine Configuration
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings &amp; Controls
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure telemetry sample rates, statistical sensitivity thresholds, and simulation state.
        </p>
      </div>

      <div className="space-y-5">

        {/* Simulation Execution Speed & State */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Simulation Clock Speed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accelerate background telemetry calculations to simulate hours of residential energy draw in seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                  speedMultiplier === s
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:border-brand-cyan dark:text-brand-cyan font-bold font-mono shadow-sm'
                    : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-mono'
                }`}
              >
                <span className="text-lg font-bold block">{s}x</span>
                <span className="text-[10px] block text-slate-400 mt-0.5">
                  {s === 1 ? 'Real-time' : `${s}× Speed`}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              ENGINE STATUS: <strong className={isPaused ? "text-amber-500" : "text-brand-emerald"}>{isPaused ? "PAUSED" : "ACTIVE"}</strong>
            </span>
            <button
              onClick={togglePause}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all ${
                isPaused
                  ? 'bg-amber-500 text-white'
                  : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isPaused ? 'Resume Simulation' : 'Pause Simulation Engine'}
            </button>
          </div>
        </div>

        {/* Statistical Anomaly Detection Threshold */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Statistical Anomaly Sensitivity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Surge threshold percentage required above 45-day diurnal normal to raise an anomaly alert.
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
              onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
              className="w-full accent-slate-900 dark:accent-brand-cyan cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>+15% (Strict)</span>
              <span>+30% (Recommended)</span>
              <span>+70% (Severe Only)</span>
            </div>
          </div>
        </div>

        {/* Display & Accessibility Preferences */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Interface &amp; Display
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Theme settings and accessibility preferences.
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Color Palette</p>
              <p className="text-[11px] text-slate-400">Toggle between Midnight Navy and Warm Off-White foundations.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-full glass-pill font-mono font-medium flex items-center gap-2 hover:border-slate-300 dark:hover:border-white/20"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Reduced Motion</p>
              <p className="text-[11px] text-slate-400">Honors accessibility preferences and dampens 3D tilts.</p>
            </div>
            <button
              onClick={() => {
                setReducedMotion(!reducedMotion);
                addToast(reducedMotion ? 'Animations restored' : 'Reduced motion activated', 'info');
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

        {/* Database Re-Seed */}
        <div className="p-6 rounded-3xl glass-panel space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Reset Simulated Historical Dataset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Purges existing records and regenerates 60 days of hourly telemetry in SQLite.
            </p>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Restores 9 canonical appliances, resets baseline distributions, and injects benchmark anomaly records.
          </p>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-mono font-bold tracking-tight flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm active:scale-95"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Re-seeding...' : 'Reset & Re-Seed Database'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
