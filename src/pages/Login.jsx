import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState("credentials")
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [qrCode, setQrCode] = useState(null)
  const [totpCode, setTotpCode] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await auth.loginStep(userName, password)
      if (!data.registered) {
        setQrCode(data.qr_code)
        setStep("qr")
      } else {
        setStep("totp")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleQrConfirm() { setStep("totp") }

  async function handleTotp(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await auth.devLogin(userName, password, totpCode)
      sessionStorage.setItem("token", data.token)
      login(data.user)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="sidebar-logo" aria-hidden="true">K</div>
          <div>
            <div className="sidebar-brand-name">KingBurger</div>
            <div className="sidebar-brand-sub">Dev Dashboard</div>
          </div>
        </div>

        <h1 className="auth-title">
          {step === "credentials" && "Sign in"}
          {step === "qr" && "Set up 2FA"}
          {step === "totp" && "Enter your code"}
        </h1>
        <p className="auth-subtitle">
          {step === "credentials" && "Use your developer credentials to continue."}
          {step === "qr" && "Scan the QR with Google Authenticator or Authy."}
          {step === "totp" && "Open your authenticator app and enter the 6-digit code."}
        </p>

        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="form">
            <div className="form-group">
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                className="input"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Checking…</> : "Continue"}
            </button>
          </form>
        )}

        {step === "qr" && (
          <div className="form">
            {qrCode && <img src={qrCode} alt="2FA QR Code" className="auth-qr" />}
            <button className="btn btn-primary btn-block btn-lg" onClick={handleQrConfirm}>
              I've scanned it — Continue
            </button>
          </div>
        )}

        {step === "totp" && (
          <form onSubmit={handleTotp} className="form">
            <div className="form-group">
              <label className="label" htmlFor="otp">6-digit code</label>
              <input
                id="otp"
                className="input input-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
                autoComplete="one-time-code"
                required
              />
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Verifying…</> : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
