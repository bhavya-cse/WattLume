import React, { useState, useRef } from 'react';
import {
  Zap,
  Activity,
  Receipt,
  Leaf,
  TrendingDown,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function LandingProductPreview({ onEnterDashboard }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt: max 3.5 degrees
    const rotateX = ((y - centerY) / centerY) * -3.5;
    const rotateY = ((x - centerX) / centerX) * 3.5;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      className="relative w-full max-w-5xl mx-auto pt-6 pb-2"
      style={{ perspective: '1200px' }}
    >
      {/* 3D Glass Surface Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onEnterDashboard('overview')}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="cursor-pointer group relative rounded-2xl sm:rounded-3xl glass-panel-elevated p-1.5 sm:p-2 text-left shadow-2xl transition-shadow duration-500 hover:shadow-[0_32px_80px_rgba(16,27,45,0.14)] dark:hover:shadow-[0_36px_90px_rgba(0,0,0,0.7)]"
      >
        {/* Specular glass reflection layer */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.07] to-white/[0.18] dark:via-white/[0.02] dark:to-white/[0.06]" />

        {/* Inner Window Frame */}
        <div className="relative rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#131D2E]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 overflow-hidden">

          {/* Window Chrome / Bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
                wattlume.app • energy overview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-brand-emerald text-[11px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                <span>LIVE SIMULATION</span>
              </span>
            </div>
          </div>

          {/* Actual Dashboard Content Mockup */}
          <div className="p-4 sm:p-7 space-y-6">

            {/* Top Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/5 pb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Good evening
                </p>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                  Here's your energy overview.
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Grid: 230V • 50 Hz • 3-BHK Household
              </div>
            </div>

            {/* Exactly 4 Glass Metric Panels */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

              {/* Metric 1 */}
              <div className="p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-[11px] sm:text-xs">Today's Consumption</span>
                  <Zap className="w-3.5 h-3.5 text-brand-royal" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tabular-nums">
                    11.45
                  </span>
                  <span className="text-xs font-mono text-slate-400">kWh</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-brand-emerald font-mono font-medium">
                  <TrendingDown className="w-3 h-3" />
                  <span>-6.5% vs yesterday</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-[11px] sm:text-xs">Current Power Usage</span>
                  <Activity className="w-3.5 h-3.5 text-brand-cyan" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-brand-blue dark:text-brand-cyan tabular-nums">
                    1,840
                  </span>
                  <span className="text-xs font-mono text-slate-400">Watts</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  6 active appliances
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-[11px] sm:text-xs">Estimated Monthly Bill</span>
                  <Receipt className="w-3.5 h-3.5 text-brand-emerald" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-slate-400">₹</span>
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tabular-nums">
                    2,840
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-brand-emerald font-mono font-medium">
                  <TrendingDown className="w-3 h-3" />
                  <span>-8.9% under budget</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-[11px] sm:text-xs">Energy Saved</span>
                  <Leaf className="w-3.5 h-3.5 text-brand-emerald" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tabular-nums">
                    42.8
                  </span>
                  <span className="text-xs font-mono text-slate-400">kWh</span>
                </div>
                <div className="text-[11px] text-brand-emerald font-mono font-medium">
                  ₹340 saved this cycle
                </div>
              </div>

            </div>

            {/* Chart & Appliance Breakdown Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">

              {/* Diurnal Load Profile Preview (8 Cols) */}
              <div className="lg:col-span-8 p-4 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">24-Hour Diurnal Load Profile</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono hidden sm:inline">Hourly Diurnal kW</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-royal" />
                      <span>Today</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                      <span>Peak Hours</span>
                    </span>
                  </div>
                </div>

                {/* Vector Curve */}
                <div className="h-32 w-full pt-1">
                  <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4169E1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4169E1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />
                    <line x1="0" y1="110" x2="500" y2="110" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />

                    {/* Area fill */}
                    <path
                      d="M 0 100 Q 60 95, 120 80 T 240 60 T 340 30 T 420 25 T 500 70 L 500 120 L 0 120 Z"
                      fill="url(#previewGrad)"
                    />
                    {/* Stroke */}
                    <path
                      d="M 0 100 Q 60 95, 120 80 T 240 60 T 340 30 T 420 25 T 500 70"
                      fill="none"
                      stroke="#4169E1"
                      strokeWidth="2.5"
                    />
                    {/* Peak highlight marker */}
                    <circle cx="420" cy="25" r="4" fill="#42D9E8" />
                    <circle cx="420" cy="25" r="7" fill="#42D9E8" fillOpacity="0.3" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span className="text-brand-cyan font-bold">18:00 (Peak 3.8 kW)</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* Appliance Breakdown (4 Cols) */}
              <div className="lg:col-span-4 p-4 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">Appliance Shares</span>
                  <span className="text-[10px] font-mono text-slate-400">Today</span>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 dark:text-slate-300">Air Conditioner</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">42%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-royal rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 dark:text-slate-300">Refrigerator</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">18%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-cyan rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 dark:text-slate-300">Water Geyser</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">15%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-emerald rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>

                {/* Insight banner inside preview */}
                <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span className="truncate">AC Dawn Timer active: saving ~₹740/mo</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Hover hint tag */}
        <div className="py-2 text-center">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-brand-royal dark:group-hover:text-brand-cyan transition-colors font-medium">
            <span>Click anywhere to explore the live dashboard</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
