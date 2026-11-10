import React, { useState } from 'react';
import { ArrowRight, Zap, TrendingDown, ShieldCheck, Activity, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import WattLumeSymbol from '../brand/WattLumeSymbol';
import LivePulse from '../brand/LivePulse';
import EnergyFlowCanvas from '../brand/EnergyFlowCanvas';

export default function LandingHero({ onEnterDashboard, onDiscoverHowItWorks }) {
  const [acActive, setAcActive] = useState(true);
  const [fridgeActive, setFridgeActive] = useState(true);
  const [workstationActive, setWorkstationActive] = useState(true);

  // Dynamic calculation for hero card based on toggles
  const heroPower = (
    (acActive ? 1450 : 0) +
    (fridgeActive ? 160 : 0) +
    (workstationActive ? 95 : 0) +
    180
  );

  return (
    <section id="hero" className="relative min-h-[92vh] pt-32 pb-20 flex items-center justify-center overflow-hidden bg-grid-pattern">
      {/* Dynamic Animated Energy Waves & Particles */}
      <EnergyFlowCanvas intensity={1.1} />

      {/* Radial ambient glow gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-blue/15 via-brand-cyan/20 to-brand-emerald/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald animate-spin" style={{ animationDuration: '6s' }} />
              <span>Smart Energy Consumption Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
              <span className="text-slate-400 font-normal">v1.0 SaaS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Energy,{' '}
              <span className="bg-gradient-to-r from-brand-cyan via-brand-emerald to-brand-blue bg-clip-text text-transparent">
                made visible.
              </span>
            </h1>

            {/* Supporting Statement */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Take control of your electricity consumption with intelligent monitoring, meaningful analytics and smarter energy-saving insights.
            </p>

            {/* Feature Checkpoints */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                <span>Zero physical hardware needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                <span>High-precision simulated telemetry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-lavender" />
                <span>Predictive bill estimation (₹ INR)</span>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={onEnterDashboard}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-emerald text-white text-base font-bold shadow-xl shadow-brand-cyan/20 hover:shadow-brand-emerald/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onDiscoverHowItWorks}
                className="w-full sm:w-auto px-7 py-4 rounded-xl border border-slate-300 dark:border-white/15 bg-white/50 dark:bg-brand-navyLight/60 hover:bg-slate-100 dark:hover:bg-brand-navyLight text-slate-800 dark:text-slate-200 text-base font-semibold backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4 text-brand-cyan" />
                <span>Discover How It Works</span>
              </button>
            </div>

            {/* Simulated Data Transparency Badge */}
            <div className="pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                * Powered by a mathematical residential load simulation engine. 100% digital &amp; software-driven.
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual - Live Energy Nexus */}
          <div className="lg:col-span-5 relative">
            
            {/* Glowing Backdrop Frame */}
            <div className="relative mx-auto max-w-md p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-brand-navyLight/90 border border-slate-200 dark:border-white/15 shadow-2xl backdrop-blur-xl">
              
              {/* Header with Live Indicator & WattLume Brand Symbol */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <WattLumeSymbol size={32} />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Telemetry Hub</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Physics-Driven Node Simulation</p>
                  </div>
                </div>
                <LivePulse isLive={true} label="LIVE" />
              </div>

              {/* Real-time Power Meter */}
              <div className="py-6 space-y-2 text-center">
                <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Instantaneous Active Load
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {(heroPower / 1000).toFixed(2)}
                  </span>
                  <span className="text-xl font-bold text-brand-cyan">kW</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Voltage: <strong className="text-slate-800 dark:text-slate-200">230.4 V</strong></span>
                  <span>•</span>
                  <span>PF: <strong className="text-brand-emerald">0.96</strong></span>
                  <span>•</span>
                  <span>Current: <strong className="text-brand-cyan">{(heroPower / (230.4 * 0.96)).toFixed(1)} A</strong></span>
                </div>
              </div>

              {/* Energy Savings Indicator Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-brand-emerald/30 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-emerald/20 text-brand-emerald">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Optimization Opportunity</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Save ₹1,420 / month</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-brand-emerald/20 text-brand-emerald text-[11px] font-bold">
                  -18% Bill
                </span>
              </div>

              {/* Floating Interactive Simulated Appliances */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                  <span>Interactive Load Switches</span>
                  <span className="text-[10px] text-brand-cyan">Click to test live draw</span>
                </div>

                {/* AC Switch */}
                <div 
                  onClick={() => setAcActive(!acActive)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    acActive 
                      ? 'bg-slate-50 dark:bg-white/5 border-brand-cyan/40 shadow-sm' 
                      : 'bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${acActive ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Inverter Air Conditioner</p>
                      <p className="text-[10px] text-slate-500">1,450 Watts • Cooling</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    acActive ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {acActive ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Refrigerator Switch */}
                <div 
                  onClick={() => setFridgeActive(!fridgeActive)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    fridgeActive 
                      ? 'bg-slate-50 dark:bg-white/5 border-brand-emerald/40 shadow-sm' 
                      : 'bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${fridgeActive ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Double-Door Refrigerator</p>
                      <p className="text-[10px] text-slate-500">160 Watts • 24/7 Cyclic</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    fridgeActive ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {fridgeActive ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Workstation Switch */}
                <div 
                  onClick={() => setWorkstationActive(!workstationActive)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    workstationActive 
                      ? 'bg-slate-50 dark:bg-white/5 border-brand-blue/40 shadow-sm' 
                      : 'bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${workstationActive ? 'bg-brand-blue/20 text-brand-blue' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Home Office Workstation</p>
                      <p className="text-[10px] text-slate-500">95 Watts • Computing</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    workstationActive ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {workstationActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 text-center">
                <button
                  onClick={onEnterDashboard}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Open Full Application Dashboard →
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
