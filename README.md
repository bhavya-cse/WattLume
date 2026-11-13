# WattLume — Smart Energy Consumption Monitoring & Intelligence Platform

> **"Energy, made visible."**  
> *Understand your energy. Optimize your future.*

---

## ⚡ Executive Summary

**WattLume** is a commercial-grade, full-stack digital energy intelligence platform that empowers residential and commercial users to visualize electrical consumption, audit appliance-wise power draws, forecast utility bills in Indian Rupees (₹ INR), identify abnormal consumption surges through statistical baselining, and implement actionable conservation strategies.

**WattLume is a 100% software-based system.** It requires **no physical IoT microcontrollers (no Arduino, ESP32, CT clamps, or physical submeters)**. Instead, it utilizes a physics-grounded mathematical simulation engine to generate realistic electrical telemetry (Voltage, Current, Power Factor, Frequency, Real Power, and Cumulative Energy) with diurnal residential human activity modeling and empirical historical datasets.

---

## 🎨 Brand Identity & Design System

### Brand Concept
- **Watt**: Quantitative metric of active electrical power and energy flux.
- **Lume**: Illumination, lucidity, transparency, and actionable visibility.
- **WattLume**: Bringing hidden electrical waste to light through elegant digital intelligence.

### Visual Design System & Creative Direction
- **Design Philosophy**: Minimal, restrained, human-crafted aesthetic inspired by Pratyora. Generous purposeful whitespace, crisp hairline borders, and purposeful contrast.
- **Deep Indigo & Midnight Navy (`#17143F` / `#101B2D`)**: Architectural canvas grounding.
- **Warm Off-white (`#F7F9FC`)**: Refined light-theme background canvas.
- **Electric Cyan (`#42D9E8`)**: Real-time electrical telemetry stream, active node pulses.
- **Fresh Emerald (`#24C78B`)**: Verified financial savings, efficiency gains, breaker active status.
- **Royal Blue (`#4169E1`)**: Longitudinal analytics and primary interactive controls.
- **Coral Warning (`#FF806B`)**: Z-score anomaly alerts and threshold breach flags.
- **Lavender (`#A78BFA`)**: Multi-factor scoring indexes.
- **Typography**: Bricolage Grotesque for headings (`font-heading`), Figtree for body (`font-sans`), and JetBrains Mono for tabular metrics (`tabular-nums font-mono`).
- **Streamlined 5-Section Dashboard Architecture**:
  1. **Overview**: Live-updating simulated telemetry, 4 core KPI cards, 24-hour diurnal load curve, top appliance breakdown, and live alert ticker.
  2. **Energy Usage & Billing**: Unified longitudinal analytics (Today, 7D, 30D, 12M), multi-slab tariff invoice projection, and Downloadable energy reports with CSV download and print capabilities.
  3. **Appliances**: Clean fleet inventory with Simulated power consumption , daily kWh consumption, monthly cost estimates, and Simulated appliance control switches.
  4. **Smart Insights**: Statistical anomaly triage (What happened / Why it matters / What you can do), efficiency scoring benchmark, monthly bill forecasting, and practical rupee-saving conservation advisories.
  5. **Profile & Simulation Settings**: Accessible via the topbar control for household profile specs, simulation speed multipliers (1x–10x), pause/resume, anomaly sensitivity threshold slider, and SQLite database reset.
- **Anti-AI Design Principles**: No generic rainbow gradient text, no floating blur blobs, no identical 3-column card grids, no oversized cartoon icons. Built with intentional restraint and human design maturity.

### Custom Geometric Logo Symbol
The WattLume emblem is a precision industrial geometric badge featuring a faceted diamond matrix, dynamic cyan energy core vectors, and a central *Lume Nexus* point with micro bus terminal alignments.

---

## 🌟 Key Features

1. **Live-updating simulated telemetry Stream**: Sub-second synchronized simulation of instantaneous active power ($W$ / $kW$), RMS voltage ($230V \pm 3V$), load current ($A$), power factor ($0.92 - 0.98$), frequency ($50Hz$), and cumulative kilowatt-hours ($kWh$).
2. **Interactive Appliance Fleet Management**: 9 canonical residential appliances (Inverter AC, Double-Door Refrigerator, BLDC Fan, 4K TV, Front-Load Washing Machine, Smart LEDs, Home Office Workstation, 25L Storage Geyser, and Microwave Oven). Real-time ON/OFF toggling immediately impacts live system power draw. Full CRUD support to add, edit, or remove appliances.
3. **Statistical Anomaly Detection (Z-Score)**: Grouping historical hourly readings into baseline distributions $(\mu_h, \sigma_h)$. Flagging surges exceeding $+30\%$ or $2.0\sigma$ with culprit appliance attribution and root-cause analysis.
4. **Predictive Electricity Bill Forecasting (₹ INR)**: Dynamic month-to-date accrual and end-of-month cost projection based on daily burn rate under configurable **Slab-Based (Tiered)** or **Flat-Rate** tariff schedules, monthly fixed charges, and regulatory duty/taxes.
5. **Contextual Smart Recommendations**: Quantitative energy conservation strategies detailing exact monthly rupee savings (cooling setpoint shifts, vampire standby load elimination, peak load shifting, and geyser timer automation).
6. **Transparent Energy Efficiency Scoring**: A 0–100 benchmark score explaining its four underlying components: Benchmark Consumption (35 pts), Peak Shift Ratio (25 pts), Standby Baseload (20 pts), and System Stability (20 pts).
7. **Compliance & Audit Reporting**: Granular tabular statements across Daily, Weekly, Monthly, Appliance, and Cost views. Downloadable CSV exports and professional browser print/PDF views.
8. **Dual-Theme & Reduced-Motion Accessibility**: Complete Dark Mode and Light Mode with persistence in `localStorage`, plus full support for `prefers-reduced-motion`.

