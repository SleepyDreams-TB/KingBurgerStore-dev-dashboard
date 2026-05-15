import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import DashboardLayout from "../components/DashboardLayout"
import { dashboard } from "../services/api"

function StatCard({ label, value, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {loading ? <span className="skeleton" style={{ display: "inline-block", width: 80, height: 28 }} /> : value}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboard.getStats()
      .then(data => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout activePage="/dashboard" title="Overview">
      <div className="page-header">
        <div>
          <p className="page-subtitle">Welcome back, {user.firstName}. Here's what's going on today.</p>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <StatCard label="Total Orders"   value={stats?.total_orders} loading={loading} />
        <StatCard label="Total Products" value={stats?.total_products} loading={loading} />
        <StatCard
          label="Revenue"
          value={stats ? `R ${stats.total_revenue.toLocaleString("en-ZA")}` : "--"}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  )
}
