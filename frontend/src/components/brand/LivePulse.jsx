import React from 'react';

export default function LivePulse({ isLive = true, label = "LIVE TELEMETRY" }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-mono tracking-wider uppercase text-slate-700 dark:text-slate-300">
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-60" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-brand-cyan' : 'bg-slate-400'}`} />
      </span>
      <span>{label}</span>
      <span className="text-slate-400 dark:text-slate-500 font-normal">| 50Hz</span>
    </div>
  );
}
