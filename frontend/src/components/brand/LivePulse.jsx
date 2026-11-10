import React from 'react';

export default function LivePulse({ isLive = true, label = "LIVE TELEMETRY" }) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-brand-cyan' : 'bg-slate-400'}`} />
      </span>
      <span>{label}</span>
    </div>
  );
}
