const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyStaff = require("../middleware/staffMiddleware");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Railway Staff Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const result = await pool.query(
      `SELECT * FROM railway_staff
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const staff = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      staff.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: staff.id,
        role: "staff"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Staff login successful!",
      token,
      staff: {
        id: staff.id,
        full_name: staff.full_name,
        email: staff.email,
        designation: staff.designation,
        station_name: staff.station_name
      }
    });

  } catch (error) {
    console.error("Staff Login Error:", error.message);

    res.status(500).json({
      message: "Staff login failed."
    });
  }
});
// Get Emergency Requests Assigned to Logged-in Staff
router.get("/my-requests", verifyStaff, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        e.*,
        p.full_name AS passenger_name,
        p.email AS passenger_email,
        p.phone AS passenger_phone
       FROM emergency_requests e
       LEFT JOIN passengers p
       ON e.passenger_id = p.id
       WHERE e.assigned_staff_id = $1
       ORDER BY e.created_at DESC`,
      [req.staff.id]
    );

    res.json({
      message: "Assigned emergency requests fetched successfully.",
      emergencies: result.rows
    });

  } catch (error) {
    console.error("Staff Emergency Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch assigned emergency requests."
    });
  }
});
// Staff can access media only from their assigned emergencies
router.get("/emergency-media/:filename", verifyStaff, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    const result = await pool.query(
      `SELECT id
       FROM emergency_requests
       WHERE assigned_staff_id = $1
       AND (image_path = $2 OR audio_path = $2)`,
      [req.staff.id, filename]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: "You are not authorized to access this media."
      });
    }

    const filePath = path.join(
      __dirname,
      "../uploads/emergencies",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Media file not found."
      });
    }

    res.sendFile(filePath);

  } catch (error) {
    console.error("Staff Media Error:", error.message);

    res.status(500).json({
      message: "Unable to access media."
    });
  }
});
// Update Assigned Emergency Status
router.put("/emergency-requests/:id/status", verifyStaff, async (req, res) => {
  try {
    const { status } = req.body;
    const emergencyId = req.params.id;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid emergency status."
      });
    }

    const result = await pool.query(
      `UPDATE emergency_requests
       SET status = $1
       WHERE id = $2
       AND assigned_staff_id = $3
       RETURNING *`,
      [status, emergencyId, req.staff.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assigned emergency request not found."
      });
    }

    res.json({
      message: "Emergency status updated successfully.",
      emergency: result.rows[0]
    });

  } catch (error) {
    console.error("Staff Status Update Error:", error.message);

    res.status(500).json({
      message: "Unable to update emergency status."
    });
  }
});
module.exports = router;