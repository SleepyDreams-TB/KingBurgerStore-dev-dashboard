import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { orders as ordersApi } from "../services/api"

export default function Orders() {
  const navigate = useNavigate()
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters — these match the query params your API accepts
  const [filters, setFilters] = useState({
    status: "",
    payment_type: "",
    date_from: "",
    date_to: "",
    page: 1,
    page_size: 10,
  })

  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 0,
    page: 1,
  })

  useEffect(() => {
    fetchOrders()
  }, [filters.page]) // refetch when page changes

  async function fetchOrders() {
    try {
      setLoading(true)

      // Remove empty filters before sending — no point sending ?status=
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      )

      const data = await ordersApi.getAll(cleanFilters)
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
  }

  function handleFilterChange(e) {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function handleSearch(e) {
    e.preventDefault()
    // Reset to page 1 when searching
    setFilters(prev => ({ ...prev, page: 1 }))
    fetchOrders()
  }

  function handlePageChange(newPage) {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  // Format the ISO date string from your API into something readable
  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function getStatusColor(status) {
    const colors = {
      pending: "#f5a623",
      completed: "#2ecc71",
      cancelled: "#e74c3c",
      processing: "#3498db",
    }
    return colors[status?.toLowerCase()] || "#aaa"
  }

  if (error) return <div style={styles.center}>Error: {error}</div>

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>KingBurger</h2>
          <p style={styles.role}>Dev Dashboard</p>
          <nav style={styles.nav}>
            <button style={styles.navItem} onClick={() => navigate("/dashboard")}>Overview</button>
            <button style={styles.navItem} onClick={() => navigate("/products")}>Products</button>
            <button style={{ ...styles.navItem, color: "#f5a623" }} onClick={() => navigate("/orders")}>Orders</button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Orders</h1>
            <p style={styles.sub}>{pagination.total_records} total orders</p>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} style={styles.filters}>
          <select style={styles.filterInput} name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select style={styles.filterInput} name="payment_type" value={filters.payment_type} onChange={handleFilterChange}>
            <option value="">All payment types</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="eft">EFT</option>
          </select>

          <input
            style={styles.filterInput}
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleFilterChange}
          />
          <input
            style={styles.filterInput}
            type="date"
            name="date_to"
            value={filters.date_to}
            onChange={handleFilterChange}
          />

          <button style={styles.searchBtn} type="submit">
            Search
          </button>
          <button
            style={styles.clearBtn}
            type="button"
            onClick={() => {
              setFilters({ status: "", payment_type: "", date_from: "", date_to: "", page: 1, page_size: 10 })
              setTimeout(fetchOrders, 0)
            }}
          >
            Clear
          </button>
        </form>

        {/* Orders table */}
        <div style={styles.table}>
          <div style={{ ...styles.row, ...styles.tableHeader }}>
            <span>Reference</span>
            <span>Date</span>
            <span>Items</span>
            <span>Payment</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          {loading && (
            <p style={{ color: "#666", padding: "1rem" }}>Loading orders...</p>
          )}

          {!loading && orderList.length === 0 && (
            <p style={{ color: "#666", padding: "1rem" }}>No orders found.</p>
          )}

          {!loading && orderList.map((order, index) => (
            <div key={order.merchant_reference || index} style={styles.row}>
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {order.merchant_reference || "--"}
              </span>
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {formatDate(order.created_at)}
              </span>
              <span style={{ color: "#fff" }}>
                {/* Show each item name and quantity */}
                {order.items.map((item, i) => (
                  <div key={i} style={{ fontSize: "0.85rem" }}>
                    {item.name} x{item.quantity}
                  </div>
                ))}
              </span>
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {order.payment_type}
              </span>
              <span style={{ color: "#f5a623", fontWeight: "bold" }}>
                R {order.total}
              </span>
              <span style={{
                color: getStatusColor(order.status),
                fontSize: "0.85rem",
                fontWeight: "bold",
                textTransform: "capitalize"
              }}>
                {order.status}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              ← Prev
            </button>

            <span style={{ color: "#aaa", fontSize: "0.9rem" }}>
              Page {pagination.page} of {pagination.total_pages}
            </span>

            <button
              style={styles.pageBtn}
              disabled={pagination.page === pagination.total_pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#fff" },
  sidebar: { width: "220px", backgroundColor: "#1a1a1a", padding: "2rem 1.5rem", borderRight: "1px solid #2a2a2a" },
  logo: { color: "#f5a623", margin: 0, fontSize: "1.4rem" },
  role: { color: "#555", fontSize: "0.8rem", marginTop: "0.25rem", marginBottom: "2rem" },
  nav: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  navItem: { backgroundColor: "transparent", border: "none", color: "#aaa", textAlign: "left", padding: "0.6rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem" },
  main: { flex: 1, padding: "2.5rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  heading: { margin: 0, fontSize: "1.8rem" },
  sub: { color: "#666", marginTop: "0.25rem" },
  filters: { display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  filterInput: { padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "0.9rem" },
  searchBtn: { padding: "0.6rem 1.2rem", backgroundColor: "#f5a623", border: "none", borderRadius: "8px", color: "#000", fontWeight: "bold", cursor: "pointer" },
  clearBtn: { padding: "0.6rem 1.2rem", backgroundColor: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#aaa", cursor: "pointer" },
  table: { backgroundColor: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a", overflow: "hidden", marginBottom: "1.5rem" },
  tableHeader: { backgroundColor: "#222", color: "#666", fontSize: "0.85rem" },
  row: { display: "grid", gridTemplateColumns: "1.5fr 1.5fr 2fr 1fr 1fr 1fr", padding: "0.9rem 1.25rem", borderBottom: "1px solid #2a2a2a", alignItems: "start" },
  pagination: { display: "flex", alignItems: "center", gap: "1rem" },
  pageBtn: { padding: "0.5rem 1rem", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#aaa", cursor: "pointer" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#aaa", backgroundColor: "#0f0f0f" },
}