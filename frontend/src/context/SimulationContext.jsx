
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  fetchLive,
  fetchOverview,
  updateSimulationControl,
} from '../services/api';

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

  // Keep refs synchronized with the latest state.
  const liveTelemetryRef = useRef(liveTelemetry);
  const isPausedRef = useRef(isPaused);
  const requestIdRef = useRef(0);
  const transitionTimerRef = useRef(null);

  liveTelemetryRef.current = liveTelemetry;
  isPausedRef.current = isPaused;

  /* -----------------------------------------------
     TOAST NOTIFICATIONS
  ----------------------------------------------- */

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

  /* -----------------------------------------------
     SMOOTH TELEMETRY TRANSITIONS

     Incoming backend readings are interpolated over
     1.5 seconds instead of jumping instantly.

     No random readings are generated here.
  ----------------------------------------------- */

  const updateTelemetrySmoothly = useCallback((newData) => {
    if (!newData) return;

    if (transitionTimerRef.current) {
      clearInterval(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    const startData = { ...liveTelemetryRef.current };
    const targetData = { ...newData };

    const duration = 1500;
    const startTime = performance.now();

    transitionTimerRef.current = setInterval(() => {
      if (isPausedRef.current) {
        clearInterval(transitionTimerRef.current);
        transitionTimerRef.current = null;
        return;
      }

      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-in/ease-out transition.
      const easedProgress =
        progress * progress * (3 - 2 * progress);

      const nextData = { ...targetData };

      // Interpolate numeric telemetry fields.
      Object.keys(targetData).forEach((key) => {
        const startValue = startData[key];
        const endValue = targetData[key];

        if (
          typeof startValue === 'number' &&
          typeof endValue === 'number' &&
          Number.isFinite(startValue) &&
          Number.isFinite(endValue)
        ) {
          nextData[key] =
            startValue +
            (endValue - startValue) * easedProgress;
        }
      });

      setLiveTelemetry(nextData);

      if (progress >= 1) {
        setLiveTelemetry(targetData);
        liveTelemetryRef.current = targetData;

        clearInterval(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    }, 100);
  }, []);

  /* -----------------------------------------------
     LIVE TELEMETRY FETCHING

     Normal speed: 5-second polling.
     Higher speed: faster polling, with a 3-second
     minimum to avoid excessive backend requests.
  ----------------------------------------------- */

  const fetchLiveData = useCallback(async () => {
    if (isPausedRef.current) return;

    const requestId = ++requestIdRef.current;

    try {
      const data = await fetchLive();

      // Ignore stale responses and responses received
      // after the simulation has been paused.
      if (
        requestId !== requestIdRef.current ||
        isPausedRef.current
      ) {
        return;
      }

      updateTelemetrySmoothly(data);
    } catch (err) {
      // Retain the last valid readings if the backend
      // is temporarily unavailable.
    }
  }, [updateTelemetrySmoothly]);

  /* -----------------------------------------------
     POLLING INTERVAL
  ----------------------------------------------- */

  useEffect(() => {
    if (isPaused) {
      requestIdRef.current += 1;

      if (transitionTimerRef.current) {
        clearInterval(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }

      return;
    }

    fetchLiveData();

    const intervalMs = Math.max(
      3000,
      Math.floor(5000 / speedMultiplier)
    );

    const timer = setInterval(fetchLiveData, intervalMs);

    return () => {
      clearInterval(timer);
      requestIdRef.current += 1;
    };
  }, [fetchLiveData, speedMultiplier, isPaused]);

  /* -----------------------------------------------
     INITIAL OVERVIEW FETCH FOR ALERTS
  ----------------------------------------------- */

  useEffect(() => {
    fetchOverview()
      .then(res => {
        if (res.recent_anomalies) {
          setRecentAnomalies(res.recent_anomalies);

          const unread = res.recent_anomalies.filter(
            a => !a.acknowledged
          ).length;

          setUnreadAlertsCount(unread);
        }
      })
      .catch(() => {});
  }, []);

  /* -----------------------------------------------
     SIMULATION SPEED
  ----------------------------------------------- */

  const changeSpeed = async (newSpeed) => {
    setSpeedMultiplier(newSpeed);

    try {
      await updateSimulationControl({
        speed_multiplier: newSpeed,
      });

      addToast(
        `Simulation speed adjusted to ${newSpeed}x`,
        'info'
      );
    } catch {
      // Local polling speed still updates.
    }
  };

  /* -----------------------------------------------
     PAUSE / RESUME
  ----------------------------------------------- */

  const togglePause = async () => {
    const nextPaused = !isPaused;

    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;

    if (nextPaused) {
      requestIdRef.current += 1;

      if (transitionTimerRef.current) {
        clearInterval(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    }

    try {
      await updateSimulationControl({
        is_paused: nextPaused,
      });

      addToast(
        nextPaused
          ? 'Simulation paused'
          : 'Simulation resumed',
        'info'
      );
    } catch {
      // Local pause/resume remains functional.
    }
  };

  /* -----------------------------------------------
     CONTEXT PROVIDER
  ----------------------------------------------- */

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
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => {
          const dark = document.documentElement.classList.contains('dark');
          const bg = dark ? '#252A32' : '#F0F9FF';
          const fg = dark ? '#FFFFFF' : '#172033';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl"
              style={{
                backgroundColor: bg,
                color: fg,
                border: '1px solid #64748B',
                opacity: 1,
                visibility: 'visible',
                position: 'relative',
                zIndex: 99999,
              }}
            >
              <span style={{
                color: fg,
                WebkitTextFillColor: fg,
                fontWeight: 700,
                fontSize: '15px',
                opacity: 1,
                visibility: 'visible',
              }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: fg, marginLeft: '12px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);

  if (!context) {
    throw new Error(
      'useSimulation must be used within SimulationProvider'
    );
  }

  return context;
}
