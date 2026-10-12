import React, { useState, useEffect, useCallback } from "react";
import { Panel, Card, Stat, Tabs, Input, Field, Button, Badge, Toggle, Empty, useToast } from "../components/ui.jsx";
import { PresentationAPI, ConnectionsAPI } from "../api.js";

const DEFAULT_SQL_LABEL = "(default — SQL_CONNECTION_STRING env var)";
const DEFAULT_VEC_LABEL = "(default — VECTOR_DB_PATH env var)";

/** Shared hook: loads SQL + vector connection profiles for the selectors
 * on this page, mirroring the Streamlit app's "pull from" pickers. */
function useConnectionProfiles() {
  const [sqlProfiles, setSqlProfiles] = useState([]);
  const [vecProfiles, setVecProfiles] = useState([]);

  useEffect(() => {
    ConnectionsAPI.listSql().then((r) => setSqlProfiles(r.profiles || [])).catch(() => {});
    ConnectionsAPI.listVector().then((r) => setVecProfiles(r.profiles || [])).catch(() => {});
  }, []);

  const sqlOptions = [DEFAULT_SQL_LABEL, ...sqlProfiles.map((p) => p.name)];
  const vecOptions = [DEFAULT_VEC_LABEL, ...vecProfiles.map((p) => p.name)];
  const sqlIdByName = Object.fromEntries(sqlProfiles.map((p) => [p.name, p.id]));
  const vecIdByName = Object.fromEntries(vecProfiles.map((p) => [p.name, p.id]));

  return { sqlOptions, vecOptions, sqlIdByName, vecIdByName };
}

const STEPS = ["queued", "generating", "critiquing", "pass"];
const ACTIVE_JOB_STORAGE_KEY = "fps_active_presentation_job";
const ACTIVE_JOB_STATUSES = new Set(["queued", "generating", "critiquing"]);