---

## 📐 Mathematical Simulation Engine

WattLume enforces strict electrical physics consistency across all telemetry calculations:

$$\text{Active Power } P_{\text{total}} = \sum_{i=1}^{N} P_i \cdot \delta_i$$

$$\text{Current } I = \frac{P_{\text{total}}}{V_{\text{RMS}} \times \text{PF}}$$

$$\text{Energy } E (kWh) = \frac{P_{\text{total}} \times \Delta t}{1000}$$

Where:
- $\delta_i \in \{0, 1\}$ represents the operational state (active vs standby/switched-off).
- $V_{\text{RMS}} = 230.0 + \mathcal{N}(0, 2.2)\text{ Volts}$.
- $\text{PF} = \text{clamp}(0.94 + \mathcal{N}(0, 0.015), 0.90, 0.99)$.
- Diurnal probability curves model human activity (cooling spikes during hot afternoons and night hours, geysers in early mornings, lighting and entertainment during evening peak grid slots).
- On initialization, 60 days of historical hourly telemetry (1,440 readings) and benchmark anomalies are seeded into SQLite.

---

## 🏗️ Technology Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       WattLume Client                       │
│  React 18 • Vite • Tailwind CSS • Recharts • Lucide Icons   │
│  (Landing Page, Live Telemetry, Interactive Fleet Toggles)  │
└──────────────────────────────▲──────────────────────────────┘
                               │ REST / JSON API (Proxy :5173 -> :8000)
┌──────────────────────────────▼──────────────────────────────┐
│                    WattLume Backend Engine                  │
│       FastAPI (Python 3) • Uvicorn • Pydantic Schemas       │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │  simulator.py    │  │  analytics.py  │  │ billing.py  │  │
│  └──────────────────┘  └────────────────┘  └─────────────┘  │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ anomaly_detect.py│  │recommendations │  │ models.py   │  │
│  └──────────────────┘  └────────────────┘  └─────────────┘  │
└──────────────────────────────▲──────────────────────────────┘
                               │ SQLAlchemy ORM
┌──────────────────────────────▼──────────────────────────────┐
│                      SQLite Database                        │
│   (wattlume.db — 60 Days Historical Seed Data & Schemas)    │
└─────────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom brand design tokens
- **Visualizations**: Recharts (Responsive Area, Stacked Bar, Line, and Donut charts)
- **Icons**: Lucide React
- **Animations**: CSS Keyframe flow, HTML5 Canvas glowing energy vectors, Tailwind transition utilities

### Backend
- **Framework**: FastAPI (Asynchronous Python 3)
- **Database & ORM**: SQLite with SQLAlchemy 2.0
- **Analytics & Math**: NumPy, Python math, statistics
- **Validation**: Pydantic v2 schemas
- **Server**: Uvicorn ASGI

---

## 📁 Repository Structure

