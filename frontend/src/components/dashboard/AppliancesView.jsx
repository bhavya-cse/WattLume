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
  Radio,
  Sliders,
  Check
} from 'lucide-react';
import { fetchAppliances, toggleAppliance, createAppliance, updateAppliance, deleteAppliance } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

export default function AppliancesView() {
  const { addToast, refreshLive } = useSimulation();
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);
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
      setAppliances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (app) => {
    try {
      const res = await toggleAppliance(app.id);
      setAppliances(prev => prev.map(a => a.id === app.id ? { ...a, is_active: res.is_active } : a));
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
      setAppliances(prev => prev.filter(a => a.id !== id));
      addToast(`Removed ${name}`, 'info');
      refreshLive();
    } catch {
      addToast('Failed to delete appliance', 'error');
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

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
    }
  };

  const categories = ['All', 'Cooling', 'Kitchen', 'Heating', 'Entertainment', 'Computing', 'Lighting'];

  const filteredAppliances = appliances.filter(app => {
    const matchesCat = selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (app.room && app.room.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalRunningWatts = appliances.filter(a => a.is_active).reduce((sum, a) => sum + a.power_watts, 0);
  const totalMonthlyCost = appliances.reduce((sum, a) => sum + (a.is_active ? a.monthly_cost_inr : 0), 0);
  const activeCount = appliances.filter(a => a.is_active).length;

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'cooling': return Wind;
      case 'kitchen': return Coffee;
      case 'heating': return Flame;
      case 'entertainment': return Tv;
      case 'computing': return Laptop;
      case 'lighting': return Lightbulb;
      default: return Zap;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/10">
        <div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            Circuit Management
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Appliances
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor appliance power draw, calculate device costs, and toggle individual circuits.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-brand-royal dark:hover:bg-slate-100 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Appliance</span>
        </button>
      </div>

      {/* Summary Strip in iOS Glass Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Monitored Fleet</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tabular-nums">
              {appliances.length}
            </span>
            <span className="text-xs text-slate-400">appliances</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Active Breakers</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-brand-blue dark:text-brand-cyan tabular-nums">
              {activeCount}
            </span>
            <span className="text-xs text-slate-400">of {appliances.length} drawing</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Live Power Draw</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tabular-nums">
              {(totalRunningWatts / 1000).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">kW ({totalRunningWatts} W)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Monthly Fleet Cost</div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-slate-400">₹</span>
            <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tabular-nums">
              {Math.round(totalMonthlyCost).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories, Search, View Mode */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                  : 'glass-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search appliances or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full glass-pill text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-full glass-pill">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'table' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
              title="Table view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl glass-panel shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3.5 px-5">Circuit &amp; Appliance</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4 text-right">Power Draw</th>
                  <th className="py-3.5 px-4 text-right">Today (kWh)</th>
                  <th className="py-3.5 px-4 text-right">Monthly Est.</th>
                  <th className="py-3.5 px-4 text-center">Breaker Switch</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredAppliances.map((app) => {
                  const Icon = getCategoryIcon(app.category);
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
                        !app.is_active ? 'opacity-60 bg-slate-50/40 dark:bg-white/[0.01]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            app.is_active
                              ? 'bg-brand-royal/10 text-brand-royal dark:text-brand-cyan'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {app.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Rated: {app.power_watts}W
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono glass-pill text-slate-600 dark:text-slate-300">
                          {app.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {app.room || 'General'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium tabular-nums">
                        {app.is_active ? (
                          <span className="text-slate-900 dark:text-white font-bold">
                            {app.power_watts} W
                          </span>
                        ) : (
                          <span className="text-slate-400">0 W (standby)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {(app.daily_kwh || (app.power_watts * 4.2 / 1000)).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                        ₹{Math.round(app.monthly_cost_inr || (app.power_watts * 4.2 * 30 * 7.5 / 1000)).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(app)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            app.is_active ? 'bg-brand-emerald shadow-sm shadow-emerald-500/20' : 'bg-slate-300 dark:bg-white/20'
                          }`}
                          title={app.is_active ? "Turn breaker OFF" : "Turn breaker ON"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              app.is_active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Edit specs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id, app.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Remove appliance"
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
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppliances.map((app) => {
            const Icon = getCategoryIcon(app.category);
            return (
              <div
                key={app.id}
                className={`p-5 rounded-2xl glass-panel glass-card-interactive transition-all ${
                  !app.is_active ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      app.is_active
                        ? 'bg-brand-royal/10 text-brand-royal dark:text-brand-cyan'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                        {app.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {app.room || 'General'} • {app.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(app)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      app.is_active ? 'bg-brand-emerald shadow-sm shadow-emerald-500/20' : 'bg-slate-300 dark:bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        app.is_active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Power Draw</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {app.is_active ? `${app.power_watts} W` : '0 W'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Monthly Est.</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      ₹{Math.round(app.monthly_cost_inr || 320).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handleOpenEdit(app)}
                    className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 text-xs inline-flex items-center gap-1"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-3xl glass-panel-elevated p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-white/60 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {editingAppliance ? 'Edit Appliance Circuit' : 'Register New Appliance'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Appliance Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inverter Air Conditioner"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="Cooling">Cooling</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Heating">Heating</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Computing">Computing</option>
                    <option value="Lighting">Lighting</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Bedroom"
                    value={formData.room}
                    onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Rated Power (Watts)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.power_watts}
                    onChange={(e) => setFormData(prev => ({ ...prev, power_watts: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-cyan"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Standby Power (Watts)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.standby_watts}
                    onChange={(e) => setFormData(prev => ({ ...prev, standby_watts: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Initial Breaker State
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded accent-brand-emerald"
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-mono">
                    {formData.is_active ? 'Circuit Active' : 'Circuit Open'}
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full glass-pill text-slate-600 dark:text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-brand-royal dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all"
                >
                  {editingAppliance ? 'Save Changes' : 'Register Appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
