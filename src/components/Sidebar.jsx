import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const NAV_ITEMS = [
  { label: "Overview",     path: "/dashboard",   icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { label: "Products",     path: "/products",    icon: "M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4" },
  { label: "Orders",       path: "/orders",      icon: "M4 6h16M4 12h16M4 18h10" },
  { label: "Services",     path: "/services",    icon: "M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" },
  { label: "Webhook Logs", path: "/webhooklogs", icon: "M4 4h16v16H4zM4 9h16M9 4v16" },
]

function NavIcon({ d }) {
  return (
    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function Sidebar({ activePage, isOpen, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  function go(path) {
    navigate(path)
    onClose?.()
  }

  const initials = (user?.firstName || "U").slice(0, 1).toUpperCase()

  return (
    <>
      <aside className={`sidebar ${isOpen ? "is-open" : ""}`} aria-label="Primary">
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">K</div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">KingBurger</div>
            <div className="sidebar-brand-sub">Dev Dashboard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`nav-item ${activePage === item.path ? "is-active" : ""}`}
              onClick={() => go(item.path)}
              aria-current={activePage === item.path ? "page" : undefined}
            >
              <NavIcon d={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">{initials}</div>
            <div>
              <div className="user-name">{user?.firstName || "User"}</div>
              <div className="user-role">{user?.role || "developer"}</div>
            </div>
          </div>
        </div>
      </aside>
      <div
        className={`sidebar-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  )
}
