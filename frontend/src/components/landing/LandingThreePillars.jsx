
import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function LandingThreePillars({ onEnterDashboard }) {
  return (
    <div
      id="features"
      className="py-20 md:py-32 space-y-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <div id="overview" className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-blue dark:text-brand-cyan">
          Architecture &amp; Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#F4F5F6] tracking-tight">
          Precision energy intelligence.
        </h2>
        <p className="text-base text-slate-600 dark:text-[#A1A6AE] font-normal leading-relaxed">
          Three integrated modules designed to make electrical load, circuit
          distribution, and billing dynamics immediately intelligible.
        </p>
      </div>

      {/* Pillar 1: Understand your usage */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="md:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-[11px] font-mono text-brand-blue dark:text-brand-cyan font-semibold uppercase tracking-wider">
            01 • Consumption Tracking
          </div>

          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tracking-tight">
            Understand your usage.
          </h3>

          <p className="text-base text-slate-600 dark:text-[#A1A6AE] leading-relaxed font-normal">
            See how much electricity you consume over time.
          </p>

          <p className="text-sm text-slate-500 dark:text-[#A1A6AE] leading-relaxed">
            Monitor 24-hour diurnal load curves, compare weekday vs weekend
            demand, and track month-to-date kilowatt-hours alongside forecasted
            utility bills.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onEnterDashboard('analytics')}
              className="text-sm font-semibold text-brand-blue dark:text-brand-cyan hover:underline inline-flex items-center gap-1.5 group"
            >
              <span>Explore analytics telemetry</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="p-6 rounded-2xl glass-panel text-left space-y-4 shadow-glass-light dark:shadow-glass-dark">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE] border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <span className="font-semibold text-slate-800 dark:text-[#F4F5F6]">
                Weekly Energy Allocation
              </span>
              <span className="font-mono text-[11px]">7 Days Monitored</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#292D33] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-[#858B94] block uppercase font-mono">
                  Today
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-[#F4F5F6]">
                  11.45 kWh
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#292D33] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-[#858B94] block uppercase font-mono">
                  Peak (18-22h)
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-brand-blue dark:text-brand-cyan">
                  3.80 kWh
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#292D33] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-[#858B94] block uppercase font-mono">
                  Cost Today
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-brand-emerald">
                  ₹86.20
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-[#A1A6AE] pt-1 leading-normal">
              Calculated using standard domestic tiered tariffs (₹4.50, ₹7.00,
              ₹9.50 per unit) with real-time billing accrual.
            </p>
          </div>
        </div>
      </section>

      {/* Pillar 2: Know where energy goes */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="md:col-span-6 md:order-2 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-[11px] font-mono text-brand-blue dark:text-brand-cyan font-semibold uppercase tracking-wider">
            02 • Appliance Breakdown
          </div>

          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tracking-tight">
            Know where energy goes.
          </h3>

          <p className="text-base text-slate-600 dark:text-[#A1A6AE] leading-relaxed font-normal">
            Understand which appliances contribute most to your electricity bill.
          </p>

          <p className="text-sm text-slate-500 dark:text-[#A1A6AE] leading-relaxed">
            Break down household consumption into clear appliance categories.
            Audit running power ratings, active duty hours, and estimated
            monthly cost for each device.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onEnterDashboard('appliances')}
              className="text-sm font-semibold text-brand-blue dark:text-brand-cyan hover:underline inline-flex items-center gap-1.5 group"
            >
              <span>View appliance management</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="md:col-span-6 md:order-1">
          <div className="p-6 rounded-2xl glass-panel text-left space-y-4 shadow-glass-light dark:shadow-glass-dark">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#A1A6AE] border-b border-slate-200/60 dark:border-white/[0.08] pb-3">
              <span className="font-semibold text-slate-800 dark:text-[#F4F5F6]">
                Household Appliance Shares
              </span>
              <span className="font-mono text-[11px]">Active Breaker State</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-800 dark:text-[#F4F5F6]">
                    Air Conditioner (1.5 Ton)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F4F5F6]">
                    42% (₹1,240/mo)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#17191D] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-blue dark:bg-brand-cyan h-full rounded-full transition-all duration-500"
                    style={{ width: '42%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-800 dark:text-[#F4F5F6]">
                    Double-Door Refrigerator
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F4F5F6]">
                    18% (₹520/mo)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#17191D] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-emerald h-full rounded-full transition-all duration-500"
                    style={{ width: '18%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-800 dark:text-[#F4F5F6]">
                    Storage Water Heater (Geyser)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F4F5F6]">
                    15% (₹440/mo)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#17191D] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: '15%' }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 dark:text-[#A1A6AE] flex justify-between border-t border-slate-100 dark:border-white/[0.08]">
              <span>9 total appliances modeled</span>
              <span className="text-brand-emerald font-medium">
                Virtual switch control
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 3: Make smarter decisions */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="md:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-[11px] font-mono text-brand-blue dark:text-brand-cyan font-semibold uppercase tracking-wider">
            03 • Intelligence &amp; Savings
          </div>

          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6] tracking-tight">
            Make smarter decisions.
          </h3>

          <p className="text-base text-slate-600 dark:text-[#A1A6AE] leading-relaxed font-normal">
            Discover unusual usage patterns and practical energy-saving
            suggestions.
          </p>

          <p className="text-sm text-slate-500 dark:text-[#A1A6AE] leading-relaxed">
            Statistical threshold analysis detects abnormal power surges before
            bills arrive. Clear recommendations explain what happened, why it
            matters, and how to reduce consumption.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onEnterDashboard('insights')}
              className="text-sm font-semibold text-brand-blue dark:text-brand-cyan hover:underline inline-flex items-center gap-1.5 group"
            >
              <span>Explore smart insights</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="p-6 rounded-2xl glass-panel text-left space-y-4 shadow-glass-light dark:shadow-glass-dark">
            {/* Surge Alert Card */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-300">
                  Unusual Afternoon Surge
                </span>
                <span className="font-mono text-[11px] text-amber-800 dark:text-amber-400 font-bold">
                  +38% baseline
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A1A6AE] leading-normal">
                Air conditioning ran continuous compressor cooling for 4+ hours
                during mild ambient temperature.
              </p>
            </div>

            {/* Practical Recommendation */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                  Actionable Opportunity
                </span>
                <span className="font-mono text-[11px] font-bold text-brand-emerald">
                  Save ₹740 / mo
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A1A6AE] leading-normal">
                Raising your AC setpoint by 2°C (22°C → 24°C) or setting a
                3-hour dawn timer reduces compressor workload by up to 18%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="p-8 sm:p-12 rounded-3xl glass-panel-elevated text-center space-y-5 shadow-glass-light dark:shadow-glass-dark"
      >
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-[#858B94]">
          Software-Based Architecture
        </span>

        <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#F4F5F6]">
          About WattLume
        </h3>

        <p className="text-sm sm:text-base text-slate-600 dark:text-[#A1A6AE] max-w-2xl mx-auto leading-relaxed">
          WattLume is an independent software-based energy intelligence
          platform. All electricity readings are simulated using realistic
          residential load profiles, diurnal curves, and mathematical power
          models. It requires no physical meters, sensors, or hardware.
        </p>

        <div className="pt-3">
          <button
            onClick={() => onEnterDashboard('overview')}
            className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-[#292D33] dark:hover:bg-[#363B43] text-white dark:text-[#F4F5F6] text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
