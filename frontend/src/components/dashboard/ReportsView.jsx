import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  RefreshCw,
  FileText,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { fetchReports, getExportCsvUrl } from '../../services/api';
import WattLumeLogo from '../brand/WattLumeLogo';

export default function ReportsView() {
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto print:p-0">

      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/70 dark:border-white/10 pb-4 print:hidden">
        <div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            Audit Statements
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
            Compliance &amp; Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Export structured verifications for financial reconciliation and sustainability compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Export */}
          <a
            href={getExportCsvUrl(selectedPeriod)}
            download
            className="px-4 py-2 rounded-full glass-pill hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-emerald" />
            <span>CSV EXPORT</span>
          </a>

          {/* Print View */}
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-brand-royal dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold tracking-tight transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/50 dark:border-white/10 print:hidden">
        {periodTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedPeriod(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
              selectedPeriod === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-sm'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Sheet */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6 print:border-none print:shadow-none print:p-0 print:bg-transparent">

        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-slate-200/60 dark:border-white/10 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <WattLumeLogo size="sm" showTagline={false} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                OFFICIAL AUDIT LOG
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
              {report?.title || 'Energy Audit Statement'}
            </h3>
            <p className="text-xs text-slate-500">
              {report?.description}
            </p>
          </div>

          <div className="text-left sm:text-right text-[11px] font-mono text-slate-500 space-y-1">
            <p>GENERATED: <strong className="text-slate-700 dark:text-slate-300">{report?.generated_at}</strong></p>
            <p>PROFILE: <span className="text-slate-700 dark:text-slate-300">3-BHK Domestic Household</span></p>
            <p className="flex items-center gap-1 sm:justify-end text-brand-emerald">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-bold">Simulated Telemetry Validated</span>
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-200/60 dark:border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
              {selectedPeriod === 'daily' && (
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Volume (kWh)</th>
                  <th className="py-3 px-3">Peak Power</th>
                  <th className="py-3 px-3">Off-Peak (kWh)</th>
                  <th className="py-3 px-3">Peak Hours</th>
                  <th className="py-3 px-3 text-right">Estimated Cost</th>
                </tr>
              )}
              {selectedPeriod === 'weekly' && (
                <tr>
                  <th className="py-3 px-3">Week Span</th>
                  <th className="py-3 px-3">Total kWh</th>
                  <th className="py-3 px-3">Daily Avg</th>
                  <th className="py-3 px-3">Peak Demand</th>
                  <th className="py-3 px-3 text-right">Invoice Sum</th>
                </tr>
              )}
              {selectedPeriod === 'monthly' && (
                <tr>
                  <th className="py-3 px-3">Billing Cycle</th>
                  <th className="py-3 px-3">Net Units (kWh)</th>
                  <th className="py-3 px-3">Base Charge</th>
                  <th className="py-3 px-3">Energy Charges</th>
                  <th className="py-3 px-3">Tax / Duty</th>
                  <th className="py-3 px-3 text-right">Total Payable</th>
                </tr>
              )}
              {selectedPeriod === 'appliances' && (
                <tr>
                  <th className="py-3 px-3">Appliance Name</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Power (W)</th>
                  <th className="py-3 px-3">Daily Energy</th>
                  <th className="py-3 px-3">Monthly Energy</th>
                  <th className="py-3 px-3 text-right">Monthly Cost</th>
                </tr>
              )}
              {selectedPeriod === 'cost' && (
                <tr>
                  <th className="py-3 px-3">Cost Component</th>
                  <th className="py-3 px-3">Rate / Metric</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  {selectedPeriod === 'daily' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.date}</td>
                      <td className="py-3 px-3 font-bold text-brand-blue dark:text-brand-cyan">{row.total_kwh} kWh</td>
                      <td className="py-3 px-3">{row.peak_watts} W</td>
                      <td className="py-3 px-3">{row.off_peak_kwh} kWh</td>
                      <td className="py-3 px-3">{row.peak_kwh} kWh</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-emerald">{currency}{row.cost_inr}</td>
                    </>
                  )}
                  {selectedPeriod === 'weekly' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.week}</td>
                      <td className="py-3 px-3 font-bold text-brand-blue dark:text-brand-cyan">{row.total_kwh} kWh</td>
                      <td className="py-3 px-3">{row.daily_avg_kwh} kWh</td>
                      <td className="py-3 px-3">{row.peak_watts} W</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-emerald">{currency}{row.cost_inr}</td>
                    </>
                  )}
                  {selectedPeriod === 'monthly' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.month}</td>
                      <td className="py-3 px-3 font-bold text-brand-blue dark:text-brand-cyan">{row.total_kwh} kWh</td>
                      <td className="py-3 px-3">{currency}{row.fixed_charge}</td>
                      <td className="py-3 px-3">{currency}{row.energy_charge}</td>
                      <td className="py-3 px-3">{currency}{row.tax_inr}</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-emerald">{currency}{row.total_bill_inr}</td>
                    </>
                  )}
                  {selectedPeriod === 'appliances' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.name}</td>
                      <td className="py-3 px-3 font-sans text-slate-500">{row.room}</td>
                      <td className="py-3 px-3">{row.power_watts} W</td>
                      <td className="py-3 px-3">{row.daily_kwh} kWh</td>
                      <td className="py-3 px-3">{row.monthly_kwh} kWh</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{currency}{row.monthly_cost}</td>
                    </>
                  )}
                  {selectedPeriod === 'cost' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.component}</td>
                      <td className="py-3 px-3">{row.rate}</td>
                      <td className="py-3 px-3">{row.quantity}</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-emerald">{currency}{row.amount}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Verification Note */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <span>WattLume Energy Intelligence Platform • Export Verification</span>
          <span>100% Simulated Load Telemetry Profile</span>
        </div>

      </div>

    </div>
  );
}
