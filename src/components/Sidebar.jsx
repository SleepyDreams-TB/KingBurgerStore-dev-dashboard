import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Sidebar({ activePage }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Products", path: "/products" },
    { label: "Orders", path: "/orders" },
    { label: "Services", path: "/services" },
    { label: "Webhook Logs", path: "/webhooklogs" },
  ]

  return (
    <div style={styles.sidebar}>
      <div>
        <h2 style={styles.logo}>KingBurger</h2>
        <p style={styles.role}>Dev Dashboard</p>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.path}
              style={{
                ...styles.navItem,
                color: activePage === item.path ? "#f5a623" : "#aaa",
              }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        <p style={styles.userName}>👤 {user.firstName}</p>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

const styles = {
  sidebar: { width: "220px", backgroundColor: "#1a1a1a", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #2a2a2a" },
  logo: { color: "#f5a623", margin: 0, fontSize: "1.4rem" },
  role: { color: "#555", fontSize: "0.8rem", marginTop: "0.25rem", marginBottom: "2rem" },
  nav: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  navItem: { backgroundColor: "transparent", border: "none", textAlign: "left", padding: "0.6rem 0.75rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem" },
  userName: { color: "#aaa", fontSize: "0.9rem", marginBottom: "0.5rem" },
  logout: { width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "transparent", color: "#e74c3c", cursor: "pointer", fontSize: "0.9rem" },
}