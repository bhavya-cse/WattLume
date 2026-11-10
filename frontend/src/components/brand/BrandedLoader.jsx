import React from 'react';
import WattLumeSymbol from './WattLumeSymbol';

export default function BrandedLoader({ message = "Initializing WattLume Intelligence Bus..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-brand-navy">
      <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center px-6">
        
        {/* Animated Brand Symbol with Glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-cyan to-brand-emerald blur-xl opacity-60 animate-pulse" />
          <WattLumeSymbol size={72} animated={true} />
        </div>

        {/* Wordmark */}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Watt<span className="bg-gradient-to-r from-brand-cyan to-brand-emerald bg-clip-text text-transparent">Lume</span>
          </h2>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            Energy, made visible.
          </p>
        </div>

        {/* Dynamic Glowing Progress Indicator */}
        <div className="w-48 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-emerald rounded-full animate-pulse" style={{ width: '85%' }} />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          {message}
        </p>

      </div>
    </div>
  );
}
