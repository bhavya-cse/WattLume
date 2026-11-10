import React from 'react';
import { Sliders, LineChart, Target, Info, CheckCircle2 } from 'lucide-react';

export default function LandingHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Generate & Simulate Telemetry',
      subtitle: 'Software-driven physics model',
      description: 'The simulation engine computes voltage (230V RMS), power factor (0.92-0.98), and cumulative watt-hours from individual appliance schedules with diurnal residential noise.',
      icon: Sliders,
      tag: '100% Software-Based',
      details: ['No Arduino or ESP32 required', 'Physics formula: E = P × t', 'Granular load models']
    },
    {
      step: '02',
      title: 'Analyze Patterns & Baselines',
      subtitle: 'Statistical profiling & detection',
      description: 'Historical hourly consumption is grouped into baseline distributions. The analytics engine segments peak grid hours from off-peak periods and identifies abnormal surges via z-scores.',
      icon: LineChart,
      tag: 'Statistical Engine',
      details: ['Historical 60-day baseline', 'Hourly z-score thresholds', 'Appliance share attribution']
    },
    {
      step: '03',
      title: 'Discover Savings Opportunities',
      subtitle: 'Predictive billing & recommendations',
      description: 'Project end-of-month electricity bills in Indian Rupees (₹) under slab or flat tariffs. Receive contextual recommendations on cooling, phantom draw, and peak shifting.',
      icon: Target,
      tag: 'Actionable ROI',
      details: ['Monthly bill projections', 'Quantifiable ₹ savings', 'Transparent Efficiency Score']
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-white dark:bg-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald text-xs font-semibold uppercase tracking-wider">
            <span>Architecture & Flow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How WattLume makes energy visible
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            A three-stage digital intelligence pipeline turning consumption hypotheses into empirical energy decisions.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative p-8 rounded-2xl bg-slate-50 dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-brand-blue dark:text-brand-cyan tracking-wider">
                      {s.step}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan">
                      {s.tag}
                    </span>
                  </div>

                  <div className="p-3.5 w-fit rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/10 text-brand-cyan mb-4">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs font-medium text-brand-emerald mb-3">
                    {s.subtitle}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 dark:border-white/5 space-y-2">
                  {s.details.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulation Notice Callout */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-brand-blue/5 dark:bg-white/[0.03] border border-brand-blue/20 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/15 text-brand-blue dark:text-brand-cyan shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Simulated Telemetry Architecture</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                WattLume is designed as a software-first intelligence suite. Readings are mathematically generated and stored in SQLite rather than streamed from physical smart meters.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
            Zero Hardware Dependency
          </span>
        </div>

      </div>
    </section>
  );
}
