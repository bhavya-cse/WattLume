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
  Home,
  ShieldAlert,
  Zap
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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Energy Analytics', icon: BarChart3 },
    { id: 'appliances', label: 'Appliances', icon: Cpu, badge: liveTelemetry.appliances_active_count ? `${liveTelemetry.appliances_active_count} ON` : null },
    { id: 'insights', label: 'Smart Insights', icon: Lightbulb, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount} Alert` : null, badgeColor: 'bg-brand-coral/20 text-brand-coral border-brand-coral/30' },
    { id: 'billing', label: 'Electricity Bills', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col justify-between border-r transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-brand-navyLight border-slate-200 dark:border-white/10`}
    >
      {/* Top Header */}
      <div>
        <div className={`h-16 flex items-center px-4 border-b border-slate-200/80 dark:border-white/5 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}>
          {collapsed ? (
            <WattLumeSymbol size={32} />
          ) : (
            <WattLumeLogo size="sm" showTagline={false} />
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse sidebar"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Item Links */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-blue/15 to-brand-cyan/15 text-brand-blue dark:text-brand-cyan border border-brand-cyan/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-cyan' : ''}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.badgeColor || 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-cyan" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Simulation Status & Back to Landing */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/5 space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Active Draw</span>
              <span className="text-brand-cyan font-bold tabular-nums">
                {liveTelemetry.current_power_kw} kW
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-emerald via-brand-cyan to-brand-coral h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (liveTelemetry.current_power_watts / 4000) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>230V • {liveTelemetry.current_a}A</span>
              <span>PF {liveTelemetry.power_factor}</span>
            </div>
          </div>
        )}

        <button
          onClick={onBackToLanding}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Return to Marketing Landing Page"
        >
          <Home className="w-4 h-4 shrink-0 text-brand-emerald" />
          {!collapsed && <span>Landing Website</span>}
        </button>
      </div>
    </aside>
  );
}
