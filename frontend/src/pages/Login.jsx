import { useState } from "react";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/login", { method: "POST", body: { username, password } });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="center">
      <form className="card" onSubmit={submit}>
        <h1>Office Attendance</h1>
        <p className="muted">Sign in to check in or out.</p>
        {error && <div className="flash">{error}</div>}
        <label htmlFor="u">Username</label>
        <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <label htmlFor="p">Password</label>
        {/* <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> */}
        <div className="password-wrapper">
          <input
            id="p"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              /* eye-off icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.39 1 12a10.94 10.94 0 0 1 2.06-3.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.61 11 8a10.95 10.95 0 0 1-1.41 2.65"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              /* eye icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <button type="submit" style={{ width: "100%" }}>Sign in</button>
      </form>
    </div>
  );
}
