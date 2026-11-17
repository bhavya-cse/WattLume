
import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const OverviewView = lazy(() => import('../dashboard/OverviewView'));
const AnalyticsView = lazy(() => import('../dashboard/AnalyticsView'));
const AppliancesView = lazy(() => import('../dashboard/AppliancesView'));
const InsightsView = lazy(() => import('../dashboard/InsightsView'));
const BillingView = lazy(() => import('../dashboard/BillingView'));
const ReportsView = lazy(() => import('../dashboard/ReportsView'));
const SettingsView = lazy(() => import('../dashboard/SettingsView'));
const EnergyAssistant = lazy(() => import('../assistant/EnergyAssistant'));

export default function DashboardLayout({
  onBackToLanding,
  initialView = 'overview'
}) {
  const [activeView, setActiveView] = useState(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantLoaded, setAssistantLoaded] = useState(false);

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
        className="hidden lg:flex"
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

        <Suspense
          fallback={
            <main className="wl-dashboard-glass relative flex-1 p-4 sm:p-6">
              <div className="max-w-7xl mx-auto space-y-5">
                <div className="h-7 w-44 rounded-lg bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
                <div className="h-28 w-full rounded-2xl bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-48 rounded-2xl bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
                  <div className="h-48 rounded-2xl bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
                </div>
              </div>
            </main>
          }
        >
          <main className="wl-dashboard-glass relative flex-1 pb-16">
            {renderActiveView()}
          </main>
        </Suspense>

        {assistantLoaded ? (
          <Suspense fallback={null}>
            <EnergyAssistant activeView={activeView} initiallyOpen />
          </Suspense>
        ) : (
          <button
            type="button"
            onClick={() => setAssistantLoaded(true)}
            aria-label="Open Lumi"
            className="fixed bottom-5 right-5 z-[101] flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#173D62] shadow-[0_12px_35px_rgba(23,61,98,0.4)] ring-2 ring-cyan-300/60 transition duration-200 hover:-translate-y-1 hover:scale-105 sm:bottom-6 sm:right-6"
          >
            <img
              src="/assets/wattlume-chatbot.webp"
              alt="Open Lumi"
              className="h-full w-full object-cover"
            />
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#17191D]" />
          </button>
        )}
      </div>
    </div>
  );
}
