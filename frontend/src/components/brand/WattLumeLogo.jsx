import React from 'react';
import WattLumeSymbol from './WattLumeSymbol';

/**
 * WattLume Brand Logo
 * Clean horizontal wordmark with distinctive standalone 'W' symbol.
 * Strict typography in Plus Jakarta Sans with perfect optical kerning.
 */
export default function WattLumeLogo({
  size = "md",
  showTagline = false,
  iconOnly = false,
  className = "",
  onClick = null
}) {
  const sizeMap = {
    sm: { symbol: 22, text: "text-base", tagline: "text-[9px]" },
    md: { symbol: 26, text: "text-lg", tagline: "text-[10px]" },
    lg: { symbol: 32, text: "text-xl", tagline: "text-xs" },
    xl: { symbol: 40, text: "text-2xl", tagline: "text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      <WattLumeSymbol size={currentSize.symbol} className="transition-transform duration-200 group-hover:scale-105" />

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <div className={`font-heading font-extrabold tracking-[-0.03em] leading-none ${currentSize.text} flex items-center`}>
            <span className="text-slate-900 dark:text-white transition-colors">Watt</span>
            <span className="text-brand-blue dark:text-brand-cyan ml-0.5 transition-colors">Lume</span>
          </div>
          {showTagline && (
            <span className={`text-slate-500 dark:text-slate-400 font-sans tracking-wide uppercase mt-0.5 ${currentSize.tagline} font-medium`}>
              Energy, made visible.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
