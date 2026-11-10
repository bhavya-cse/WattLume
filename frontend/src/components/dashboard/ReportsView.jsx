import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Table, 
  CheckCircle2, 
  RefreshCw,
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import { fetchReports, getExportCsvUrl } from '../../services/api';
import { useSimulation } from '../../context/SimulationContext';

export default function ReportsView() {
  const { addToast } = useSimulation();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  const loadReport = async (period) => {
    setLoading(true);
    try {
      const data = await fetchReports(period);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedPeriod);
  }, [selectedPeriod]);

  const handlePrint = () => {
    window.print();
  };

  const periodTabs = [
    { id: 'daily', label: 'Daily Audit' },
    { id: 'weekly', label: 'Weekly Summary' },
    { id: 'monthly', label: 'Monthly Statement' },
    { id: 'appliances', label: 'Appliance Inventory' },
    { id: 'cost', label: 'Cost Buildup' },
  ];

  const reportData = report?.data || [];
  const currency = report?.currency_symbol || '₹';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto print:p-0 print:m-0">
      
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Compliance &amp; Energy Audit Reports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate and export structured verification statements for financial and sustainability audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Download Button */}
          <a
            href={getExportCsvUrl(selectedPeriod)}
            download
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navyLight hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-emerald" />
            <span>Export CSV</span>
          </a>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-bold shadow-md hover:shadow-brand-cyan/20 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF View</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-white/10 print:hidden">
        {periodTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedPeriod(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPeriod === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Formatted Report Document Paper */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-brand-navyLight border border-slate-200 dark:border-white/10 shadow-lg space-y-6 print:shadow-none print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 dark:border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Watt<span className="text-brand-cyan">Lume</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-bold">
                AUDIT STATEMENT
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {report?.title || 'Energy Consumption Report'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {report?.description}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-500">
            <p>Generated: <strong className="text-slate-800 dark:text-slate-200">{report?.generated_at}</strong></p>
            <p>Household: <strong className="text-slate-800 dark:text-slate-200">Aravind S. (Smart Hub 3-BHK)</strong></p>
            <p>Status: <span className="text-brand-emerald font-bold">Digitally Verified</span></p>
          </div>
        </div>

        {/* Report Granular Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.04] text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              {selectedPeriod === 'daily' && (
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Consumption (kWh)</th>
                  <th className="py-3 px-4">Peak Power</th>
                  <th className="py-3 px-4">Off-Peak (kWh)</th>
                  <th className="py-3 px-4">Peak Window (kWh)</th>
                  <th className="py-3 px-4">Estimated Cost</th>
                  <th className="py-3 px-4">Efficiency</th>
                </tr>
              )}
              {selectedPeriod === 'weekly' && (
                <tr>
                  <th className="py-3 px-4">Weekly Horizon</th>
                  <th className="py-3 px-4">Total Energy (kWh)</th>
                  <th className="py-3 px-4">Daily Average</th>
                  <th className="py-3 px-4">Peak Demand</th>
                  <th className="py-3 px-4">Total Billed ({currency})</th>
                  <th className="py-3 px-4">Mean Score</th>
                </tr>
              )}
              {selectedPeriod === 'monthly' && (
                <tr>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Consumption (kWh)</th>
                  <th className="py-3 px-4">Prior Year Baseline</th>
                  <th className="py-3 px-4">Effective Rate</th>
                  <th className="py-3 px-4">Total Invoice ({currency})</th>
                </tr>
              )}
              {selectedPeriod === 'appliances' && (
                <tr>
                  <th className="py-3 px-4">Appliance</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Rating (Watts)</th>
                  <th className="py-3 px-4">Daily Energy (kWh)</th>
                  <th className="py-3 px-4">Monthly Cost</th>
                  <th className="py-3 px-4">Share of Load</th>
                </tr>
              )}
              {selectedPeriod === 'cost' && (
                <tr>
                  <th className="py-3 px-4">Calendar Date</th>
                  <th className="py-3 px-4">Daily Energy (kWh)</th>
                  <th className="py-3 px-4">Daily Charge ({currency})</th>
                  <th className="py-3 px-4">Cumulative Month-to-Date</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  {selectedPeriod === 'daily' && (
                    <>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{row.date}</td>
                      <td className="py-3 px-4 font-bold text-brand-cyan">{row.consumption_kwh}</td>
                      <td className="py-3 px-4">{row.peak_power_watts} W</td>
                      <td className="py-3 px-4">{row.off_peak_kwh}</td>
                      <td className="py-3 px-4 text-brand-coral">{row.peak_kwh}</td>
                      <td className="py-3 px-4 font-bold text-brand-emerald">{currency}{row.cost_inr}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[11px] font-bold">
                          {row.efficiency_score}/100
                        </span>
                      </td>
                    </>
                  )}
                  {selectedPeriod === 'weekly' && (
                    <>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{row.period}</td>
                      <td className="py-3 px-4 font-bold text-brand-cyan">{row.consumption_kwh}</td>
                      <td className="py-3 px-4">{row.avg_daily_kwh} kWh/d</td>
                      <td className="py-3 px-4">{row.peak_power_watts} W</td>
                      <td className="py-3 px-4 font-bold text-brand-emerald">{currency}{row.cost_inr}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[11px] font-bold">
                          {row.efficiency_score}/100
                        </span>
                      </td>
                    </>
                  )}
                  {selectedPeriod === 'monthly' && (
                    <>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{row.month_label}</td>
                      <td className="py-3 px-4 font-bold text-brand-cyan">{row.total_kwh}</td>
                      <td className="py-3 px-4 text-slate-400">{row.prev_year_kwh} kWh</td>
                      <td className="py-3 px-4">{currency}{row.avg_cost_per_kwh}/unit</td>
                      <td className="py-3 px-4 font-bold text-brand-emerald">{currency}{row.cost_inr}</td>
                    </>
                  )}
                  {selectedPeriod === 'appliances' && (
                    <>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                      <td className="py-3 px-4 font-sans text-slate-400">{row.room}</td>
                      <td className="py-3 px-4">{row.power_watts} W</td>
                      <td className="py-3 px-4 font-bold text-brand-cyan">{row.daily_energy_kwh}</td>
                      <td className="py-3 px-4 font-bold text-brand-emerald">{currency}{row.monthly_cost_inr}</td>
                      <td className="py-3 px-4">{row.percentage_share}%</td>
                    </>
                  )}
                  {selectedPeriod === 'cost' && (
                    <>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{row.date}</td>
                      <td className="py-3 px-4">{row.kwh} kWh</td>
                      <td className="py-3 px-4 text-brand-cyan font-bold">{currency}{row.cost_inr}</td>
                      <td className="py-3 px-4 font-bold text-brand-emerald">{row.cumulative_kwh} kWh</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>WattLume Digital Energy Intelligence Platform • Simulated Audit Report</p>
          <p>Confidential &amp; Proprietary Analysis</p>
        </div>

      </div>

    </div>
  );
}
