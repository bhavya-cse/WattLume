import React from 'react';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import WattLumeSymbol from '../brand/WattLumeSymbol';

export default function LandingFinalCTA({ onEnterDashboard }) {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-brand-navy">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-brand-navyLight via-brand-navy to-slate-900 border border-brand-cyan/30 text-white shadow-2xl overflow-hidden text-center space-y-6">
          
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-emerald/20 rounded-full blur-[80px] pointer-events-none" />

          {/* Symbol */}
          <div className="flex justify-center">
            <WattLumeSymbol size={52} />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Your energy deserves better insights.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-normal">
              Step inside the WattLume energy intelligence console. Monitor simulated electrical nodes, audit appliance loads, forecast monthly electricity bills, and unlock actionable efficiency gains.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterDashboard}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-emerald text-white text-base font-bold shadow-xl shadow-brand-cyan/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Start Exploring WattLume</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Open-source architecture • 100% simulated digital environment • Instant access
          </p>
        </div>

      </div>
    </section>
  );
}
