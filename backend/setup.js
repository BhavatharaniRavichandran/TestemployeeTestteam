// Run once: npm run setup  -> creates database, tables and demo users
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import "dotenv/config";

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
await conn.query(`USE \`${process.env.DB_NAME}\``);
await conn.query(fs.readFileSync("schema.sql", "utf8"));

const [rows] = await conn.query("SELECT COUNT(*) AS n FROM users");
if (rows[0].n === 0) {
  const demo = [
    ["Office Admin", "admin", "admin123", "admin"],
    ["Demo Employee", "john", "john123", "employee"],
  ];
  for (const [name, username, pw, role] of demo) {
    await conn.query(
      "INSERT INTO users (name, username, password_hash, role) VALUES (?,?,?,?)",
      [name, username, await bcrypt.hash(pw, 10), role]
    );
  }
  console.log("Demo users created: admin/admin123, john/john123");
}
console.log("Database ready.");
await conn.end();
