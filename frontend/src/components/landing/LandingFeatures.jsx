import React from 'react';
import { 
  Activity, BarChart3, Receipt, Cpu, AlertTriangle, Lightbulb, 
  ArrowUpRight, ShieldCheck, Zap, Sparkles 
} from 'lucide-react';

export default function LandingFeatures({ onSelectFeature }) {
  const features = [
    {
      id: 'monitoring',
      title: 'Real-Time Energy Monitoring',
      description: 'Stream instantaneous power (W/kW), voltage (V), current (A) and power factor with sub-second simulated telemetry.',
      icon: Activity,
      color: 'text-brand-cyan',
      bgColor: 'bg-brand-cyan/10 border-brand-cyan/20',
      badge: 'Sub-Second Stream',
      viewId: 'overview'
    },
    {
      id: 'analytics',
      title: 'Smart Consumption Analytics',
      description: 'Multi-scale timeseries breakdowns across Today, 7-Day, 30-Day and 12-Month horizons with peak vs off-peak analysis.',
      icon: BarChart3,
      color: 'text-brand-blue',
      bgColor: 'bg-brand-blue/10 border-brand-blue/20',
      badge: 'Peak & Off-Peak',
      viewId: 'analytics'
    },
    {
      id: 'billing',
      title: 'Electricity Bill Estimation',
      description: 'Dynamic Indian Rupee (₹ INR) billing forecasting based on configurable slab tiers, fixed monthly charges, and consumption rate.',
      icon: Receipt,
      color: 'text-brand-emerald',
      bgColor: 'bg-brand-emerald/10 border-brand-emerald/20',
      badge: '₹ INR Slabs & Taxes',
      viewId: 'billing'
    },
    {
      id: 'appliances',
      title: 'Appliance-Wise Monitoring',
      description: 'Granular load apportionment for Air Conditioners, Refrigerators, Geysers, Fans, and Lighting with live interactive control switches.',
      icon: Cpu,
      color: 'text-brand-lavender',
      bgColor: 'bg-brand-lavender/10 border-brand-lavender/20',
      badge: 'Interactive Toggles',
      viewId: 'appliances'
    },
    {
      id: 'anomaly',
      title: 'Abnormal Usage Detection',
      description: 'Rigorous statistical z-score baselining flags atypical surges, phantom night loads, and equipment duty cycle malfunctions.',
      icon: AlertTriangle,
      color: 'text-brand-coral',
      bgColor: 'bg-brand-coral/10 border-brand-coral/20',
      badge: 'Z-Score Detection',
      viewId: 'insights'
    },
    {
      id: 'recommendations',
      title: 'Intelligent Recommendations',
      description: 'Actionable conservation advisories with quantifiable monthly rupee savings and a transparent multi-factor Efficiency Score.',
      icon: Lightbulb,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10 border-amber-400/20',
      badge: 'Calculated Savings',
      viewId: 'insights'
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-slate-50 dark:bg-brand-navy/60 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/25 text-brand-blue dark:text-brand-cyan text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Six pillars of intelligent energy visibility
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Engineered from first principles to turn raw electrical wattage into clear, actionable financial and operational intelligence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onSelectFeature && onSelectFeature(feat.viewId)}
                className="group relative p-7 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 hover:border-brand-cyan/40 dark:hover:border-brand-cyan/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl border ${feat.bgColor} ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-brand-cyan transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-brand-cyan transition-colors">
                  <span>Explore capability</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
