import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setToday(await api("/attendance/today"));
    setHistory(await api("/attendance/history"));
  }

  useEffect(() => { load().catch((e) => setMsg(e.message)); }, []);

  async function act(path) {
    try {
      const data = await api(path, { method: "POST" });
      setMsg(data.message);
    } catch (e) {
      setMsg(e.message);
    }
    load();
  }

  let status = "You haven't checked in yet.";
  if (today && !today.check_out) status = `Checked in at ${today.check_in}.`;
  if (today && today.check_out) status = `In ${today.check_in} · Out ${today.check_out}`;

  return (
    <>
      <div className="card wide">
        {msg && <div className="flash">{msg}</div>}
        <h2>Today</h2>
        <p className="muted">{status}</p>
        <div className="row">
          <button className="btn-in" disabled={!!today} onClick={() => act("/attendance/check-in")}>Check in</button>
          <button className="btn-out" disabled={!today || !!today.check_out} onClick={() => act("/attendance/check-out")}>Check out</button>
        </div>
      </div>
      <div className="card wide">
        <h2>Last 30 days</h2>
        {history.length === 0 ? (
          <p className="muted">No records yet. Check in to get started.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead><tr><th>Date</th><th>In</th><th>Out</th></tr></thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.work_date}><td>{r.work_date}</td><td>{r.check_in || "-"}</td><td>{r.check_out || "-"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
