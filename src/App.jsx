import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Orders from "./pages/Orders"
import Services from "./pages/Services"
import WebhookLogs from "./pages/Webhooks"

// This component decides whether to show a page or redirect to login
// If you're not logged in and try to visit /dashboard, it sends you to /login
function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  // Only allow developers into the dashboard
  if (user.role !== "developer" && user.role !== "admin") {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    // BrowserRouter enables routing for the whole app
    <BrowserRouter>
      {/* AuthProvider wraps everything so all pages can access the logged in user */}
      <AuthProvider>
        <Routes>
          {/* Public route — anyone can see login */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — only developers can see these */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/webhooklogs" element={
            <ProtectedRoute>
              <WebhookLogs />
            </ProtectedRoute>
          } />
          {/* If someone visits / redirect them to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App