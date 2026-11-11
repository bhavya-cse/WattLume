
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OverviewView from '../dashboard/OverviewView';
import AnalyticsView from '../dashboard/AnalyticsView';
import AppliancesView from '../dashboard/AppliancesView';
import InsightsView from '../dashboard/InsightsView';
import BillingView from '../dashboard/BillingView';
import ReportsView from '../dashboard/ReportsView';
import SettingsView from '../dashboard/SettingsView';

export default function DashboardLayout({
  onBackToLanding,
  initialView = 'overview'
}) {
  const [activeView, setActiveView] = useState(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView onNavigateView={setActiveView} />;
      case 'analytics':
      case 'usage':
        return <AnalyticsView onNavigateView={setActiveView} />;
      case 'appliances':
        return <AppliancesView onNavigateView={setActiveView} />;
      case 'insights':
        return <InsightsView onNavigateView={setActiveView} />;
      case 'bills':
      case 'billing':
        return <BillingView onNavigateView={setActiveView} />;
      case 'reports':
        return <ReportsView onNavigateView={setActiveView} />;
      case 'settings':
        return <SettingsView onNavigateView={setActiveView} />;
      default:
        return <OverviewView onNavigateView={setActiveView} />;
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col font-sans
        bg-[#F1F5FB] dark:bg-[#17191D]
        text-slate-900 dark:text-slate-100
        selection:bg-brand-cyan/20 selection:text-brand-cyan
        overflow-x-hidden"
    >
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-[25%] w-[500px] h-[400px]
            rounded-full bg-brand-royal/10 dark:bg-white/[0.015]
            blur-[120px]"
        />

        <div
          className="absolute top-[45%] right-0 w-[400px] h-[400px]
            rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/5
            blur-[120px]"
        />

        <div
          className="absolute bottom-0 left-[20%] w-[350px] h-[300px]
            rounded-full bg-brand-emerald/5 dark:bg-brand-emerald/5
            blur-[110px]"
        />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onBackToLanding={onBackToLanding}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30
            backdrop-blur-md lg:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64
          glass-sidebar shadow-2xl
          transition-transform duration-300 lg:hidden
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setMobileSidebarOpen(false);
          }}
          collapsed={false}
          setCollapsed={() => {}}
          onBackToLanding={onBackToLanding}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`relative z-10 flex-1 flex flex-col
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}`}
      >
        <Topbar
          activeView={activeView}
          onToggleMobileSidebar={() =>
            setMobileSidebarOpen(!mobileSidebarOpen)
          }
          onNavigateView={setActiveView}
        />

        <main className="relative flex-1 pb-16">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
