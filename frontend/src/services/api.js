// API service connecting React frontend to FastAPI backend

const API_HOST = typeof window !== 'undefined' && ['5173', '5174'].includes(window.location.port)
  ? `http://${window.location.hostname === 'localhost' ? 'localhost' : '192.168.29.114'}:8000`
  : '';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || API_HOST).replace(/\/$/, '');
const BASE_URL = `${API_BASE_URL}/api`;

export async function fetchOverview() {
  const res = await fetch(`${BASE_URL}/overview`);
  if (!res.ok) throw new Error(`Failed to fetch overview: ${res.statusText}`);
  return res.json();
}

export async function fetchLive() {
  const res = await fetch(`${BASE_URL}/live`);
  if (!res.ok) throw new Error(`Failed to fetch live telemetry: ${res.statusText}`);
  return res.json();
}

export async function fetchAnalytics(range = '7d') {
  const res = await fetch(`${BASE_URL}/analytics?range=${range}`);
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  return res.json();
}

export async function fetchAppliances() {
  const res = await fetch(`${BASE_URL}/appliances`);
  if (!res.ok) throw new Error(`Failed to fetch appliances: ${res.statusText}`);
  return res.json();
}

export async function createAppliance(data) {
  const res = await fetch(`${BASE_URL}/appliances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create appliance: ${res.statusText}`);
  return res.json();
}

export async function updateAppliance(id, data) {
  const res = await fetch(`${BASE_URL}/appliances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update appliance: ${res.statusText}`);
  return res.json();
}

export async function toggleAppliance(id) {
  const res = await fetch(`${BASE_URL}/appliances/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error(`Failed to toggle appliance: ${res.statusText}`);
  return res.json();
}

export async function deleteAppliance(id) {
  const res = await fetch(`${BASE_URL}/appliances/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete appliance: ${res.statusText}`);
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${BASE_URL}/insights`);
  if (!res.ok) throw new Error(`Failed to fetch insights: ${res.statusText}`);
  return res.json();
}

export async function acknowledgeAnomaly(id) {
  const res = await fetch(`${BASE_URL}/insights/anomalies/${id}/acknowledge`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to acknowledge anomaly: ${res.statusText}`);
  return res.json();
}

export async function fetchBilling() {
  const res = await fetch(`${BASE_URL}/billing`);
  if (!res.ok) throw new Error(`Failed to fetch billing: ${res.statusText}`);
  return res.json();
}

export async function updateTariff(tariffData) {
  const res = await fetch(`${BASE_URL}/billing/tariff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tariffData),
  });
  if (!res.ok) throw new Error(`Failed to update tariff: ${res.statusText}`);
  return res.json();
}

export async function fetchReports(period = 'monthly') {
  const res = await fetch(`${BASE_URL}/reports?period=${period}`);
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.statusText}`);
  return res.json();
}

export function getExportCsvUrl(period = 'monthly') {
  return `${BASE_URL}/reports/export-csv?period=${period}`;
}

export async function updateSimulationControl(payload) {
  const res = await fetch(`${BASE_URL}/simulation/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update simulation: ${res.statusText}`);
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${BASE_URL}/simulation/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reset simulation: ${res.statusText}`);
  return res.json();
}

export async function sendEnergyAssistantMessage({ message, history = [], activeView = 'overview' }) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, active_view: activeView }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Energy assistant request failed (${res.status})`);
  }
  return data;
}
