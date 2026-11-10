import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Zap, 
  Leaf, 
  IndianRupee, 
  Clock, 
  TreePine, 
  Filter, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { fetchAnalytics } from '../../services/api';

export default function AnalyticsView() {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Bar with Horizon Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Energy Consumption Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-scale chronological decomposition and peak demand analysis.
          </p>
        </div>

        {/* Range Selector Pill */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 p-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRange === r.id
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-brand-cyan shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Energy */}
        <div className="p-4 rounded-xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Consumption</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.total_energy_kwh || '--'}
            </span>
            <span className="text-xs font-bold text-brand-cyan">kWh</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Selected Horizon</span>
        </div>

        {/* Total Cost */}
        <div className="p-4 rounded-xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estimated Cost</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-bold text-brand-emerald">{currency}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {analyticsData ? Math.round(analyticsData.total_cost_inr).toLocaleString('en-IN') : '--'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Active Tariff Rules</span>
        </div>

        {/* Peak Demand */}
        <div className="p-4 rounded-xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Peak Demand</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.peak_demand_watts ? (analyticsData.peak_demand_watts / 1000).toFixed(2) : '--'}
            </span>
            <span className="text-xs font-bold text-brand-blue">kW</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Instantaneous Peak</span>
        </div>

        {/* Carbon Footprint */}
        <div className="p-4 rounded-xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Carbon Footprint</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.carbon_footprint_kg || '--'}
            </span>
            <span className="text-xs font-bold text-amber-500">kg CO₂</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">0.82 kg CO₂ / kWh</span>
        </div>

        {/* Trees Equivalent */}
        <div className="p-4 rounded-xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tree Offset Needed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {analyticsData?.trees_equivalent || '--'}
            </span>
            <span className="text-xs font-bold text-brand-emerald">Trees</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Annual Sequestration</span>
        </div>

      </div>

      {/* Main Dynamic Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedRange === 'today' && "Hourly Load Profile (24 Hours)"}
              {selectedRange === '7d' && "7-Day Load: Peak vs Off-Peak Apportionment"}
              {selectedRange === '30d' && "30-Day Daily Consumption Trend & Rolling Average"}
              {selectedRange === '12m' && "12-Month Historical & Seasonal Comparison"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedRange === 'today' && "Real-time electrical active watts compared with historical hourly normal."}
              {selectedRange === '7d' && "Distribution of kilowatt-hours consumed during grid peak hours (18:00 - 22:00) vs off-peak."}
              {selectedRange === '30d' && "Daily total energy with 7-day smoothing curve to detect upward baseline creep."}
              {selectedRange === '12m' && "Monthly energy volume with previous year baseline for annual benchmarking."}
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {selectedRange === 'today' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="anPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42D9E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#42D9E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} interval={2} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}W`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs space-y-1 shadow-xl">
                          <p className="font-bold text-brand-cyan">{label}</p>
                          <p>Power: <span className="font-mono text-white font-bold">{payload[0]?.value} W</span></p>
                          <p className="text-slate-400">Energy: <span className="font-mono">{payload[0]?.payload?.energy_kwh} kWh</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="power_watts" stroke="#42D9E8" strokeWidth={2.5} fill="url(#anPower)" name="Power (W)" />
                <Line type="monotone" dataKey="baseline_watts" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Baseline" />
              </AreaChart>
            ) : selectedRange === '7d' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="day_name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs space-y-1 shadow-xl">
                          <p className="font-bold text-white">{data.date} ({label})</p>
                          <p className="text-brand-cyan">Off-Peak: <span className="font-mono">{data.off_peak_kwh} kWh</span></p>
                          <p className="text-brand-coral">Peak: <span className="font-mono">{data.peak_kwh} kWh</span></p>
                          <p className="text-brand-emerald">Total: <span className="font-mono font-bold">{data.total_kwh} kWh ({currency}{data.cost_inr})</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="off_peak_kwh" name="Off-Peak Energy (kWh)" stackId="a" fill="#42D9E8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="peak_kwh" name="Peak Hours 18-22h (kWh)" stackId="a" fill="#FF806B" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : selectedRange === '30d' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} interval={4} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs space-y-1 shadow-xl">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-brand-cyan">Daily Total: <span className="font-mono font-bold">{payload[0]?.value} kWh</span></p>
                          <p className="text-brand-emerald">7-Day Moving Avg: <span className="font-mono">{payload[1]?.value} kWh</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="total_kwh" name="Daily Energy (kWh)" stroke="#42D9E8" strokeWidth={2} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="rolling_avg_kwh" name="7-Day Moving Avg" stroke="#24C78B" strokeWidth={2.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="month_label" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs space-y-1 shadow-xl">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-brand-cyan">Current Year: <span className="font-mono font-bold">{data.total_kwh} kWh</span></p>
                          <p className="text-slate-400">Previous Year: <span className="font-mono">{data.prev_year_kwh} kWh</span></p>
                          <p className="text-brand-emerald">Billed Cost: <span className="font-mono">{currency}{data.cost_inr}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="total_kwh" name="Current Period (kWh)" fill="#4169E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prev_year_kwh" name="Previous Year Baseline" fill="#94A3B8" opacity={0.4} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appliance-Wise Energy Breakdown Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Appliance Consumption Apportionment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked breakdown of appliance power ratings and daily financial impact.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Appliance</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Power Rating</th>
                <th className="py-3 px-4">Daily Usage</th>
                <th className="py-3 px-4">Daily Cost</th>
                <th className="py-3 px-4">Monthly Cost</th>
                <th className="py-3 px-4 rounded-r-xl">Load Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {analyticsData?.appliances?.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                    <span>{app.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{app.room}</td>
                  <td className="py-3.5 px-4 font-mono">{app.power_watts} W</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {app.daily_energy_kwh} kWh
                  </td>
                  <td className="py-3.5 px-4 font-mono text-brand-emerald">
                    {currency}{app.daily_cost_inr}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-brand-blue font-bold">
                    {currency}{app.monthly_cost_inr}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-cyan h-full rounded-full"
                          style={{ width: `${Math.min(100, app.percentage_share * 2.2)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {app.percentage_share}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
