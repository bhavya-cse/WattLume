import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Cpu,
  Lightbulb,
  Receipt,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

import WattLumeLogo from '../brand/WattLumeLogo';
import WattLumeSymbol from '../brand/WattLumeSymbol';
import { useSimulation } from '../../context/SimulationContext';

const NAV_GROUPS = [
  {
    label: 'Monitor',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'appliances', label: 'Appliances', icon: Cpu },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
      { id: 'bills', label: 'Bills', icon: Receipt },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Some views are reachable under an alias id; keep the right item highlighted.
const ALIASES = { usage: 'analytics', billing: 'bills' };

const BADGE_TONES = {
  info: 'bg-brand-royal/10 text-brand-royal dark:bg-brand-cyan/10 dark:text-brand-cyan',
  alert: 'bg-brand-coral/15 text-brand-coral',
};

// Power bar colour by load, on the existing 0–4000 W scale
const POWER_MAX_WATTS = 4000;
function powerTone(pct) {
  if (pct >= 85) return 'bg-brand-coral';
  if (pct >= 60) return 'bg-amber-400';
  return 'bg-brand-royal dark:bg-brand-cyan';
}

export default function Sidebar({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  onBackToLanding
}) {
  const { unreadAlertsCount, liveTelemetry, isPaused } = useSimulation();

  const currentView = ALIASES[activeView] || activeView;

  const activeCount = Math.round(liveTelemetry.appliances_active_count || 0);
  const badges = {
    appliances: activeCount > 0 ? { text: String(activeCount), tone: 'info' } : null,
    insights: unreadAlertsCount > 0 ? { text: String(unreadAlertsCount), tone: 'alert' } : null,
  };

  const watts = Number(liveTelemetry.current_power_watts) || 0;
  const kw = Number(liveTelemetry.current_power_kw) || 0;
  const pct = Math.min(100, Math.max(0, (watts / POWER_MAX_WATTS) * 100));

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col justify-between
        transition-[width] duration-300
        ${collapsed ? 'w-16' : 'w-60'}
        bg-white dark:bg-[#17191D]
        border-r border-slate-200/70 dark:border-white/[0.08]`}
    >
      <div>
        {/* Header */}
        <div
          className={`h-16 flex items-center px-4
            border-b border-slate-200/70 dark:border-white/[0.08]
            ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {collapsed ? (
            <WattLumeSymbol size={24} />
          ) : (
            <WattLumeLogo size="sm" showTagline={false} />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar width"
            className="hidden lg:flex p-1.5 rounded-md
              text-slate-400 hover:text-brand-royal dark:hover:text-brand-cyan
              hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.07]
              transition-colors duration-200"
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3" aria-label="Dashboard sections">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {collapsed ? (
                gi > 0 && <div className="mx-2 mb-3 border-t border-slate-200/70 dark:border-white/[0.08]" />
              ) : (
                <p className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-slate-400 dark:text-[#858B94]">
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const badge = badges[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative w-full flex items-center gap-3
                        px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors duration-200
                        ${collapsed ? 'justify-center px-2' : ''}
                        ${
                          isActive
                            ? 'bg-brand-royal/10 text-brand-royal dark:bg-brand-cyan/10 dark:text-brand-cyan'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-brand-royal dark:bg-brand-cyan" />
                      )}

                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors
                          ${
                            isActive
                              ? ''
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-royal dark:group-hover:text-brand-cyan'
                          }`}
                      />

                      {!collapsed && (
                        <span className="truncate flex-1 text-left tracking-tight">
                          {item.label}
                        </span>
                      )}

                      {!collapsed && badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums ${BADGE_TONES[badge.tone]}`}
                        >
                          {badge.text}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-200/70 dark:border-white/[0.08] space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#202328] border border-slate-200/70 dark:border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2 tracking-wider">
                {!isPaused && (
                  <span className="wd-live-dot text-brand-emerald" aria-hidden="true" />
                )}
                {isPaused ? 'PAUSED' : 'LIVE POWER'}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {kw.toFixed(2)}
                <span className="ml-1 text-[10px] font-normal text-slate-400">kW</span>
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-white/[0.08] overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${powerTone(pct)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={onBackToLanding}
          title="Return to Landing Page"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
            text-slate-500 dark:text-slate-400
            hover:text-brand-royal dark:hover:text-brand-cyan
            hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.06]
            transition-colors duration-200
            ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </button>
      </div>
    </aside>
  );
}