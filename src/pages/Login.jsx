import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // We track which step the user is on
  // "credentials" = step 1, "qr" = step 2 (show QR), "totp" = step 3 (enter code)
  const [step, setStep] = useState("credentials")

  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [qrCode, setQrCode] = useState(null)   // base64 QR image from API
  const [totpCode, setTotpCode] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // ── Step 1: Username + Password ──
  async function handleCredentials(e) {
    e.preventDefault()  // stops the page from refreshing on submit
    setError(null)
    setLoading(true)

    try {
      const data = await auth.loginStep(userName, password)

      if (!data.registered) {
        // First time — show QR code to scan with authenticator app
        setQrCode(data.qr_code)
        setStep("qr")
      } else {
        // Already registered 2FA — go straight to entering the code
        setStep("totp")
      }

    } catch (err) {
      setError(err.message)
    } finally {
      // finally always runs — makes sure loading stops whether it worked or not
      setLoading(false)
    }
  }

  // ── Step 2: User scanned QR, now move to entering the code ──
  function handleQrConfirm() {
    setStep("totp")
  }

  // ── Step 3: Verify the 6-digit TOTP code ──
  async function handleTotp(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await auth.devLogin(userName, password, totpCode)

      sessionStorage.setItem("token", data.token)

      // Store the user in context so the whole app knows who's logged in
      login(data.user)

      // Send them to the dashboard
      navigate("/dashboard")

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>KingBurger</h1>
        <p style={styles.subtitle}>Dev Dashboard</p>

        {/* Show different content based on which step we're on */}

        {step === "credentials" && (
          <form onSubmit={handleCredentials} style={styles.form}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {step === "qr" && (
          <div style={styles.form}>
            <p style={styles.label}>
              Scan this QR code with Google Authenticator or Authy, then click Continue.
            </p>
            {qrCode && (
              <img src={qrCode} alt="2FA QR Code" style={styles.qr} />
            )}
            <button style={styles.button} onClick={handleQrConfirm}>
              I've scanned it — Continue
            </button>
          </div>
        )}

        {step === "totp" && (
          <form onSubmit={handleTotp} style={styles.form}>
            <label style={styles.label}>Enter your 6-digit authenticator code</label>
            <input
              style={{ ...styles.input, textAlign: "center", letterSpacing: "0.5rem", fontSize: "1.5rem" }}
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="000000"
              required
            />

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Basic inline styles to make it look decent for now
// We'll clean up styling properly later
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "2.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#f5a623",
    margin: 0,
    fontSize: "1.8rem",
  },
  subtitle: {
    color: "#666",
    marginTop: "0.25rem",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    color: "#aaa",
    fontSize: "0.9rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#0f0f0f",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#f5a623",
    color: "#000",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
  },
  error: {
    color: "#e74c3c",
    fontSize: "0.9rem",
    margin: 0,
  },
  qr: {
    width: "100%",
    borderRadius: "8px",
  },
}