import React from 'react';

/**
 * WattLume Brand Symbol
 * Distinctive standalone geometric 'W' mark fusing energy waveform dynamics
 * with optical lume illumination. Engineered for pixel-crisp rendering from 16px to 128px.
 */
export default function WattLumeSymbol({ size = 26, className = "" }) {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="wlSymbolGradient" x1="5" y1="9" x2="27" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4169E1" />
            <stop offset="50%" stopColor="#42D9E8" />
            <stop offset="100%" stopColor="#24C78B" />
          </linearGradient>
          <linearGradient id="wlGlow" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#42D9E8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4169E1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Ambient Glass Squircle Backplate */}
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7.5"
          className="fill-slate-900/5 dark:fill-white/5 stroke-slate-900/10 dark:stroke-white/10"
          strokeWidth="1"
        />

        {/* Precision Geometric 'W' Energy Waveform */}
        {/* Left Phase */}
        <path
          d="M 6.5 10.5 L 11.5 22 L 16 13.5"
          stroke="url(#wlSymbolGradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Phase */}
        <path
          d="M 16 13.5 L 20.5 22 L 25.5 10.5"
          stroke="url(#wlSymbolGradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Optical Lume Core (Energy made visible) */}
        <circle
          cx="16"
          cy="13.5"
          r="2.2"
          className="fill-brand-cyan"
        />
        <circle
          cx="16"
          cy="13.5"
          r="1"
          className="fill-white"
        />

        {/* Sub-nodal energy pulse accent */}
        <circle
          cx="11.5"
          cy="22"
          r="1.2"
          className="fill-brand-blue"
        />
        <circle
          cx="20.5"
          cy="22"
          r="1.2"
          className="fill-brand-emerald"
        />
      </svg>
    </div>
  );
}
