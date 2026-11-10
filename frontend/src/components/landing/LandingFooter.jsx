import React from 'react';
import { Github, Heart, Shield, Cpu } from 'lucide-react';
import WattLumeLogo from '../brand/WattLumeLogo';

export default function LandingFooter({ onNavigateSection, onEnterDashboard }) {
  return (
    <footer className="bg-slate-900 dark:bg-brand-navyDark text-slate-400 py-16 border-t border-slate-800 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <WattLumeLogo size="md" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              WattLume makes energy visible through intelligent software-based telemetry, predictive bill estimation, and automated consumption analytics.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-emerald">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <span>Simulation Engine Active</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigateSection('hero')} className="hover:text-white transition-colors">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('features')} className="hover:text-white transition-colors">
                  Core Capabilities
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('how-it-works')} className="hover:text-white transition-colors">
                  Simulation Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('stats')} className="hover:text-white transition-colors">
                  Benchmark Metrics
                </button>
              </li>
              <li>
                <button onClick={onEnterDashboard} className="text-brand-cyan hover:underline">
                  Launch Live App →
                </button>
              </li>
            </ul>
          </div>

          {/* Intelligence Modules */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white">Real-Time Telemetry (W, V, A, PF)</span></li>
              <li><span className="hover:text-white">Appliance-Wise Apportionment</span></li>
              <li><span className="hover:text-white">Predictive Tariff Modeling (₹ INR)</span></li>
              <li><span className="hover:text-white">Statistical Z-Score Anomaly Engine</span></li>
              <li><span className="hover:text-white">CO₂ Footprint &amp; Tree Equivalent</span></li>
            </ul>
          </div>

          {/* Technical Specs & Disclaimer */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">
              System Specification
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built with React, Vite, Tailwind CSS, Recharts, FastAPI, SQLAlchemy, and SQLite.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <p className="font-semibold text-brand-cyan mb-1">Academic &amp; Commercial Prototype</p>
              <p>Simulated software model. Physical smart meter integration is not required.</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WattLume. All rights reserved. "Energy, made visible."</p>
          
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-slate-300">
              <Shield className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Simulated Data Isolation</span>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
