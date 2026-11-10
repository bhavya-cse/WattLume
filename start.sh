#!/usr/bin/env bash

# WattLume — Smart Energy Consumption Monitoring & Intelligence Platform
# Start script for Backend (FastAPI) and Frontend (Vite)

echo "=========================================================="
echo "  ⚡ Starting WattLume Platform: Energy, made visible."
echo "=========================================================="

# Trap to kill background jobs on CTRL+C
cleanup() {
    echo ""
    echo "Shutting down WattLume processes..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend on port 8000
echo "[1/2] Starting FastAPI backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 2. Start Vite Frontend on port 5173
echo "[2/2] Starting Vite React frontend on http://localhost:5173 ..."
npm --prefix frontend run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  🚀 WattLume is Live!"
echo "  • Frontend UI: http://localhost:5173"
echo "  • Backend API & Docs: http://localhost:8000/docs"
echo "  • Direct Full-Stack App: http://localhost:8000"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

wait
