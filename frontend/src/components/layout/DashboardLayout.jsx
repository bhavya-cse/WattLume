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

export default function DashboardLayout({ onBackToLanding, initialView = 'overview' }) {
  const [activeView, setActiveView] = useState(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView onNavigateView={setActiveView} />;
      case 'analytics':
        return <AnalyticsView onNavigateView={setActiveView} />;
      case 'appliances':
        return <AppliancesView onNavigateView={setActiveView} />;
      case 'insights':
        return <InsightsView onNavigateView={setActiveView} />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-brand-navyLight border-r border-slate-200 dark:border-white/10 transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar
          activeView={activeView}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNavigateView={setActiveView}
        />

        <main className="flex-1 pb-16">
          {renderActiveView()}
        </main>
      </div>

    </div>
  );
}
