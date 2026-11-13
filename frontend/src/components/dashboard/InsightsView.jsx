import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { fetchInsights, acknowledgeAnomaly } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

export default function InsightsView({ onNavigateView }) {
  const { addToast } = useSimulation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [appliedRecs, setAppliedRecs] = useState({});

  const loadData = async () => {
    try {
      const res = await fetchInsights();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAnomaly(id);
      setData(prev => ({
        ...prev,
        anomalies: prev.anomalies.map(a => a.id === id ? { ...a, acknowledged: true } : a)
      }));
      addToast('Alert marked as acknowledged', 'success');
    } catch {
      addToast('Failed to acknowledge alert', 'error');
    }
  };

  const toggleApplyRec = (id, title) => {
    setAppliedRecs(prev => {
      const next = !prev[id];
      addToast(next ? `Applied recommendation: ${title}` : `Reverted recommendation: ${title}`, next ? 'success' : 'info');
      return { ...prev, [id]: next };
    });
  };

  const anomalies = data?.anomalies || [];
  const rawRecommendations = data?.recommendations || [];
  const eff = data?.efficiency_score || {
    overall_score: 88,
    rating_label: 'Exceptional',
    rating_description: 'Operating in the top tier of energy efficiency.',
    factors: []
  };
  const forecast = data?.bill_forecast || {
    forecasted_bill_inr: 2840,
    month_to_date_bill_inr: 1240,
    days_remaining: 18,
    previous_month_bill_inr: 3120,
    diff_pct: -8.9
  };

  const structuredRecommendations = rawRecommendations.map(rec => {
    let whatHappened = "Consistent baseline power draw detected across active circuits.";
    let whyItMatters = `Unoptimized settings add approximately ₹${rec.potential_savings_inr || 350}/month in avoidable electricity charges.`;
    let whatYouCanDo = rec.action_label || "Adjust equipment schedule";

    if (rec.title.toLowerCase().includes('ac') || rec.category?.toLowerCase() === 'cooling') {
      whatHappened = "Air conditioning is currently scheduled 2°C below optimal setpoint during peak evening hours.";
      whyItMatters = "Every 1°C increase in AC setpoint reduces cooling compressor power consumption by 6% (approx ₹450/month).";
      whatYouCanDo = "Set AC thermostat to 24°C and enable Eco timer mode between 11 PM and 6 AM.";
    } else if (rec.title.toLowerCase().includes('phantom') || rec.title.toLowerCase().includes('standby')) {
      whatHappened = "Entertainment & computing circuits continue drawing 48W aggregate power when left on standby overnight.";
      whyItMatters = "Vampire power draw contributes up to ₹240/month without delivering any functional output.";
      whatYouCanDo = "Use a smart power strip or turn off main wall switch for TV, soundbar and console when unattended.";
    } else if (rec.title.toLowerCase().includes('geyser') || rec.title.toLowerCase().includes('water heater')) {
      whatHappened = "Water heater element remained energized for 95 continuous minutes during morning hours.";
      whyItMatters = "Water heaters consume 2,000W; continuous heating after water has reached temperature wastes ₹380/month.";
      whatYouCanDo = "Limit geyser pre-heating to 20 minutes before bathing or install a 30-minute auto-cutoff timer.";
    } else if (rec.title.toLowerCase().includes('refrigerator')) {
      whatHappened = "Refrigerator compressor cycle frequency indicates possible heat buildup or door gasket leakage.";
      whyItMatters = "Compressor running extra cycles increases monthly kitchen energy draw by 18% (approx ₹210/month).";
      whatYouCanDo = "Ensure 10cm rear ventilation clearance and inspect door seal integrity with a paper test.";
    }

    return {
      ...rec,
      whatHappened,
      whyItMatters,
      whatYouCanDo
    };
  });

  return (
    <div className="insights-bold max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">


      <style>{`
        .insights-bold {
          color: var(--text-primary, #101B2D);
        }

        .insights-bold > header {
          padding: 8px 0 20px;
          border-color: var(--border-subtle, rgba(16,27,45,.08)) !important;
          background: transparent !important;
          box-shadow: none !important;
          animation: wlHeadingEnter .65s cubic-bezier(.2,.75,.25,1) both !important;
        }

        .insights-bold > header h2 {
          color: var(--text-primary, #101B2D) !important;
          letter-spacing: -.04em;
        }

        .insights-bold > header p {
          color: var(--text-muted, #64748B) !important;
        }

        .insights-bold > section {
          border-radius: 18px !important;
          border: 1px solid var(--border-subtle, rgba(16,27,45,.08)) !important;
          background: var(--glass-bg) !important;
          -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(155%) !important;
          backdrop-filter: blur(var(--glass-blur)) saturate(155%) !important;
          border-color: var(--glass-border) !important;
          box-shadow: var(--glass-shadow) !important;
          animation: none !important;
        }

        /* Alerts */
        .insights-bold > section:nth-of-type(1) {
          border-top: 3px solid #FF806B !important;
        }

        .insights-bold > section:nth-of-type(1) > div:first-child {
          background: transparent !important;
          border-color: var(--border-subtle, rgba(16,27,45,.08)) !important;
        }

        .insights-bold > section:nth-of-type(1) > div:first-child > div > div:first-child {
          background: #FF806B !important;
          box-shadow: none !important;
        }

        .insights-bold > section:nth-of-type(1) article {
          background: var(--glass-bg) !important;
          -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(155%);
          backdrop-filter: blur(var(--glass-blur)) saturate(155%);
          border: 1px solid var(--glass-border) !important;
          border-left: 3px solid #FF806B !important;
          border-radius: 13px !important;
          box-shadow: none !important;
          transition: border-color .2s ease, transform .2s ease;
        }

        .insights-bold > section:nth-of-type(1) article:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16,27,45,.06) !important;
        }

        .insights-bold > section:nth-of-type(1) article button {
          background: #4169E1 !important;
          color: white !important;
          box-shadow: none !important;
        }

        /* Efficiency and forecast */
        .insights-bold > section:nth-of-type(2) {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }

        .insights-bold > section:nth-of-type(2) > div {
          border-radius: 18px !important;
          background: var(--glass-bg) !important;
          -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(155%);
          backdrop-filter: blur(var(--glass-blur)) saturate(155%);
          border: 1px solid var(--glass-border) !important;
          box-shadow: var(--glass-shadow) !important;
        }

        .insights-bold > section:nth-of-type(2) > div:first-child {
          border-top: 3px solid #24C78B !important;
        }

        .insights-bold > section:nth-of-type(2) > div:last-child {
          border-top: 3px solid #4169E1 !important;
        }

        .insights-bold > section:nth-of-type(2) > div:first-child .text-5xl,
        .insights-bold > section:nth-of-type(2) > div:first-child .text-4xl {
          color: #24C78B !important;
          text-shadow: none !important;
        }

        .insights-bold > section:nth-of-type(2) > div:last-child .text-5xl,
        .insights-bold > section:nth-of-type(2) > div:last-child .text-4xl,
        .insights-bold > section:nth-of-type(2) > div:last-child .text-3xl {
          color: #4169E1 !important;
          text-shadow: none !important;
        }

        .insights-bold > section:nth-of-type(2) > div:last-child > div:nth-of-type(2) {
          background: rgba(65,105,225,.06) !important;
          border: 1px solid rgba(65,105,225,.14) !important;
          border-radius: 12px;
          backdrop-filter: none !important;
        }

        /* Recommendations */
        .insights-bold > section:nth-of-type(3) {
          border-top: 3px solid #24C78B !important;
        }

        .insights-bold > section:nth-of-type(3) > div:first-child {
          background: transparent !important;
          border-color: var(--border-subtle, rgba(16,27,45,.08)) !important;
          border-radius: 0 !important;
        }

        .insights-bold > section:nth-of-type(3) > div:first-child * {
          color: var(--text-primary, #101B2D);
        }

        .insights-bold > section:nth-of-type(3) > div:first-child > div > div:first-child {
          background: #24C78B !important;
          box-shadow: none !important;
        }

        .insights-bold > section:nth-of-type(3) article {
          background: var(--bg-surface, #FFFFFF) !important;
          border: 1px solid var(--border-subtle, rgba(16,27,45,.08)) !important;
          border-radius: 14px !important;
          box-shadow: none !important;
          transition: border-color .2s ease, transform .2s ease;
        }

        .insights-bold > section:nth-of-type(3) article:hover {
          transform: translateY(-2px);
          border-color: rgba(36,199,139,.5) !important;
          box-shadow: 0 6px 16px rgba(16,27,45,.05) !important;
        }

        .insights-bold > section:nth-of-type(3) article .bg-slate-50 {
          background: rgba(36,199,139,.07) !important;
          border: 1px solid rgba(36,199,139,.15) !important;
        }

        .insights-bold > section:nth-of-type(3) article button:first-child {
          background: #4169E1 !important;
          color: #FFFFFF !important;
          border-radius: 9px !important;
          box-shadow: none !important;
        }

        .insights-bold > section:nth-of-type(3) article button:first-child:hover {
          background: #3458C5 !important;
          transform: translateY(-1px);
        }

        .insights-bold svg {
          transition: transform .2s ease;
        }

        .insights-bold button {
          transition: background-color .2s ease, border-color .2s ease, transform .2s ease;
        }

        .insights-bold button:active {
          transform: scale(.98);
        }

        /* Original WattLume dark surfaces */
        .dark .insights-bold > section,
        .dark .insights-bold > section:nth-of-type(1) article,
        .dark .insights-bold > section:nth-of-type(2) > div,
        .dark .insights-bold > section:nth-of-type(3) article {
          background: var(--glass-bg-elevated) !important;
          -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(155%);
          backdrop-filter: blur(var(--glass-blur)) saturate(155%);
          border-color: var(--glass-border) !important;
          box-shadow: var(--glass-shadow) !important;
          color: #F4F5F6;
        }

        .dark .insights-bold > section:nth-of-type(1) {
          border-top-color: #FF806B !important;
        }

        .dark .insights-bold > section:nth-of-type(2) > div:first-child {
          border-top-color: #24C78B !important;
        }

        .dark .insights-bold > section:nth-of-type(2) > div:last-child {
          border-top-color: #42D9E8 !important;
        }

        .dark .insights-bold > section:nth-of-type(2) > div:last-child .text-5xl,
        .dark .insights-bold > section:nth-of-type(2) > div:last-child .text-4xl,
        .dark .insights-bold > section:nth-of-type(2) > div:last-child .text-3xl {
          color: #42D9E8 !important;
        }

        .dark .insights-bold > section:nth-of-type(2) > div:last-child > div:nth-of-type(2) {
          background: rgba(66,217,232,.08) !important;
          border-color: rgba(66,217,232,.18) !important;
        }

        .dark .insights-bold > section:nth-of-type(3) article .bg-slate-50 {
          background: rgba(36,199,139,.09) !important;
          border-color: rgba(36,199,139,.16) !important;
        }

        .dark .insights-bold > section:nth-of-type(3) article {
          border-color: rgba(244,245,246,.09) !important;
        }

        @media(max-width:767px) {
          .insights-bold > header {
            padding-top: 4px;
          }
        }

        @media(prefers-reduced-motion:reduce) {
          .insights-bold *,
          .insights-bold *:before,
          .insights-bold *:after {
            animation: none !important;
            transition: none !important;
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


      {/* PAGE HEADER */}
      <header className="wl-page-heading wl-heading-insights flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div className="wl-heading-main">
          <div className="wl-heading-icon" aria-hidden="true">
            <Lightbulb className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="wl-heading-copy">
            <span className="wl-heading-eyebrow">Energy performance</span>
            <h2 className="wl-heading-title">Smart Insights</h2>
            <p>Understand unusual usage, track efficiency and find practical ways to reduce your electricity bill.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03]">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Detection sensitivity
          </span>
          <span className="text-[11px] font-mono font-semibold text-slate-900 dark:text-white">
            1.30σ
          </span>
        </div>
      </header>

      {/* ALERTS */}
      <section className="rounded-2xl border border-rose-300/50 dark:border-rose-400/20 bg-white dark:bg-[#171923] shadow-lg shadow-rose-500/[0.06] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500 shadow-lg shadow-rose-500/25">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Unusual consumption
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Usage patterns that need your attention
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-rose-600 dark:text-rose-400 font-bold tabular-nums">
              {anomalies.filter(a => !a.acknowledged).length}
            </span>
            {' '}active alerts
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {anomalies.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-300 mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No unusual consumption detected
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Your usage is within the expected range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {anomalies.map((anom) => {
                const isAck = anom.acknowledged;
                return (
                  <article
                    key={anom.id}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isAck
                        ? 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]'
                        : 'border-rose-400/50 dark:border-rose-400/30 bg-gradient-to-br from-rose-500/15 via-rose-500/[0.06] to-orange-500/10 shadow-md shadow-rose-500/[0.08]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${
                          isAck
                            ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
                            : 'bg-rose-500 text-white dark:bg-rose-500 dark:text-white shadow-sm shadow-rose-500/20'
                        }`}>
                          {isAck ? 'Reviewed' : `+${anom.percentage_deviation}% spike`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {anom.timestamp}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold leading-snug text-slate-900 dark:text-white">
                          {anom.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-2">
                          {anom.message}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-white/80 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 p-2.5">
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                            Actual usage
                          </span>
                          <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                            {anom.actual_kwh} <span className="text-[10px] font-medium text-slate-400">kWh</span>
                          </span>
                        </div>
                        <div className="rounded-lg bg-white/80 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 p-2.5">
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                            Expected
                          </span>
                          <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                            {anom.baseline_kwh} <span className="text-[10px] font-medium text-slate-400">kWh</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Check the relevant appliance or circuit for continuous operation, unusual load or incorrect thermostat settings.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ALRT-{anom.id}
                      </span>
                      {isAck ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-emerald">
                          <Check className="w-3.5 h-3.5" />
                          Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(anom.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-80 transition-opacity"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* EFFICIENCY AND BILL FORECAST */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* EFFICIENCY */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-300/50 dark:border-emerald-400/20 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/70 dark:via-slate-900 dark:to-cyan-950/60 shadow-lg shadow-emerald-500/[0.08] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Performance benchmark
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Energy efficiency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your household's overall efficiency rating
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-5xl sm:text-6xl font-heading font-extrabold tracking-tight text-emerald-600 dark:text-emerald-300 tabular-nums drop-shadow-sm">
                  {eff.overall_score}
                </span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
              <span className="text-xs font-semibold text-brand-emerald">
                {eff.rating_label}
              </span>
            </div>
          </div>

          <div className="mt-5 h-3 rounded-full bg-emerald-200/70 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-emerald transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, Number(eff.overall_score) || 0))}%` }}
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {eff.rating_description}
          </p>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Score breakdown
              </h4>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Methodology
              </span>
            </div>

            {eff.factors?.length ? (
              <div className="space-y-4">
                {eff.factors.map((f, i) => {
                  const percentage = f.max_score > 0
                    ? Math.min(100, Math.max(0, (f.score / f.max_score) * 100))
                    : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {f.name}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          {f.score}<span className="text-slate-400"> / {f.max_score}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-emerald transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {f.detail && (
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {f.detail}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Detailed factor scores are not available yet.
              </p>
            )}
          </div>
        </div>

        {/* BILL FORECAST */}
        <div className="lg:col-span-5 rounded-2xl border border-blue-300/50 dark:border-cyan-400/20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/70 dark:via-slate-900 dark:to-cyan-950/60 shadow-lg shadow-blue-500/[0.08] p-5 sm:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Monthly projection
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Bill forecast
              </h3>
            </div>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-300">
              {forecast.days_remaining} days left
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Estimated month-end electricity cost based on your current usage.
          </p>

          <div className="mt-5 p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-100/80 to-cyan-100/60 dark:from-blue-500/15 dark:to-cyan-500/10 border border-blue-200 dark:border-cyan-400/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Projected total
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-medium text-slate-400">₹</span>
              <span className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-blue-800 dark:text-cyan-200 tabular-nums">
                {Math.round(forecast.forecasted_bill_inr).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Spent so far
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                ₹{Math.round(forecast.month_to_date_bill_inr).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/10">
            <div>
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Compared with last month
              </span>
              <span className="text-[10px] text-slate-400">
                Previous: ₹{Math.round(forecast.previous_month_bill_inr).toLocaleString('en-IN')}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${
              forecast.diff_pct <= 0 ? 'text-brand-emerald' : 'text-brand-coral'
            }`}>
              {forecast.diff_pct <= 0
                ? <TrendingDown className="w-4 h-4" />
                : <TrendingUp className="w-4 h-4" />}
              {Math.abs(forecast.diff_pct)}%
            </span>
          </div>

          <button
            onClick={() => onNavigateView('bills')}
            className="mt-auto pt-5 w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-emerald dark:hover:text-brand-emerald transition-colors"
          >
            <span>Explore detailed tariff slabs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ways to save energy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practical actions based on your consumption patterns
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            {structuredRecommendations.length} suggestions
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {structuredRecommendations.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-brand-emerald mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                You're all caught up
              </p>
              <p className="text-xs text-slate-500 mt-1">
                No additional recommendations are available right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {structuredRecommendations.map((rec) => {
                const isApplied = appliedRecs[rec.id];
                return (
                  <article
                    key={rec.id}
                    className="rounded-xl border border-emerald-200 dark:border-emerald-400/15 bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-800/90 dark:to-emerald-950/30 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Save ₹{rec.potential_savings_inr || 450}/month
                      </span>
                      <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
                        {rec.impact_level || 'High'} priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                      {rec.title}
                    </h4>

                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          The observation
                        </span>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-1">
                          {rec.whatHappened}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Why it matters
                        </span>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-1">
                          {rec.whyItMatters}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-white/[0.035] p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald">
                          Recommended action
                        </span>
                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 mt-1">
                          {rec.whatYouCanDo}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => toggleApplyRec(rec.id, rec.title)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                          isApplied
                            ? 'bg-brand-emerald text-white'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500'
                        }`}
                      >
                        {isApplied
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <Check className="w-3.5 h-3.5" />}
                        {isApplied ? 'Applied' : 'Mark as applied'}
                      </button>

                      <button
                        onClick={() => onNavigateView('appliances')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-emerald transition-colors"
                      >
                        Inspect equipment
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}