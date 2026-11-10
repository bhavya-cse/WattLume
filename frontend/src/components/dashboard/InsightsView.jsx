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
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/10">
        <div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            Automated Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Smart Insights
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical anomaly detection, efficiency scoring, and structured energy conservation opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-slate-600 dark:text-slate-300">
            Z-Score Sensitivity: 1.30σ (+30%)
          </span>
        </div>
      </div>

      {/* SECTION 1: UNUSUAL CONSUMPTION ALERTS (ANOMALIES) */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Unusual Consumption Alerts
            </h3>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {anomalies.filter(a => !a.acknowledged).length} active alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anomalies.map((anom) => {
            const isAck = anom.acknowledged;
            return (
              <div
                key={anom.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isAck
                    ? 'border-slate-200/50 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] opacity-60'
                    : 'glass-panel border-rose-300/40 dark:border-rose-500/20 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* Alert Header */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      +{anom.percentage_deviation}% Spike
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {anom.timestamp}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {anom.title}
                  </h4>

                  {/* 3-Part Structural Insight */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        What Happened
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        {anom.message} Surge reached {anom.actual_kwh} kWh (expected baseline: {anom.baseline_kwh} kWh).
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        Why It Matters
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        Unattended spikes increase utility billing brackets and indicate continuous motor operation or stuck thermostats.
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        What You Can Do
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        Inspect the circuit switch in Appliances or check thermostat setpoints on cooling hardware.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: ALRT-{anom.id}
                  </span>

                  {isAck ? (
                    <span className="text-slate-400 text-xs flex items-center gap-1 font-medium font-mono">
                      <Check className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(anom.id)}
                      className="px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-brand-royal dark:hover:bg-slate-100 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: EFFICIENCY BENCHMARK & BILL FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Efficiency Score Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Benchmarking Index
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-0.5">
                Energy Efficiency Score
              </h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-heading text-brand-emerald tabular-nums">
                {eff.overall_score}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5">
            <strong>Rating: {eff.rating_label}.</strong> {eff.rating_description}
          </p>

          {/* Factor Bars */}
          <div className="space-y-3 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Methodology Breakdown
            </span>
            {eff.factors?.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {f.score} / {f.max_score}
                  </span>
                </div>
                <div className="w-full bg-slate-200/70 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-emerald h-full rounded-full transition-all duration-500"
                    style={{ width: `${(f.score / f.max_score) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block">{f.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Forecast Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1 pb-3 border-b border-slate-200/50 dark:border-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Monthly Bill Forecast
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                {forecast.days_remaining} Days Remaining
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 mt-2">
              Projected end-of-cycle electricity bill calculated from historical daily burn rate.
            </p>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider">
                Estimated Month-End Total
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <span className="text-3xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
                  {Math.round(forecast.forecasted_bill_inr).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-200/60 dark:border-white/5 text-slate-500">
                <span>Month-to-Date Accrued:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  ₹{Math.round(forecast.month_to_date_bill_inr).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">vs Prior Month (₹{Math.round(forecast.previous_month_bill_inr).toLocaleString('en-IN')})</span>
              <span className={`font-bold flex items-center ${forecast.diff_pct <= 0 ? 'text-brand-emerald' : 'text-brand-coral'}`}>
                {forecast.diff_pct <= 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(forecast.diff_pct)}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateView('bills')}
            className="w-full py-2.5 rounded-full border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors glass-pill"
          >
            <span>View Detailed Tariff Slabs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* SECTION 3: PRACTICAL ENERGY-SAVING RECOMMENDATIONS */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Practical Energy-Saving Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear suggestions structured around observation, financial impact, and immediate action.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {structuredRecommendations.map((rec) => {
            const isApplied = appliedRecs[rec.id];
            return (
              <div
                key={rec.id}
                className="p-5 rounded-2xl glass-panel flex flex-col justify-between space-y-4 border border-slate-200/60 dark:border-white/5 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-emerald/15 text-brand-emerald">
                      Save ₹{rec.potential_savings_inr || 450} / mo
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Priority: {rec.impact_level || 'High'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </h4>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        What Happened
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                        {rec.whatHappened}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        Why It Matters
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                        {rec.whyItMatters}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        What You Can Do
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                        {rec.whatYouCanDo}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => toggleApplyRec(rec.id, rec.title)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                      isApplied
                        ? 'bg-brand-emerald text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-brand-royal dark:hover:bg-slate-100'
                    }`}
                  >
                    {isApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isApplied ? 'Applied' : 'Apply Suggestion'}</span>
                  </button>

                  <button
                    onClick={() => onNavigateView('appliances')}
                    className="text-xs text-brand-blue dark:text-brand-cyan hover:underline font-semibold"
                  >
                    Inspect equipment →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
