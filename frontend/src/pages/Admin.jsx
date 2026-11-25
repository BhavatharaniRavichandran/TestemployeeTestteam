import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Admin() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [msg, setMsg] = useState("");

  // const load = () => api("/admin/attendance").then(setRecords).catch((e) => setMsg(e.message));
  // useEffect(() => { load(); }, []);
  const loadAttendance = () => api("/admin/attendance").then(setRecords).catch((e) => setMsg(e.message));
  const loadEmployees = () => api("/admin/employees").then(setEmployees).catch((e) => setMsg(e.message));
  useEffect(() => {
    
        loadAttendance();
    
        loadEmployees();
    
      }, []);
    
  async function addEmployee(e) {
    e.preventDefault();
    try {
      const data = await api("/admin/employees", { method: "POST", body: form });
      setMsg(data.message);
      setForm({ name: "", username: "", password: "" });
      loadEmployees();
    } catch (err) {
      setMsg(err.message);
    }
  }
  async function deleteEmployee(id, name) {
    if (!window.confirm(`Delete employee "${name}"? This will also remove all their attendance records.`)) return;
    try {
      const data = await api(`/admin/employees/${id}`, { method: "DELETE" });
      setMsg(data.message);
      loadEmployees();
      loadAttendance();
    } catch (err) {
      setMsg(err.message);
    }
  }
  async function deleteEmployee(id, name) {
    
        if (!window.confirm(`Delete employee "${name}"? This will also remove all their attendance records.`)) return;
    
        try {
    
          const data = await api(`/admin/employees/${id}`, { method: "DELETE" });
    
          setMsg(data.message);
    
          loadEmployees();
    
          loadAttendance();
    
        } catch (err) {
    
          setMsg(err.message);
    
        }
    
      }
    
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="card wide">
        {msg && <div className="flash">{msg}</div>}
        <h2>Add employee</h2>
        <form className="row" style={{ alignItems: "end" }} onSubmit={addEmployee}>
          <div><label htmlFor="n">Name</label><input id="n" value={form.name} onChange={set("name")} required /></div>
          <div><label htmlFor="un">Username</label><input id="un" value={form.username} onChange={set("username")} required /></div>
          <div><label htmlFor="pw">Password</label><input id="pw" type="password" value={form.password} onChange={set("password")} required /></div>
          <button type="submit" style={{ marginTop: 0 }}>Add employee</button>
        </form>
        </div>
      <div className="card wide">
        <h2>Employees</h2>
        {employees.length === 0 ? (
          <p className="muted">No employees yet.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead><tr><th>Name</th><th>Username</th><th></th></tr></thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.username}</td>
                    <td>
                      <button
                        className="btn-delete"
                        title={`Delete ${emp.name}`}
                        onClick={() => deleteEmployee(emp.id, emp.name)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card wide">
        <h2>Attendance records</h2>
        {records.length === 0 ? (
          <p className="muted">No one has checked in yet.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead><tr><th>Date</th><th>Employee</th><th>In</th><th>Out</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}><td>{r.work_date}</td><td>{r.name}</td><td>{r.check_in || "-"}</td><td>{r.check_out || "-"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
