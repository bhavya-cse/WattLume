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

export default function Sidebar({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  onBackToLanding
}) {
  const { unreadAlertsCount, liveTelemetry } = useSimulation();

  // Exactly 7 items per specification
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'appliances',
      label: 'Appliances',
      icon: Cpu,
      badge: liveTelemetry.appliances_active_count ? `${liveTelemetry.appliances_active_count}` : null,
      badgeColor: 'bg-brand-royal/10 text-brand-royal dark:bg-brand-cyan/10 dark:text-brand-cyan'
    },
    {
      id: 'insights',
      label: 'Smart Insights',
      icon: Lightbulb,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null,
      badgeColor: 'bg-brand-emerald/15 text-brand-emerald dark:bg-brand-emerald/20 dark:text-brand-emerald'
    },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col justify-between border-r transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } bg-white/70 dark:bg-[#101B2D]/85 backdrop-blur-xl border-slate-200/80 dark:border-white/10 shadow-[1px_0_20px_rgba(0,0,0,0.02)] dark:shadow-[1px_0_20px_rgba(0,0,0,0.2)]`}
    >
      {/* Top Header */}
      <div>
        <div className={`h-16 flex items-center px-4 border-b border-slate-200/70 dark:border-white/10 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}>
          {collapsed ? (
            <WattLumeSymbol size={24} />
          ) : (
            <WattLumeLogo size="sm" showTagline={false} />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar width"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 7 Main Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-slate-400 dark:text-slate-500'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left tracking-tight">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="p-3 border-t border-slate-200/70 dark:border-white/10 space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="tracking-wider">LIVE POWER</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {liveTelemetry.current_power_kw.toFixed(2)} kW
              </span>
            </div>
            <div className="w-full bg-slate-200/70 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-cyan h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (liveTelemetry.current_power_watts / 4000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={onBackToLanding}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Return to Landing Page"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </button>
      </div>
    </aside>
  );
}
