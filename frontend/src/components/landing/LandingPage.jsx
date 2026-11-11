import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import LandingThreePillars from './LandingThreePillars';
import LandingFooter from './LandingFooter';

export default function LandingPage({ onEnterDashboard }) {
  const scrollToSection = (id) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
<div className="min-h-screen bg-brand-offwhite dark:bg-[#17191D] text-slate-900 dark:text-[#F4F5F6] flex flex-col font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Liquid Glass Navigation */}
      <LandingNavbar
        onEnterDashboard={onEnterDashboard}
        onNavigateSection={scrollToSection}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Editorial Hero with 3D Liquid Glass Product Preview */}
        <LandingHero
          onEnterDashboard={onEnterDashboard}
          onSeeHowItWorks={() => scrollToSection('overview')}
        />

        {/* 3 Core Architecture Modules */}
        <LandingThreePillars
          onEnterDashboard={onEnterDashboard}
        />
      </main>

      {/* Restrained Minimal Footer */}
      <LandingFooter
        onNavigateSection={scrollToSection}
        onEnterDashboard={onEnterDashboard}
      />

    </div>
  );
}
