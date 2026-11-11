
import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import LandingProductPreview from './LandingProductPreview';

export default function LandingHero({ onEnterDashboard, onSeeHowItWorks }) {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-transparent"
    >
      {/* Soft ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-brand-royal/10 dark:bg-white/[0.015] blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute top-[45%] left-[15%] w-64 h-64 bg-brand-cyan/10 dark:bg-brand-cyan/[0.04] blur-[110px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">

        {/* Glass Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-white/65 dark:bg-[#202328]/85
          backdrop-blur-xl
          border border-white/80 dark:border-white/[0.08]
          shadow-[0_4px_20px_rgba(65,105,225,0.08)]
          dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
          text-xs font-medium text-slate-600 dark:text-[#A1A6AE]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="font-mono text-[11px] tracking-tight">
            Smart Energy Monitoring &amp; Intelligence
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto">
          <span className="text-[#2457D6] dark:text-[#42D9E8]">
            Energy
          </span>
          {", "}
          <span className="text-[#079B70] dark:text-[#B8F3D5]">
            made visible.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-[#A1A6AE] max-w-2xl mx-auto leading-relaxed font-normal">
          Understand where your electricity goes. Discover what it costs.
          Make smarter energy decisions.
        </p>

        {/* CTA Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => onEnterDashboard('overview')}
            className="w-full sm:w-auto px-7 py-3 rounded-full
              bg-slate-900 hover:bg-slate-800
              dark:bg-[#292D33] dark:hover:bg-[#363B43]
              text-white dark:text-[#F4F5F6] text-sm font-semibold
              transition-all duration-200 flex items-center justify-center gap-2
              shadow-lg shadow-slate-900/10 dark:shadow-black/20
              active:scale-[0.98]"
          >
            <span>Explore dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSeeHowItWorks}
            className="w-full sm:w-auto px-5 py-3 rounded-full
              text-sm font-medium text-slate-600 hover:text-slate-900
              dark:text-[#A1A6AE] dark:hover:text-[#F4F5F6]
              flex items-center justify-center gap-1 transition-all
              hover:bg-white/60 dark:hover:bg-[#292D33]
              hover:backdrop-blur-lg"
          >
            <span>See how it works</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Simulation Notice */}
        <p className="text-xs text-slate-400 dark:text-[#858B94] font-sans">
          100% software-based simulated energy data. Zero hardware or meter wiring needed.
        </p>

        {/* Product Preview with Glass Frame */}
        <div className="pt-8">
          <div className="relative rounded-[28px] p-[1px]
            bg-gradient-to-br from-white/90 via-brand-cyan/25 to-brand-royal/20
            dark:from-white/[0.08] dark:via-brand-cyan/[0.12] dark:to-white/[0.04]
            shadow-[0_20px_70px_rgba(31,38,135,0.10)]
            dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)]"
          >
            <div className="rounded-[27px] overflow-hidden
              bg-white/75 dark:bg-[#202328]/95
              backdrop-blur-2xl"
            >
              <LandingProductPreview onEnterDashboard={onEnterDashboard} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
