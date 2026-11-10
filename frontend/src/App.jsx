import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SimulationProvider } from './context/SimulationContext';
import LandingPage from './components/landing/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import BrandedLoader from './components/brand/BrandedLoader';

function MainApp() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'dashboard'
  const [initialDashboardView, setInitialDashboardView] = useState('overview');

  // Initial snappy branded loading screen (650ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterDashboard = (view = 'overview') => {
    setInitialDashboardView(view || 'overview');
    setViewMode('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <BrandedLoader />;
  }

  return (
    <>
      {viewMode === 'landing' ? (
        <LandingPage onEnterDashboard={handleEnterDashboard} />
      ) : (
        <DashboardLayout
          initialView={initialDashboardView}
          onBackToLanding={handleBackToLanding}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SimulationProvider>
        <MainApp />
      </SimulationProvider>
    </ThemeProvider>
  );
}
