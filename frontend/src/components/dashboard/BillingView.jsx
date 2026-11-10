import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Calendar, 
  ShieldCheck, 
  X, 
  Check, 
  Info,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
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
      addToast('Electricity tariff updated and bill recalculated', 'success');
    } catch {
      addToast('Failed to update tariff', 'error');
    }
  };

  const currency = billingData?.currency_symbol || '₹';
  const dailyTrend = billingData?.daily_trend || [];
  const projectedTrend = billingData?.projected_trend || [];

  // Combine actual and projected for cumulative chart
  const combinedTrajectory = [
    ...dailyTrend.map(d => ({ day: d.day, actual_kwh: d.cumulative_kwh, projected_kwh: null, label: `Day ${d.day}` })),
    ...projectedTrend.map(p => ({ day: p.day, actual_kwh: null, projected_kwh: p.projected_kwh, label: `Day ${p.day}` })),
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header with Tariff Config Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Electricity Bill Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Audit monthly expenditure, analyze slab tier apportionment, and configure Indian Rupee (₹) tariffs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-bold shadow-md hover:shadow-brand-cyan/20 flex items-center gap-2 transition-all"
        >
          <Sliders className="w-4 h-4" />
          <span>Configure Tariff Rules</span>
        </button>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Forecasted Total Bill */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-brand-cyan/30 shadow-sm relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Forecasted Monthly Bill
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-sm font-bold text-brand-cyan">{currency}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {billingData ? Math.round(billingData.forecasted_bill_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-400">{billingData?.days_remaining} days left in cycle</span>
            <span className="text-brand-emerald font-bold">
              {billingData?.bill_diff_pct}% vs Prev
            </span>
          </div>
        </div>

        {/* Month to Date Accrued */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Month-to-Date Accrued
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-sm font-bold text-brand-emerald">{currency}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {billingData ? Math.round(billingData.month_to_date_bill_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-400">{billingData?.days_elapsed} days recorded</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              {billingData?.month_to_date_kwh} kWh
            </span>
          </div>
        </div>

        {/* Average Cost per Unit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Effective Cost / Unit
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-sm font-bold text-brand-blue">{currency}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {billingData?.average_cost_per_kwh || '--'}
            </span>
            <span className="text-xs text-slate-400">/ kWh</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-400">Avg Daily: {currency}{billingData?.average_daily_cost_inr}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-400">
              {billingData?.tariff_model?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Previous Month Bill */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Previous Month Total
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-sm font-bold text-slate-400">{currency}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {billingData ? Math.round(billingData.previous_month_bill_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-400">{billingData?.previous_month_kwh} kWh Total</span>
            <span className="text-brand-emerald font-semibold">Audited</span>
          </div>
        </div>

      </div>

      {/* Slab Apportionment Visualizer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Slab Tier Apportionment Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progressive energy consumption allocation across active tariff tiers.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
            Fixed Charge: {currency}{billingData?.fixed_charge}/mo • {billingData?.tax_rate_percent}% Duty
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {billingData?.slab_breakdown?.map((slab, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {slab.tier_label}
                </span>
                <span className="text-xs font-bold text-brand-cyan">
                  {currency}{slab.rate_per_kwh}/unit
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {slab.units_kwh} kWh
                </span>
                <span className="text-sm font-bold text-brand-emerald font-mono">
                  {currency}{slab.cost}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cumulative Day-by-Day Bill Accumulation Trajectory */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cumulative Consumption &amp; Projected Month Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded month-to-date trajectory with predictive burn rate forecast for remaining cycle.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
              <span className="text-slate-600 dark:text-slate-300">Actual Accumulated (kWh)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
              <span className="text-brand-emerald">Projected Trajectory</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedTrajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#42D9E8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#42D9E8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#24C78B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#24C78B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} interval={2} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v} kWh`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs space-y-1 shadow-xl">
                        <p className="font-bold text-white">Billing Day {d.day}</p>
                        {d.actual_kwh !== null && (
                          <p className="text-brand-cyan">Actual Accrued: <span className="font-mono font-bold">{d.actual_kwh} kWh</span></p>
                        )}
                        {d.projected_kwh !== null && (
                          <p className="text-brand-emerald">Projected: <span className="font-mono font-bold">{d.projected_kwh} kWh</span></p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="actual_kwh" stroke="#42D9E8" strokeWidth={2.5} fill="url(#actualGrad)" name="Actual Accrued" />
              <Area type="monotone" dataKey="projected_kwh" stroke="#24C78B" strokeWidth={2.5} strokeDasharray="4 4" fill="url(#projGrad)" name="Projected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tariff Config Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Configure Electricity Tariff Structure
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Model
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTariffForm({ ...tariffForm, model_type: 'slab' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      tariffForm.model_type === 'slab'
                        ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Slab-Based (Tiered)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTariffForm({ ...tariffForm, model_type: 'flat' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      tariffForm.model_type === 'flat'
                        ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Flat Rate per Unit
                  </button>
                </div>
              </div>

              {tariffForm.model_type === 'flat' ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Flat Rate per kWh (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="30"
                    value={tariffForm.flat_rate}
                    onChange={(e) => setTariffForm({ ...tariffForm, flat_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">
                    Slab Tiers (INR ₹ / kWh)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">0 - 100 kWh</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffForm.slabs[0]?.rate || 4.5}
                        onChange={(e) => {
                          const newSlabs = [...tariffForm.slabs];
                          newSlabs[0].rate = parseFloat(e.target.value) || 0;
                          setTariffForm({ ...tariffForm, slabs: newSlabs });
                        }}
                        className="w-full px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy font-mono font-bold"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">101 - 300 kWh</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffForm.slabs[1]?.rate || 7.0}
                        onChange={(e) => {
                          const newSlabs = [...tariffForm.slabs];
                          newSlabs[1].rate = parseFloat(e.target.value) || 0;
                          setTariffForm({ ...tariffForm, slabs: newSlabs });
                        }}
                        className="w-full px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy font-mono font-bold"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">&gt; 300 kWh</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffForm.slabs[2]?.rate || 9.5}
                        onChange={(e) => {
                          const newSlabs = [...tariffForm.slabs];
                          newSlabs[2].rate = parseFloat(e.target.value) || 0;
                          setTariffForm({ ...tariffForm, slabs: newSlabs });
                        }}
                        className="w-full px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Fixed Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={tariffForm.fixed_charge_monthly}
                    onChange={(e) => setTariffForm({ ...tariffForm, fixed_charge_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tax / Duty Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={tariffForm.tax_rate_percent}
                    onChange={(e) => setTariffForm({ ...tariffForm, tax_rate_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                  Update Tariff &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
