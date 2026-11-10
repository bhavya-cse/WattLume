import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchLive, fetchOverview, updateSimulationControl } from '../services/api';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [liveTelemetry, setLiveTelemetry] = useState({
    current_power_watts: 1840.0,
    current_power_kw: 1.84,
    voltage_v: 230.4,
    current_a: 8.42,
    power_factor: 0.95,
    frequency_hz: 50.02,
    today_energy_kwh: 11.45,
    is_live: true,
    status: 'Optimal',
    appliances_active_count: 6,
    total_appliances_count: 9,
    breakdown: {},
  });

  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Poll live telemetry periodically
  const fetchLiveData = useCallback(async () => {
    if (isPaused) return;
    try {
      const data = await fetchLive();
      setLiveTelemetry(data);
    } catch (err) {
      // Keep existing state if offline or restarting
    }
  }, [isPaused]);

  useEffect(() => {
    fetchLiveData();
    const intervalMs = Math.max(800, Math.floor(2500 / speedMultiplier));
    const timer = setInterval(fetchLiveData, intervalMs);
    return () => clearInterval(timer);
  }, [fetchLiveData, speedMultiplier]);

  // Initial overview fetch for alerts count
  useEffect(() => {
    fetchOverview()
      .then(res => {
        if (res.recent_anomalies) {
          setRecentAnomalies(res.recent_anomalies);
          const unread = res.recent_anomalies.filter(a => !a.acknowledged).length;
          setUnreadAlertsCount(unread);
        }
      })
      .catch(() => {});
  }, []);

  const changeSpeed = async (newSpeed) => {
    setSpeedMultiplier(newSpeed);
    try {
      await updateSimulationControl({ speed_multiplier: newSpeed });
      addToast(`Simulation speed adjusted to ${newSpeed}x`, 'info');
    } catch {
      // local fallback
    }
  };

  const togglePause = async () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    try {
      await updateSimulationControl({ is_paused: nextPaused });
      addToast(nextPaused ? 'Simulation paused' : 'Simulation resumed', 'info');
    } catch {
      // local fallback
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        liveTelemetry,
        setLiveTelemetry,
        refreshLive: fetchLiveData,
        speedMultiplier,
        changeSpeed,
        isPaused,
        togglePause,
        toasts,
        addToast,
        removeToast,
        recentAnomalies,
        unreadAlertsCount,
        setUnreadAlertsCount,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-sm transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-brand-coral/50 text-white'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-brand-emerald/50 text-white'
                : 'bg-brand-navyLight/95 border-brand-cyan/40 text-slate-100'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
}
