import React, { useState } from "react";
import { Panel, Card, Field, Input, Button, useToast, useConfirm } from "../components/ui.jsx";
import { SchedulerAPI, ProfileStore } from "../api.js";
import Ic from "../components/icons.jsx";

const PROVIDERS = [
  { key: "env", label: "env — SCHED_MASTER_KEY (dev only)" },
  { key: "file", label: "file — Locked-down server file outside app directory" },
  { key: "aws_secrets", label: "aws_secrets — AWS Secrets Manager (IAM role)" },
  { key: "azure_kv", label: "azure_kv — Azure Key Vault (managed identity)" },
  { key: "gcp_secrets", label: "gcp_secrets — GCP Secret Manager (workload identity)" },
  { key: "vault", label: "vault — HashiCorp Vault (Vault Agent)" },
];

export default function Settings() {
  const [logDir, setLogDir] = useState("scheduler_logs/");
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();

  const exportLogs = async () => {
    try {
      const history = await SchedulerAPI.history();
      downloadJSON(history, "all_scan_logs.json");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const exportConfigs = () => {
    downloadJSON(ProfileStore.all(), "scheduler_configs.json");
  };

  const clearLogs = async () => {
    if (!(await confirm("Clear all locally-hidden scan log filters? (Server history is untouched.)"))) return;
    localStorage.removeItem("fps_hidden_logs");
    toast("Scan log filters cleared", "success");
  };

  const deleteAllSchedulers = async () => {
    if (!(await confirm("Delete ALL schedulers? This can't be undone."))) return;
    const all = ProfileStore.all();
    Object.keys(all).forEach((id) => ProfileStore.remove(id));
    try { await SchedulerAPI.stop(); } catch {}
    toast("All schedulers deleted", "success");
  };

  return (
    <>
      {confirmNode}

      <Panel title="Credential encryption" icon="lock" subtitle="Master-key provider status">
        <div className="info-inline mb-md">
          Each source's credentials are encrypted individually and stored with that source — sources never share a
          single set of secrets. Configure the provider via <code className="mono">SCHED_KEY_PROVIDER</code> on
          api_server.py.
        </div>
        <details>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Key provider configuration reference</summary>
          <div className="flex-col gap-sm mt-sm">
            {PROVIDERS.map((p) => (
              <div key={p.key} className="provider-row">
                <span className="mono">{p.key}</span>
                <span className="text-mid">{p.label}</span>
              </div>
            ))}
          </div>
        </details>
      </Panel>

      <Panel title="Log storage" icon="archive">
        <Field label="Log directory">
          <Input value={logDir} onChange={(e) => setLogDir(e.target.value)} />
        </Field>
      </Panel>

      <Panel title="Export" icon="download" subtitle="Exported configs are safe to share — secret fields stay encrypted (enc:v1:...)">
        <div className="row gap-sm">
          <Button onClick={exportLogs}><Ic n="download" size={13} /> All scan logs (JSON)</Button>
          <Button onClick={exportConfigs}><Ic n="download" size={13} /> Scheduler configs (JSON)</Button>
        </div>
      </Panel>

      <Panel title="Danger zone" icon="warn">
        <div className="row gap-sm">
          <Button variant="danger" onClick={clearLogs}><Ic n="trash" size={13} /> Clear scan log filters</Button>
          <Button variant="danger" onClick={deleteAllSchedulers}><Ic n="bomb" size={13} /> Delete all schedulers</Button>
        </div>
      </Panel>

      <style>{`
        .info-inline{background:var(--accent-dim);color:var(--accent-hi);padding:10px 14px;border-radius:8px;font-size:13px}
        .flex-col{display:flex;flex-direction:column}
        .provider-row{display:flex;gap:12px;align-items:baseline;font-size:12.5px;padding:6px 0;border-bottom:1px solid var(--border-soft)}
      `}</style>
    </>
  );
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
