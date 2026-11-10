import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Power, 
  Zap, 
  Activity, 
  Wind, 
  Tv, 
  Shirt, 
  Lightbulb, 
  Laptop, 
  Flame, 
  Microwave, 
  X, 
  Check, 
  AlertCircle,
  Home
} from 'lucide-react';
import { fetchAppliances, toggleAppliance, createAppliance, updateAppliance, deleteAppliance } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

// Map icon strings to Lucide components
const ICON_MAP = {
  AirVent: Wind,
  Refrigerator: Zap,
  Fan: Wind,
  Tv: Tv,
  Shirt: Shirt,
  Lightbulb: Lightbulb,
  Laptop: Laptop,
  Flame: Flame,
  Microwave: Microwave,
  Zap: Zap,
};

export default function AppliancesView() {
  const { addToast, refreshLive } = useSimulation();
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    icon: 'Zap',
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
      addToast('Failed to toggle appliance status', 'error');
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
      icon: app.icon,
      power_watts: app.power_watts,
      standby_watts: 2.0,
      room: app.room,
      is_active: app.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' from simulated monitoring?`)) return;
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

  const totalSimulatedPower = appliances
    .filter(a => a.is_active)
    .reduce((sum, a) => sum + a.power_watts, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Appliance Fleet Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control simulated appliance duty states, inspect power ratings, and audit daily consumption.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Active Fleet Power:</span>
            <span className="font-bold text-brand-cyan tabular-nums">
              {(totalSimulatedPower / 1000).toFixed(2)} kW
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-bold shadow-md hover:shadow-brand-cyan/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appliance</span>
          </button>
        </div>
      </div>

      {/* Appliances Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {appliances.map((app) => {
          const IconComponent = ICON_MAP[app.icon] || Zap;
          const isActive = app.is_active;

          return (
            <div
              key={app.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-white dark:bg-brand-navyLight border-slate-200 dark:border-white/10 shadow-sm hover:border-brand-cyan/40'
                  : 'bg-slate-100/60 dark:bg-brand-navyDark/60 border-slate-200/60 dark:border-white/5 opacity-70'
              }`}
            >
              <div>
                {/* Card Header: Icon, Category & Toggle Switch */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isActive 
                        ? 'bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan' 
                        : 'bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {app.category} • {app.room}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {app.name}
                      </h3>
                    </div>
                  </div>

                  {/* Operational Status Toggle Switch */}
                  <button
                    onClick={() => handleToggle(app)}
                    title={isActive ? "Turn OFF" : "Turn ON"}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-brand-emerald' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Power & Financial Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rating</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {app.power_watts}W
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Daily Energy</span>
                    <span className="text-xs font-bold text-brand-cyan font-mono">
                      {app.daily_energy_kwh} kWh
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monthly Cost</span>
                    <span className="text-xs font-bold text-brand-emerald font-mono">
                      ₹{app.monthly_cost_inr}
                    </span>
                  </div>
                </div>

                {/* Load Share Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Household Share</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{app.percentage_share}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isActive ? 'bg-brand-cyan' : 'bg-slate-400'}`}
                      style={{ width: `${Math.min(100, app.percentage_share * 2.5)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Status badge & Edit/Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-500' 
                    : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                }`}>
                  {isActive ? 'SIMULATED ACTIVE' : 'SWITCHED OFF'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    title="Edit appliance specs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-coral hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    title="Delete appliance"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Appliance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAppliance ? 'Edit Appliance Specs' : 'Add New Simulated Appliance'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Appliance Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electric Vehicle Charger (Level 2)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="Cooling">Cooling</option>
                    <option value="Heating">Heating</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Computing">Computing</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Utility">Utility</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Zone
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Garage"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Running Power (Watts)
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="10000"
                    value={formData.power_watts}
                    onChange={(e) => setFormData({ ...formData, power_watts: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Standby (Watts)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.standby_watts}
                    onChange={(e) => setFormData({ ...formData, standby_watts: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                  {editingAppliance ? 'Save Changes' : 'Create Appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
