const bcrypt = require("bcryptjs");
const pool = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
  try {
    const full_name = await ask("Enter Admin Name: ");
    const email = (await ask("Enter Admin Email: ")).trim().toLowerCase();
    const password = await ask("Enter Admin Password: ");

    if (!full_name.trim() || !email || password.length < 6) {
      console.log("Please enter valid details. Password must be at least 6 characters.");
      return;
    }

    const existing = await pool.query(
      "SELECT id FROM railway_admins WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      console.log("Admin with this email already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO railway_admins (full_name, email, password)
       VALUES ($1, $2, $3)`,
      [full_name.trim(), email, hashedPassword]
    );

    console.log("Admin account created successfully!");

  } catch (error) {
    console.error("Admin Creation Error:", error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin();