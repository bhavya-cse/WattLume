import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import LandingFeatures from './LandingFeatures';
import LandingHowItWorks from './LandingHowItWorks';
import LandingStats from './LandingStats';
import LandingFinalCTA from './LandingFinalCTA';
import LandingFooter from './LandingFooter';

export default function LandingPage({ onEnterDashboard }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-brand-navy text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan">
      
      {/* Sticky Top Navigation */}
      <LandingNavbar
        onEnterDashboard={onEnterDashboard}
        onNavigateSection={scrollToSection}
      />

      {/* Main Sections */}
      <main className="flex-1">
        <LandingHero
          onEnterDashboard={onEnterDashboard}
          onDiscoverHowItWorks={() => scrollToSection('how-it-works')}
        />

        <LandingFeatures
          onSelectFeature={(featureView) => onEnterDashboard(featureView)}
        />

        <LandingHowItWorks />

        <LandingStats />

        <LandingFinalCTA
          onEnterDashboard={onEnterDashboard}
        />
      </main>

      {/* Footer */}
      <LandingFooter
        onNavigateSection={scrollToSection}
        onEnterDashboard={onEnterDashboard}
      />

    </div>
  );
}
