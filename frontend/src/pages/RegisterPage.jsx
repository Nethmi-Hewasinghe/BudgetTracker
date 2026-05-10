import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./auth.css";

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      nav("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authShell">
      <div className="card authCard">
        <div className="authTitle">Create account</div>
        <div className="authSubtitle">Start tracking income, expenses, and budgets.</div>

        <form className="grid" onSubmit={onSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
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
              minLength={8}
            />
          </div>
          <button className="btn btnPrimary" disabled={busy} type="submit">
            {busy ? "Creating..." : "Register"}
          </button>
        </form>

        {error ? <div className="err">{error}</div> : null}

        <div className="authActions">
          <span className="muted">Already have an account?</span>
          <Link className="link" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

