import React, { useState, useEffect, useCallback } from "react";
import { Panel, Badge, Button, Empty, useToast, useConfirm } from "../components/ui.jsx";
import { SchedulerAPI, ProfileStore } from "../api.js";
import { freqLabel, fmtDateTime } from "../lib/format.js";
import { fmtNextRun } from "../lib/nextRun.js";

export default function SchedulerList({ goTo }) {
  const [profiles, setProfiles] = useState({});
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();
  const [, forceTick] = useState(0);

  const reload = useCallback(() => setProfiles(ProfileStore.all()), []);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    const id = setInterval(() => { reload(); forceTick((t) => t + 1); }, 5000);
    return () => clearInterval(id);
  }, [reload]);

  const list = Object.values(profiles).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  const runNow = async (sid) => {
    setBusyId(sid);
    try {
      await SchedulerAPI.triggerNow();
      const p = profiles[sid];
      ProfileStore.save(sid, { ...p, lastRun: new Date().toISOString() });
      toast("Scan triggered", "success");
    } catch (e) {
      toast(`Trigger failed: ${e.message}`, "error");
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const toggle = async (sid, sched) => {
    setBusyId(sid);
    const running = sched.status === "running";
    try {
      if (running) await SchedulerAPI.pause();
      else await SchedulerAPI.resume();
      ProfileStore.save(sid, {
        ...sched,
        status: running ? "paused" : "running",
        ...(running ? {} : { run_started_at: new Date().toISOString() }),
      });
      toast(running ? "Paused" : "Resumed", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const remove = async (sid, sched) => {
    if (!(await confirm(`Delete scheduler "${sched.name}"?`))) return;
    ProfileStore.remove(sid);
    try { await SchedulerAPI.stop(); } catch {}
    toast("Deleted", "success");
    reload();
  };

  return (
    <>
      {confirmNode}
      <Panel title="My schedulers" icon="🗂️" subtitle={`${list.length} configured`}>
        {list.length === 0 ? (
          <Empty icon="📭" title="No schedulers yet" hint='Create one from "New Scheduler".' />
        ) : (
          <div className="sched-table">
            {list.map((s) => (
              <div className="sched-row" key={s.id}>
                <div className="sched-row-main">
                  <div className="sched-name">{s.name}</div>
                  <div className="sched-id mono">{s.id}</div>
                </div>
                <Badge status={s.status || "idle"} />
                <div className="text-mid" style={{ fontSize: 12.5 }}>📆 {freqLabel(s)}</div>
                <div className="text-mid" style={{ fontSize: 12.5 }}>
                  {s.status === "running"
                    ? `⏰ next: ${fmtNextRun(s) || "—"}`
                    : s.lastRun ? `⏰ last ${fmtDateTime(s.lastRun)}` : "⏰ —"}
                </div>
                <div className="row gap-sm">
                  <Button size="sm" loading={busyId === s.id} onClick={() => runNow(s.id)}>⚡</Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo && goTo("new", { editingId: s.id })}>✏️</Button>
                  <Button size="sm" variant={s.status === "running" ? "warn" : "success"}
                    loading={busyId === s.id} onClick={() => toggle(s.id, s)}>
                    {s.status === "running" ? "⏸" : "▶"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => remove(s.id, s)}>🗑</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
