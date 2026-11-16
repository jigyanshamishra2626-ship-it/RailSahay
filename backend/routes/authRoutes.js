const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Passenger Registration
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM passengers WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO passengers
       (full_name, email, phone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone`,
      [full_name, email, phone || null, hashedPassword]
    );

    res.status(201).json({
      message: "Passenger registered successfully!",
      passenger: result.rows[0]
    });

  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});
// Passenger Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM passengers WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passenger = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      passenger.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: passenger.id,
        email: passenger.email,
        role: "passenger"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful!",
      token,
      passenger: {
        id: passenger.id,
        full_name: passenger.full_name,
        email: passenger.email,
        phone: passenger.phone
      }
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      message: "Login failed"
    });
  }
});
module.exports = router;