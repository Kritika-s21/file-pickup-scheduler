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
import Ic from "./components/icons.jsx";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "sdash", Comp: Dashboard },
  { key: "new", label: "New Scheduler", icon: "snew", Comp: NewScheduler },
  { key: "list", label: "Schedulers", icon: "archive", Comp: SchedulerList },
  { key: "sources", label: "Sources", icon: "ssrc", Comp: Sources },
  { key: "logs", label: "History & Logs", icon: "slogs", Comp: Logs },
  { key: "agent", label: "Ingestion Agent", icon: "sagent", Comp: IngestionAgent },
  { key: "presentation", label: "Presentation Agent", icon: "spres", Comp: Presentation },
  { key: "connections", label: "Data Connections", icon: "sconn", Comp: DataConnections },
  { key: "settings", label: "Settings", icon: "cog", Comp: Settings },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [status, setStatus] = useState(null);
  const [connErr, setConnErr] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("fps_theme") || "dark"; } catch { return "dark"; }
  });
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("fps_collapsed") === "1"; } catch { return false; }
  });

  const toggleTheme = () => setTheme((prev) => {
    const next = prev === "dark" ? "light" : "dark";
    try { localStorage.setItem("fps_theme", next); } catch { /* storage unavailable */ }
    return next;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem("fps_collapsed", collapsed ? "1" : "0"); } catch { /* storage unavailable */ }
  }, [collapsed]);

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
      <div className={`shell${collapsed ? " collapsed" : ""}`}>
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
          <div className="brand">
            <div className="brand-mark"><Ic n="logo" size={20} /></div>
            <div className="brand-copy">
              <div className="brand-title">File Pickup</div>
              <div className="brand-sub">Scheduler Console</div>
            </div>
            <button
              className="collapse-btn"
              aria-label={collapsed ? "Expand File Pickup panel" : "Collapse File Pickup panel"}
              aria-expanded={!collapsed}
              aria-controls="primary-navigation"
              title={collapsed ? "Expand panel" : "Collapse panel"}
              onClick={() => setCollapsed((c) => !c)}
            >
              <Ic n={collapsed ? "panelExpand" : "panelCollapse"} size={16} />
            </button>
          </div>

          <nav className="nav" id="primary-navigation">
            {NAV.map((n) => (
              <button
                key={n.key}
                className={`nav-item ${active === n.key ? "nav-item-active" : ""}`}
                onClick={() => goTo(n.key)}
                aria-label={n.label}
                title={n.label}
              >
                <span className="nav-icon"><Ic n={n.icon} size={17} /></span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

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

          <div className="sidebar-foot">
            <div className="engine-pill engine-default">
              <span className={`dot ${connErr ? "dot-bad" : "dot-good"}`} />
              <span className="engine-label">{connErr ? "API unreachable" : `Engine: ${engineStatus}`}</span>
            </div>
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
              <button
                className="icon-btn"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {theme === "dark"
                  ? <Ic n="sun" size={15} style={{ color: "var(--warn)" }} />
                  : <Ic n="moon" size={15} />}
              </button>
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