function savedActiveJobId() {
  try {
    return sessionStorage.getItem(ACTIVE_JOB_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export default function Presentation() {
  const [schema, setSchema] = useState(null);
  const [schemaErr, setSchemaErr] = useState(null);
  const [tab, setTab] = useState("generate");
  // The page unmounts when navigating through the sidebar. Keep the selected
  // job in session storage so an in-progress generation can be restored.
  const [jobId, setJobId] = useState(savedActiveJobId);

  const selectJob = useCallback((id, showStatus = false) => {
    setJobId(id);
    try {
      if (id) sessionStorage.setItem(ACTIVE_JOB_STORAGE_KEY, id);
      else sessionStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
    } catch {
      // The UI still works if browser storage is unavailable.
    }
    if (showStatus) setTab("status");
  }, []);

  const { sqlOptions, vecOptions, sqlIdByName, vecIdByName } = useConnectionProfiles();
  const [snapSqlChoice, setSnapSqlChoice] = useState(DEFAULT_SQL_LABEL);
  const [snapVecChoice, setSnapVecChoice] = useState(DEFAULT_VEC_LABEL);

  const loadSchema = useCallback(() => {
    PresentationAPI.schemaPreview(sqlIdByName[snapSqlChoice], vecIdByName[snapVecChoice])
      .then(setSchema)
      .catch((e) => setSchemaErr(e.message));
  }, [snapSqlChoice, snapVecChoice, sqlIdByName, vecIdByName]);
  useEffect(loadSchema, [loadSchema]);

  // If storage was cleared (or this is a new tab), recover the newest running
  // job from the server. The generation itself runs in the backend executor,
  // so navigation must never make it disappear from the UI.
  useEffect(() => {
    if (jobId) return;
    PresentationAPI.jobs().then((result) => {
      const active = (result.jobs || []).find((job) => ACTIVE_JOB_STATUSES.has(job.status));
      if (active) selectJob(active.job_id, true);
    }).catch(() => {});
  }, [jobId, selectJob]);

  if (schemaErr) {
    return (
      <Panel title="Presentation Generator" icon="🎞️">
        <div className="err-banner">⚠️ {schemaErr}</div>
        <pre className="mono code-box">python api_server.py</pre>
        <style>{`.err-banner{background:var(--bad-dim);color:var(--bad);padding:12px 16px;border-radius:8px;margin-bottom:14px}
          .code-box{background:#0c1119;border:1px solid var(--border-soft);border-radius:8px;padding:12px 16px}`}</style>
      </Panel>
    );
  }

  const sql = schema?.sql || {};
  const vec = schema?.vector_db || {};

  return (
    <>
      <Panel title="Data source snapshot" icon="🗄🔍" subtitle="Live SQL Server + LanceDB preview"
        actions={<Button size="sm" onClick={loadSchema}>🔄 Refresh</Button>}>
        <div className="grid grid-2 mb-md">
          <Field label="SQL database">
            <select className="select w-full" value={snapSqlChoice} onChange={(e) => setSnapSqlChoice(e.target.value)}>
              {sqlOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Vector store">
            <select className="select w-full" value={snapVecChoice} onChange={(e) => setSnapVecChoice(e.target.value)}>
              {vecOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-2">
          <Card>
            <h4 className="mb-sm">🗄 SQL Server</h4>
            {sql.reachable ? (
              <>
                <div className="grid grid-2 mb-sm">
                  <Stat icon="📊" tone="accent" label="Rows" value={(sql.row_count ?? 0).toLocaleString()} />
                  <Stat icon="📐" tone="violet" label="Columns" value={(sql.columns || []).length} />
                </div>
                <div className="text-mid mono" style={{ fontSize: 12 }}>Table: {sql.table || "?"}</div>
              </>
            ) : (
              <div className="err-inline">Unreachable: {sql.error || "unknown error"}</div>
            )}
          </Card>
          <Card>
            <h4 className="mb-sm">🔍 Vector Database (LanceDB)</h4>
            {vec.reachable ? (
              <>
                <div className="grid grid-2 mb-sm">
                  <Stat icon="🧩" tone="accent" label="Chunks" value={(vec.row_count ?? 0).toLocaleString()} />
                  <Stat icon="📐" tone="violet" label="Fields" value={(vec.columns || []).length} />
                </div>
                <div className="text-mid mono" style={{ fontSize: 12 }}>Table: {vec.table || "?"}</div>
              </>
            ) : (
              <div className="err-inline">Unreachable: {vec.error || "unknown error"}</div>
            )}
          </Card>
        </div>
      </Panel>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "generate", label: "Generate", icon: "✨" },
          { key: "status", label: "Job Status & Download", icon: "📂" },
          { key: "history", label: "Recent Jobs", icon: "🗂" },
        ]}
      />

      <div className="mt-md">
        {tab === "generate" && <GenerateTab onQueued={(id) => selectJob(id, true)} />}
        {tab === "status" && <StatusTab jobId={jobId} setJobId={selectJob} />}
        {tab === "history" && <HistoryTab onView={(id) => selectJob(id, true)} />}
      </div>

      <style>{`.err-inline{color:var(--bad);font-size:13px}`}</style>
    </>
  );
}

function GenerateTab({ onQueued }) {
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { sqlOptions, vecOptions, sqlIdByName, vecIdByName } = useConnectionProfiles();
  const [sqlChoice, setSqlChoice] = useState(DEFAULT_SQL_LABEL);
  const [vecChoice, setVecChoice] = useState(DEFAULT_VEC_LABEL);

  const generate = async () => {
    setBusy(true);
    try {
      const r = await PresentationAPI.generate(topic.trim(), sqlIdByName[sqlChoice], vecIdByName[vecChoice]);
      toast(`Job queued: ${r.job_id}`, "success");
      onQueued(r.job_id);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Generate a new presentation" icon="✨">
      <p className="text-mid" style={{ fontSize: 13 }}>
        Leave the topic blank to generate a presentation covering <b>all</b> available data comprehensively. Every
        number, chart, and claim is pulled live from SQL Server + LanceDB — nothing is hardcoded.
      </p>
      <Field label="Topic / prompt (optional)">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder='e.g. "Q2 performance review" — leave blank for a full data overview' />
      </Field>
      <div className="grid grid-2 mb-md">
        <Field label="SQL database to pull from">
          <select className="select w-full" value={sqlChoice} onChange={(e) => setSqlChoice(e.target.value)}>
            {sqlOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Vector store to pull from">
          <select className="select w-full" value={vecChoice} onChange={(e) => setVecChoice(e.target.value)}>
            {vecOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </div>
      <div className="text-low mb-md" style={{ fontSize: 12 }}>Add more databases/stores under 🔌 Data Connections.</div>
      <div className="row gap-md">
        <Button variant="primary" size="lg" loading={busy} onClick={generate}>🚀 Generate Presentation</Button>
        <span className="text-low" style={{ fontSize: 12 }}>Typical runtime: 30s – 2min depending on data volume and LLM latency.</span>
      </div>
      <style>{`.select{background:var(--bg-3);border:1px solid var(--border-soft);border-radius:8px;padding:8px 12px;font-size:13px}`}</style>
    </Panel>
  );
}

function StatusTab({ jobId, setJobId }) {
  const [input, setInput] = useState(jobId);
  const [job, setJob] = useState(null);
  const [err, setErr] = useState(null);
  const [autoPoll, setAutoPoll] = useState(true);
  const [retryTopic, setRetryTopic] = useState("");
  const [manifest, setManifest] = useState(null);
  const toast = useToast();

  useEffect(() => setInput(jobId), [jobId]);

  const fetchStatus = useCallback((id) => {
    if (!id) return;
    PresentationAPI.job(id).then((j) => { setJob(j); setErr(null); setRetryTopic(j.topic || ""); }).catch((e) => setErr(e.message));
  }, []);

  useEffect(() => { if (input) { setJobId(input); fetchStatus(input); } }, [input]); // eslint-disable-line

  useEffect(() => {
    if (!autoPoll || !job) return;
    if (!["queued", "generating", "critiquing"].includes(job.status)) return;
    const t = setTimeout(() => fetchStatus(input), 3000);
    return () => clearTimeout(t);
  }, [autoPoll, job, input, fetchStatus]);

  useEffect(() => {
    if (job?.status === "pass" && input) {
      PresentationAPI.manifest(input).then(setManifest).catch(() => {});
    }
  }, [job?.status, input]);

  const retry = async () => {
    try {
      await PresentationAPI.retry(input, retryTopic.trim());
      toast("Retry triggered — refresh status to track progress", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <Panel title="Job status & download" icon="📂">
      <div className="row gap-sm mb-md">
        <Input className="w-full" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="paste a job_id or generate one in the Generate tab" />
        <Button onClick={() => fetchStatus(input)}>🔄 Refresh status</Button>
        <Toggle checked={autoPoll} onChange={setAutoPoll} label="Auto-poll" />
      </div>

      {err && <div className="err-inline">{err}</div>}
      {!input ? (
        <Empty icon="📭" title="No job selected" hint="Generate a presentation, or pick one from Recent Jobs." />
      ) : job ? (
        <>
          <Card className="mb-md">
            <div className="row-between mb-md">
              <div>
                <b>Job {job.job_id}</b>
                <span className="text-mid"> — {job.topic || "full data overview"}</span>
              </div>
              <Badge status={statusTone(job.status)}>{job.status}</Badge>
            </div>
            <Steps status={job.status} />
            <div className="grid grid-3 mt-md">
              <Stat icon="🔁" tone="accent" label="Attempts" value={`${job.attempts ?? 0}/3`} />
              <Stat icon="🎯" tone="violet" label="Critique score" value={job.score ?? job.verdict?.score ?? "—"} />
              <Stat icon="✅" tone="good" label="Pass threshold" value="85" />
            </div>
          </Card>

          {job.status === "pass" && (
            <Card className="mb-md">
              <div className="row-between">
                <span className="text-mid">✅ Presentation passed critique and is ready to download.</span>
                <a href={PresentationAPI.downloadUrl(input)} target="_blank" rel="noreferrer">
                  <Button variant="primary">⬇️ Download .pptx</Button>
                </a>
              </div>
            </Card>
          )}

          {manifest?.manifest?.length > 0 && (
            <Card className="mb-md">
              <h4 className="mb-sm">📋 Per-slide source / claim audit trail</h4>
              <table className="data-table">
                <thead><tr><th>Slide</th><th>Claim</th><th>Source</th></tr></thead>
                <tbody>
                  {manifest.manifest.map((e, i) => (
                    <tr key={i}><td>{e.slide}</td><td>{e.claim}</td><td>{e.source}</td></tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {job.status === "manual_review" && (
            <Card className="mb-md">
              <div className="warn-inline mb-sm">🚩 Sent to manual review — critique didn't pass after 3 attempts.</div>
              {(job.verdict?.issues || []).map((issue, i) => <div key={i} className="issue-row">⚠️ {issue}</div>)}
              <Field label="Retry with topic">
                <Input value={retryTopic} onChange={(e) => setRetryTopic(e.target.value)} />
              </Field>
              <Button variant="primary" onClick={retry}>🔁 Retry generation</Button>
            </Card>
          )}

          {job.status === "error" && (
            <Card className="mb-md">
              <div className="err-inline mb-sm">❌ Generation failed.</div>
              {job.error && <pre className="mono code-box">{job.error}</pre>}
              <Field label="Retry with topic">
                <Input value={retryTopic} onChange={(e) => setRetryTopic(e.target.value)} />
              </Field>
              <Button variant="primary" onClick={retry}>🔁 Retry generation</Button>
            </Card>
          )}

          {["queued", "generating", "critiquing"].includes(job.status) && (
            <div className="info-inline">⏳ Job is <b>{job.status}</b>… this can take 30s–2min.</div>
          )}

          <details className="mt-md">
            <summary style={{ cursor: "pointer", fontSize: 13 }}>View full job JSON</summary>
            <pre className="mono code-box mt-sm">{JSON.stringify(job, null, 2)}</pre>
          </details>
        </>
      ) : null}

      <style>{`
        .err-inline{color:var(--bad);font-size:13px}
        .warn-inline{color:var(--warn);font-size:13px}
        .info-inline{background:var(--accent-dim);color:var(--accent-hi);padding:10px 14px;border-radius:8px;font-size:13px}
        .issue-row{background:var(--warn-dim);color:var(--warn);padding:8px 12px;border-radius:6px;margin-bottom:6px;font-size:12.5px}
        .code-box{background:#0c1119;border:1px solid var(--border-soft);border-radius:8px;padding:12px 16px;font-size:12px;max-height:320px;overflow:auto}
      `}</style>
    </Panel>
  );
}

function Steps({ status }) {
  const idx = STEPS.indexOf(status === "manual_review" || status === "error" ? "critiquing" : status);
  return (
    <div className="steps-row">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step-dot ${i <= idx ? "step-done" : ""} ${status === "error" && i === idx ? "step-err" : ""}`}>
            {i <= idx ? "✓" : i + 1}
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${i < idx ? "step-line-done" : ""}`} />}
        </React.Fragment>
      ))}
      <style>{`
        .steps-row{display:flex;align-items:center;margin:14px 0}
        .step-dot{width:26px;height:26px;border-radius:50%;background:var(--bg-4);color:var(--text-low);
          display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
        .step-done{background:var(--good-dim);color:var(--good)}
        .step-err{background:var(--bad-dim);color:var(--bad)}
        .step-line{flex:1;height:2px;background:var(--border-soft);margin:0 4px}
        .step-line-done{background:var(--good)}
      `}</style>
    </div>
  );
}

function statusTone(s) {
  if (s === "pass") return "success";
  if (s === "error" || s === "manual_review") return "error";
  return "pending";
}

function HistoryTab({ onView }) {
  const [jobs, setJobs] = useState(null);
  const [err, setErr] = useState(null);
  const load = () => PresentationAPI.jobs().then((r) => setJobs(r.jobs || [])).catch((e) => setErr(e.message));
  useEffect(load, []);

  return (
    <Panel title="Recent jobs" icon="🗂" actions={<Button size="sm" onClick={load}>🔄 Refresh</Button>}>
      {err && <div className="err-inline">{err}</div>}
      {!jobs ? <Empty icon="⏳" title="Loading…" /> : jobs.length === 0 ? (
        <Empty icon="📭" title="No presentation jobs yet" hint="Generate one in the Generate tab." />
      ) : (
        <div className="flex-col gap-sm">
          {jobs.map((j) => (
            <div key={j.job_id} className="job-row">
              <div>
                <div className="job-topic">{j.topic || "Full data overview"}</div>
                <div className="job-meta mono">
                  {j.job_id} · attempts {j.attempts ?? 0}{j.score != null ? ` · score ${j.score}` : ""} · {(j.created_at || "").slice(0, 19).replace("T", " ")}
                </div>
              </div>
              <div className="row gap-sm">
                <Badge status={statusTone(j.status)}>{j.status}</Badge>
                <Button size="sm" onClick={() => onView(j.job_id)}>View</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .flex-col{display:flex;flex-direction:column;gap:8px}
        .job-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg-3);border-radius:10px}
        .job-topic{font-weight:600;font-size:13.5px}
        .job-meta{font-size:11.5px;color:var(--text-low);margin-top:2px}
        .err-inline{color:var(--bad);font-size:13px}
      `}</style>
    </Panel>
  );
}
