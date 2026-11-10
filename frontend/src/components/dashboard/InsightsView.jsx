import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { fetchInsights, acknowledgeAnomaly } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

export default function InsightsView({ onNavigateView }) {
  const { addToast } = useSimulation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

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
      addToast('Anomaly alert marked as acknowledged', 'success');
    } catch {
      addToast('Failed to acknowledge alert', 'error');
    }
  };

  const anomalies = data?.anomalies || [];
  const recommendations = data?.recommendations || [];
  const eff = data?.efficiency_score || {
    overall_score: 88,
    rating_label: 'Exceptional',
    rating_color: 'emerald',
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Smart Intelligence &amp; Insights
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Statistical anomaly detection, predictive bill forecasts, and quantifiable conservation advisories.
        </p>
      </div>

      {/* Top Split: Transparent Efficiency Score & Bill Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Transparent Energy Efficiency Score Card (Col 7) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-emerald/15 text-brand-emerald">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Energy Efficiency Score
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated against empirical Indian urban residential benchmarks.
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-brand-emerald tabular-nums">
                {eff.overall_score}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-100 dark:border-white/5">
            <strong>Rating: {eff.rating_label}.</strong> {eff.rating_description}
          </p>

          {/* Transparent 4-Factor Breakdown */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Scoring Factors Breakdown
            </span>
            <div className="space-y-2.5">
              {eff.factors?.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                    <span className="font-mono font-bold text-brand-cyan">
                      {f.score} / {f.max_score} pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-brand-blue to-brand-emerald h-full rounded-full"
                      style={{ width: `${(f.score / f.max_score) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{f.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Predictive Bill Forecast Card (Col 5) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Predictive End-of-Month Bill
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue font-bold">
                {forecast.days_remaining} Days Remaining
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Forecasted cost extrapolates month-to-date burn rate under active slab tariff rules.
            </p>

            <div className="p-4 rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 border border-brand-cyan/25 space-y-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Projected Billing Total
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-brand-cyan">₹</span>
                <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                  {Math.round(forecast.forecasted_bill_inr).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-cyan/20">
                <span className="text-slate-500">Month-to-Date Accrued:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{Math.round(forecast.month_to_date_bill_inr).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-500">vs Previous Month (₹{Math.round(forecast.previous_month_bill_inr)})</span>
              <span className={`font-bold flex items-center ${forecast.diff_pct <= 0 ? 'text-brand-emerald' : 'text-brand-coral'}`}>
                {forecast.diff_pct <= 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(forecast.diff_pct)}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateView('billing')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-cyan/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Configure Tariff Slabs &amp; Taxes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Abnormal Consumption Detection Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-coral/15 text-brand-coral">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Abnormal Consumption Detection &amp; Root Cause Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triggered only when instantaneous load deviates beyond +30% or 2.0σ above historical hourly norm.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-coral/10 text-brand-coral border border-brand-coral/25">
            {anomalies.filter(a => !a.acknowledged).length} Unacknowledged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                anom.acknowledged
                  ? 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/5 opacity-60'
                  : 'bg-white dark:bg-white/[0.03] border-brand-coral/30 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    anom.severity === 'critical' ? 'bg-rose-500/15 text-rose-500' : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {anom.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-black text-brand-coral tabular-nums">
                    +{anom.percentage_deviation}% Spike
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {anom.title}
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {anom.message}
                </p>

                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] space-y-0.5 font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Baseline Expectation:</span>
                    <span>{anom.baseline_kwh} kWh</span>
                  </div>
                  <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold">
                    <span>Actual Recorded:</span>
                    <span>{anom.actual_kwh} kWh</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 text-[10px]">{anom.timestamp}</span>
                {anom.acknowledged ? (
                  <span className="text-slate-400 flex items-center gap-1 font-semibold text-[10px]">
                    <Check className="w-3 h-3 text-brand-emerald" />
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(anom.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] hover:opacity-90 transition-opacity"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Contextual Recommendations Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/15 text-amber-500">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Contextual Intelligent Recommendations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable optimization advisories with quantified monthly savings in Indian Rupees (₹).
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Total Potential Savings</span>
            <span className="text-sm font-bold text-brand-emerald">
              ₹{data?.total_potential_savings_inr?.toLocaleString('en-IN')} / mo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-brand-cyan/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-brand-cyan">
                    {rec.category}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-emerald/15 text-brand-emerald font-mono">
                    Save ₹{rec.potential_savings_inr}/mo
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {rec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Confidence: <strong className="text-slate-300">{rec.confidence_pct}%</strong>
                </span>

                <button
                  onClick={() => addToast(`Automated reminder set for ${rec.title}`, 'success')}
                  className="px-3 py-1.5 rounded-lg bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-blue dark:text-brand-cyan font-bold transition-colors"
                >
                  {rec.action_label}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
