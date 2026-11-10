import React from 'react';
import { ArrowRight, ChevronRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import LandingProductPreview from './LandingProductPreview';

export default function LandingHero({ onEnterDashboard, onSeeHowItWorks }) {
  return (
    <section id="hero" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">

      {/* Subtle, restrained ambient light field — no crazy neon or distracting blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-brand-royal/5 dark:bg-brand-royal/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">

        {/* Subtle Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="font-mono text-[11px] tracking-tight">Smart Energy Monitoring &amp; Intelligence</span>
        </div>

        {/* Exact Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] max-w-4xl mx-auto">
          Energy, made visible.
        </h1>

        {/* Exact Supporting Text */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Understand where your electricity goes. Discover what it costs. Make smarter energy decisions.
        </p>

        {/* CTA Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => onEnterDashboard('overview')}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-white/5 active:scale-[0.98]"
          >
            <span>Explore dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSeeHowItWorks}
            className="w-full sm:w-auto px-5 py-3 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center gap-1 transition-colors hover:bg-slate-900/5 dark:hover:bg-white/5"
          >
            <span>See how it works</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Simulation Notice Note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
          100% software-based simulated energy data. Zero hardware or meter wiring needed.
        </p>

        {/* ONE Singular, Beautiful, Realistic Product Preview */}
        <div className="pt-6">
          <LandingProductPreview onEnterDashboard={onEnterDashboard} />
        </div>

      </div>
    </section>
  );
}
