
import React, { useState } from 'react';
import {
  RotateCcw,
  SlidersHorizontal,
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
    <div className="settings-page p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto">


      <style>{`
        .settings-page {
          --settings-ink: #101B2D;
          --settings-muted: #64748B;
          --settings-line: rgba(100,116,139,.17);
          --settings-surface: #FFFFFF;
          --settings-blue: #4169E1;
          --settings-cyan: #42D9E8;
          --settings-green: #24C78B;
          --settings-coral: #FF806B;
        }

        .dark .settings-page {
          --settings-ink: #F3F4F6;
          --settings-muted: #A1A1AA;
          --settings-line: rgba(255,255,255,.09);
          --settings-surface: #202328;
        }

        .settings-page .settings-section {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--settings-line);
          background: var(--settings-surface);
          box-shadow: 0 8px 28px rgba(15,23,42,.045);
          transition: transform .2s ease, box-shadow .2s ease,
                      border-color .2s ease;
        }

        .settings-page .settings-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(15,23,42,.075);
        }

        .settings-page .settings-section::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 4px;
          border-radius: 20px 0 0 20px;
          background: var(--section-accent);
        }

        .settings-simulation { --section-accent: #4169E1; }
        .settings-sensitivity { --section-accent: #FF806B; }
        .settings-appearance { --section-accent: #24C78B; }
        .settings-reset { --section-accent: #E5A33B; }

        .settings-page h3 {
          color: var(--settings-ink);
          font-size: 15px;
          letter-spacing: -.025em;
        }

        .settings-page .settings-section > div:first-child p {
          line-height: 1.65;
        }

        .settings-page button {
          transition: all .18s ease;
        }

        .settings-page button:focus-visible,
        .settings-page input:focus-visible {
          outline: 3px solid rgba(65,105,225,.3);
          outline-offset: 3px;
        }

        .settings-page .settings-simulation button:not(:disabled):hover,
        .settings-page .settings-appearance button:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .settings-page input[type="range"] {
          accent-color: #4169E1;
          height: 6px;
        }

        .dark .settings-page input[type="range"] {
          accent-color: #42D9E8;
        }

        .settings-page .settings-reset {
          background: linear-gradient(110deg, rgba(255,128,107,.075),
            rgba(229,163,59,.045));
        }

        .dark .settings-page .settings-reset {
          background: linear-gradient(110deg, rgba(255,128,107,.09),
            rgba(229,163,59,.055));
        }

        @media (min-width: 900px) {
          .settings-page > div:last-child {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: stretch;
            gap: 18px;
          }

          .settings-page .settings-simulation,
          .settings-page .settings-appearance {
            grid-column: span 1;
          }

          .settings-page .settings-sensitivity,
          .settings-page .settings-reset {
            grid-column: span 1;
          }
        }

        @media (max-width: 640px) {
          .settings-page .settings-section {
            border-radius: 20px;
          }

          .settings-page .settings-section:hover {
            transform: none;
          }

          .settings-page .settings-simulation > div:nth-child(2) {
            gap: 8px;
          }

          .settings-page .settings-simulation button {
            min-width: 0;
          }
        }

        @media print {
          .settings-page .settings-section {
            box-shadow: none;
            break-inside: avoid;
          }
        }

              /* WATTLUME — REFINED PAGE HEADING SYSTEM */
.wl-page-heading {
  --wl-heading-accent:#287A4B;
  --wl-heading-tint:rgba(40,122,75,.11);
  position:relative;
  isolation:isolate;
  animation:wlHeadingEnter .55s cubic-bezier(.2,.75,.25,1) both;
}
.wl-heading-insights {--wl-heading-accent:#287A4B;--wl-heading-tint:rgba(40,122,75,.11)}
.wl-heading-bills {--wl-heading-accent:#B77932;--wl-heading-tint:rgba(183,121,50,.12)}
.wl-heading-reports {--wl-heading-accent:#397C70;--wl-heading-tint:rgba(57,124,112,.12)}
.wl-heading-settings {--wl-heading-accent:#71834B;--wl-heading-tint:rgba(113,131,75,.13)}
.dark .wl-heading-insights {--wl-heading-accent:#78BD91;--wl-heading-tint:rgba(120,189,145,.13)}
.dark .wl-heading-bills {--wl-heading-accent:#DDB078;--wl-heading-tint:rgba(221,176,120,.14)}
.dark .wl-heading-reports {--wl-heading-accent:#82BDB1;--wl-heading-tint:rgba(130,189,177,.13)}
.dark .wl-heading-settings {--wl-heading-accent:#B2C887;--wl-heading-tint:rgba(178,200,135,.14)}

.wl-page-heading::before {
  content:"";position:absolute;z-index:-1;left:-24px;top:-24px;
  width:260px;height:130px;pointer-events:none;
  background:radial-gradient(ellipse at 35% 55%,var(--wl-heading-tint),transparent 72%);
}
.wl-heading-main {display:flex;align-items:center;gap:17px;min-width:0}
.wl-heading-icon {
  position:relative;display:grid;place-items:center;flex:0 0 58px;
  width:58px;height:58px;color:var(--wl-heading-accent);
  border:1px solid color-mix(in srgb,var(--wl-heading-accent) 24%,transparent);
  border-radius:18px;
  background:linear-gradient(145deg,rgba(255,255,255,.92),var(--wl-heading-tint));
  box-shadow:0 8px 22px color-mix(in srgb,var(--wl-heading-accent) 10%,transparent),
             inset 0 1px 0 rgba(255,255,255,.8);
  animation:wlIconReveal .65s .08s cubic-bezier(.2,.75,.25,1) both;
}
.wl-heading-icon::after {
  content:"";position:absolute;inset:5px;
  border:1px solid color-mix(in srgb,var(--wl-heading-accent) 13%,transparent);
  border-radius:13px;pointer-events:none;
}
.dark .wl-heading-icon {
  background:linear-gradient(145deg,rgba(255,255,255,.09),var(--wl-heading-tint));
  box-shadow:0 8px 24px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.08);
}
.dark .wl-heading-icon::after {
  border-color:color-mix(in srgb,var(--wl-heading-accent) 18%,transparent);
}
.wl-heading-copy {min-width:0}
.wl-page-heading .wl-heading-eyebrow {
  display:inline-flex;align-items:center;gap:9px;
  color:var(--wl-heading-accent)!important;
  font-size:10px;font-weight:800;letter-spacing:.19em;line-height:1.5;
  text-transform:uppercase;
}
.wl-page-heading .wl-heading-eyebrow::before {
  content:"";width:7px;height:7px;flex:0 0 7px;border-radius:50%;
  background:var(--wl-heading-accent);
  box-shadow:0 0 0 4px var(--wl-heading-tint);
}
.wl-page-heading .wl-heading-title {
  display:block;margin:5px 0 0!important;padding:0!important;
  color:var(--text-primary,#101B2D)!important;
  font-size:clamp(27px,3.1vw,35px)!important;
  font-weight:850!important;letter-spacing:-.045em!important;line-height:1.13!important;
}
.wl-page-heading .wl-heading-title::after {content:none!important}
.wl-page-heading .wl-heading-copy > p {
  margin:7px 0 0!important;max-width:650px;
  color:var(--text-muted,#64748B)!important;font-size:13px;line-height:1.65;
}
@keyframes wlHeadingEnter {
  from {opacity:0;transform:translateY(7px)}
  to {opacity:1;transform:translateY(0)}
}
@keyframes wlIconReveal {
  from {opacity:0;transform:translateY(5px) scale(.94)}
  to {opacity:1;transform:translateY(0) scale(1)}
}
@media(prefers-reduced-motion:reduce) {
  .wl-page-heading,.wl-heading-icon {animation:none!important}
}
\n      `}</style>

      {/* Header */}
      <div className="wl-page-heading wl-heading-settings border-b border-slate-200/70 dark:border-white/[0.08] pb-5">
        <div className="wl-heading-main">
          <div className="wl-heading-icon" aria-hidden="true">
            <SlidersHorizontal className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="wl-heading-copy">
            <span className="wl-heading-eyebrow">Preferences</span>
            <h2 className="wl-heading-title">Settings &amp; Controls</h2>
            <p>Manage your dashboard, simulation and energy monitoring preferences.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">

        {/* Simulation Speed */}
        <div className="settings-section settings-simulation p-5 sm:p-6 rounded-3xl glass-panel space-y-5">
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
        <div className="settings-section settings-sensitivity p-5 sm:p-6 rounded-3xl glass-panel space-y-5">
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
        <div className="settings-section settings-appearance p-5 sm:p-6 rounded-3xl glass-panel space-y-5">
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
        <div className="settings-section settings-reset p-5 sm:p-6 rounded-3xl glass-panel space-y-4">
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
