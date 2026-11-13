import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Zap,
  LayoutList,
  LayoutGrid,
  Search,
  X,
  Power,
  Tv,
  Wind,
  Coffee,
  Flame,
  Laptop,
  Lightbulb,
  Activity,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchAppliances,
  toggleAppliance,
  createAppliance,
  updateAppliance,
  deleteAppliance,
} from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

/* ---------- helpers ---------- */

const CURRENCY = '₹';
const BASE_CATEGORIES = [
  'Cooling',
  'Kitchen',
  'Heating',
  'Entertainment',
  'Computing',
  'Lighting',
  'Utility',
  'General',
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60';

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#17191D] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan focus-visible:ring-2 focus-visible:ring-brand-cyan/30';

const muted = 'text-slate-500 dark:text-[#A1A6AE]';

const toNum = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const fmtMoney = (n) => `${CURRENCY}${Math.round(n || 0).toLocaleString('en-IN')}`;

/* Fixed colour per appliance (same variables as the Overview breakdown) */
const applianceColor = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('air cond')) return 'var(--wd-ap-ac)';
  if (n.includes('refrigerator') || n.includes('fridge')) return 'var(--wd-ap-fridge)';
  if (n.includes('geyser') || n.includes('water heater')) return 'var(--wd-ap-geyser)';
  if (n.includes('washing')) return 'var(--wd-ap-washer)';
  if (n.includes('television') || /\btv\b/.test(n)) return 'var(--wd-ap-tv)';
  return 'var(--wd-ap-other)';
};

const getCategoryIcon = (cat = '') => {
  switch (cat.toLowerCase()) {
    case 'cooling': return Wind;
    case 'kitchen': return Coffee;
    case 'heating': return Flame;
    case 'entertainment': return Tv;
    case 'computing': return Laptop;
    case 'lighting': return Lightbulb;
    case 'utility': return Power;
    default: return Zap;
  }
};

const tileStyle = (color) => ({
  '--c': color,
  background: 'color-mix(in srgb, var(--c) 14%, transparent)',
  color: 'var(--c)',
});

/* ---------- small components ---------- */

