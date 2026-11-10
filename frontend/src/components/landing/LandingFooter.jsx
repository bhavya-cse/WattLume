import React from 'react';
import WattLumeLogo from '../brand/WattLumeLogo';

export default function LandingFooter({ onNavigateSection, onEnterDashboard }) {
  return (
    <footer className="border-t border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-[#101B2D]/70 backdrop-blur-md py-12 text-sm text-slate-500 dark:text-slate-400">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <WattLumeLogo size="sm" showTagline={true} />

          <nav className="flex flex-wrap items-center gap-6 text-xs">
            <button
              onClick={() => onNavigateSection('hero')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => onNavigateSection('features')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => onNavigateSection('about')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => onEnterDashboard('overview')}
              className="text-brand-blue dark:text-brand-cyan hover:underline font-semibold"
            >
              Explore Dashboard →
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} WattLume. Energy, made visible.</p>
          <p className="font-mono text-[11px]">Simulated Data • 100% Software Architecture</p>
        </div>

      </div>
    </footer>
  );
}
