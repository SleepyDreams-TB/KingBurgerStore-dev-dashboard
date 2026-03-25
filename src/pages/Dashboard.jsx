import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>KingBurger</h2>
          <p style={styles.role}>Dev Dashboard</p>

          <nav style={styles.nav}>
            <button style={styles.navItem} onClick={() => navigate("/dashboard")}>
              Overview
            </button>
            <button style={styles.navItem} onClick={() => navigate("/products")}>
              Products
            </button>
            <button style={styles.navItem} onClick={() => navigate("/orders")}>
              Orders
            </button>
          </nav>
        </div>

        {/* User info + logout at bottom of sidebar */}
        <div>
          <p style={styles.userName}>👤 {user.firstName}</p>
          <button style={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <h1 style={styles.heading}>Overview</h1>
        <p style={styles.sub}>Welcome back, {user.firstName}. Here's what's going on.</p>

        {/* Stat cards — hardcoded for now, we'll wire up real data later */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Orders</p>
            <p style={styles.cardValue}>--</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Products</p>
            <p style={styles.cardValue}>--</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Revenue</p>
            <p style={styles.cardValue}>--</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    color: "#fff",
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#1a1a1a",
    padding: "2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #2a2a2a",
  },
  logo: {
    color: "#f5a623",
    margin: 0,
    fontSize: "1.4rem",
  },
  role: {
    color: "#555",
    fontSize: "0.8rem",
    marginTop: "0.25rem",
    marginBottom: "2rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  navItem: {
    backgroundColor: "transparent",
    border: "none",
    color: "#aaa",
    textAlign: "left",
    padding: "0.6rem 0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  userName: {
    color: "#aaa",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  },
  logout: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "transparent",
    color: "#e74c3c",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  main: {
    flex: 1,
    padding: "2.5rem",
  },
  heading: {
    margin: 0,
    fontSize: "1.8rem",
    color: "#fff",
  },
  sub: {
    color: "#666",
    marginTop: "0.5rem",
    marginBottom: "2rem",
  },
  cards: {
    display: "flex",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "1.5rem",
    borderRadius: "12px",
    flex: 1,
    border: "1px solid #2a2a2a",
  },
  cardLabel: {
    color: "#666",
    fontSize: "0.85rem",
    margin: 0,
  },
  cardValue: {
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "0.5rem 0 0 0",
  },
}