function BreakerSwitch({ on, label, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 motion-reduce:transition-none ${focusRing} ${
        on ? 'bg-brand-emerald' : 'bg-slate-300 dark:bg-white/20'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none ${
          on ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function LoadBar({ share, color, width = 64 }) {
  return (
    <div className="wd-track" style={{ width }} aria-hidden="true">
      <div className="wd-fill" style={{ '--c': color, width: `${share}%` }} />
    </div>
  );
}

function Kpi({ index, accent, label, icon: Icon, live = false, children }) {
  return (
    <div className={`wd-ov-kpi wd-kpi ${accent}`} style={{ '--i': index }}>
      <div className="flex items-center justify-between gap-3">
        <span className="wd-kpi-label">{label}</span>
        <span className={`wd-ov-icon ${live ? 'wd-ov-icon-live' : ''}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

/* ---------- view ---------- */

export default function AppliancesView() {
  const { addToast, refreshLive, liveTelemetry, isPaused } = useSimulation();
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cooling',
    icon: 'Wind',
    power_watts: 500,
    standby_watts: 2.0,
    room: 'Living Room',
    is_active: true,
  });

  const loadData = async () => {
    try {
      const data = await fetchAppliances();
      setAppliances(Array.isArray(data) ? data : []);
      setLoadError(false);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  const handleToggle = async (app) => {
    try {
      const res = await toggleAppliance(app.id);
      setAppliances((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, is_active: res.is_active } : a))
      );
      addToast(res.message, res.is_active ? 'success' : 'info');
      refreshLive();
    } catch (err) {
      addToast('Failed to toggle circuit breaker', 'error');
    }
  };

  const handleOpenAdd = () => {
    setEditingAppliance(null);
    setFormData({
      name: '',
      category: 'General',
      icon: 'Zap',
      power_watts: 450,
      standby_watts: 2.0,
      room: 'Living Room',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app) => {
    setEditingAppliance(app);
    setFormData({
      name: app.name,
      category: app.category,
      icon: app.icon || 'Zap',
      power_watts: app.power_watts,
      standby_watts: app.standby_watts || 2.0,
      room: app.room,
      is_active: app.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' from monitoring?`)) return;
    try {
      await deleteAppliance(id);
      setAppliances((prev) => prev.filter((a) => a.id !== id));
      addToast(`Removed ${name}`, 'info');
      refreshLive();
    } catch {
      addToast('Failed to delete appliance', 'error');
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.name || saving) return;

    setSaving(true);
    try {
      if (editingAppliance) {
        await updateAppliance(editingAppliance.id, formData);
        addToast(`Updated ${formData.name}`, 'success');
      } else {
        await createAppliance(formData);
        addToast(`Added ${formData.name}`, 'success');
      }
      setIsModalOpen(false);
      loadData();
      refreshLive();
    } catch {
      addToast('Error saving appliance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
  };

  /* ---------- loading and error states ---------- */

  if (loading && appliances.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="wd-skeleton h-8 w-48" />
          <div className="wd-skeleton h-4 w-96 max-w-full" />
        </div>
        <div className="wd-skeleton h-32 w-full" style={{ borderRadius: 'var(--wd-radius)' }} />
        <div className="wd-skeleton h-96 w-full" style={{ borderRadius: 'var(--wd-radius)' }} />
      </div>
    );
  }

  if (loadError && appliances.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="wd-card flex flex-col items-center text-center gap-3 py-12">
          <span className="wd-ov-icon" style={{ '--accent': 'var(--wd-bad)' }}>
            <AlertTriangle className="w-4 h-4" />
          </span>
          <h2 className="wd-title font-heading">Couldn't load your appliances</h2>
          <p className={`text-xs max-w-sm ${muted}`}>
            The backend didn't respond. Check that it is running, then try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setLoadError(false);
              loadData();
            }}
            className={`mt-1 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-royal text-white hover:opacity-90 transition-opacity ${focusRing}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- derived data ---------- */

  const live = liveTelemetry || {};
  const liveBreakdown = live.breakdown || {};
  const liveTotalW = toNum(live.current_power_watts);

  const drawOf = (app) => (app.is_active ? toNum(liveBreakdown[app.name]) : 0);
  const shareOf = (w) =>
    liveTotalW && w != null && w > 0
      ? Math.min(100, Math.max(2, (w / liveTotalW) * 100))
      : 0;
  const dailyOf = (app) => toNum(app.daily_kwh) ?? toNum(app.daily_energy_kwh);

  const categories = [
    'All',
    ...Array.from(new Set(appliances.map((a) => a.category).filter(Boolean))).sort(),
  ];

  const filteredAppliances = appliances.filter((app) => {
    const matchesCat =
      selectedCategory === 'All' ||
      (app.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(term) ||
      (app.room && app.room.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  const totalRunningWatts = appliances
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + (a.power_watts || 0), 0);
  const totalMonthlyCost = appliances.reduce(
    (sum, a) => sum + (a.is_active ? a.monthly_cost_inr || 0 : 0),
    0
  );
  const activeCount = appliances.filter((a) => a.is_active).length;

  const modalCategories = Array.from(new Set([...BASE_CATEGORIES, formData.category].filter(Boolean)));

  /* ---------- render ---------- */

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="wl-page-heading wl-heading-appliances flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--wd-line)]">
        <div className="wl-heading-main">
          <div className="wl-heading-icon" aria-hidden="true">
            <LayoutGrid className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="wl-heading-copy">
            <span className="wl-heading-eyebrow">Connected devices</span>
            <h2 className="wl-heading-title">Appliances</h2>
            <p>Switch circuits, monitor live power draw and keep track of appliance costs.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-royal text-white text-xs font-semibold hover:opacity-90 transition-opacity ${focusRing}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add appliance</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="wd-ov-kpis wd-enter grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ '--i': 1 }}>
        <Kpi index={1} accent="wd-accent-money" label="Appliances" icon={LayoutGrid}>
          <div className="flex items-baseline">
            <span className="wd-kpi-value font-heading">{appliances.length}</span>
            <span className="wd-kpi-unit">monitored</span>
          </div>
          <div className={`text-[11px] font-mono ${muted}`}>
            {categories.length - 1} {categories.length - 1 === 1 ? 'category' : 'categories'}
          </div>
        </Kpi>

        <Kpi index={2} accent="wd-accent-good" label="Circuits on" icon={Power}>
          <div className="flex items-baseline">
            <span className="wd-kpi-value font-heading">{activeCount}</span>
            <span className="wd-kpi-unit">of {appliances.length}</span>
          </div>
          <div className={`text-[11px] font-mono ${muted}`}>
            {appliances.length - activeCount} switched off
          </div>
        </Kpi>

        <Kpi index={3} accent="wd-accent-live" label="Live draw" icon={Activity} live={!isPaused}>
          <div className="flex items-baseline">
            <span className="wd-kpi-value wd-ov-live-value font-heading">
              {liveTotalW != null ? (liveTotalW / 1000).toFixed(2) : '—'}
            </span>
            <span className="wd-kpi-unit">kW</span>
          </div>
          <div className={`text-[11px] font-mono ${muted}`}>
            Rated load of active circuits: {totalRunningWatts.toLocaleString('en-IN')} W
          </div>
        </Kpi>

        <Kpi index={4} accent="wd-accent-money" label="Est. monthly cost" icon={Receipt}>
          <div className="flex items-baseline">
            <span className="mr-1 text-lg font-semibold text-slate-400">{CURRENCY}</span>
            <span className="wd-kpi-value font-heading">
              {Math.round(totalMonthlyCost).toLocaleString('en-IN')}
            </span>
          </div>
          <div className={`text-[11px] font-mono ${muted}`}>Active circuits only</div>
        </Kpi>
      </div>

      {/* Controls */}
      <div
        className="wd-enter flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        style={{ '--i': 2 }}
      >
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${focusRing} ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : `${muted} hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search appliances"
              placeholder="Search by name or room"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--wd-line)] bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-lg border border-[var(--wd-line)]">
            {[
              { id: 'table', label: 'Table view', Icon: LayoutList },
              { id: 'grid', label: 'Grid view', Icon: LayoutGrid },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                aria-label={label}
                aria-pressed={viewMode === id}
                title={label}
                className={`p-1.5 rounded-md transition-colors ${focusRing} ${
                  viewMode === id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="wd-enter" style={{ '--i': 3 }}>
        {appliances.length === 0 ? (
          <div className="wd-card flex flex-col items-center text-center gap-3 py-14">
            <span className="wd-ov-icon" style={{ '--accent': 'var(--wd-royal)' }}>
              <Plus className="w-4 h-4" />
            </span>
            <h3 className="wd-title font-heading">No appliances yet</h3>
            <p className={`text-xs max-w-sm ${muted}`}>
              Add your first appliance to start tracking its power draw and monthly cost.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className={`px-4 py-2 rounded-lg text-xs font-semibold bg-brand-royal text-white hover:opacity-90 transition-opacity ${focusRing}`}
            >
              Add appliance
            </button>
          </div>
        ) : filteredAppliances.length === 0 ? (
          <div className="wd-card flex flex-col items-center text-center gap-3 py-14">
            <span className="wd-ov-icon" style={{ '--accent': 'var(--wd-warn)' }}>
              <Search className="w-4 h-4" />
            </span>
            <h3 className="wd-title font-heading">No appliances match</h3>
            <p className={`text-xs max-w-sm ${muted}`}>
              Try a different search term or category.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border border-[var(--wd-line)] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${focusRing}`}
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="wd-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--wd-line)] text-[11px] font-medium text-slate-400">
                    <th className="py-3 pl-5 pr-4 font-medium">Appliance</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Room</th>
                    <th className="py-3 px-4 font-medium text-right">Draw now</th>
                    <th className="py-3 px-4 font-medium text-right">Today (kWh)</th>
                    <th className="py-3 px-4 font-medium text-right">Monthly est.</th>
                    <th className="py-3 px-4 font-medium text-center">Breaker</th>
                    <th className="py-3 pl-4 pr-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppliances.map((app) => {
                    const Icon = getCategoryIcon(app.category);
                    const color = applianceColor(app.name);
                    const drawW = drawOf(app);
                    const daily = dailyOf(app);
                    const monthly = toNum(app.monthly_cost_inr);
                    const dim = app.is_active ? '' : 'opacity-60';

                    return (
                      <tr
                        key={app.id}
                        className="border-t border-[var(--wd-line)] first:border-t-0 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-3 pl-5 pr-4">
                          <div className={`flex items-center gap-3 ${dim}`}>
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={tileStyle(color)}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{app.name}</div>
                              <div className={`text-[11px] font-mono ${muted}`}>Rated {app.power_watts} W</div>
                            </div>
                          </div>
                        </td>

                        <td className={`py-3 px-4 ${muted} ${dim}`}>{app.category}</td>

                        <td className={`py-3 px-4 ${muted} ${dim}`}>{app.room || 'General'}</td>

                        <td className="py-3 px-4 text-right">
                          {!app.is_active ? (
                            <span className="font-mono text-slate-400">Off</span>
                          ) : drawW == null ? (
                            <span className="font-mono text-slate-400">—</span>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <LoadBar share={shareOf(drawW)} color={color} />
                              <span className="w-16 font-mono font-medium tabular-nums text-slate-900 dark:text-white">
                                {Math.round(drawW).toLocaleString('en-IN')} W
                              </span>
                            </div>
                          )}
                        </td>

                        <td className={`py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 ${dim}`}>
                          {daily == null ? '—' : daily.toFixed(2)}
                        </td>

                        <td className={`py-3 px-4 text-right font-mono font-medium tabular-nums text-slate-900 dark:text-white ${dim}`}>
                          {monthly == null ? '—' : fmtMoney(monthly)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <BreakerSwitch
                            on={app.is_active}
                            label={`${app.is_active ? 'Turn off' : 'Turn on'} ${app.name}`}
                            onClick={() => handleToggle(app)}
                          />
                        </td>

                        <td className="py-3 pl-4 pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(app)}
                              aria-label={`Edit ${app.name}`}
                              title="Edit appliance"
                              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${focusRing}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(app.id, app.name)}
                              aria-label={`Delete ${app.name}`}
                              title="Remove appliance"
                              className={`p-1.5 rounded-lg text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors ${focusRing}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppliances.map((app) => {
              const Icon = getCategoryIcon(app.category);
              const color = applianceColor(app.name);
              const drawW = drawOf(app);
              const monthly = toNum(app.monthly_cost_inr);
              const dim = app.is_active ? '' : 'opacity-60';

              return (
                <div key={app.id} className="wd-card flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex items-center gap-3 ${dim}`}>
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={tileStyle(color)}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                          {app.name}
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${muted}`}>
                          {app.room || 'General'} · {app.category}
                        </p>
                      </div>
                    </div>

                    <BreakerSwitch
                      on={app.is_active}
                      label={`${app.is_active ? 'Turn off' : 'Turn on'} ${app.name}`}
                      onClick={() => handleToggle(app)}
                    />
                  </div>

                  <div className={`space-y-3 ${dim}`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className={`block text-[11px] ${muted}`}>Draw now</span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                          {!app.is_active
                            ? 'Off'
                            : drawW == null
                              ? '—'
                              : `${Math.round(drawW).toLocaleString('en-IN')} W`}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[11px] ${muted}`}>Monthly est.</span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                          {monthly == null ? '—' : fmtMoney(monthly)}
                        </span>
                      </div>
                    </div>

                    <div className="wd-track" aria-hidden="true">
                      <div className="wd-fill" style={{ '--c': color, width: `${shareOf(drawW)}%` }} />
                    </div>
                    <p className={`text-[11px] font-mono ${muted}`}>Rated {app.power_watts} W</p>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-3 mt-auto border-t border-[var(--wd-line)]">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(app)}
                      className={`px-2 py-1 rounded-lg text-xs inline-flex items-center gap-1.5 text-slate-500 dark:text-[#A1A6AE] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${focusRing}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(app.id, app.name)}
                      className={`px-2 py-1 rounded-lg text-xs inline-flex items-center gap-1.5 text-slate-500 dark:text-[#A1A6AE] hover:text-brand-coral hover:bg-brand-coral/10 transition-colors ${focusRing}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {appliances.length > 0 && filteredAppliances.length > 0 && (
          <p className={`mt-3 text-[11px] font-mono ${muted}`}>
            Showing {filteredAppliances.length} of {appliances.length} appliances
          </p>
        )}
      </div>

      {/* Add / edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="appliance-modal-title"
            className="wd-card wd-pop relative w-full max-w-md z-10 space-y-4 shadow-2xl"
            style={{ transformOrigin: 'center' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--wd-line)]">
              <h3
                id="appliance-modal-title"
                className="text-base font-bold font-heading text-slate-900 dark:text-white"
              >
                {editingAppliance ? 'Edit appliance' : 'Add appliance'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${focusRing}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="appliance-name"
                  className="font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
                >
                  Name
                </label>
                <input
                  id="appliance-name"
                  type="text"
                  autoFocus
                  placeholder="e.g. Inverter Air Conditioner"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="appliance-category"
                    className="font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="appliance-category"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className={inputCls}
                  >
                    {modalCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="appliance-room"
                    className="font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
                  >
                    Room
                  </label>
                  <input
                    id="appliance-room"
                    type="text"
                    placeholder="e.g. Master Bedroom"
                    value={formData.room}
                    onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="appliance-power"
                    className="font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
                  >
                    Rated power (W)
                  </label>
                  <input
                    id="appliance-power"
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.power_watts}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, power_watts: parseInt(e.target.value) || 0 }))
                    }
                    className={`${inputCls} font-mono`}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="appliance-standby"
                    className="font-medium text-slate-700 dark:text-slate-300 block mb-1.5"
                  >
                    Standby power (W)
                  </label>
                  <input
                    id="appliance-standby"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.standby_watts}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, standby_watts: parseFloat(e.target.value) || 0 }))
                    }
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">Start switched on</span>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-brand-emerald"
                />
              </label>

              <div className="pt-4 border-t border-[var(--wd-line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border border-[var(--wd-line)] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${focusRing}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg bg-brand-royal text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 ${focusRing}`}
                >
                  {saving ? 'Saving…' : editingAppliance ? 'Save changes' : 'Add appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}