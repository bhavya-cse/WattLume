import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Sliders,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { fetchBilling, updateTariff } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

export default function BillingView() {
  const { addToast } = useSimulation();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);

  // Tariff Config Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tariffForm, setTariffForm] = useState({
    model_type: 'slab',
    flat_rate: 7.50,
    fixed_charge_monthly: 120.0,
    tax_rate_percent: 5.0,
    slabs: [
      { up_to: 100, rate: 4.5 },
      { up_to: 300, rate: 7.0 },
      { up_to: null, rate: 9.5 },
    ],
    currency_symbol: '₹',
    currency_code: 'INR',
  });

  const loadData = async () => {
    try {
      const data = await fetchBilling();
      setBillingData(data);
      setTariffForm({
        model_type: data.tariff_model,
        flat_rate: data.flat_rate,
        fixed_charge_monthly: data.fixed_charge,
        tax_rate_percent: data.tax_rate_percent,
        slabs: [
          { up_to: 100, rate: 4.5 },
          { up_to: 300, rate: 7.0 },
          { up_to: null, rate: 9.5 },
        ],
        currency_symbol: data.currency_symbol || '₹',
        currency_code: data.currency_code || 'INR',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTariff = async (e) => {
    e.preventDefault();
    try {
      const res = await updateTariff(tariffForm);
      setBillingData(res.billing);
      setIsModalOpen(false);
      addToast('Electricity tariff updated and bills recalculated', 'success');
    } catch {
      addToast('Failed to update tariff', 'error');
    }
  };

  const currency = billingData?.currency_symbol || '₹';
  const dailyTrend = billingData?.daily_trend || [];
  const projectedTrend = billingData?.projected_trend || [];

  const combinedTrajectory = [
    ...dailyTrend.map(d => ({ day: d.day, actual_kwh: d.cumulative_kwh, projected_kwh: null })),
    ...projectedTrend.map(p => ({ day: p.day, actual_kwh: null, projected_kwh: p.projected_kwh })),
  ];

  return (
    <div className="bill-page p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">

    <style>{`
  .bill-page {
    background: var(--bg-canvas);
    color: var(--text-primary);
    font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Page heading */
  .bill-page > div:nth-of-type(1) {
    padding-bottom: 22px;
    border-color: var(--border-subtle);
  }

  .bill-page > div:nth-of-type(1) h2 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(25px, 3vw, 32px);
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--text-primary);
  }

  .bill-page > div:nth-of-type(1) p {
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* Financial summary cards */
  .bill-page > div:nth-of-type(2) {
    gap: 14px;
  }

  .bill-page > div:nth-of-type(2) > div {
    position: relative;
    overflow: hidden;
    min-height: 140px;
    padding: 20px;
    border-radius: 17px;
    border: 1px solid var(--border-subtle);
    background: var(--glass-bg-elevated);
    box-shadow: var(--glass-shadow);
    transition: transform .2s ease, border-color .2s ease;
  }

  .bill-page > div:nth-of-type(2) > div:hover {
    transform: translateY(-3px);
    border-color: rgba(65,105,225,.32);
  }

  .bill-page > div:nth-of-type(2) > div:nth-child(1) {
    border-top: 3px solid #4169E1;
  }

  .bill-page > div:nth-of-type(2) > div:nth-child(2) {
    border-top: 3px solid #24C78B;
  }

  .bill-page > div:nth-of-type(2) > div:nth-child(3) {
    border-top: 3px solid #42D9E8;
  }

  .bill-page > div:nth-of-type(2) > div:nth-child(4) {
    border-top: 3px solid #FF806B;
  }

  .bill-page > div:nth-of-type(2) > div > span:first-child {
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .1em;
  }

  .bill-page > div:nth-of-type(2) > div > div > span:nth-child(2) {
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    letter-spacing: -.04em;
  }

  /* Tariff breakdown and consumption chart */
  .bill-page > div:nth-of-type(3),
  .bill-page > div:nth-of-type(4) {
    padding: 22px;
    border: 1px solid var(--border-subtle);
    border-radius: 18px;
    background: var(--glass-bg);
    box-shadow: var(--glass-shadow);
  }

  .bill-page > div:nth-of-type(3) h3,
  .bill-page > div:nth-of-type(4) h3 {
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 750;
    letter-spacing: -.025em;
  }

  .bill-page > div:nth-of-type(3) > div:last-child > div {
    border: 1px solid var(--border-subtle);
    border-radius: 13px;
    background: var(--bg-surface);
    padding: 16px;
  }

  .bill-page > div:nth-of-type(3) > div:last-child > div:nth-child(1) {
    border-left: 3px solid #4169E1;
  }

  .bill-page > div:nth-of-type(3) > div:last-child > div:nth-child(2) {
    border-left: 3px solid #42D9E8;
  }

  .bill-page > div:nth-of-type(3) > div:last-child > div:nth-child(3) {
    border-left: 3px solid #24C78B;
  }

  .bill-page .recharts-cartesian-grid-horizontal line {
    stroke: var(--border-subtle);
  }

  /* Tariff configuration dialog */
  .bill-page > div:last-child .glass-panel-elevated {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
  }

  .bill-page > div:last-child input {
    background: var(--bg-canvas);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    border-radius: 9px;
  }

  .bill-page > div:last-child input:focus {
    outline: none;
    border-color: #4169E1;
    box-shadow: 0 0 0 3px rgba(65,105,225,.15);
  }

  .bill-page > div:last-child form button[type="submit"] {
    background: #4169E1 !important;
    color: #fff !important;
  }

  .dark .bill-page > div:nth-of-type(2) > div,
  .dark .bill-page > div:nth-of-type(3),
  .dark .bill-page > div:nth-of-type(4) {
    background: var(--glass-bg-elevated);
  }

  .dark .bill-page > div:nth-of-type(3) > div:last-child > div {
    background: var(--bg-surface);
  }

  @media (max-width: 640px) {
    .bill-page > div:nth-of-type(1) > button {
      width: 100%;
      justify-content: center;
    }

    .bill-page > div:nth-of-type(3),
    .bill-page > div:nth-of-type(4) {
      padding: 16px;
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
      <div className="wl-page-heading wl-heading-bills flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/70 dark:border-white/10 pb-4">
        <div className="wl-heading-main">
          <div className="wl-heading-icon" aria-hidden="true">
            <Receipt className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="wl-heading-copy">
            <span className="wl-heading-eyebrow">Utility reconciliation</span>
            <h2 className="wl-heading-title">Bills &amp; Tariffs</h2>
            <p>Consumption accrual, slab tier allocation, and utility tariff rate configurations.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-royal hover:opacity-90 dark:bg-brand-cyan text-white dark:text-[#17191D] text-xs font-bold tracking-tight transition-all shadow-md shadow-brand-royal/20 dark:shadow-brand-cyan/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal focus-visible:ring-offset-2"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure Tariff Rules</span>
        </button>
      </div>

      {/* Primary KPI Strip in Glass Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Forecasted Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono font-bold text-brand-emerald">{currency}</span>
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {billingData ? Math.round(billingData.forecasted_bill_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{billingData?.days_remaining} days left in cycle</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Month-to-Date</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono font-bold text-slate-400">{currency}</span>
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {billingData ? Math.round(billingData.month_to_date_bill_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{billingData?.month_to_date_kwh} kWh consumed</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Unit Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono font-bold text-[#AD694B] dark:text-[#D99A78]">{currency}</span>
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {billingData?.average_cost_per_kwh || '--'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">/ kWh</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Avg Daily: {currency}{billingData?.average_daily_cost_inr}</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Previous Invoice</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono font-bold text-slate-400">{currency}</span>
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {billingData ? Math.round(billingData.previous_month_bill_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{billingData?.previous_month_kwh} kWh volume</span>
        </div>

      </div>

      {/* Slab Apportionment Visualizer */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Slab Tier Apportionment Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progressive energy consumption allocation across active tariff tiers.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 glass-pill px-3 py-1 rounded-full">
            Fixed Charge: {currency}{billingData?.fixed_charge}/mo • {billingData?.tax_rate_percent}% Duty
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {billingData?.slab_breakdown?.map((slab, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                  {slab.tier_label}
                </span>
                <span className="text-[#AD694B] dark:text-[#D99A78] font-bold">
                  {currency}{slab.rate_per_kwh}/unit
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {slab.units_kwh} kWh
                </span>
                <span className="text-sm font-bold text-brand-emerald">
                  {currency}{slab.cost}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cumulative Trajectory Chart */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Cumulative Consumption &amp; Projected Month Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded month-to-date trajectory with predictive burn rate forecast for remaining cycle.
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedTrajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="accruedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AD694B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#AD694B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82916F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#82916F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} interval={2} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}k`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="glass-panel-elevated p-2.5 rounded-xl text-xs font-mono space-y-0.5 shadow-xl border border-white/60 dark:border-white/10">
                        <p className="font-bold text-slate-900 dark:text-white">Day {d.day}</p>
                        {d.actual_kwh !== null && (
                          <p className="text-[#AD694B] dark:text-[#D99A78]">Accrued: {d.actual_kwh} kWh</p>
                        )}
                        {d.projected_kwh !== null && (
                          <p className="text-brand-emerald">Projected: {d.projected_kwh} kWh</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="actual_kwh" stroke="#AD694B" strokeWidth={2} fill="url(#accruedGrad)" name="Accrued" />
              <Area type="monotone" dataKey="projected_kwh" stroke="#82916F" strokeWidth={2} strokeDasharray="3 3" fill="url(#projGrad)" name="Projected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tariff Config Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-3xl glass-panel-elevated p-6 z-10 space-y-4 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Configure Electricity Tariff Structure
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Billing Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTariffForm({ ...tariffForm, model_type: 'slab' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold font-mono transition-all ${
                      tariffForm.model_type === 'slab'
                        ? 'border-brand-blue bg-brand-blue/10 text-[#AD694B] dark:border-brand-cyan dark:text-brand-cyan'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Slab-Based (Tiered)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTariffForm({ ...tariffForm, model_type: 'flat' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold font-mono transition-all ${
                      tariffForm.model_type === 'flat'
                        ? 'border-brand-blue bg-brand-blue/10 text-[#AD694B] dark:border-brand-cyan dark:text-brand-cyan'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Flat Rate
                  </button>
                </div>
              </div>

              {tariffForm.model_type === 'flat' ? (
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Flat Rate per kWh (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="30"
                    value={tariffForm.flat_rate}
                    onChange={(e) => setTariffForm({ ...tariffForm, flat_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#AD694B]"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="block font-medium text-slate-700 dark:text-slate-300">
                    Slab Tiers (INR ₹ / kWh)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">0-100 kWh</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffForm.slabs[0]?.rate || 4.5}
                        onChange={(e) => {
                          const newSlabs = [...tariffForm.slabs];
                          newSlabs[0].rate = parseFloat(e.target.value) || 0;
                          setTariffForm({ ...tariffForm, slabs: newSlabs });
                        }}
                        className="w-full px-1 py-1 text-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#292621] font-mono font-bold"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">101-300 kWh</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffForm.slabs[1]?.rate || 7.0}
                        onChange={(e) => {
                          const newSlabs = [...tariffForm.slabs];
                          newSlabs[1].rate = parseFloat(e.target.value) || 0;
                          setTariffForm({ ...tariffForm, slabs: newSlabs });
                        }}
                        className="w-full px-1 py-1 text-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#292621] font-mono font-bold"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">&gt;300 kWh</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffForm.slabs[2]?.rate || 9.5}
                        onChange={(e) => {
                          const newSlabs = [...tariffForm.slabs];
                          newSlabs[2].rate = parseFloat(e.target.value) || 0;
                          setTariffForm({ ...tariffForm, slabs: newSlabs });
                        }}
                        className="w-full px-1 py-1 text-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#292621] font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fixed Monthly Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={tariffForm.fixed_charge_monthly}
                    onChange={(e) => setTariffForm({ ...tariffForm, fixed_charge_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#AD694B]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tax / Duty Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={tariffForm.tax_rate_percent}
                    onChange={(e) => setTariffForm({ ...tariffForm, tax_rate_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#AD694B]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200/50 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full glass-pill text-slate-600 dark:text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm"
                >
                  Update &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
