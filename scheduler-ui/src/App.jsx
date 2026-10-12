import React, { useState, useEffect } from "react";
import "./App.css";
import { ToastProvider } from "./components/ui.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { SchedulerAPI, ProfileStore } from "./api.js";

import Dashboard from "./pages/Dashboard.jsx";
import NewScheduler from "./pages/NewScheduler.jsx";
import Sources from "./pages/Sources.jsx";
import SchedulerList from "./pages/SchedulerList.jsx";
import Logs from "./pages/Logs.jsx";
import IngestionAgent from "./pages/IngestionAgent.jsx";
import Presentation from "./pages/Presentation.jsx";
import DataConnections from "./pages/DataConnections.jsx";
import Settings from "./pages/Settings.jsx";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "📊", Comp: Dashboard },
  { key: "new", label: "New Scheduler", icon: "➕", Comp: NewScheduler },
  { key: "list", label: "Schedulers", icon: "🗂️", Comp: SchedulerList },
  { key: "sources", label: "Sources", icon: "🔌", Comp: Sources },
  { key: "logs", label: "History & Logs", icon: "📜", Comp: Logs },
  { key: "agent", label: "Ingestion Agent", icon: "🧠", Comp: IngestionAgent },
  { key: "presentation", label: "Presentation Agent", icon: "🎞️", Comp: Presentation },
  { key: "connections", label: "Data Connections", icon: "🔌", Comp: DataConnections },
  { key: "settings", label: "Settings", icon: "⚙️", Comp: Settings },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState(null);
  const [connErr, setConnErr] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [profiles, setProfiles] = useState({});

  const goTo = (key, opts = {}) => {
    setActive(key);
    setEditingId(opts.editingId ?? null);
  };

  useEffect(() => {
    const load = () => setProfiles(ProfileStore.all());
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const schedList = Object.values(profiles);
  const totalCount = schedList.length;
  const activeCount = schedList.filter((s) => s.status === "running").length;
  const pausedCount = totalCount - activeCount;

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const s = await SchedulerAPI.status();
        if (alive) {
          setStatus(s);
          setConnErr(false);
        }
      } catch {
        if (alive) setConnErr(true);
      }
    };
    poll();
    const id = setInterval(poll, 8000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const ActiveComp = NAV.find((n) => n.key === active)?.Comp || Dashboard;
  const engineStatus = status?.status || "unknown";

  return (
    <ToastProvider>
      <div className={`shell ${collapsed ? "shell-collapsed" : ""}`}>
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">FS</div>
            {!collapsed && (
              <div>
                <div className="brand-title">File Pickup</div>
                <div className="brand-sub">Scheduler Console</div>
              </div>
            )}
          </div>

          <nav className="nav">
            {NAV.map((n) => (
              <button
                key={n.key}
                className={`nav-item ${active === n.key ? "nav-item-active" : ""}`}
                onClick={() => goTo(n.key)}
                title={n.label}
              >
                <span className="nav-icon">{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
              </button>
            ))}
          </nav>

          {!collapsed && (
            <div className="sidebar-stat">
              <div className="sidebar-stat-item">
                <div className="sidebar-stat-num">{totalCount}</div>
                <div className="sidebar-stat-lbl">Total</div>
              </div>
              <div className="sidebar-stat-item">
                <div className="sidebar-stat-num" style={{ color: "var(--good, #10b981)" }}>{activeCount}</div>
                <div className="sidebar-stat-lbl">Active</div>
              </div>
              <div className="sidebar-stat-item">
                <div className="sidebar-stat-num" style={{ color: "var(--warn, #f59e0b)" }}>{pausedCount}</div>
                <div className="sidebar-stat-lbl">Paused</div>
              </div>
            </div>
          )}

          <div className="sidebar-foot">
            <div className={`engine-pill engine-${engineStatus}`}>
              <span className={`dot ${connErr ? "dot-bad" : "dot-good"}`} />
              {!collapsed && (
                <span>{connErr ? "API unreachable" : `Engine: ${engineStatus}`}</span>
              )}
            </div>
            <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? "»" : "« Collapse"}
            </button>
          </div>
        </aside>

        <style>{`
          .sidebar-stat {
            background: var(--bg-3, #f8f9fb);
            border: 1px solid var(--border-soft, #e2e5ec);
            border-radius: 10px;
            padding: 12px 16px;
            margin: 10px 12px 0;
            display: flex;
            gap: 16px;
          }
          .sidebar-stat-item { text-align: center; flex: 1; }
          .sidebar-stat-num  { font-size: 22px; font-weight: 800; color: var(--accent, #6366f1); line-height: 1.1; }
          .sidebar-stat-lbl  { font-size: 10.5px; color: var(--text-mid, #64748b); text-transform: uppercase; letter-spacing: .05em; font-weight: 700; margin-top: 2px; }
        `}</style>

        <main className="content">
          <header className="topbar">
            <div>
              <h1 className="page-title">{NAV.find((n) => n.key === active)?.label}</h1>
              <div className="page-crumb">File Pickup Scheduler / {active}</div>
            </div>
            <div className="topbar-right">
              {connErr ? (
                <span className="conn-badge conn-bad">● Disconnected from api_server.py</span>
              ) : (
                <span className="conn-badge conn-good">● Connected</span>
              )}
            </div>
          </header>

          <div className="content-inner">
            <ErrorBoundary key={active}>
              <ActiveComp
                status={status}
                editingId={editingId}
                goTo={goTo}
                onSaved={(id) => goTo(id ? "list" : "dashboard")}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
