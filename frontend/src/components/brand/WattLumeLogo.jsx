import React from 'react';
import WattLumeSymbol from './WattLumeSymbol';

export default function WattLumeLogo({ 
  size = "md", 
  showTagline = false, 
  iconOnly = false,
  className = "",
  onClick = null
}) {
  const sizeMap = {
    sm: { symbol: 26, text: "text-lg", tagline: "text-[10px]" },
    md: { symbol: 34, text: "text-xl", tagline: "text-xs" },
    lg: { symbol: 42, text: "text-2xl", tagline: "text-xs" },
    xl: { symbol: 52, text: "text-3xl", tagline: "text-sm" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <WattLumeSymbol size={currentSize.symbol} />
      
      {!iconOnly && (
        <div className="flex flex-col">
          <div className={`font-bold tracking-tight leading-none ${currentSize.text} flex items-center`}>
            <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">Watt</span>
            <span className="bg-gradient-to-r from-brand-cyan via-brand-emerald to-brand-blue bg-clip-text text-transparent font-black ml-0.5">
              Lume
            </span>
          </div>
          {showTagline && (
            <span className={`text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 ${currentSize.tagline}`}>
              Energy, made visible.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
