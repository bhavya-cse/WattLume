import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from 'recharts';
import {
  fetchOverview,
  fetchInsights,
  fetchBilling,
} from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';
import { useTheme } from '../../context/ThemeContext';


/* Fixed colour per appliance, shared with the foundation tokens */
function applianceColor(name = '') {
  const n = name.toLowerCase();
  if (n.includes('air cond')) return 'var(--wd-ap-ac)';
  if (n.includes('refrig')) return 'var(--wd-ap-fridge)';
  if (n.includes('geyser') || n.includes('water heater')) return 'var(--wd-ap-geyser)';
  if (n.includes('wash')) return 'var(--wd-ap-washer)';
  if (n.includes('television') || /\btv\b/.test(n)) return 'var(--wd-ap-tv)';
  return 'var(--wd-ap-other)';
}

/* --------------------------------------------------
   REUSABLE ANIMATED NUMBER (unchanged behaviour)
-------------------------------------------------- */

function AnimatedNumber({ value, decimals = 0, duration = 1000 }) {
  const target = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const currentValue = useRef(0);

  useEffect(() => {
    const startValue = currentValue.current;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentValue.current = target;
      setDisplayValue(target);
      return;
    }

    let frameId;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (target - startValue) * easedProgress;

      currentValue.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        currentValue.current = target;
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return (
    <>
      {displayValue.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

/* --------------------------------------------------
   SMALL PRESENTATION HELPERS
-------------------------------------------------- */

function Delta({ tone = 'good', icon: Icon, children }) {
  return (
    <span className={`wd-delta wd-delta-${tone}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{children}</span>
    </span>
  );
}

function KpiCell({ index, accent, label, icon: Icon, iconLive = false, children }) {
  return (
    <div
      className={`wd-kpi wd-ov-kpi wd-enter ${accent}`}
      style={{ '--i': index }}
    >
      <div className="flex items-center justify-between">
        <span className="wd-kpi-label">{label}</span>
        <span className={`wd-ov-icon ${iconLive ? 'wd-ov-icon-live' : ''}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--wd-line)]">
      <div>
        <h3 className="wd-title font-heading">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-[#A1A6AE] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

const linkBtn =
  'text-xs text-brand-blue dark:text-brand-cyan hover:underline font-semibold inline-flex items-center gap-1';

/* --------------------------------------------------
   OVERVIEW DASHBOARD
-------------------------------------------------- */

export default function OverviewView({ onNavigateView }) {
  const { liveTelemetry, refreshLive, addToast, isPaused } = useSimulation();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [appliedInsight, setAppliedInsight] = useState(false);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);

  /* Reduced-motion preference */

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /* Reveal appliance bars */

  useEffect(() => {
    if (prefersReducedMotion) {
      setBarsVisible(true);
      return undefined;
    }
    setBarsVisible(false);
    const timeout = setTimeout(() => setBarsVisible(true), 150);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  /* Time-of-day greeting */

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  /* Load dashboard data */

  const loadData = async ({ manual = false } = {}) => {
    if (manual) setRefreshing(true);
    try {
      const [overviewRes, insightsRes, billingRes] = await Promise.all([
        fetchOverview(),
        fetchInsights().catch(() => null),
        fetchBilling().catch(() => null),
      ]);

      setOverviewData(
        overviewRes && Array.isArray(overviewRes.hourly_chart)
          ? {
              ...overviewRes,
              hourly_chart: overviewRes.hourly_chart.map((h) => ({
                ...h,
                kwh: h.energy_kwh,
              })),
            }
          : overviewRes
      );
      setInsightsData(insightsRes);
      setBillingData(billingRes);
      setError(false);
    } catch (err) {
      console.error('Failed to load overview data:', err);
      if (manual) {
        addToast('Could not refresh. Showing the last loaded data.', 'error');
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Loading state */

  if (loading && !overviewData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="wd-skeleton h-4 w-28" />
          <div className="wd-skeleton h-8 w-72" />
        </div>
        <div className="wd-skeleton h-32 w-full" style={{ borderRadius: 'var(--wd-radius)' }} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="wd-skeleton lg:col-span-8 h-80" style={{ borderRadius: 'var(--wd-radius)' }} />
          <div className="wd-skeleton lg:col-span-4 h-80" style={{ borderRadius: 'var(--wd-radius)' }} />
        </div>
      </div>
    );
  }

  /* Error state */

  if (error && !overviewData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="wd-card flex flex-col items-center text-center gap-3 py-12">
          <span className="wd-ov-icon" style={{ '--accent': 'var(--wd-bad)' }}>
            <AlertTriangle className="w-4 h-4" />
          </span>
          <h2 className="wd-title font-heading">Couldn't load your overview</h2>
          <p className="text-xs text-slate-500 dark:text-[#A1A6AE] max-w-sm">
            The backend didn't respond. Check that it is running, then try again.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(false);
              loadData();
            }}
            className="mt-1 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-royal text-white hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* Dashboard data */

  const kpis = overviewData?.kpis || {};
  const hourlyChart = overviewData?.hourly_chart || [];
  const appliances = overviewData?.appliance_breakdown || [];
  const currency = overviewData?.currency_symbol || '₹';

  /* Live metrics */

  const liveWatts =
    liveTelemetry.current_power_watts || kpis.current_power_w || 1840;
  const liveKwhToday =
    liveTelemetry.today_energy_kwh || kpis.today_kwh || 11.45;
  const activeCount = Math.round(liveTelemetry.appliances_active_count ?? 6);
  const totalCount = Math.round(liveTelemetry.total_appliances_count ?? 9);

  /* Monthly comparison (real billing data only, no fallback numbers) */

  const hasBilling =
    billingData?.previous_month_kwh != null &&
    billingData?.forecasted_month_kwh != null;
  const prevKwh = hasBilling ? Math.round(billingData.previous_month_kwh) : 0;
  const forecastKwh = hasBilling ? Math.round(billingData.forecasted_month_kwh) : 0;
  const forecastRatio = prevKwh ? forecastKwh / prevKwh : 0;
  const forecastFill =
    forecastRatio > 1 ? '#FF806B' : forecastRatio > 0.95 ? '#E3A82B' : '#4169E1';

  const monthlyComparison = hasBilling
    ? [
        { name: 'Last Month', kwh: prevKwh, fill: '#94A3B8' },
        { name: 'This Month (Est)', kwh: forecastKwh, fill: forecastFill },
      ]
    : [];

  const monthDiff = prevKwh - forecastKwh;
  const monthDiffPct = prevKwh ? (Math.abs(monthDiff) / prevKwh) * 100 : 0;

  /* Projected saving vs last month (from billing) */

  const savedKwh = hasBilling
    ? billingData.previous_month_kwh - billingData.forecasted_month_kwh
    : 0;
  const savedCost =
    billingData?.bill_diff_amount != null ? -billingData.bill_diff_amount : null;

  /* Efficiency score (from API) */

  const efficiencyScore = kpis.efficiency_score ?? null;
  const effColor =
    efficiencyScore >= 75
      ? 'var(--wd-good, #24C78B)'
      : efficiencyScore >= 50
        ? 'var(--wd-warn, #E3A82B)'
        : 'var(--wd-bad, #FF806B)';

  /* Lowest hour among hours already elapsed in the simulated day */

  const simHour = parseInt((liveTelemetry.simulated_time || '').slice(11, 13), 10);
  const lowestHour = hourlyChart
    .filter((h) => Number.isNaN(simHour) || h.hour <= simHour)
    .reduce((min, h) => (!min || h.energy_kwh < min.energy_kwh ? h : min), null);

  /* Largest appliance share (derived from data) */

  const topAppliance = appliances.reduce(
    (best, a) => (!best || a.percentage_share > best.percentage_share ? a : best),
    null
  );

  /* Peak slab band on the hourly chart */

  const peakStart = hourlyChart.find((d) => d.hour === 18)?.time;
  const peakEnd = hourlyChart.find((d) => d.hour === 22)?.time;

  /* Energy recommendation */

  const topRecommendation =
    insightsData?.recommendations?.length > 0
      ? insightsData.recommendations[0]
      : {
          id: 1,
          title: 'Shift AC thermostat from 22°C to 24°C during peak diurnal hours',
          description:
            'Compressor duty cycle drops by 18% during afternoon heat without compromising thermal comfort.',
          impact_level: 'High',
          estimated_monthly_saving_inr: 740,
          appliance: 'Air Conditioner (1.5 Ton)',
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

  const chartAnimation = !prefersReducedMotion;
  const lineColor = isDark ? '#42D9E8' : '#4169E1';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}

      <div
        className="wd-enter flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--wd-line)]"
        style={{ '--i': 0 }}
      >
        <div>
          <p className="wd-eyebrow">{getGreeting()}</p>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Here's your energy overview.
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline text-[11px] font-mono text-slate-500 dark:text-[#A1A6AE]">
            230V • 50 Hz Domestic Profile
          </span>

          <span className={`wd-chip ${isPaused ? 'wd-chip-warn' : 'wd-chip-live'}`}>
            {!isPaused && <span className="wd-live-dot" aria-hidden="true" />}
            <span>{isPaused ? 'PAUSED' : 'LIVE'}</span>
          </span>

          <button
            onClick={() => {
              loadData({ manual: true });
              refreshLive();
              addToast('Refreshing telemetry and circuit readings...', 'info');
            }}
            disabled={refreshing}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#202328] text-slate-500 hover:text-brand-royal dark:hover:text-brand-cyan hover:border-brand-royal/40 dark:hover:border-brand-cyan/40 transition-colors disabled:opacity-60"
            title="Refresh overview metrics"
            aria-label="Refresh overview metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI STRIP */}

      <div className="wd-ov-kpis grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCell index={1} accent="wd-accent-live" label="Today's Consumption" icon={Zap}>
          <div className="flex items-baseline">
            <span className="wd-kpi-value font-heading">
              <AnimatedNumber value={liveKwhToday} decimals={2} />
            </span>
            <span className="wd-kpi-unit">kWh</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#A1A6AE]">
            {kpis.yesterday_kwh > 0
              ? `${Math.round((liveKwhToday / kpis.yesterday_kwh) * 100)}% of yesterday's total so far`
              : 'No data for yesterday yet'}
          </span>
        </KpiCell>

        <KpiCell
          index={2}
          accent="wd-accent-live"
          label="Current Power Usage"
          icon={Activity}
          iconLive={!isPaused}
        >
          <div className="flex items-baseline">
            <span className="wd-kpi-value wd-ov-live-value font-heading">
              <AnimatedNumber value={Math.round(liveWatts)} />
            </span>
            <span className="wd-kpi-unit">Watts</span>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-[#A1A6AE]">
            {!isPaused && (
              <span className="wd-live-dot text-brand-cyan" aria-hidden="true" />
            )}
            <span>{activeCount} of {totalCount} appliances drawing</span>
          </span>
        </KpiCell>

        <KpiCell index={3} accent="wd-accent-money" label="Estimated Monthly Bill" icon={Receipt}>
          <div className="flex items-baseline">
            <span className="mr-1 text-lg font-semibold text-slate-400">{currency}</span>
            <span className="wd-kpi-value font-heading">
              <AnimatedNumber value={Math.round(kpis.estimated_monthly_bill_inr ?? 0)} />
            </span>
          </div>
          {kpis.monthly_bill_diff_pct != null && (
            <Delta
              tone={kpis.monthly_bill_diff_pct <= 0 ? 'good' : 'bad'}
              icon={kpis.monthly_bill_diff_pct <= 0 ? TrendingDown : TrendingUp}
            >
              {Math.abs(kpis.monthly_bill_diff_pct).toFixed(1)}%{' '}
              {kpis.monthly_bill_diff_pct <= 0 ? 'below' : 'above'} last month
            </Delta>
          )}
        </KpiCell>

        <KpiCell
          index={4}
          accent="wd-accent-good"
          label={savedKwh >= 0 ? 'Projected Saving' : 'Projected Increase'}
          icon={Leaf}
        >
          <div className="flex items-baseline">
            <span className="wd-kpi-value font-heading">
              {hasBilling ? <AnimatedNumber value={Math.abs(savedKwh)} decimals={1} /> : '—'}
            </span>
            {hasBilling && <span className="wd-kpi-unit">kWh</span>}
          </div>
          {hasBilling && savedCost != null && (
            <Delta
              tone={savedKwh >= 0 ? 'good' : 'bad'}
              icon={savedKwh >= 0 ? Sparkles : TrendingUp}
            >
              {currency}{Math.round(Math.abs(savedCost)).toLocaleString('en-IN')} vs last month
            </Delta>
          )}
          {efficiencyScore != null && (
            <span className="mt-1 block text-[11px] font-mono leading-snug" style={{ color: effColor }}>
              Efficiency {efficiencyScore}/100{kpis.efficiency_label && <span className="block">{kpis.efficiency_label}</span>}
            </span>
          )}
        </KpiCell>
      </div>

      {/* ENERGY CHART AND APPLIANCE BREAKDOWN */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 24-hour energy chart */}

        <div className="wd-card wd-enter lg:col-span-8 space-y-4" style={{ '--i': 5 }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[var(--wd-line)]">
            <div>
              <h3 className="wd-title font-heading">Energy Consumption Chart</h3>
              <p className="text-xs text-slate-500 dark:text-[#A1A6AE] mt-0.5">
                24-Hour Diurnal Load Profile with hourly kilowatt-hour telemetry.
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-[#A1A6AE]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 rounded-full" style={{ background: lineColor }} />
                <span>Simulated Draw</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E3A82B]/30 border border-[#E3A82B]/60" />
                <span>Peak Slab (18-22h)</span>
              </span>
            </div>
          </div>

          <div className="wd-ov-chart h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyChart}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.32} />
                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--chart-grid, #E2E8F0)"
                  opacity={0.4}
                />

                {peakStart && peakEnd && (
                  <ReferenceArea
                    x1={peakStart}
                    x2={peakEnd}
                    fill="#E3A82B"
                    fillOpacity={0.09}
                    stroke="none"
                  />
                )}

                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--chart-axis, #94A3B8)"
                  fontSize={11}
                  interval={3}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--chart-axis, #94A3B8)"
                  fontSize={11}
                  width={38}
                  tickFormatter={(v) => `${Math.round(v * 100) / 100}`}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isPeak = data.hour >= 18 && data.hour <= 22;

                      return (
                        <div className="glass-panel-elevated p-3 rounded-xl shadow-xl text-xs font-mono border border-white/60 dark:border-white/10">
                          <div className="text-slate-400 text-[10px] uppercase font-sans mb-1 flex items-center justify-between gap-3">
                            <span>{data.time}</span>
                            {isPeak && (
                              <span className="wd-chip wd-chip-warn" style={{ padding: '0 6px', fontSize: 9 }}>
                                PEAK SLAB
                              </span>
                            )}
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
                  stroke={lineColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#energyGrad)"
                  isAnimationActive={chartAnimation}
                  animationDuration={1600}
                  animationEasing="ease-out"
                  activeDot={{
                    r: 5,
                    stroke: '#42D9E8',
                    strokeWidth: 2,
                    fill: isDark ? '#202328' : '#4169E1',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[var(--wd-line)] flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE]">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lowestHour
                  ? `Lowest hour so far: ${lowestHour.energy_kwh.toFixed(2)} kWh at ${lowestHour.time}`
                  : 'Waiting for hourly data'}
              </span>
            </span>

            <button onClick={() => onNavigateView('analytics')} className={linkBtn}>
              <span>Explore full analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Appliance breakdown */}

        <div
          className="wd-card wd-enter lg:col-span-4 flex flex-col justify-between space-y-4"
          style={{ '--i': 6 }}
        >
          <div>
            <CardHeader
              title="Appliance Breakdown"
              subtitle="Share of today's electricity consumption."
              action={
                <button onClick={() => onNavigateView('appliances')} className={linkBtn}>
                  All ({totalCount})
                </button>
              }
            />

            <div className="space-y-4 pt-4">
              {appliances.slice(0, 4).map((app, idx) => {
                const cleanName = app.name.split(' (')[0];
                const color = applianceColor(app.name);

                return (
                  <div key={app.name || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 min-w-0 font-medium text-slate-800 dark:text-slate-200">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: color }}
                          aria-hidden="true"
                        />
                        <span className="truncate max-w-[150px]">{cleanName}</span>
                      </span>

                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                        {app.percentage_share}%
                        <span className="text-[10px] text-slate-400 font-normal">
                          {' '}({app.daily_energy_kwh.toFixed(1)} kWh)
                        </span>
                      </span>
                    </div>

                    <div className="wd-track">
                      <div
                        className="wd-ov-bar"
                        style={{
                          '--c': color,
                          '--i': idx,
                          width: barsVisible
                            ? `${Math.min(100, app.percentage_share)}%`
                            : '0%',
                          transition: prefersReducedMotion
                            ? 'none'
                            : `width 1000ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 140}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--wd-line)] text-[11px] text-slate-500 dark:text-[#A1A6AE] flex items-center justify-between gap-3">
            <span className="truncate">
              {topAppliance
                ? `${topAppliance.name.split(' (')[0]} is the largest share (${topAppliance.percentage_share}%)`
                : 'No appliance data yet'}
            </span>

            <button onClick={() => onNavigateView('appliances')} className={`${linkBtn} shrink-0`}>
              Virtual switches →
            </button>
          </div>
        </div>
      </div>

      {/* MONTHLY COMPARISON AND ENERGY INSIGHT */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Monthly comparison */}

        <div className="wd-card wd-enter lg:col-span-6 space-y-4" style={{ '--i': 7 }}>
          <CardHeader
            title="Monthly Usage Comparison"
            subtitle="Current month-to-date projection against last month."
            action={
              <button onClick={() => onNavigateView('bills')} className={`${linkBtn} shrink-0`}>
                View billing →
              </button>
            }
          />

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyComparison}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--chart-grid, #E2E8F0)"
                  opacity={0.4}
                />

                <XAxis
                  type="number"
                  stroke="var(--chart-axis, #94A3B8)"
                  fontSize={11}
                  unit=" kWh"
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--chart-axis, #94A3B8)"
                  fontSize={11}
                  width={105}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel-elevated p-2 rounded-lg text-xs font-mono border border-white/60 dark:border-white/10">
                          <span className="font-sans font-semibold text-slate-900 dark:text-white">
                            {d.name}
                          </span>
                          <div className="text-brand-blue dark:text-brand-cyan font-bold">
                            {d.kwh} kWh
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar
                  dataKey="kwh"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                  isAnimationActive={chartAnimation}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {monthlyComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[var(--wd-line)] flex flex-wrap items-center justify-between gap-2 text-xs">
            {hasBilling ? (
              monthDiff >= 0 ? (
                <Delta tone="good" icon={TrendingDown}>
                  {monthDiffPct.toFixed(1)}% lower than last month ({monthDiff} kWh less)
                </Delta>
              ) : (
                <Delta tone="bad" icon={TrendingUp}>
                  {monthDiffPct.toFixed(1)}% higher than last month ({Math.abs(monthDiff)} kWh more)
                </Delta>
              )
            ) : (
              <span className="font-mono text-[11px] text-slate-400">
                Billing data unavailable
              </span>
            )}

            {hasBilling && (
              <span className="font-mono text-[11px] text-slate-400">
                Forecast {forecastKwh} kWh · last month {prevKwh} kWh
              </span>
            )}
          </div>
        </div>

        {/* Highlighted insight */}

        <div
          className="wd-card wd-enter lg:col-span-6 flex flex-col justify-between space-y-4 border-l-[3px] border-l-brand-emerald"
          style={{ '--i': 8 }}
        >
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--wd-line)]">
              <div className="flex items-center gap-2">
                <span className="wd-ov-icon" style={{ '--accent': 'var(--wd-good)', width: 24, height: 24 }}>
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="wd-title font-heading">Highlighted Energy Insight</h3>
              </div>

              <span className="wd-chip wd-chip-good shrink-0">
                Save {currency}{topRecommendation.estimated_monthly_saving_inr || 740} / mo
              </span>
            </div>

            <div className="pt-3 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {topRecommendation.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {topRecommendation.description}
              </p>

              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                <span>Target: {topRecommendation.appliance || 'Air Conditioner'}</span>
                <span>•</span>
                <span className="text-brand-emerald font-semibold">
                  Impact: {topRecommendation.impact_level || 'High'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--wd-line)] flex items-center justify-between gap-3">
            <button
              onClick={handleApplyInsight}
              aria-pressed={appliedInsight}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 active:scale-95 ${
                appliedInsight
                  ? 'bg-brand-emerald text-white'
                  : 'bg-slate-900 text-white dark:bg-[#292D33] dark:text-[#F4F5F6] hover:bg-brand-royal dark:hover:bg-[#363B43]'
              }`}
            >
              {appliedInsight ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{appliedInsight ? 'Adjustment Applied' : 'Apply Recommendation'}</span>
            </button>

            <button onClick={() => onNavigateView('insights')} className={linkBtn}>
              <span>View all insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}