
import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import WattLumeLogo from '../brand/WattLumeLogo';
import { useTheme } from '../../context/ThemeContext';

export default function LandingNavbar({ onEnterDashboard, onNavigateSection }) {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', id: 'overview' },
    { label: 'Features', id: 'features' },
    { label: 'About', id: 'about' },
  ];

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 transition-all duration-300 pt-3 sm:pt-4">
      <div
        className={`max-w-5xl mx-auto rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between ${
          isScrolled
            ? 'glass-panel shadow-glass-light dark:shadow-glass-dark border border-white/60 dark:border-white/[0.08]'
            : 'bg-white/40 dark:bg-[#202328]/85 backdrop-blur-md border border-white/30 dark:border-white/[0.08]'
        }`}
      >
        <WattLumeLogo
          size="md"
          showTagline={false}
          onClick={() => handleLinkClick('hero')}
        />

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-[#A1A6AE] dark:hover:text-[#F4F5F6] transition-colors tracking-tight"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-[#A1A6AE] hover:bg-slate-900/5 dark:hover:bg-[#292D33] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08] transition-all"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => onEnterDashboard('overview')}
            className="group relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-slate-900 dark:bg-[#292D33] dark:text-[#F4F5F6] hover:bg-brand-royal dark:hover:bg-[#363B43] shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-[#A1A6AE] hover:bg-slate-900/5 dark:hover:bg-[#292D33]"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-[#F4F5F6] hover:bg-slate-900/5 dark:hover:bg-[#292D33]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-5xl mx-auto rounded-2xl glass-panel p-4 space-y-3 animate-in fade-in slide-in-from-top-2 border border-white/60 dark:border-white/[0.08] shadow-glass-light dark:shadow-glass-dark">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#F4F5F6] rounded-lg hover:bg-slate-900/5 dark:hover:bg-[#292D33]"
            >
              {item.label}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterDashboard('overview');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-slate-900 text-white dark:bg-[#292D33] dark:text-[#F4F5F6] text-sm font-semibold hover:bg-brand-royal dark:hover:bg-[#363B43] transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
