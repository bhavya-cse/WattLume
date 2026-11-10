import React from 'react';
import { Zap, IndianRupee, Cpu, Award } from 'lucide-react';

export default function LandingStats() {
  const stats = [
    {
      label: 'Energy Monitored',
      value: '1,840+',
      unit: 'kWh',
      icon: Zap,
      color: 'text-brand-cyan',
      description: 'Historical records simulated over 60 days',
    },
    {
      label: 'Estimated Savings',
      value: '₹4,850+',
      unit: 'INR',
      icon: IndianRupee,
      color: 'text-brand-emerald',
      description: 'Identified through load shifting & cooling tuning',
    },
    {
      label: 'Appliances Tracked',
      value: '9',
      unit: 'Active Units',
      icon: Cpu,
      color: 'text-brand-lavender',
      description: 'Realistic residential power ratings & schedules',
    },
    {
      label: 'Efficiency Benchmark',
      value: '88',
      unit: '/ 100',
      icon: Award,
      color: 'text-brand-blue',
      description: 'Top decile benchmark score in regional tier',
    },
  ];

  return (
    <section id="stats" className="py-20 relative bg-slate-50 dark:bg-brand-navy/60 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Platform Benchmarks
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Demonstration Metrics &amp; Impact
          </h2>
          <p className="text-xs text-brand-cyan italic">
            * All figures below represent simulated benchmark demo data for illustrative presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {s.label}
                    </span>
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-white/5 ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {s.value}
                    </span>
                    <span className={`text-sm font-bold ${s.color}`}>
                      {s.unit}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal pt-3 border-t border-slate-100 dark:border-white/5">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
