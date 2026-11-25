import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- auth middleware ----------
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please sign in again." });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admins only." });
  next();
}

// // ---------- login ----------
// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;
//   const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
//   const user = rows[0];
//   if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
//     return res.status(401).json({ error: "Wrong username or password." });
//   }
//   const payload = { id: user.id, name: user.name, role: user.role };
//   const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
//   res.json({ token, user: payload });
// });
// ---------- login ----------
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(`[LOGIN] Attempt for username: "${username}"`);

  const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  const user = rows[0];

  if (!user) {
    console.error(`[LOGIN FAILED] Username not found: "${username}"`);
    return res.status(401).json({ error: "Wrong username or password." });
  }

  const passwordOk = await bcrypt.compare(password || "", user.password_hash);
  if (!passwordOk) {
    console.error(`[LOGIN FAILED] Wrong password for username: "${username}"`);
    return res.status(401).json({ error: "Wrong username or password." });
  }

  const payload = { id: user.id, name: user.name, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
  console.log(`[LOGIN OK] ${user.username} (${user.role}) signed in`);
  res.json({ token, user: payload });
});

// ---------- employee: attendance ----------
app.get("/api/attendance/today", auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM attendance WHERE user_id = ? AND work_date = CURDATE()",
    [req.user.id]
  );
  res.json(rows[0] || null);
});

app.get("/api/attendance/history", auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT work_date, check_in, check_out FROM attendance WHERE user_id = ? ORDER BY work_date DESC LIMIT 30",
    [req.user.id]
  );
  res.json(rows);
});

app.get("/api/admin/employees", auth, adminOnly, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, username FROM users WHERE role = 'employee' ORDER BY name ASC"
  );
  res.json(rows);
});
app.post("/api/attendance/check-in", auth, async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO attendance (user_id, work_date, check_in) VALUES (?, CURDATE(), CURTIME())",
      [req.user.id]
    );
    res.json({ message: "Checked in. Have a good day!" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "You already checked in today." });
    throw e;
  }
});

app.post("/api/attendance/check-out", auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM attendance WHERE user_id = ? AND work_date = CURDATE()",
    [req.user.id]
  );
  if (!rows[0]) return res.status(400).json({ error: "Check in first." });
  if (rows[0].check_out) return res.status(400).json({ error: "You already checked out today." });
  await pool.query("UPDATE attendance SET check_out = CURTIME() WHERE id = ?", [rows[0].id]);
  res.json({ message: "Checked out. See you tomorrow!" });
});

// ---------- admin ----------
app.get("/api/admin/attendance", auth, adminOnly, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id, a.work_date, u.name, a.check_in, a.check_out
     FROM attendance a JOIN users u ON u.id = a.user_id
     ORDER BY a.work_date DESC, a.check_in DESC LIMIT 200`
  );
  res.json(rows);
});

app.post("/api/admin/employees", auth, adminOnly, async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: "Fill in all fields." });
  try {
    await pool.query(
      "INSERT INTO users (name, username, password_hash, role) VALUES (?,?,?, 'employee')",
      [name, username, await bcrypt.hash(password, 10)]
    );
    res.json({ message: "Employee added." });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "That username is already taken." });
    throw e;
  }
});



app.delete("/api/admin/employees/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'employee'", [id]);
  if (!rows[0]) return res.status(404).json({ error: "Employee not found." });
  await pool.query("DELETE FROM attendance WHERE user_id = ?", [id]);
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
  res.json({ message: "Employee deleted." });
});

// ---------- error fallback ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error. Check the backend console." });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`API running on http://localhost:${process.env.PORT || 5000}`)
);
