import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  Receipt,
  Leaf,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { fetchOverview, fetchInsights, fetchBilling, acknowledgeAnomaly } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

export default function OverviewView({ onNavigateView }) {
  const { liveTelemetry, refreshLive, addToast } = useSimulation();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [appliedInsight, setAppliedInsight] = useState(false);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async () => {
    try {
      const [overviewRes, insightsRes, billingRes] = await Promise.all([
        fetchOverview(),
        fetchInsights().catch(() => null),
        fetchBilling().catch(() => null),
      ]);
      setOverviewData(overviewRes);
      setInsightsData(insightsRes);
      setBillingData(billingRes);
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !overviewData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200/70 dark:bg-white/5 rounded-full animate-pulse" />
          <div className="h-8 w-64 bg-slate-200/70 dark:bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 glass-panel rounded-2xl animate-pulse" />
          <div className="lg:col-span-4 h-80 glass-panel rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const kpis = overviewData?.kpis || {};
  const hourlyChart = overviewData?.hourly_chart || [];
  const appliances = overviewData?.appliance_breakdown || [];
  const currency = overviewData?.currency_symbol || '₹';

  // Live metrics
  const liveWatts = liveTelemetry.current_power_watts || kpis.current_power_w || 1840;
  const liveKwhToday = liveTelemetry.today_energy_kwh || kpis.today_kwh || 11.45;
  const activeCount = liveTelemetry.appliances_active_count ?? 6;
  const totalCount = liveTelemetry.total_appliances_count ?? 9;

  // Monthly comparison data
  const monthlyComparison = [
    { name: 'Last Month', kwh: Math.round(billingData?.previous_month_kwh || 382), fill: '#94A3B8' },
    { name: 'This Month (Est)', kwh: Math.round(billingData?.forecasted_month_kwh || 348), fill: '#4169E1' },
    { name: 'Budget Target', kwh: 380, fill: '#24C78B' },
  ];

  // One important energy insight
  const topRecommendation = (insightsData?.recommendations && insightsData.recommendations.length > 0)
    ? insightsData.recommendations[0]
    : {
        id: 1,
        title: "Shift AC thermostat from 22°C to 24°C during peak diurnal hours",
        description: "Compressor duty cycle drops by 18% during afternoon heat without compromising thermal comfort.",
        impact_level: "High",
        estimated_monthly_saving_inr: 740,
        appliance: "Air Conditioner (1.5 Ton)",
      };

  const handleApplyInsight = (e) => {
    e.stopPropagation();
    setAppliedInsight(!appliedInsight);
    addToast(
      !appliedInsight
        ? `Applied smart recommendation: ${topRecommendation.title}`
        : `Reverted recommendation: ${topRecommendation.title}`,
      !appliedInsight ? 'success' : 'info'
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">

      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/70 dark:border-white/10">
        <div>
          <p className="text-xs sm:text-sm font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {getGreeting()}
          </p>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Here's your energy overview.
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
            <span>230V • 50 Hz Domestic Profile</span>
          </div>

          <button
            onClick={() => {
              loadData();
              refreshLive();
              addToast("Refreshing telemetry and circuit readings...", "info");
            }}
            className="p-2 rounded-full glass-pill text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            title="Refresh overview metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Exactly 4 Essential Glass-Inspired Metric Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* Metric 1: Today's energy consumption */}
        <div className="p-5 rounded-2xl glass-panel glass-card-interactive text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium tracking-tight">Today's Consumption</span>
            <div className="w-7 h-7 rounded-xl bg-brand-royal/10 dark:bg-brand-royal/20 flex items-center justify-center text-brand-royal dark:text-brand-cyan">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {liveKwhToday.toFixed(2)}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">kWh</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-brand-emerald font-mono font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{Math.abs(kpis.today_vs_yesterday_pct || 6.5)}% vs yesterday</span>
          </div>
        </div>

        {/* Metric 2: Current power usage */}
        <div className="p-5 rounded-2xl glass-panel glass-card-interactive text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium tracking-tight">Current Power Usage</span>
            <div className="w-7 h-7 rounded-xl bg-brand-cyan/15 dark:bg-brand-cyan/20 flex items-center justify-center text-brand-blue dark:text-brand-cyan">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-bold tracking-tight text-brand-blue dark:text-brand-cyan tabular-nums">
              {Math.round(liveWatts).toLocaleString()}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">Watts</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            <span>{activeCount} of {totalCount} appliances drawing</span>
          </div>
        </div>

        {/* Metric 3: Estimated monthly bill */}
        <div className="p-5 rounded-2xl glass-panel glass-card-interactive text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium tracking-tight">Estimated Monthly Bill</span>
            <div className="w-7 h-7 rounded-xl bg-brand-emerald/15 dark:bg-brand-emerald/20 flex items-center justify-center text-brand-emerald">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-400">{currency}</span>
            <span className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {Math.round(kpis.estimated_monthly_bill_inr || 2840).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-brand-emerald font-mono font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{Math.abs(kpis.monthly_bill_diff_pct || 8.9)}% under previous bill</span>
          </div>
        </div>

        {/* Metric 4: Energy saved */}
        <div className="p-5 rounded-2xl glass-panel glass-card-interactive text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium tracking-tight">Energy Saved</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center text-brand-emerald">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              42.8
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">kWh</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-emerald font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currency}340 saved • Score {kpis.efficiency_score || 88}/100</span>
          </div>
        </div>

      </div>

      {/* Primary Section: 24h Load Chart & Appliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Section 1: Energy consumption chart (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Energy Consumption Chart
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                24-Hour Diurnal Load Profile with hourly kilowatt-hour telemetry.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-royal" />
                <span>Simulated Draw</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Peak Slab (18-22h)</span>
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyChart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4169E1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4169E1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94A3B8"
                  fontSize={11}
                  interval={3}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94A3B8"
                  fontSize={11}
                  unit=" kWh"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isPeak = (data.hour >= 18 && data.hour <= 22);
                      return (
                        <div className="glass-panel-elevated p-3 rounded-xl shadow-xl text-xs font-mono border border-white/60 dark:border-white/10">
                          <div className="text-slate-400 text-[10px] uppercase font-sans mb-1 flex items-center justify-between gap-3">
                            <span>{data.time}</span>
                            {isPeak && <span className="text-amber-400 text-[9px] font-bold">PEAK SLAB</span>}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {data.kwh.toFixed(3)} kWh
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            Est: ~{(data.kwh * 1000).toFixed(0)} W average circuit draw
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kwh"
                  stroke="#4169E1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#energyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Base load: ~0.45 kWh/hr during night hours</span>
            </span>
            <button
              onClick={() => onNavigateView('analytics')}
              className="text-brand-blue dark:text-brand-cyan hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>Explore full analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 2: Appliance-wise consumption breakdown (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  Appliance Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share of today's electricity consumption.
                </p>
              </div>
              <button
                onClick={() => onNavigateView('appliances')}
                className="text-xs text-brand-blue dark:text-brand-cyan hover:underline font-semibold"
              >
                All ({totalCount})
              </button>
            </div>

            <div className="space-y-3.5 pt-4">
              {appliances.slice(0, 4).map((app, idx) => {
                const cleanName = app.name.split(' (')[0];
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {cleanName}
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                        {app.percentage_share}% <span className="text-[10px] text-slate-400 font-normal">({app.daily_energy_kwh.toFixed(1)} kWh)</span>
                      </span>
                    </div>
                    {/* Sleek Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, app.percentage_share)}%`,
                          backgroundColor: idx === 0 ? '#4169E1' : idx === 1 ? '#42D9E8' : idx === 2 ? '#24C78B' : '#A78BFA'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Cooling accounts for ~42%</span>
            <button
              onClick={() => onNavigateView('appliances')}
              className="text-brand-blue dark:text-brand-cyan hover:underline font-semibold"
            >
              Virtual switches →
            </button>
          </div>
        </div>

      </div>

      {/* Secondary Section: Monthly usage comparison & One important energy insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Section 3: Monthly usage comparison (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Monthly Usage Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current month-to-date projection against historical baseline and budget.
              </p>
            </div>
            <button
              onClick={() => onNavigateView('bills')}
              className="text-xs text-brand-blue dark:text-brand-cyan hover:underline font-semibold"
            >
              View billing →
            </button>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} unit=" kWh" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={105} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel-elevated p-2 rounded-lg text-xs font-mono border border-white/60 dark:border-white/10">
                          <span className="font-sans font-semibold text-slate-900 dark:text-white">{d.name}</span>
                          <div className="text-brand-blue dark:text-brand-cyan font-bold">{d.kwh} kWh</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="kwh" radius={[0, 6, 6, 0]} barSize={16}>
                  {monthlyComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px] text-brand-emerald font-semibold">
              -8.9% lower than last month (32 kWh saved)
            </span>
            <span className="text-slate-400">Within ₹3,000 threshold</span>
          </div>
        </div>

        {/* Section 4: One important energy insight (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between border-brand-blue/30 dark:border-brand-cyan/20">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-brand-emerald flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  Highlighted Energy Insight
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-emerald/15 text-brand-emerald">
                Save {currency}{topRecommendation.estimated_monthly_saving_inr || 740} / mo
              </span>
            </div>

            <div className="pt-3 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {topRecommendation.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {topRecommendation.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                <span>Target: {topRecommendation.appliance || "Air Conditioner"}</span>
                <span>•</span>
                <span className="text-brand-emerald font-semibold">Impact: {topRecommendation.impact_level || "High"}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
            <button
              onClick={handleApplyInsight}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${
                appliedInsight
                  ? 'bg-brand-emerald text-white'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-brand-royal dark:hover:bg-slate-100'
              }`}
            >
              {appliedInsight ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{appliedInsight ? 'Adjustment Applied' : 'Apply Recommendation'}</span>
            </button>

            <button
              onClick={() => onNavigateView('insights')}
              className="text-xs text-brand-blue dark:text-brand-cyan hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View all insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
