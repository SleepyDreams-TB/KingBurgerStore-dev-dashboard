import { useState, useEffect } from "react"
import { flags as flagsApi } from "../services/api"
import DashboardLayout from "../components/DashboardLayout"

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
    setFlagList(prev =>
      prev.map(f => f._id === serviceId ? { ...f, enabled: newValue } : f)
    )
    try {
      await flagsApi.toggle(serviceId, newValue)
    } catch (err) {
      setFlagList(prev =>
        prev.map(f => f._id === serviceId ? { ...f, enabled: currentValue } : f)
      )
      alert(err.message)
    }
  }

  return (
    <DashboardLayout activePage="/services" title="Services">
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">Toggle services on or off across the platform.</p>
        </div>
      </div>

      {loading && (
        <div className="card text-soft">Loading services…</div>
      )}

      {!loading && flagList.length === 0 && (
        <div className="card text-soft">No services configured.</div>
      )}

      <div className="grid" style={{ gap: "var(--sp-3)" }}>
        {flagList.map(flag => (
          <div key={flag._id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{flag.label || flag._id}</p>
              <p className="text-xs text-soft mt-2">
                Last changed by {flag.updated_by || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${flag.enabled ? "badge-success" : "badge-neutral"}`}>
                {flag.enabled ? "Enabled" : "Disabled"}
              </span>
              <button
                className={`toggle ${flag.enabled ? "is-on" : ""}`}
                onClick={() => handleToggle(flag._id, flag.enabled)}
                aria-label={`Toggle ${flag.label || flag._id}`}
                aria-pressed={flag.enabled}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
