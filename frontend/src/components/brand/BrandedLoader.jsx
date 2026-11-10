import React from 'react';
import WattLumeSymbol from './WattLumeSymbol';

export default function BrandedLoader({ message = "Connecting to telemetry bus..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-brand-navy">
      <div className="flex flex-col items-center space-y-4 max-w-xs text-center px-6">

        <WattLumeSymbol size={44} />

        <div>
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900 dark:text-white">
            WattLume
          </h2>
          <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mt-0.5">
            Energy, made visible.
          </p>
        </div>

        <div className="w-36 bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-slate-900 dark:bg-white rounded-full animate-pulse" style={{ width: '75%' }} />
        </div>

        <p className="text-[11px] font-mono text-slate-400">
          {message}
        </p>

      </div>
    </div>
  );
}
