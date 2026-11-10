import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Calendar,
  Leaf,
  Zap,
  ArrowUpDown,
  Filter,
  ChevronRight,
  TrendingDown,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import { fetchAnalytics } from '../../services/api';

export default function AnalyticsView() {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async (range) => {
    setLoading(true);
    try {
      const data = await fetchAnalytics(range);
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedRange);
  }, [selectedRange]);

  const ranges = [
    { id: 'today', label: 'Today (24h)' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '12m', label: 'Last 12 Months' },
  ];

  const chartData = analyticsData?.chart_data || [];
  const currency = analyticsData?.currency_symbol || '₹';

  const filteredAppliances = (analyticsData?.appliances || []).filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">

      {/* View Header with Horizon Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/70 dark:border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            Chronological Analysis
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Energy Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Historical consumption trends, diurnal demand curves, and carbon footprints.
          </p>
        </div>

        {/* Range Selector Pill */}
        <div className="flex items-center rounded-full glass-pill p-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRange(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-all duration-150 ${
                selectedRange === r.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Analytical Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Total Volume</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.total_energy_kwh || '--'}
            </span>
            <span className="text-xs font-mono font-bold text-brand-cyan">kWh</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Selected Horizon</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Expenditure</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono font-bold text-brand-emerald">{currency}</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {analyticsData ? Math.round(analyticsData.total_cost_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Active Tariff Rules</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Peak Demand</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.peak_demand_watts ? (analyticsData.peak_demand_watts / 1000).toFixed(2) : '--'}
            </span>
            <span className="text-xs font-mono font-bold text-brand-blue dark:text-brand-cyan">kW</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Instantaneous Peak</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">CO₂ Emitted</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.carbon_footprint_kg || '--'}
            </span>
            <span className="text-xs font-mono font-bold text-amber-500">kg</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">0.82 kg / kWh</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">Tree Offset</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-brand-emerald tabular-nums">
              {analyticsData?.trees_equivalent || '--'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">Trees</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Sequestration</span>
        </div>

      </div>

      {/* Main Dynamic Chart */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              {selectedRange === 'today' && "Hourly Load Trace (24 Hours)"}
              {selectedRange === '7d' && "7-Day Load: Peak vs Off-Peak Apportionment"}
              {selectedRange === '30d' && "30-Day Daily Consumption & 7-Day Moving Baseline"}
              {selectedRange === '12m' && "12-Month Year-over-Year Comparison"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedRange === '7d' && "Segmented by 18:00 - 22:00 grid peak surcharge hours."}
              {selectedRange === '30d' && "7-day rolling window to identify gradual baseload drift."}
              {selectedRange === 'today' && "Actual power draw against historical diurnal normal."}
              {selectedRange === '12m' && "Monthly volume comparison against historical baseline."}
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {selectedRange === 'today' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42D9E8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#42D9E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} interval={2} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}W`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel-elevated p-2.5 rounded-xl text-xs font-mono space-y-0.5 shadow-xl border border-white/60 dark:border-white/10">
                          <p className="font-bold text-brand-blue dark:text-brand-cyan">{label}</p>
                          <p className="text-slate-900 dark:text-white">Power: {payload[0]?.value} W</p>
                          <p className="text-slate-400">Baseline: {payload[1]?.value} W</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="power_watts" stroke="#42D9E8" strokeWidth={2} fill="url(#todayGrad)" name="Power" />
                <Line type="monotone" dataKey="baseline_watts" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Baseline" />
              </AreaChart>
            ) : selectedRange === '7d' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="day_name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel-elevated p-2.5 rounded-xl text-xs font-mono space-y-0.5 shadow-xl border border-white/60 dark:border-white/10">
                          <p className="font-bold text-slate-900 dark:text-white">{d.date} ({label})</p>
                          <p className="text-brand-blue dark:text-brand-cyan">Off-Peak: {d.off_peak_kwh} kWh</p>
                          <p className="text-brand-coral">Peak: {d.peak_kwh} kWh</p>
                          <p className="text-brand-emerald font-bold">Total: {d.total_kwh} kWh ({currency}{d.cost_inr})</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="off_peak_kwh" name="Off-Peak (kWh)" stackId="a" fill="#42D9E8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="peak_kwh" name="Peak Window 18-22h (kWh)" stackId="a" fill="#FF806B" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : selectedRange === '30d' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} interval={4} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel-elevated p-2.5 rounded-xl text-xs font-mono space-y-0.5 shadow-xl border border-white/60 dark:border-white/10">
                          <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                          <p className="text-brand-blue dark:text-brand-cyan">Daily: {payload[0]?.value} kWh</p>
                          <p className="text-brand-emerald font-semibold">7D Moving Avg: {payload[1]?.value} kWh</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="total_kwh" name="Daily Total (kWh)" stroke="#42D9E8" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="rolling_avg_kwh" name="7-Day Moving Avg" stroke="#24C78B" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="month_label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel-elevated p-2.5 rounded-xl text-xs font-mono space-y-0.5 shadow-xl border border-white/60 dark:border-white/10">
                          <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                          <p className="text-brand-blue dark:text-brand-cyan">Current Period: {d.total_kwh} kWh</p>
                          <p className="text-slate-400">Previous Baseline: {d.prev_year_kwh} kWh</p>
                          <p className="text-brand-emerald">Invoice: {currency}{d.cost_inr}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="total_kwh" name="Current Period (kWh)" fill="#4169E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prev_year_kwh" name="Previous Year Baseline" fill="#94A3B8" opacity={0.35} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appliance Fleet Apportionment Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Appliance Fleet Apportionment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked breakdown of appliance power ratings and estimated financial impact.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter appliance or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full glass-pill text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-200/50 dark:border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Appliance</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Daily Energy</th>
                <th className="py-3 px-3">Daily Cost</th>
                <th className="py-3 px-3">Monthly Cost</th>
                <th className="py-3 px-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredAppliances.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                    {app.name}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-500">{app.room}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{app.power_watts} W</td>
                  <td className="py-3 px-3 font-bold text-brand-blue dark:text-brand-cyan">{app.daily_energy_kwh} kWh</td>
                  <td className="py-3 px-3 text-brand-emerald">{currency}{app.daily_cost_inr}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{currency}{app.monthly_cost_inr}</td>
                  <td className="py-3 px-3 font-bold">{app.percentage_share}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
