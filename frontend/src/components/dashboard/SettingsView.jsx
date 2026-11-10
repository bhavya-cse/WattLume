import React, { useState } from 'react';
import { 
  Settings, 
  Gauge, 
  RotateCcw, 
  Moon, 
  Sun, 
  ShieldAlert, 
  Sliders, 
  Check, 
  AlertTriangle,
  Zap,
  Info
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
      addToast(`Anomaly detection sensitivity set to +${Math.round((val - 1.0) * 100)}%`, 'info');
    } catch {
      // fallback
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to re-seed the simulation database? This will refresh all 60 days of historical hourly records and anomalies.")) {
      return;
    }
    setResetting(true);
    try {
      await resetSimulation();
      addToast("Database re-seeded with fresh 60 days of simulated energy data", "success");
      refreshLive();
    } catch (err) {
      addToast("Failed to reset database", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System &amp; Simulation Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure real-time telemetry clock rates, detection thresholds, and demonstration state.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Simulation Speed & State */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-cyan/15 text-brand-cyan">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Simulation Engine Speed &amp; State
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up telemetry ticks to simulate hours of residential energy draw in seconds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`py-3 px-4 rounded-xl border text-center transition-all ${
                  speedMultiplier === s
                    ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-bold shadow-sm'
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-lg font-black block font-mono">{s}x</span>
                <span className="text-[11px] block text-slate-400">
                  {s === 1 ? 'Real-time' : `${s}× Accelerated`}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Simulation Telemetry Execution:
            </span>
            <button
              onClick={togglePause}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isPaused
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              {isPaused ? 'Resume Simulation' : 'Pause Simulation Engine'}
            </button>
          </div>
        </div>

        {/* Anomaly Detection Sensitivity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-coral/15 text-brand-coral">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Statistical Anomaly Sensitivity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Threshold percentage above diurnal baseline required to raise an anomaly alert.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Current Threshold:</span>
              <span className="text-brand-coral font-mono">
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
              className="w-full accent-brand-coral cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>+15% (Ultra Sensitive)</span>
              <span>+30% (Recommended)</span>
              <span>+70% (Severe Only)</span>
            </div>
          </div>
        </div>

        {/* Interface & Theme Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/15 text-brand-blue">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interface &amp; Display Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch themes and manage accessibility display settings.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Color Theme</p>
              <p className="text-[11px] text-slate-400">Toggle between Dark Midnight Navy and Light Clean theme.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold flex items-center gap-2"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-blue" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Reduced Motion</p>
              <p className="text-[11px] text-slate-400">Diminish background waveforms and particle animations.</p>
            </div>
            <button
              onClick={() => {
                setReducedMotion(!reducedMotion);
                addToast(reducedMotion ? 'Animations restored' : 'Reduced motion activated', 'info');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                reducedMotion
                  ? 'border-brand-emerald bg-brand-emerald/15 text-brand-emerald'
                  : 'border-slate-200 dark:border-white/10 text-slate-500'
              }`}
            >
              {reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Database Re-seeding & Demo Reset */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-rose-500/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reset Simulated Demonstration Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Purge existing records and regenerate a pristine 60-day mathematical simulation history.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This will restore the 9 canonical residential appliances, regenerate 1,440 hourly electrical telemetry records in SQLite, recreate seasonal curves, and inject benchmark anomalies.
          </p>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Re-seeding Simulation...' : 'Reset & Re-Seed 60-Day Dataset'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
