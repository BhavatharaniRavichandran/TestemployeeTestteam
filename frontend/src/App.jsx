import { useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("dashboard");

  function handleLogin(token, u) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    setPage("dashboard");
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <>
      <div className="top">
        <strong>Hi, {user.name}</strong>
        <span>
          {user.role === "admin" && page === "dashboard" && (
            <button className="link" onClick={() => setPage("admin")}>All records</button>
          )}
          {page === "admin" && (
            <button className="link" onClick={() => setPage("dashboard")}>My attendance</button>
          )}
          <button className="link" onClick={logout}>Sign out</button>
        </span>
      </div>
      {page === "admin" ? <Admin /> : <Dashboard />}
    </>
  );
}
