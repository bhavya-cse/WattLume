import React from 'react';

export default function WattLumeSymbol({ size = 36, animated = true, className = "" }) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {animated && (
        <div 
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-cyan/25 to-brand-emerald/30 blur-[6px] animate-pulse"
        />
      )}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="sym-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#42D9E8" />
            <stop offset="45%" stopColor="#24C78B" />
            <stop offset="100%" stopColor="#4169E1" />
          </linearGradient>
          <linearGradient id="sym-grad-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#24C78B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#42D9E8" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="sym-core-lume" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#42D9E8" />
            <stop offset="100%" stopColor="#24C78B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Geometric Hex Shield with Micro-Gaps */}
        <path
          d="M24 6 L38 14.5 V31.5 L24 40 L10 31.5 V14.5 Z"
          stroke="url(#sym-grad-primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "opacity-75" : "opacity-90"}
        />

        {/* Internal Luminous Energy Matrix */}
        <path
          d="M24 13 L33 18.5 V29.5 L24 35 L15 29.5 V18.5 Z"
          fill="url(#sym-grad-glow)"
          stroke="url(#sym-grad-primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Ray Lines - Energy Distribution */}
        <line x1="24" y1="6" x2="24" y2="13" stroke="#42D9E8" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="14.5" x2="33" y2="18.5" stroke="#24C78B" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="31.5" x2="15" y2="29.5" stroke="#42D9E8" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="40" x2="24" y2="35" stroke="#4169E1" strokeWidth="2" strokeLinecap="round" />

        {/* Dynamic Center Illuminator (Lume Core) */}
        <circle cx="24" cy="24" r="5" fill="url(#sym-core-lume)" />
        <circle cx="24" cy="24" r="2.2" fill="#FFFFFF" />

        {/* Micro-spark vectors */}
        <path
          d="M24 18 V30 M18 24 H30"
          stroke="#B8F3D5"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
