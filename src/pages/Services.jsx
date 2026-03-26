import { useState, useEffect } from "react"
import { flags as flagsApi } from "../services/api"
import Sidebar from "../components/Sidebar"

export default function Services() {
  const [flagList, setFlagList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    flagsApi.getAll()
      .then(data => setFlagList(data.flags))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(serviceId, currentValue) {
    const newValue = !currentValue
    // optimistic update — flip it in UI immediately
    setFlagList(prev =>
      prev.map(f => f._id === serviceId ? { ...f, enabled: newValue } : f)
    )
    try {
      await flagsApi.toggle(serviceId, newValue)
    } catch (err) {
      // roll back if the API call failed
      setFlagList(prev =>
        prev.map(f => f._id === serviceId ? { ...f, enabled: currentValue } : f)
      )
      alert(err.message)
    }
  }

  return (
    <div style={styles.page}>
      <Sidebar activePage="/services" />
      <div style={styles.main}>
        <h1 style={styles.heading}>Services</h1>
        <p style={styles.sub}>Toggle services on or off across the platform.</p>

        {loading && <p style={{ color: "#666" }}>Loading...</p>}

        <div style={styles.list}>
          {flagList.map(flag => (
            <div key={flag._id} style={styles.row}>
              <div>
                <p style={styles.label}>{flag.label || flag._id}</p>
                <p style={styles.meta}>
                  Last changed by {flag.updated_by || "—"}
                </p>
              </div>
              <button
                style={{
                  ...styles.toggle,
                  backgroundColor: flag.enabled ? "#2ecc71" : "#333",
                }}
                onClick={() => handleToggle(flag._id, flag.enabled)}
              >
                {flag.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#fff" },
  main: { flex: 1, padding: "2.5rem" },
  heading: { margin: 0, fontSize: "1.8rem" },
  sub: { color: "#666", marginTop: "0.25rem", marginBottom: "2rem" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1a1a1a", padding: "1.25rem 1.5rem", borderRadius: "12px", border: "1px solid #2a2a2a" },
  label: { margin: 0, fontWeight: "500", color: "#fff" },
  meta: { margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#555" },
  toggle: { padding: "0.5rem 1.25rem", border: "none", borderRadius: "8px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "0.9rem", transition: "background-color 0.2s" },
}