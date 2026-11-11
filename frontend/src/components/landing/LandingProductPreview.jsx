import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Activity,
  Receipt,
  Leaf,
  TrendingDown,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Plays the intro once when the preview scrolls into view,
   and pauses looping animations while it is off-screen. */
function usePreviewVisibility(ref) {
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return { seen, visible };
}

/* Counts up to the existing value. Final frame is always exactly `to`. */
function CountUp({ to, decimals = 0, duration = 1400, delay = 0, active, suffix = '' }) {
  const [val, setVal] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) {
      setVal(to);
      return undefined;
    }
    let raf;
    const t0 = performance.now() + delay;
    const tick = (now) => {
      if (now < t0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, duration, delay]);

  return (
    <>
      {val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

export default function LandingProductPreview({ onEnterDashboard }) {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const { seen, visible } = usePreviewVisibility(rootRef);

  /* Tilt is applied directly to the element (no React re-render per mouse move) */
  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el || prefersReducedMotion()) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3.5;
    const rotateY = ((x - centerX) / centerX) * 3.5;

    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseEnter = () => {
    if (cardRef.current) cardRef.current.style.transition = 'transform 0.12s ease-out';
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  /* Cursor-following highlight inside KPI cards */
  const trackPointer = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const rootClass = [
    'wl-preview relative w-full max-w-5xl mx-auto pt-6 pb-2',
    seen ? 'wl-in' : '',
    visible ? '' : 'wl-offscreen',
  ].join(' ');

  return (
    <div ref={rootRef} className={rootClass} style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onEnterDashboard('overview')}
        style={{
          transform: 'rotateX(0deg) rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="cursor-pointer group relative rounded-2xl sm:rounded-3xl glass-panel-elevated p-1.5 sm:p-2 text-left shadow-2xl transition-shadow duration-500 hover:shadow-[0_32px_80px_rgba(16,27,45,0.14)] dark:hover:shadow-[0_36px_90px_rgba(0,0,0,0.45)]"
      >
        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.07] to-white/[0.18] dark:via-white/[0.015] dark:to-white/[0.035]" />

        {/* Inner Window Frame */}
        <div className="relative rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#202328] backdrop-blur-xl border border-white/60 dark:border-white/[0.08] overflow-hidden">

          {/* One-time light sweep across the window */}
          <span className="wl-sweep" aria-hidden="true" />

          {/* Window Chrome */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-200/60 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#17191D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#484D55]" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#484D55]" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#484D55]" />
              <span className="text-[11px] font-mono text-slate-400 dark:text-[#858B94] ml-2 hidden sm:inline">
                wattlume.app • energy overview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-brand-emerald text-[11px] font-mono font-medium">
                <span className="wl-live-dot" aria-hidden="true" />
                <span>LIVE SIMULATION</span>
              </span>
            </div>
          </div>

          {/* Dashboard Preview Content */}
          <div className="p-4 sm:p-7 space-y-6">

            {/* Greeting */}
            <div
              className="wl-rise flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/[0.07] pb-4"
              style={{ '--wl-d': '150ms' }}
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-[#858B94] uppercase tracking-wider font-mono">
                  Good evening
                </p>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tracking-tight">
                  Here's your energy overview.
                </h3>
              </div>
              <div className="text-xs text-slate-500 dark:text-[#A1A6AE] font-mono">
                Grid: 230V • 50 Hz • 3-BHK Household
              </div>
            </div>

            {/* Four Metric Panels */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

              {/* Consumption */}
              <div
                onMouseMove={trackPointer}
                style={{ '--wl-d': '450ms', '--wl-i': 0 }}
                className="wl-kpi wl-rise p-4 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-md dark:bg-[#292D33]/75 dark:backdrop-blur-md border border-white/80 dark:border-white/[0.06] shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE]">
                  <span className="font-medium text-[11px] sm:text-xs">Today's Consumption</span>
                  <Zap className="w-3.5 h-3.5 text-brand-royal dark:text-brand-cyan" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tabular-nums">
                    <CountUp to={11.45} decimals={2} delay={450} active={seen} />
                  </span>
                  <span className="text-xs font-mono text-slate-400">kWh</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-brand-emerald font-mono font-medium">
                  <TrendingDown className="w-3 h-3" />
                  <span>-6.5% vs yesterday</span>
                </div>
              </div>

              {/* Current Power */}
              <div
                onMouseMove={trackPointer}
                style={{ '--wl-d': '560ms', '--wl-i': 1 }}
                className="wl-kpi wl-rise p-4 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-md dark:bg-[#292D33]/75 dark:backdrop-blur-md border border-white/80 dark:border-white/[0.06] shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE]">
                  <span className="font-medium text-[11px] sm:text-xs">Current Power Usage</span>
                  <span className="wl-power-icon relative inline-flex items-center justify-center w-6 h-6 -my-1 -mr-[5px] rounded-full text-brand-cyan">
                    <Activity className="relative z-[1] w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="wl-power-value text-2xl sm:text-3xl font-heading font-bold text-brand-blue dark:text-brand-cyan tabular-nums">
                    <CountUp to={1840} delay={560} active={seen} />
                  </span>
                  <span className="text-xs font-mono text-slate-400">Watts</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-[#A1A6AE] font-mono">
                  6 active appliances
                </div>
              </div>

              {/* Monthly Bill */}
              <div
                onMouseMove={trackPointer}
                style={{ '--wl-d': '670ms', '--wl-i': 2 }}
                className="wl-kpi wl-rise p-4 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-md dark:bg-[#292D33]/75 dark:backdrop-blur-md border border-white/80 dark:border-white/[0.06] shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE]">
                  <span className="font-medium text-[11px] sm:text-xs">Estimated Monthly Bill</span>
                  <Receipt className="w-3.5 h-3.5 text-brand-emerald" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-slate-400">₹</span>
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tabular-nums">
                    <CountUp to={2840} delay={670} active={seen} />
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-brand-emerald font-mono font-medium">
                  <TrendingDown className="w-3 h-3" />
                  <span>-8.9% under budget</span>
                </div>
              </div>

              {/* Energy Saved */}
              <div
                onMouseMove={trackPointer}
                style={{ '--wl-d': '780ms', '--wl-i': 3 }}
                className="wl-kpi wl-rise p-4 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-md dark:bg-[#292D33]/75 dark:backdrop-blur-md border border-white/80 dark:border-white/[0.06] shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE]">
                  <span className="font-medium text-[11px] sm:text-xs">Energy Saved</span>
                  <Leaf className="w-3.5 h-3.5 text-brand-emerald" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tabular-nums">
                    <CountUp to={42.8} decimals={1} delay={780} active={seen} />
                  </span>
                  <span className="text-xs font-mono text-slate-400">kWh</span>
                </div>
                <div className="text-[11px] text-brand-emerald font-mono font-medium">
                  ₹340 saved this cycle
                </div>
              </div>
            </div>

            {/* Chart and Appliance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">

              {/* Load Profile */}
              <div
                className="wl-rise lg:col-span-8 p-4 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-[#202328] border border-slate-200/50 dark:border-white/[0.07] space-y-3"
                style={{ '--wl-d': '900ms' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-[#F4F5F6]">24-Hour Diurnal Load Profile</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono hidden sm:inline">Hourly Diurnal kW</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-royal dark:bg-brand-cyan" />
                      <span>Today</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                      <span>Peak Hours</span>
                    </span>
                  </div>
                </div>

                <div className="wl-chart relative h-32 w-full pt-1">
                  <div className="wl-chart-wipe h-full w-full">
                    <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4169E1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4169E1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-200 dark:text-white/[0.07]" strokeDasharray="3 3" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="currentColor" className="text-slate-200 dark:text-white/[0.07]" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="500" y2="110" stroke="currentColor" className="text-slate-200 dark:text-white/[0.07]" strokeDasharray="3 3" />

                      <path
                        d="M 0 100 Q 60 95, 120 80 T 240 60 T 340 30 T 420 25 T 500 70 L 500 120 L 0 120 Z"
                        fill="url(#previewGrad)"
                      />

                      <path
                        d="M 0 100 Q 60 95, 120 80 T 240 60 T 340 30 T 420 25 T 500 70"
                        fill="none"
                        stroke="#4169E1"
                        className="wl-line dark:stroke-[#42D9E8]"
                        strokeWidth="2.5"
                      />

                      {/* Light pulse travelling along the same curve */}
                      <path
                        d="M 0 100 Q 60 95, 120 80 T 240 60 T 340 30 T 420 25 T 500 70"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="7 93"
                        className="wl-comet"
                      />

                      <circle className="wl-peak-ping" cx="420" cy="25" r="7" fill="#42D9E8" />
                      <circle className="wl-peak-dot" cx="420" cy="25" r="4" fill="#42D9E8" />
                      <circle className="wl-peak-dot" cx="420" cy="25" r="7" fill="#42D9E8" fillOpacity="0.3" />
                    </svg>
                  </div>
                  <span className="wl-scanline" aria-hidden="true" />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-white/[0.07]">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span className="text-brand-cyan font-bold">18:00 (Peak 3.8 kW)</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* Appliance Breakdown */}
              <div
                className="wl-rise lg:col-span-4 p-4 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-[#202328] border border-slate-200/50 dark:border-white/[0.07] space-y-2.5"
                style={{ '--wl-d': '1000ms' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-[#F4F5F6]">Appliance Shares</span>
                  <span className="text-[10px] font-mono text-slate-400">Today</span>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 dark:text-[#C4C8CE]">Air Conditioner</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-[#F4F5F6] tabular-nums">
                        <CountUp to={42} suffix="%" duration={1200} delay={1250} active={seen} />
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-[#17191D] rounded-full overflow-hidden">
                      <div
                        className="wl-bar h-full bg-brand-royal dark:bg-brand-cyan rounded-full"
                        style={{ width: '42%', '--wl-d': '1250ms', '--wl-i': 0 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 dark:text-[#C4C8CE]">Refrigerator</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-[#F4F5F6] tabular-nums">
                        <CountUp to={18} suffix="%" duration={1200} delay={1400} active={seen} />
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-[#17191D] rounded-full overflow-hidden">
                      <div
                        className="wl-bar h-full bg-brand-cyan rounded-full"
                        style={{ width: '18%', '--wl-d': '1400ms', '--wl-i': 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 dark:text-[#C4C8CE]">Water Geyser</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-[#F4F5F6] tabular-nums">
                        <CountUp to={15} suffix="%" duration={1200} delay={1550} active={seen} />
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-[#17191D] rounded-full overflow-hidden">
                      <div
                        className="wl-bar h-full bg-brand-emerald rounded-full"
                        style={{ width: '15%', '--wl-d': '1550ms', '--wl-i': 2 }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="wl-rise mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-slate-700 dark:text-[#C4C8CE] flex items-center gap-1.5"
                  style={{ '--wl-d': '2000ms' }}
                >
                  <ShieldCheck className="wl-shield w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span className="truncate">AC Dawn Timer active: saving ~₹740/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover hint */}
        <div className="wl-rise py-2 text-center" style={{ '--wl-d': '2400ms' }}>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-brand-royal dark:group-hover:text-brand-cyan transition-colors font-medium">
            <span>Click anywhere to explore the live dashboard</span>
            <span className="wl-nudge inline-flex">
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}