import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../services/api"

// Step 1 — Create the context (think of it as an empty container for now)
const AuthContext = createContext(null)

// Step 2 — The Provider wraps your whole app and holds the actual data
// Any component inside it can access the user and these functions
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)        // who is logged in
  const [loading, setLoading] = useState(true)  // are we still checking?

  // When the app first loads, check if there's already a valid
  // cookie/session — so the user doesn't have to log in every refresh
  useEffect(() => {
    auth.me()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))  // no valid session, that's fine
      .finally(() => setLoading(false))
  }, [])  // the empty [] means this only runs once, on first load

  const login = (userData) => setUser(userData)

  const logout = async () => {
    await auth.logout()
    setUser(null)
  }

  // Don't render anything until we know if the user is logged in
  if (loading) return <div>Loading...</div>

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 3 — This is a custom hook, a shortcut so any component can just write:
// const { user, login, logout } = useAuth()
// instead of having to import useContext and AuthContext every time
export function useAuth() {
  return useContext(AuthContext)
}