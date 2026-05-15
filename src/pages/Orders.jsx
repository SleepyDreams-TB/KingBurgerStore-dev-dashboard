import { useState, useEffect, useCallback } from "react"
import { orders as ordersApi } from "../services/api"
import DashboardLayout from "../components/DashboardLayout"

const EMPTY_FILTERS = {
  status: "", payment_type: "", date_from: "", date_to: "",
  merchant_reference: "", page: 1, page_size: 10,
}

function StatusBadge({ status }) {
  const map = {
    pending:    "badge-warn",
    processing: "badge-info",
    complete:   "badge-success",
    completed:  "badge-success",
    cancelled:  "badge-danger",
  }
  const cls = map[status?.toLowerCase()] || "badge-neutral"
  return <span className={`badge ${cls}`}>{status}</span>
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function Orders() {
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [pagination, setPagination] = useState({ total_records: 0, total_pages: 0, page: 1 })

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""))
      const data = await ordersApi.getAll(clean)
      setOrderList(data.orders)
      setPagination({
        total_records: data.total_records,
        total_pages: data.total_pages,
        page: data.page,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  function handleFilterChange(e) {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function handleSearch(e) {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  function handlePageChange(newPage) {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <DashboardLayout activePage="/orders" title="Orders">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{pagination.total_records} total orders</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="filters">
        <select className="select" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="complete">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select className="select" name="payment_type" value={filters.payment_type} onChange={handleFilterChange}>
          <option value="">All payment types</option>
          <option value="credit_card">Credit Card</option>
          <option value="saved_card">Saved Card</option>
          <option value="eft">EFT</option>
          <option value="paypal">PayPal</option>
        </select>

        <input className="input" type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
        <input className="input" type="date" name="date_to"   value={filters.date_to}   onChange={handleFilterChange} />

        <input
          className="input"
          type="text"
          name="merchant_reference"
          value={filters.merchant_reference}
          onChange={handleFilterChange}
          placeholder="Search reference…"
        />

        <button className="btn btn-primary" type="submit">Search</button>
        <button className="btn btn-secondary" type="button" onClick={() => setFilters(EMPTY_FILTERS)}>
          Clear
        </button>
      </form>

      {error && <p className="form-error mb-4" role="alert">{error}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Date</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="table-loading">Loading orders…</td></tr>
            )}
            {!loading && orderList.length === 0 && (
              <tr><td colSpan={6} className="table-empty">No orders found.</td></tr>
            )}
            {!loading && orderList.map((order, index) => (
              <tr key={order.merchant_reference || index}>
                <td data-label="Reference" className="cell-muted font-mono text-xs">
                  {order.merchant_reference || "--"}
                </td>
                <td data-label="Date" className="cell-muted text-xs">
                  {formatDate(order.created_at)}
                </td>
                <td data-label="Items">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-xs">{item.name} <span className="text-soft">×{item.quantity}</span></div>
                  ))}
                </td>
                <td data-label="Payment" className="cell-muted text-xs">{order.payment_type}</td>
                <td data-label="Total" className="cell-accent">R {order.total}</td>
                <td data-label="Status"><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.total_pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            ← Prev
          </button>
          <span>Page {pagination.page} of {pagination.total_pages}</span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page === pagination.total_pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
