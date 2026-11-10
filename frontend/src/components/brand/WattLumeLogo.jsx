
import React from 'react';
import WattLumeSymbol from './WattLumeSymbol';

export default function WattLumeLogo({
  size = 'md',
  showTagline = false,
  iconOnly = false,
  className = '',
  onClick = null
}) {
  const sizeMap = {
    sm: 130,
    md: 155,
    lg: 190,
    xl: 225
  };

  const logoWidth = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex flex-col items-start select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {iconOnly ? (
        <WattLumeSymbol size={26} />
      ) : (
        <img
          src="/wattlume-logo.png"
          alt="WattLume — Energy, made visible."
          width={logoWidth}
          className="h-auto max-w-full object-contain dark:bg-white dark:rounded-md dark:p-1"
          style={{ width: `${logoWidth}px` }}
        />
      )}

      {showTagline && !iconOnly && (
        <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Energy, made visible.
        </span>
      )}
    </div>
  );
}