```
wattlume/
├── backend/
│   ├── __init__.py
│   ├── main.py                # FastAPI routes, CORS, lifecycle, SPA static mount
│   ├── database.py            # SQLite connection and session factory
│   ├── models.py              # SQLAlchemy tables (Appliances, Readings, Tariffs, etc.)
│   ├── schemas.py             # Pydantic request/response models
│   ├── simulator.py           # Physics simulation engine, diurnal models, DB seeding
│   ├── analytics.py           # Timeseries aggregation (today, 7d, 30d, 12m), CO₂ impact
│   ├── anomaly_detection.py   # Statistical z-score baselining & detection
│   ├── billing.py             # INR slab/flat tariff calculator & month-end projection
│   ├── recommendations.py     # Contextual conservation rules & Efficiency Score
│   └── wattlume.db            # Persistent SQLite database (auto-generated on startup)
├── frontend/
│   ├── index.html             # HTML entry point with Plus Jakarta Sans & favicon
│   ├── vite.config.js         # Vite configuration with API reverse proxy
│   ├── tailwind.config.js     # Custom brand palette, fonts, keyframes
│   ├── postcss.config.js
│   ├── package.json
│   ├── public/
│   │   └── favicon.svg        # Custom geometric SVG logo symbol
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # App shell, router, and loading state
│       ├── index.css          # Design system, grid background, tabular nums
│       ├── context/
│       │   ├── ThemeContext.jsx       # Dark/Light theme toggle
│       │   └── SimulationContext.jsx  # Real-time polling & toast manager
│       ├── services/
│       │   └── api.js                 # Frontend HTTP client
│       └── components/
│           ├── brand/         # Logo, SVG Symbol, LivePulse, EnergyFlowCanvas
│           ├── landing/       # Navbar, Hero, Features, HowItWorks, Stats, CTA, Footer
│           ├── layout/        # DashboardLayout, Sidebar, Topbar
│           └── dashboard/     # 7 Core Views: Overview, Analytics, Appliances,
│                              # Insights, Billing, Reports, Settings
├── start.sh                   # One-click startup script for both servers
├── README.md                  # Comprehensive documentation
└── .gitignore
```

---

## 🚀 Installation & Getting Started

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js v18+ and npm

### 1. Clone & Setup Backend
```bash
# Navigate to the project root
cd /path/to/wattlume

# Install Python backend dependencies
python3 -m pip install -r backend/requirements.txt
```

### 2. Setup Frontend
```bash
# Install Node dependencies
npm --prefix frontend install

# Optional: Build production bundle
npm --prefix frontend run build
```

### 3. Run the Complete Application

#### Option A: One-Click Startup Script (Recommended)
```bash
chmod +x start.sh
./start.sh
```
This concurrently starts:
- FastAPI Backend: `http://127.0.0.1:8000`
- React Frontend (Vite Dev Server): `http://localhost:5173`

#### Option B: Run Individually
In terminal 1 (Backend):
```bash
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

In terminal 2 (Frontend):
```bash
npm --prefix frontend run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📡 API Reference Documentation

FastAPI provides interactive Swagger documentation at **`http://127.0.0.1:8000/docs`**.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & simulation status |
| `GET` | `/api/live` | Real-time electrical telemetry ($W, kW, V, A, PF, Hz, kWh$) |
| `GET` | `/api/overview` | Dashboard summary KPIs, today's curve, load shares, alerts |
| `GET` | `/api/analytics?range={today\|7d\|30d\|12m}` | Multi-horizon timeseries datasets and environmental footprints |
| `GET` | `/api/appliances` | List all appliances with daily $kWh$ and monthly costs |
| `POST` | `/api/appliances` | Create a new simulated appliance |
| `PUT` | `/api/appliances/{id}` | Update appliance power ratings or room assignments |
| `PATCH` | `/api/appliances/{id}/toggle` | **Toggle appliance ON/OFF (immediately recalculates system power)** |
| `DELETE` | `/api/appliances/{id}` | Delete appliance from fleet |
| `GET` | `/api/insights` | Anomaly logs, bill forecast, smart recommendations, Efficiency Score |
| `POST` | `/api/insights/anomalies/{id}/acknowledge` | Acknowledge active anomaly alert |
| `GET` | `/api/billing` | Full billing audit, slab tier breakdown, projected trajectory |
| `POST` | `/api/billing/tariff` | Update tariff rules (slab vs flat, slab rates, fixed charges, taxes) |
| `GET` | `/api/reports?period={daily\|weekly\|monthly\|appliances\|cost}` | Structured report datasets |
| `GET` | `/api/reports/export-csv?period={...}` | **Downloadable CSV file** |
| `POST` | `/api/simulation/control` | Adjust simulation speed ($1\times, 2\times, 5\times, 10\times$) or pause/resume |
| `POST` | `/api/simulation/reset` | **Re-seed fresh 60-day historical simulation dataset** |

---

## 🔒 Limitations & Disclaimers

1. **Simulated Telemetry**: WattLume is a 100% digital, software-only application. Consumption metrics are mathematically synthesized and do not represent physical hardware meter connections.
2. **Electricity Tariffs**: Default slab rates (₹4.50, ₹7.00, ₹9.50) reflect typical Indian state DISCOM residential structures. Users can configure customized tariffs in the Billing page.
3. **Hardware Independence**: No hardware drivers or IoT protocols (Modbus, Zigbee, MQTT) are required.

---

## 🔮 Future Enhancements
- Export PDF reports using headless Chromium print-to-PDF rendering.
- Integration of solar rooftop PV generation and net-metering simulation.
- Export of machine-readable telemetry logs to Prometheus / Grafana.
- Multi-occupant tariff sharing for co-living spaces.

---

## 📄 License & Attribution
Designed and built for **WattLume Energy Intelligence**.  
Open-source under the MIT License.
