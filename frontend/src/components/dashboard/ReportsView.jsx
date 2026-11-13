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

  const sum = (key) => reportData.reduce(
    (total, row) => total + (Number(row[key]) || 0), 0
  );
  const max = (key) => reportData.reduce(
    (value, row) => Math.max(value, Number(row[key]) || 0), 0
  );
  const fmt = (value) => Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });
  const money = (value) => `${currency}${fmt(value)}`;

  const reportSnapshots = {
    daily: {
      eyebrow: 'DAILY PERFORMANCE',
      accent: '#4169E1',
      tint: 'rgba(65,105,225,.10)',
      metrics: [
        { label: 'TOTAL CONSUMPTION', value: `${fmt(sum('consumption_kwh'))} kWh`, note: 'Energy used in this period' },
        { label: 'PEAK DEMAND', value: `${fmt(max('peak_power_watts'))} W`, note: 'Highest recorded power' },
        { label: 'PEAK-HOUR ENERGY', value: `${fmt(sum('peak_kwh'))} kWh`, note: 'Consumption during peak hours' },
        { label: 'ESTIMATED COST', value: money(sum('cost_inr')), note: 'Calculated energy expense' }
      ]
    },
    weekly: {
      eyebrow: 'WEEKLY PERFORMANCE',
      accent: '#168D69',
      tint: 'rgba(36,199,139,.12)',
      metrics: [
        { label: 'TOTAL ENERGY', value: `${fmt(sum('consumption_kwh'))} kWh`, note: 'Combined weekly consumption' },
        { label: 'DAILY AVERAGE', value: `${fmt(reportData.length ? sum('avg_daily_kwh') / reportData.length : 0)} kWh`, note: 'Average across listed weeks' },
        { label: 'PEAK DEMAND', value: `${fmt(max('peak_power_watts'))} W`, note: 'Highest weekly demand' },
        { label: 'INVOICE TOTAL', value: money(sum('cost_inr')), note: 'Estimated charges' }
      ]
    },
    monthly: {
      eyebrow: 'BILLING OVERVIEW',
      accent: '#4169E1',
      tint: 'rgba(65,105,225,.10)',
      metrics: [
        { label: 'TOTAL UNITS', value: `${fmt(sum('total_kwh'))} kWh`, note: 'Recorded monthly energy' },
        { label: 'ENERGY CHARGES', value: money(sum('energy_charge')), note: 'Variable consumption charges' },
        { label: 'TAX & DUTY', value: money(sum('tax_inr')), note: 'Applicable additional charges' },
        { label: 'TOTAL PAYABLE', value: money(sum('total_bill_inr')), note: 'Combined estimated bill' }
      ]
    },
    appliances: {
      eyebrow: 'APPLIANCE OVERVIEW',
      accent: '#D97745',
      tint: 'rgba(255,128,107,.13)',
      metrics: [
        { label: 'REGISTERED APPLIANCES', value: fmt(reportData.length), note: 'Items in this inventory' },
        { label: 'MEASURED ITEMS', value: fmt(reportData.filter(row => row.measurement_available !== false).length), note: 'With available measurements' },
        { label: 'MONTHLY ENERGY', value: `${fmt(reportData.reduce((total, row) => total + (row.measurement_available === false ? 0 : (Number(row.daily_energy_kwh) || 0) * 30), 0))} kWh`, note: 'Estimated from daily readings' },
        { label: 'MONTHLY COST', value: money(sum('monthly_cost_inr')), note: 'Estimated appliance expense' }
      ]
    },
    cost: {
      eyebrow: 'COST & CONSUMPTION',
      accent: '#D97745',
      tint: 'rgba(255,128,107,.13)',
      metrics: [
        { label: 'TOTAL ENERGY', value: `${fmt(sum('kwh'))} kWh`, note: 'Energy across listed dates' },
        { label: 'TOTAL COST', value: money(sum('cost_inr')), note: 'Accumulated daily cost' },
        { label: 'CUMULATIVE ENERGY', value: `${fmt(reportData.length ? Number(reportData[reportData.length - 1].cumulative_kwh) || 0 : 0)} kWh`, note: 'Last recorded cumulative reading' },
        { label: 'REPORT ENTRIES', value: fmt(reportData.length), note: 'Daily records included' }
      ]
    }
  };

  const snapshot = reportSnapshots[selectedPeriod];

  return (
    <div className="reports-page p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto print:p-0">

      <style>{`
        .reports-page {
          --report-bg: #F7F9FC;
          --report-surface: #FFFFFF;
          --report-text: #101B2D;
          --report-muted: #64748B;
          --report-border: rgba(16,27,45,.09);
          --report-blue: #4169E1;
          --report-cyan: #42D9E8;
          --report-green: #24C78B;
          --report-coral: #FF806B;
          color: var(--report-text);
        }

        .reports-page > div:first-of-type {
          padding-bottom: 22px !important;
          border-color: var(--report-border) !important;
        }

        .reports-page h2 {
          font-family: 'Plus Jakarta Sans', Inter, sans-serif !important;
          font-size: clamp(25px, 3vw, 34px) !important;
          font-weight: 800 !important;
          letter-spacing: -1.25px !important;
          line-height: 1.2 !important;
          margin-top: 7px !important;
        }

        .reports-page h2 + p {
          font-size: 13px !important;
          line-height: 1.7 !important;
          margin-top: 7px !important;
          color: var(--report-muted) !important;
        }

        .reports-page a[href],
        .reports-page button {
          transition: background .18s ease, border-color .18s ease,
                      color .18s ease, transform .18s ease, box-shadow .18s ease;
        }

        .reports-page a[href] {
          background: var(--report-surface) !important;
          border: 1px solid var(--report-border) !important;
          border-radius: 11px !important;
          padding: 11px 15px !important;
          font-family: Inter, sans-serif !important;
          font-size: 11px !important;
          letter-spacing: .3px !important;
          box-shadow: 0 2px 8px rgba(16,27,45,.025);
        }

        .reports-page a[href]:hover {
          border-color: var(--report-blue) !important;
          color: var(--report-blue) !important;
          transform: translateY(-1px);
        }

        .reports-page button[onclick],
        .reports-page button {
          font-family: Inter, sans-serif;
        }

        .reports-page > div:nth-of-type(2) {
          gap: 7px !important;
          padding: 5px !important;
          border: 1px solid var(--report-border) !important;
          border-radius: 13px !important;
          background: var(--report-surface) !important;
          width: fit-content;
          max-width: 100%;
          box-shadow: 0 2px 8px rgba(16,27,45,.025);
        }

        .reports-page > div:nth-of-type(2) button {
          border-radius: 9px !important;
          padding: 10px 15px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }

        .reports-page > div:nth-of-type(2) button:hover {
          color: var(--report-blue) !important;
          background: rgba(65,105,225,.06) !important;
        }

        .reports-page > div:nth-of-type(2) button[class*="bg-slate-900"],
        .reports-page > div:nth-of-type(2) button[class*="dark:bg-white"] {
          background: var(--report-blue) !important;
          color: #FFFFFF !important;
          box-shadow: 0 3px 9px rgba(65,105,225,.18) !important;
        }

        .reports-page > div:nth-of-type(3) {
          background: var(--report-surface) !important;
          border: 1px solid var(--report-border) !important;
          border-radius: 18px !important;
          padding: clamp(18px, 3vw, 34px) !important;
          box-shadow: 0 8px 30px rgba(16,27,45,.045) !important;
          gap: 25px !important;
        }

        .reports-page > div:nth-of-type(3) > div:first-child {
          border-color: var(--report-border) !important;
          padding-bottom: 22px !important;
        }

        .reports-page > div:nth-of-type(3) h3 {
          font-family: 'Plus Jakarta Sans', Inter, sans-serif !important;
          font-size: 17px !important;
          font-weight: 750 !important;
          letter-spacing: -.35px !important;
          margin-top: 7px !important;
        }

        .reports-page table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          min-width: 680px;
          font-family: Inter, sans-serif !important;
          font-size: 12px !important;
        }

        .reports-page thead {
          background: #F5F7FB !important;
        }

        .reports-page thead th {
          padding: 14px 13px !important;
          color: #64748B !important;
          font-family: Inter, sans-serif !important;
          font-size: 9px !important;
          font-weight: 750 !important;
          letter-spacing: .8px !important;
          white-space: nowrap;
          border-bottom: 1px solid var(--report-border) !important;
        }

        .reports-page tbody td {
          padding: 15px 13px !important;
          font-size: 11px !important;
          color: #64748B !important;
          white-space: nowrap;
          border-bottom: 1px solid rgba(16,27,45,.055) !important;
          font-variant-numeric: tabular-nums;
        }

        .reports-page tbody tr:last-child td {
          border-bottom: none !important;
        }

        .reports-page tbody tr:hover td {
          background: rgba(65,105,225,.035) !important;
        }

        .reports-page tbody td:first-child {
          color: var(--report-text) !important;
          font-weight: 650 !important;
        }

        .reports-page tbody td:nth-child(2) {
          color: var(--report-blue) !important;
          font-weight: 700 !important;
        }

        .reports-page tbody td:last-child {
          font-weight: 700 !important;
        }

        .reports-page > div:nth-of-type(3) > div:last-child {
          border-color: var(--report-border) !important;
          padding-top: 17px !important;
          color: var(--report-muted) !important;
          font-family: Inter, sans-serif !important;
          font-size: 10px !important;
          letter-spacing: .1px !important;
        }

        .dark .reports-page {
          --report-bg: #17191D;
          --report-surface: #202328;
          --report-text: #F4F5F6;
          --report-muted: #A1A6AE;
          --report-border: rgba(255,255,255,.09);
        }

        .dark .reports-page > div:nth-of-type(2),
        .dark .reports-page > div:nth-of-type(3),
        .dark .reports-page a[href] {
          background: #202328 !important;
          border-color: rgba(255,255,255,.09) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,.12) !important;
        }

        .dark .reports-page > div:nth-of-type(2) button:hover {
          background: rgba(65,105,225,.13) !important;
          color: #8FAAFF !important;
        }

        .dark .reports-page thead {
          background: #292D33 !important;
        }

        .dark .reports-page thead th {
          color: #A1A6AE !important;
          border-color: rgba(255,255,255,.09) !important;
        }

        .dark .reports-page tbody td {
          color: #A1A6AE !important;
          border-color: rgba(255,255,255,.065) !important;
        }

        .dark .reports-page tbody td:first-child {
          color: #F4F5F6 !important;
        }

        .dark .reports-page tbody td:nth-child(2) {
          color: #65DCE8 !important;
        }

        .dark .reports-page tbody tr:hover td {
          background: rgba(255,255,255,.025) !important;
        }

        .dark .reports-page > div:nth-of-type(3) > div:last-child {
          border-color: rgba(255,255,255,.09) !important;
        }

        @media (max-width: 640px) {
          .reports-page > div:nth-of-type(2) {
            width: 100%;
            overflow-x: auto;
          }
          .reports-page > div:nth-of-type(2) button {
            flex-shrink: 0;
          }
          .reports-page > div:first-of-type > div:last-child {
            width: 100%;
          }
          .reports-page a[href] {
            flex: 1;
            justify-content: center;
          }
        }

        @media print {
          .reports-page {
            color: #101B2D !important;
          }
          .reports-page > div:nth-of-type(3) {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .reports-page table {
            min-width: 0 !important;
          }
          .reports-page thead {
            background: #F1F4F8 !important;
            print-color-adjust: exact;
          }
        }



        /* WATTLUME — STANDALONE REPORT PRINT LAYOUT */
        @page {
          size: A4 portrait;
          margin: 12mm 13mm;
        }

        @media print {
          html, body, #root {
            width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
          }

          body:has(.reports-page) {
            color: #182230 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          body:has(.reports-page) aside,
          body:has(.reports-page) header,
          body:has(.reports-page) .fixed {
            display: none !important;
          }

          body:has(.reports-page) .relative.z-10.flex-1.flex.flex-col {
            width: 100% !important;
            min-width: 0 !important;
            padding-left: 0 !important;
            margin: 0 !important;
          }

          body:has(.reports-page) main {
            width: 100% !important;
            min-width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #FFFFFF !important;
          }

          .reports-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 16px !important;
            color: #182230 !important;
            background: #FFFFFF !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }

          .reports-page .report-document-sheet {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 17px !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #FFFFFF !important;
            color: #182230 !important;
          }

          .reports-page .report-document-header {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            justify-content: space-between !important;
            gap: 18px !important;
            padding: 0 0 14px !important;
            border-bottom: 2px solid #DCE4EA !important;
            break-inside: avoid;
          }

          .reports-page .report-document-header h3 {
            margin-top: 8px !important;
            color: #172B3A !important;
            font-size: 17px !important;
            line-height: 1.3 !important;
          }

          .reports-page .report-document-header p {
            color: #64748B !important;
          }

          .reports-page .report-snapshot {
            display: flex !important;
            gap: 11px !important;
            padding: 13px !important;
            border: 1px solid #DCE5EA !important;
            border-radius: 9px !important;
            background: #F7FAFC !important;
            break-inside: avoid;
          }

          .reports-page .report-snapshot-heading {
            margin-bottom: 1px !important;
          }

          .reports-page .report-snapshot-heading h4 {
            color: #1C3445 !important;
            font-size: 13px !important;
          }

          .reports-page .report-metric-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .reports-page .report-metric-card {
            min-width: 0 !important;
            min-height: 91px !important;
            padding: 10px 9px 12px !important;
            gap: 8px !important;
            border: 1px solid #E0E7ED !important;
            border-radius: 7px !important;
            background: #FFFFFF !important;
            box-shadow: none !important;
            animation: none !important;
            break-inside: avoid;
          }

          .reports-page .report-metric-top {
            color: #64748B !important;
            font-size: 8px !important;
            letter-spacing: .35px !important;
          }

          .reports-page .report-metric-value {
            display: block !important;
            width: 100% !important;
            overflow: visible !important;
            overflow-wrap: normal !important;
            word-break: keep-all !important;
            white-space: nowrap !important;
            color: #172B3A !important;
            font-size: clamp(13px, 1.25vw, 19px) !important;
            letter-spacing: -.45px !important;
            line-height: 1.2 !important;
            font-variant-numeric: tabular-nums;
          }

          .reports-page .report-metric-note {
            color: #778596 !important;
            font-size: 8px !important;
          }

          .reports-page .report-table-wrap {
            width: 100% !important;
            overflow: visible !important;
            break-inside: auto;
          }

          .reports-page .report-data-table {
            width: 100% !important;
            min-width: 0 !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            font-size: 8.5px !important;
            color: #263746 !important;
          }

          .reports-page .report-data-table thead {
            display: table-header-group !important;
            background: #EAF0F4 !important;
          }

          .reports-page .report-data-table thead tr {
            break-inside: avoid;
            break-after: avoid;
          }

          .reports-page .report-data-table th {
            padding: 9px 6px !important;
            color: #29465A !important;
            background: #EAF0F4 !important;
            border-bottom: 1px solid #CAD6DE !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 7.5px !important;
            font-weight: 800 !important;
            letter-spacing: .35px !important;
            line-height: 1.35 !important;
            white-space: normal !important;
            overflow-wrap: normal !important;
          }

          .reports-page .report-data-table td {
            padding: 8px 6px !important;
            color: #344454 !important;
            border-bottom: 1px solid #E7EDF1 !important;
            font-size: 8.5px !important;
            line-height: 1.35 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: clip !important;
            font-variant-numeric: tabular-nums;
          }

          .reports-page .report-data-table tbody tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .reports-page .report-data-table tbody td:first-child {
            color: #20384A !important;
            font-weight: 700 !important;
          }

          .reports-page .report-data-table tbody td:last-child {
            color: #167653 !important;
            font-weight: 800 !important;
          }

          .reports-page .report-document-footer {
            padding-top: 10px !important;
            border-top: 1px solid #DCE4EA !important;
            color: #718096 !important;
            font-size: 8px !important;
            break-inside: avoid;
          }

          .reports-page .report-document-sheet,
          .reports-page .report-snapshot,
          .reports-page .report-metric-card {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .reports-page a,
          .reports-page button {
            display: none !important;
          }
        }

        /* Dynamic report summary cards */
        .reports-page .report-snapshot {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 21px;
          border: 1px solid var(--report-border);
          border-radius: 16px;
          background: linear-gradient(135deg, #F8FAFF, #FFFFFF 65%);
        }

        .reports-page .report-snapshot-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .reports-page .report-snapshot-kicker {
          display: block;
          color: var(--report-blue);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .reports-page .report-snapshot-heading h4 {
          margin-top: 4px;
          font-family: 'Plus Jakarta Sans', Inter, sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -.35px;
        }

        .reports-page .report-snapshot-count {
          padding: 7px 10px;
          border-radius: 7px;
          background: rgba(65,105,225,.09);
          color: #4169E1;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .7px;
        }

        .reports-page .report-metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .reports-page .report-metric-card {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 142px;
          flex-direction: column;
          justify-content: space-between;
          gap: 13px;
          overflow: hidden;
          padding: 17px 16px 19px;
          border: 1px solid var(--report-border);
          border-radius: 12px;
          background: #FFFFFF;
          box-shadow: 0 3px 12px rgba(16,27,45,.035);
          animation: reportMetricIn .35s ease both;
          animation-delay: var(--metric-delay);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .reports-page .report-metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 9px 22px rgba(16,27,45,.09);
        }

        .reports-page .report-metric-top {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748B;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .65px;
          line-height: 1.5;
        }

        .reports-page .report-metric-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: var(--metric-accent);
          box-shadow: 0 0 0 4px var(--metric-tint);
        }

        .reports-page .report-metric-value {
          display: block;
          overflow-wrap: anywhere;
          color: #101B2D;
          font-family: 'Plus Jakarta Sans', Inter, sans-serif;
          font-size: clamp(19px, 2.1vw, 27px);
          font-weight: 850;
          letter-spacing: -1px;
          line-height: 1.15;
          font-variant-numeric: tabular-nums;
        }

        .reports-page .report-metric-note {
          color: #8490A1;
          font-size: 10px;
          line-height: 1.5;
        }

        .reports-page .report-metric-accent {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: 4px;
          background: var(--metric-accent);
        }

        @keyframes reportMetricIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dark .reports-page .report-snapshot {
          background: linear-gradient(135deg, #24282E, #202328 75%);
          border-color: rgba(255,255,255,.09);
        }

        .dark .reports-page .report-snapshot-heading h4 {
          color: #F4F5F6;
        }

        .dark .reports-page .report-snapshot-count {
          background: rgba(101,220,232,.12);
          color: #65DCE8;
        }

        .dark .reports-page .report-metric-card {
          background: #292D33;
          border-color: rgba(255,255,255,.09);
          box-shadow: 0 4px 14px rgba(0,0,0,.12);
        }

        .dark .reports-page .report-metric-top {
          color: #A1A6AE;
        }

        .dark .reports-page .report-metric-value {
          color: #F4F5F6;
        }

        .dark .reports-page .report-metric-note {
          color: #A1A6AE;
        }

        @media (max-width: 900px) {
          .reports-page .report-metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .reports-page .report-snapshot {
            padding: 14px;
          }
          .reports-page .report-metric-card {
            min-height: 125px;
            padding: 13px;
          }
          .reports-page .report-metric-value {
            font-size: 20px;
          }
        }

        @media print {
          .reports-page .report-snapshot {
            background: #F8FAFF !important;
            break-inside: avoid;
            print-color-adjust: exact;
          }
          .reports-page .report-metric-card {
            background: #FFFFFF !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          .reports-page .report-metric-value {
            color: #101B2D !important;
          }
        }

        /* REPORTS VISUAL UPGRADE */

        .reports-page h2 {
          font-size: clamp(28px, 3.5vw, 38px) !important;
          letter-spacing: -1.6px !important;
        }

        /* Give the statement its own identity */
        .reports-page > div:nth-of-type(3) {
          border-top: 4px solid var(--report-blue) !important;
          box-shadow: 0 12px 38px rgba(65,105,225,.075) !important;
        }

        .reports-page > div:nth-of-type(3) > div:first-child {
          background: linear-gradient(
            110deg,
            rgba(65,105,225,.10),
            rgba(66,217,232,.075),
            transparent 85%
          ) !important;
          border: 1px solid rgba(65,105,225,.10) !important;
          border-radius: 13px !important;
          padding: 20px !important;
        }

        .reports-page > div:nth-of-type(3) h3 {
          font-size: 19px !important;
          letter-spacing: -.65px !important;
        }

        .reports-page > div:nth-of-type(3) > div:first-child strong {
          color: var(--report-blue) !important;
        }

        /* More character in the report selector */
        .reports-page > div:nth-of-type(2) button {
          padding: 11px 17px !important;
          border: 1px solid transparent !important;
        }

        .reports-page > div:nth-of-type(2) button[class*="bg-slate-900"],
        .reports-page > div:nth-of-type(2) button[class*="dark:bg-white"] {
          background: linear-gradient(110deg, #4169E1, #398FCF) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(65,105,225,.24) !important;
        }

        /* Stronger table hierarchy */
        .reports-page thead {
          background: #EAF0FF !important;
        }

        .reports-page thead th {
          color: #3456A8 !important;
          font-size: 9px !important;
          letter-spacing: 1px !important;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }

        .reports-page tbody tr:nth-child(even) td {
          background: rgba(65,105,225,.025);
        }

        .reports-page tbody td:nth-child(2) {
          color: #4169E1 !important;
          font-size: 12px !important;
          font-weight: 800 !important;
        }

        .reports-page tbody td:last-child {
          color: #168D69 !important;
          font-weight: 800 !important;
        }

        .reports-page tbody tr:hover td {
          background: rgba(66,217,232,.09) !important;
        }

        /* Dark mode: retain colour without introducing navy panels */
        .dark .reports-page > div:nth-of-type(3) {
          border-top-color: #65DCE8 !important;
          box-shadow: 0 12px 38px rgba(0,0,0,.18) !important;
        }

        .dark .reports-page > div:nth-of-type(3) > div:first-child {
          background: linear-gradient(
            110deg,
            rgba(65,105,225,.16),
            rgba(66,217,232,.08),
            transparent 85%
          ) !important;
          border-color: rgba(255,255,255,.08) !important;
        }

        .dark .reports-page > div:nth-of-type(3) h3 {
          color: #F4F5F6 !important;
        }

        .dark .reports-page thead {
          background: #30343A !important;
        }

        .dark .reports-page thead th {
          color: #8FAAFF !important;
        }

        .dark .reports-page tbody td:nth-child(2) {
          color: #65DCE8 !important;
        }

        .dark .reports-page tbody td:last-child {
          color: #55D6A5 !important;
        }

        .dark .reports-page tbody tr:nth-child(even) td {
          background: rgba(255,255,255,.018);
        }

        .dark .reports-page tbody tr:hover td {
          background: rgba(66,217,232,.055) !important;
        }


              /* WATTLUME — REFINED PAGE HEADING SYSTEM */
.wl-page-heading {
  --wl-heading-accent:#287A4B;
  --wl-heading-tint:rgba(40,122,75,.11);
  position:relative;
  isolation:isolate;
  animation:wlHeadingEnter .55s cubic-bezier(.2,.75,.25,1) both;
}
.wl-heading-insights {--wl-heading-accent:#287A4B;--wl-heading-tint:rgba(40,122,75,.11)}
.wl-heading-bills {--wl-heading-accent:#B77932;--wl-heading-tint:rgba(183,121,50,.12)}
.wl-heading-reports {--wl-heading-accent:#397C70;--wl-heading-tint:rgba(57,124,112,.12)}
.wl-heading-settings {--wl-heading-accent:#71834B;--wl-heading-tint:rgba(113,131,75,.13)}
.dark .wl-heading-insights {--wl-heading-accent:#78BD91;--wl-heading-tint:rgba(120,189,145,.13)}
.dark .wl-heading-bills {--wl-heading-accent:#DDB078;--wl-heading-tint:rgba(221,176,120,.14)}
.dark .wl-heading-reports {--wl-heading-accent:#82BDB1;--wl-heading-tint:rgba(130,189,177,.13)}
.dark .wl-heading-settings {--wl-heading-accent:#B2C887;--wl-heading-tint:rgba(178,200,135,.14)}

.wl-page-heading::before {
  content:"";position:absolute;z-index:-1;left:-24px;top:-24px;
  width:260px;height:130px;pointer-events:none;
  background:radial-gradient(ellipse at 35% 55%,var(--wl-heading-tint),transparent 72%);
}
.wl-heading-main {display:flex;align-items:center;gap:17px;min-width:0}
.wl-heading-icon {
  position:relative;display:grid;place-items:center;flex:0 0 58px;
  width:58px;height:58px;color:var(--wl-heading-accent);
  border:1px solid color-mix(in srgb,var(--wl-heading-accent) 24%,transparent);
  border-radius:18px;
  background:linear-gradient(145deg,rgba(255,255,255,.92),var(--wl-heading-tint));
  box-shadow:0 8px 22px color-mix(in srgb,var(--wl-heading-accent) 10%,transparent),
             inset 0 1px 0 rgba(255,255,255,.8);
  animation:wlIconReveal .65s .08s cubic-bezier(.2,.75,.25,1) both;
}
.wl-heading-icon::after {
  content:"";position:absolute;inset:5px;
  border:1px solid color-mix(in srgb,var(--wl-heading-accent) 13%,transparent);
  border-radius:13px;pointer-events:none;
}
.dark .wl-heading-icon {
  background:linear-gradient(145deg,rgba(255,255,255,.09),var(--wl-heading-tint));
  box-shadow:0 8px 24px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.08);
}
.dark .wl-heading-icon::after {
  border-color:color-mix(in srgb,var(--wl-heading-accent) 18%,transparent);
}
.wl-heading-copy {min-width:0}
.wl-page-heading .wl-heading-eyebrow {
  display:inline-flex;align-items:center;gap:9px;
  color:var(--wl-heading-accent)!important;
  font-size:10px;font-weight:800;letter-spacing:.19em;line-height:1.5;
  text-transform:uppercase;
}
.wl-page-heading .wl-heading-eyebrow::before {
  content:"";width:7px;height:7px;flex:0 0 7px;border-radius:50%;
  background:var(--wl-heading-accent);
  box-shadow:0 0 0 4px var(--wl-heading-tint);
}
.wl-page-heading .wl-heading-title {
  display:block;margin:5px 0 0!important;padding:0!important;
  color:var(--text-primary,#101B2D)!important;
  font-size:clamp(27px,3.1vw,35px)!important;
  font-weight:850!important;letter-spacing:-.045em!important;line-height:1.13!important;
}
.wl-page-heading .wl-heading-title::after {content:none!important}
.wl-page-heading .wl-heading-copy > p {
  margin:7px 0 0!important;max-width:650px;
  color:var(--text-muted,#64748B)!important;font-size:13px;line-height:1.65;
}
@keyframes wlHeadingEnter {
  from {opacity:0;transform:translateY(7px)}
  to {opacity:1;transform:translateY(0)}
}
@keyframes wlIconReveal {
  from {opacity:0;transform:translateY(5px) scale(.94)}
  to {opacity:1;transform:translateY(0) scale(1)}
}
@media(prefers-reduced-motion:reduce) {
  .wl-page-heading,.wl-heading-icon {animation:none!important}
}
\n      `}</style>


      {/* Top Header & Export Actions */}
      <div className="wl-page-heading wl-heading-reports flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/70 dark:border-white/10 pb-4 print:hidden">
        <div className="wl-heading-main">
          <div className="wl-heading-icon" aria-hidden="true">
            <FileText className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="wl-heading-copy">
            <span className="wl-heading-eyebrow">Audit statements</span>
            <h2 className="wl-heading-title">Compliance &amp; Reports</h2>
            <p>Export structured verifications for financial reconciliation and sustainability compliance.</p>
          </div>
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
      <div className="report-document-sheet p-6 sm:p-8 rounded-3xl glass-panel space-y-6 print:border-none print:shadow-none print:p-0 print:bg-transparent">

        {/* Document Header */}
        <div className="report-document-header flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-slate-200/60 dark:border-white/10 gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2.5 mb-2">
              <WattLumeLogo size="sm" showTagline={false} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                OFFICIAL AUDIT LOG
              </span>
            </div>

            <h3 className="max-w-2xl text-lg sm:text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white font-heading">
              {report?.title || 'Energy Audit Statement'}
            </h3>

            {report?.title === 'Monthly Energy & Expenditure Summary Report' ? (
              <>
                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Historical monthly consumption and estimated bills using the configured tariff.
                </p>
                <p className="inline-flex items-center gap-2 rounded-lg border border-slate-200/70 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.035] px-3 py-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  Final month represents a partial billing period.
                </p>
              </>
            ) : (
              <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {report?.description}
              </p>
            )}
          </div>

          <div className="shrink-0 sm:max-w-[230px] text-left sm:text-right text-[11px] font-mono text-slate-500 space-y-1">
            <p>GENERATED: <strong className="text-slate-700 dark:text-slate-300">{report?.generated_at}</strong></p>
            <p>PROFILE: <span className="text-slate-700 dark:text-slate-300">3-BHK Domestic Household</span></p>
            <p className="flex items-center gap-1 sm:justify-end text-brand-emerald">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-bold">Simulated Telemetry Validated</span>
            </p>
          </div>
        </div>

        {/* Report Snapshot Cards */}
        {snapshot && (
          <section className="report-snapshot" aria-label="Report summary">
            <div className="report-snapshot-heading">
              <div>
                <span className="report-snapshot-kicker">AT A GLANCE</span>
                <h4>{snapshot.eyebrow}</h4>
              </div>
              <span className="report-snapshot-count">
                {reportData.length} RECORDS
              </span>
            </div>

            <div className="report-metric-grid">
              {snapshot.metrics.map((metric, index) => (
                <article
                  className="report-metric-card"
                  key={metric.label}
                  style={{
                    '--metric-accent': snapshot.accent,
                    '--metric-tint': snapshot.tint,
                    '--metric-delay': `${index * 65}ms`
                  }}
                >
                  <div className="report-metric-top">
                    <span className="report-metric-dot" />
                    <span>{metric.label}</span>
                  </div>
                  <strong className="report-metric-value">{metric.value}</strong>
                  <span className="report-metric-note">{metric.note}</span>
                  <div className="report-metric-accent" />
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Data Table */}
        <div className="report-table-wrap overflow-x-auto">
          <table className="report-data-table w-full text-left text-xs font-mono">
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
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Daily Energy</th>
                  <th className="py-3 px-3">Daily Cost</th>
                  <th className="py-3 px-3 text-right">Cumulative Energy</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  {selectedPeriod === 'daily' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.date}</td>
                      <td className="py-3 px-3 font-bold text-brand-blue dark:text-brand-cyan">{row.consumption_kwh} kWh</td>
                      <td className="py-3 px-3">{row.peak_power_watts} W</td>
                      <td className="py-3 px-3">{row.off_peak_kwh} kWh</td>
                      <td className="py-3 px-3">{row.peak_kwh} kWh</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-emerald">{currency}{row.cost_inr}</td>
                    </>
                  )}
                  {selectedPeriod === 'weekly' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.period}</td>
                      <td className="py-3 px-3 font-bold text-brand-blue dark:text-brand-cyan">{row.consumption_kwh} kWh</td>
                      <td className="py-3 px-3">{row.avg_daily_kwh} kWh</td>
                      <td className="py-3 px-3">{row.peak_power_watts} W</td>
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
                      <td className="py-3 px-3">{row.measurement_available === false ? 'Not measured' : `${row.daily_energy_kwh} kWh`}</td>
                      <td className="py-3 px-3">{row.measurement_available === false ? 'Not measured' : `${(row.daily_energy_kwh * 30).toFixed(2)} kWh`}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{row.measurement_available === false ? 'Not measured' : `${currency}${row.monthly_cost_inr}`}</td>
                    </>
                  )}
                  {selectedPeriod === 'cost' && (
                    <>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.date}</td>
                      <td className="py-3 px-3">{row.kwh} kWh</td>
                      <td className="py-3 px-3">{currency}{row.cost_inr}</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-emerald">{row.cumulative_kwh} kWh</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Verification Note */}
        <div className="report-document-footer pt-4 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <span>WattLume Energy Intelligence Platform • Export Verification</span>
          <span>100% Simulated Load Telemetry Profile</span>
        </div>

      </div>

    </div>
  );
}
