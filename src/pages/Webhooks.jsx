import { useEffect, useState } from "react"
import { webhooks as webhooksApi } from "../services/api"
import DashboardLayout from "../components/DashboardLayout"

function formatBody(body) {
  if (!body) return null
  if (typeof body === "object") return JSON.stringify(body, null, 2)
  try { return JSON.stringify(JSON.parse(body), null, 2) } catch { /* ignore */ }
  try {
    const params = new URLSearchParams(body)
    const obj = {}
    for (const [k, v] of params.entries()) obj[k] = v
    return JSON.stringify(obj, null, 2)
  } catch { /* ignore */ }
  return body
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function getHostname(url) { try { return new URL(url).hostname } catch { return "" } }
function getPathname(url) { try { return new URL(url).pathname } catch { return url } }

function MethodBadge({ method }) {
  const map = { GET: "badge-success", POST: "badge-info", DELETE: "badge-danger", PUT: "badge-warn", PATCH: "badge-warn" }
  return <span className={`badge ${map[method] || "badge-neutral"}`}>{method}</span>
}

function StatusBadge({ status }) {
  if (!status) return null
  let cls = "badge-neutral"
  if (status < 300) cls = "badge-success"
  else if (status < 400) cls = "badge-info"
  else if (status < 500) cls = "badge-warn"
  else cls = "badge-danger"
  return <span className={`badge ${cls}`}>{status}</span>
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy(e) {
    e.stopPropagation()
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={handleCopy} className="btn btn-ghost btn-sm">
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

function Section({ title, content }) {
  const [open, setOpen] = useState(true)
  const hasContent = content !== null && content !== undefined
  return (
    <div className="section">
      <div className="section-head" onClick={() => setOpen(o => !o)}>
        <span className="section-label">{title}</span>
        <div className="section-actions">
          {hasContent && <CopyButton text={content} />}
          <svg
            className={`section-chevron ${open ? "is-open" : ""}`}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {open && (
        <div className="section-content">
          {hasContent
            ? <pre className="code-block">{content}</pre>
            : <span className="text-xs text-soft">Empty</span>}
        </div>
      )}
    </div>
  )
}

export default function WebhookLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [spinning, setSpinning] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await webhooksApi.getAll(200)
      setLogs(res.data)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setSpinning(true)
    await load()
    setTimeout(() => setSpinning(false), 600)
  }

  function matchesSearch(log) {
    const s = search.toLowerCase()
    return (
      log.url?.toLowerCase().includes(s) ||
      log.method?.toLowerCase().includes(s) ||
      log.body_raw?.toLowerCase().includes(s)
    )
  }

  const filteredLogs = logs.filter(matchesSearch)
  const selectedVisible = selected && filteredLogs.find(l => l.id === selected.id)

  return (
    <DashboardLayout activePage="/webhooklogs" title="Webhooks">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Webhook Logs</h1>
          <span className="pill">
            {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="search">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="input"
              placeholder="Search URL, method, body…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-icon"
            onClick={handleRefresh}
            disabled={spinning}
            aria-label="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 1 0 1.5-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="split-view">
        <div className="split-list">
          {loading && <p className="table-loading">Loading…</p>}
          {!loading && filteredLogs.length === 0 && (
            <p className="table-empty">No results</p>
          )}
          {!loading && filteredLogs.map(log => {
            const isActive = selectedVisible?.id === log.id
            return (
              <div
                key={log.id}
                className={`log-item ${isActive ? "is-active" : ""}`}
                onClick={() => setSelected(log)}
              >
                <div className="log-row-1">
                  <MethodBadge method={log.method} />
                  <span className="log-path" title={log.url}>{getPathname(log.url)}</span>
                  {log.status && <StatusBadge status={log.status} />}
                </div>
                <div className="log-row-2">
                  <span className="log-meta truncate">{getHostname(log.url)}</span>
                  <span className="log-meta">{timeAgo(log.receivedAt)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="split-detail">
          {!selectedVisible ? (
            <div className="detail-empty">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity="0.35">
                <rect x="4" y="8" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 13h28" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="17" width="8" height="2" rx="1" fill="currentColor" />
                <rect x="8" y="21" width="14" height="2" rx="1" fill="currentColor" />
              </svg>
              <span>Select an event to inspect</span>
            </div>
          ) : (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <MethodBadge method={selectedVisible.method} />
                  {selectedVisible.status && <StatusBadge status={selectedVisible.status} />}
                  <span className="detail-url">{selectedVisible.url}</span>
                </div>
                <p className="text-xs text-soft">
                  {new Date(selectedVisible.receivedAt).toLocaleString()}
                </p>
              </div>
              <div className="detail-body">
                <Section
                  title="Headers"
                  content={JSON.stringify(selectedVisible.headers || {}, null, 2)}
                />
                <Section
                  title="Query params"
                  content={
                    Object.keys(selectedVisible.query || {}).length
                      ? JSON.stringify(selectedVisible.query, null, 2)
                      : null
                  }
                />
                <Section
                  title="Body"
                  content={formatBody(selectedVisible.body_raw)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
