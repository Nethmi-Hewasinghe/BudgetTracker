import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { GoogleSignInButton } from "../components/GoogleSignInButton.jsx";
import "./auth.css";

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onGoogle = useCallback(
    async (credential) => {
      setError("");
      setBusy(true);
      try {
        await loginWithGoogle(credential);
        nav("/dashboard");
      } catch (err) {
        setError(err?.response?.data?.message || "Google sign-in failed");
      } finally {
        setBusy(false);
      }
    },
    [loginWithGoogle, nav]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authShell">
      <div className="card authCard">
        <div className="authTitle">Welcome back</div>
        <div className="authSubtitle">Sign in to continue tracking your finances.</div>

        <GoogleSignInButton onCredential={onGoogle} disabled={busy} uxMode="signin" />

        <div className="authDivider">
          <span>or with email</span>
        </div>

        <form className="grid" onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <button className="btn btnPrimary" disabled={busy} type="submit">
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        {error ? <div className="err">{error}</div> : null}

        <div className="authActions">
          <span className="muted">No account?</span>
          <Link className="link" to="/register">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

