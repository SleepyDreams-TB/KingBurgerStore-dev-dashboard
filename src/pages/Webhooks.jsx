import { useEffect, useState } from "react"
import { webhooks as webhooksApi } from "../services/api"
import Sidebar from "../components/Sidebar"

/* ================= HELPERS ================= */

function formatBody(body) {
  if (!body) return null
  if (typeof body === "object") return JSON.stringify(body, null, 2)
  try { return JSON.stringify(JSON.parse(body), null, 2) } catch { /* ignore */ }
  try {
    const params = new URLSearchParams(body)
    const obj = {}
    for (const [key, value] of params.entries()) obj[key] = value
    return JSON.stringify(obj, null, 2)
  } catch { /* ignore */ }
  return body
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function getHostname(url) {
  try { return new URL(url).hostname } catch { return "" }
}

function getPathname(url) {
  try { return new URL(url).pathname } catch { return url }
}

/* ================= METHOD BADGE ================= */

function MethodBadge({ method }) {
  const colorMap = {
    GET: { background: "var(--color-background-success)", color: "var(--color-text-success)" },
    POST: { background: "var(--color-background-info)", color: "var(--color-text-info)" },
    DELETE: { background: "var(--color-background-danger)", color: "var(--color-text-danger)" },
    PUT: { background: "var(--color-background-warning)", color: "var(--color-text-warning)" },
    PATCH: { background: "var(--color-background-warning)", color: "var(--color-text-warning)" },
  }
  const style = colorMap[method] || {
    background: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
  }
  return <span style={{ ...styles.badge, ...style }}>{method}</span>
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  if (!status) return null
  let style
  if (status < 300) style = { background: "var(--color-background-success)", color: "var(--color-text-success)" }
  else if (status < 400) style = { background: "var(--color-background-info)", color: "var(--color-text-info)" }
  else if (status < 500) style = { background: "var(--color-background-warning)", color: "var(--color-text-warning)" }
  else style = { background: "var(--color-background-danger)", color: "var(--color-text-danger)" }
  return <span style={{ ...styles.badge, ...style }}>{status}</span>
}

/* ================= COPY BUTTON ================= */

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
    <button onClick={handleCopy} style={styles.copyBtn}>
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

/* ================= COLLAPSIBLE SECTION ================= */

function Section({ title, content }) {
  const [open, setOpen] = useState(true)
  const hasContent = content !== null && content !== undefined

  return (
    <div style={styles.section}>
      <div style={styles.sectionHead} onClick={() => setOpen(o => !o)}>
        <span style={styles.sectionLabel}>{title}</span>
        <div style={styles.sectionActions}>
          {hasContent && <CopyButton text={content} />}
          <svg
            style={{ ...styles.chevron, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            viewBox="0 0 14 14" fill="none"
          >
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {open && (
        <div style={styles.sectionContent}>
          {hasContent
            ? <pre style={styles.pre}>{content}</pre>
            : <span style={styles.emptySection}>Empty</span>
          }
        </div>
      )}
    </div>
  )
}

/* ================= REFRESH ICON ================= */

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 8a6 6 0 1 0 1.5-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ================= MAIN COMPONENT ================= */

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

  // If the selected item is no longer in filtered results, deselect it
  const selectedVisible = selected && filteredLogs.find(l => l.id === selected.id)

  return (
    <div style={styles.page}>
      <Sidebar activePage="/webhooks" />

      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.heading}>Webhooks</h1>
            <span style={styles.countPill}>
              {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.searchWrap}>
              <svg style={styles.searchIcon} width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                style={styles.search}
                placeholder="Search URL, method, body…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              style={{
                ...styles.iconBtn,
                opacity: spinning ? 0.4 : 1,
                transition: "opacity 0.3s",
              }}
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={styles.container}>
          {/* LEFT LIST */}
          <div style={styles.list}>
            {loading && <p style={styles.emptyMsg}>Loading…</p>}

            {!loading && filteredLogs.length === 0 && (
              <p style={styles.emptyMsg}>No results</p>
            )}

            {!loading && filteredLogs.map((log) => {
              const isActive = selectedVisible?.id === log.id
              return (
                <div
                  key={log.id}
                  onClick={() => setSelected(log)}
                  style={{
                    ...styles.item,
                    background: isActive ? "var(--color-background-secondary)" : "transparent",
                    borderLeft: isActive
                      ? "2px solid var(--color-border-info)"
                      : "2px solid transparent",
                  }}
                >
                  <div style={styles.itemRow1}>
                    <MethodBadge method={log.method} />
                    <span style={styles.itemPath} title={log.url}>
                      {getPathname(log.url)}
                    </span>
                    {log.status && <StatusBadge status={log.status} />}
                  </div>
                  <div style={styles.itemRow2}>
                    <span style={styles.itemHost}>{getHostname(log.url)}</span>
                    <span style={styles.itemTime}>{timeAgo(log.receivedAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* RIGHT DETAIL */}
          <div style={styles.detail}>
            {!selectedVisible ? (
              <div style={styles.emptyDetail}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity="0.3">
                  <rect x="4" y="8" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 13h28" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8" y="17" width="8" height="2" rx="1" fill="currentColor" />
                  <rect x="8" y="21" width="14" height="2" rx="1" fill="currentColor" />
                </svg>
                <span>Select an event to inspect</span>
              </div>
            ) : (
              <>
                <div style={styles.detailHeader}>
                  <div style={styles.detailTitle}>
                    <MethodBadge method={selectedVisible.method} />
                    {selectedVisible.status && <StatusBadge status={selectedVisible.status} />}
                    <span style={styles.detailUrl}>{selectedVisible.url}</span>
                  </div>
                  <p style={styles.detailTime}>
                    {new Date(selectedVisible.receivedAt).toLocaleString()}
                  </p>
                </div>

                <div style={styles.detailBody}>
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
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "var(--color-background-tertiary)",
    color: "var(--color-text-primary)",
  },
  main: {
    flex: 1,
    padding: "2.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  heading: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 500,
    color: "var(--color-text-primary)",
  },
  countPill: {
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "99px",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
    border: "0.5px solid var(--color-border-tertiary)",
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "9px",
    color: "var(--color-text-tertiary)",
    pointerEvents: "none",
  },
  search: {
    padding: "6px 10px 6px 30px",
    borderRadius: "8px",
    border: "0.5px solid var(--color-border-secondary)",
    backgroundColor: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    fontSize: "13px",
    width: "260px",
    outline: "none",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    border: "0.5px solid var(--color-border-secondary)",
    background: "transparent",
    cursor: "pointer",
    color: "var(--color-text-secondary)",
  },
  container: {
    display: "flex",
    gap: "1rem",
    height: "75vh",
  },
  list: {
    width: "35%",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "12px",
    backgroundColor: "var(--color-background-primary)",
    overflowY: "auto",
    flexShrink: 0,
  },
  item: {
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    transition: "background 0.1s",
  },
  itemRow1: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflow: "hidden",
  },
  itemPath: {
    fontSize: "12px",
    color: "var(--color-text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  itemRow2: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
  },
  itemHost: {
    fontSize: "11px",
    color: "var(--color-text-tertiary)",
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemTime: {
    fontSize: "11px",
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: "5px",
    flexShrink: 0,
    letterSpacing: "0.02em",
  },
  detail: {
    flex: 1,
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "12px",
    backgroundColor: "var(--color-background-primary)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  emptyDetail: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "var(--color-text-tertiary)",
    fontSize: "13px",
  },
  emptyMsg: {
    padding: "1rem",
    color: "var(--color-text-tertiary)",
    fontSize: "14px",
  },
  detailHeader: {
    padding: "14px 16px 12px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    flexShrink: 0,
  },
  detailTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "6px",
  },
  detailUrl: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--color-text-primary)",
    wordBreak: "break-all",
  },
  detailTime: {
    fontSize: "12px",
    color: "var(--color-text-tertiary)",
    margin: 0,
  },
  detailBody: {
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  section: {
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 12px",
    background: "var(--color-background-secondary)",
    cursor: "pointer",
    userSelect: "none",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  sectionActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  chevron: {
    width: "14px",
    height: "14px",
    color: "var(--color-text-tertiary)",
    transition: "transform 0.15s",
    flexShrink: 0,
  },
  sectionContent: {
    padding: "10px 12px",
    borderTop: "0.5px solid var(--color-border-tertiary)",
  },
  copyBtn: {
    fontSize: "11px",
    color: "var(--color-text-tertiary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 4px",
    borderRadius: "4px",
  },
  pre: {
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    margin: 0,
    lineHeight: 1.6,
  },
  emptySection: {
    fontSize: "12px",
    color: "var(--color-text-tertiary)",
  },
}