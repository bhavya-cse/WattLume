import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Award, 
  Activity, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchOverview } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

const PIE_COLORS = ['#42D9E8', '#24C78B', '#4169E1', '#A78BFA', '#FF806B', '#F59E0B', '#10B981', '#6366F1'];

export default function OverviewView({ onNavigateView }) {
  const { liveTelemetry, refreshLive } = useSimulation();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);

  const loadData = async () => {
    try {
      const data = await fetchOverview();
      setOverviewData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !overviewData) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-white/10 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-white/10 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-white/10 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpis = overviewData?.kpis || {
    current_power_w: liveTelemetry.current_power_watts,
    current_power_kw: liveTelemetry.current_power_kw,
    today_kwh: liveTelemetry.today_energy_kwh,
    yesterday_kwh: 12.8,
    today_vs_yesterday_pct: -6.5,
    estimated_monthly_bill_inr: 2840.0,
    last_month_bill_inr: 3120.0,
    monthly_bill_diff_pct: -8.9,
    efficiency_score: 88,
    efficiency_score_change: 3,
    efficiency_label: 'Exceptional'
  };

  const hourlyChart = overviewData?.hourly_chart || [];
  const appliances = overviewData?.appliance_breakdown || [];
  const anomalies = overviewData?.recent_anomalies || [];
  const currency = overviewData?.currency_symbol || '₹';

  // Format data for Recharts Pie Donut
  const pieData = appliances.slice(0, 5).map(app => ({
    name: app.name.split(' (')[0],
    value: app.percentage_share,
    kwh: app.daily_energy_kwh,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* View Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time digital intelligence and energy consumption telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadData();
              refreshLive();
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navyLight text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Current Power */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-brand-cyan/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Power
            </span>
            <div className="p-2 rounded-xl bg-brand-cyan/15 text-brand-cyan">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {liveTelemetry.current_power_kw.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-brand-cyan">kW</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="tabular-nums">{(liveTelemetry.current_power_watts).toFixed(0)} Watts Active</span>
            <span className="flex items-center gap-1 text-brand-emerald font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* KPI 2: Today's Consumption */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-brand-blue/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Energy
            </span>
            <div className="p-2 rounded-xl bg-brand-blue/15 text-brand-blue">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {liveTelemetry.today_energy_kwh.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-brand-blue">kWh</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
            <span>vs Yesterday ({kpis.yesterday_kwh} kWh)</span>
            <span className={`flex items-center font-bold ${
              kpis.today_vs_yesterday_pct <= 0 ? 'text-brand-emerald' : 'text-brand-coral'
            }`}>
              {kpis.today_vs_yesterday_pct <= 0 ? (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(kpis.today_vs_yesterday_pct)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Estimated Monthly Bill */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-brand-emerald/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estimated Monthly Bill
            </span>
            <div className="p-2 rounded-xl bg-brand-emerald/15 text-brand-emerald">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-brand-emerald">{currency}</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {Math.round(kpis.estimated_monthly_bill_inr).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
            <span>Last Mo: {currency}{Math.round(kpis.last_month_bill_inr).toLocaleString('en-IN')}</span>
            <span className="text-brand-emerald font-bold">
              {kpis.monthly_bill_diff_pct}% Projected
            </span>
          </div>
        </div>

        {/* KPI 4: Energy Efficiency Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-brand-lavender/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Efficiency Score
            </span>
            <div className="p-2 rounded-xl bg-brand-lavender/15 text-brand-lavender">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {kpis.efficiency_score}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="px-2 py-0.5 rounded-full bg-brand-emerald/15 text-brand-emerald text-[11px] font-bold">
              {kpis.efficiency_label}
            </span>
            <button
              onClick={() => onNavigateView('insights')}
              className="text-brand-cyan hover:underline text-[11px] font-semibold"
            >
              Methodology →
            </button>
          </div>
        </div>

      </div>

      {/* Live Monitoring Telemetry Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-blue/10 via-brand-cyan/10 to-brand-emerald/10 border border-brand-cyan/25 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-cyan/20 text-brand-cyan">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instantaneous Grid Electrical Parameters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized simulated bus telemetry updated in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Voltage (RMS)</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {liveTelemetry.voltage_v} V
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Current</span>
            <span className="text-sm font-bold text-brand-cyan tabular-nums">
              {liveTelemetry.current_a} A
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Power Factor</span>
            <span className="text-sm font-bold text-brand-emerald tabular-nums">
              {liveTelemetry.power_factor}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Frequency</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {liveTelemetry.frequency_hz} Hz
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Active Loads</span>
            <span className="text-sm font-bold text-brand-lavender tabular-nums">
              {liveTelemetry.appliances_active_count} of {liveTelemetry.total_appliances_count}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Hourly Curve + Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Consumption Chart (Col 8) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Hourly Consumption Curve
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing 24-hour actual load profile against 30-day diurnal baseline (Watts).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
                <span className="text-slate-600 dark:text-slate-300">Actual Power</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-400">Historical Baseline</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyChart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42D9E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#42D9E8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false} 
                  interval={3}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `${val}W`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <p className="font-bold text-brand-cyan">{label}</p>
                          <p>Actual: <span className="font-mono text-white font-bold">{payload[0]?.value} W</span></p>
                          <p className="text-slate-400">Baseline: <span className="font-mono">{payload[1]?.value} W</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="power_watts" 
                  name="Actual Power" 
                  stroke="#42D9E8" 
                  strokeWidth={2.2} 
                  fillOpacity={1} 
                  fill="url(#powerGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="baseline_watts" 
                  name="Historical Baseline" 
                  stroke="#94A3B8" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  fillOpacity={1} 
                  fill="url(#baseGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Peak grid window: 18:00 - 22:00</span>
            <button
              onClick={() => onNavigateView('analytics')}
              className="text-brand-cyan hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore In-Depth Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Appliance Distribution Donut (Col 4) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appliance Load Share
              </h3>
              <button
                onClick={() => onNavigateView('appliances')}
                className="text-xs text-brand-cyan font-semibold hover:underline"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Proportion of total energy consumed by top household appliances.
            </p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs shadow-xl">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-brand-cyan">{data.value.toFixed(1)}% ({data.kwh.toFixed(1)} kWh/d)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {item.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Smart Anomalies Alert Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-brand-coral" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Consumption Anomalies
            </h3>
          </div>
          <button
            onClick={() => onNavigateView('insights')}
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>View All Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {anomalies.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No consumption anomalies registered. All equipment running within historical limits.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                onClick={() => onNavigateView('insights')}
                className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-brand-coral/40 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    anom.severity === 'critical' ? 'bg-rose-500/15 text-rose-500' : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {anom.severity.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-bold text-brand-coral tabular-nums">
                    +{anom.percentage_deviation}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {anom.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {anom.message}
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  {anom.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
