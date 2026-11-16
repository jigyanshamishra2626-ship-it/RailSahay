const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const verifyAdmin = require("../middleware/adminMiddleware");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Railway Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const result = await pool.query(
      "SELECT * FROM railway_admins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid admin email or password."
      });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid admin email or password."
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful!",
      token,
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error("Admin Login Error:", error.message);

    res.status(500).json({
      message: "Admin login failed."
    });
  }
});
// Get All Passenger Emergency Requests (Admin Only)
router.get("/emergency-requests", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.*,
        p.full_name AS passenger_name,
        p.email AS passenger_email,
        p.phone AS passenger_phone
       FROM emergency_requests e
       LEFT JOIN passengers p ON e.passenger_id = p.id
       ORDER BY e.created_at DESC`
    );

    res.json({
      message: "Emergency requests fetched successfully.",
      emergencies: result.rows
    });

  } catch (error) {
    console.error("Admin Emergency Fetch Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch emergency requests."
    });
  }
});
// Update Emergency Request Status
router.put("/emergency-requests/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["Pending", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status."
      });
    }

    const result = await pool.query(
      "UPDATE emergency_requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Emergency request not found."
      });
    }

    res.json({
      message: "Status updated successfully!",
      emergency: result.rows[0]
    });

  } catch (error) {
    console.error("Status Update Error:", error.message);
    res.status(500).json({
      message: "Failed to update status."
    });
  }
});
// Get All Railway Staff
router.get("/staff", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, designation, station_name
       FROM railway_staff
       ORDER BY full_name ASC`
    );

    res.json({
      staff: result.rows
    });

  } catch (error) {
    console.error("Fetch Staff Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch Railway Staff."
    });
  }
});
// Assign Emergency Request to Railway Staff
router.put(
  "/emergency-requests/:id/assign",
  verifyAdmin,
  async (req, res) => {
    try {
      const { staff_id } = req.body;
      const emergencyId = req.params.id;

      if (!staff_id) {
        return res.status(400).json({
          message: "Staff ID is required."
        });
      }

      // Check whether staff exists
      const staffResult = await pool.query(
        `SELECT id, full_name, designation, station_name
         FROM railway_staff
         WHERE id = $1`,
        [staff_id]
      );

      if (staffResult.rows.length === 0) {
        return res.status(404).json({
          message: "Railway Staff not found."
        });
      }

      // Assign emergency to staff
      const result = await pool.query(
        `UPDATE emergency_requests
         SET assigned_staff_id = $1
         WHERE id = $2
         RETURNING *`,
        [staff_id, emergencyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Emergency request not found."
        });
      }

      res.json({
        message: "Emergency successfully assigned to Railway Staff!",
        emergency: result.rows[0],
        staff: staffResult.rows[0]
      });

    } catch (error) {
      console.error("Staff Assignment Error:", error.message);

      res.status(500).json({
        message: "Unable to assign emergency to staff."
      });
    }
  }
)
// Get All Passenger Complaints (Admin Only)
router.get("/complaints", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        c.*,
        p.full_name AS passenger_name,
        p.email AS passenger_email,
        p.phone AS passenger_phone
       FROM complaints c
       LEFT JOIN passengers p ON c.passenger_id = p.id
       ORDER BY c.created_at DESC`
    );

    res.json({
      message: "Complaints fetched successfully.",
      complaints: result.rows
    });

  } catch (error) {
    console.error("Admin Complaints Fetch Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch complaints."
    });
  }
});

// Update Passenger Complaint Status
router.put("/complaints/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["Pending", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status."
      });
    }

    const result = await pool.query(
      `UPDATE complaints
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Complaint not found."
      });
    }

    res.json({
      message: "Complaint status updated successfully!",
      complaint: result.rows[0]
    });

  } catch (error) {
    console.error("Complaint Status Update Error:", error.message);

    res.status(500).json({
      message: "Failed to update complaint status."
    });
  }
});
// Get All Lost & Found Reports (Admin Only)
router.get("/lost-found-reports", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        l.*,
        p.full_name AS passenger_name,
        p.email AS passenger_email,
        p.phone AS passenger_phone
       FROM lost_found_complaints l
       LEFT JOIN passengers p ON l.passenger_id = p.id
       ORDER BY l.created_at DESC`
    );

    res.json({
      message: "Lost & Found reports fetched successfully.",
      reports: result.rows
    });

  } catch (error) {
    console.error("Admin Lost Found Fetch Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch Lost & Found reports."
    });
  }
});
// Secure access to emergency images and audio
router.get("/emergency-media/:filename", verifyAdmin, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

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
    console.error("Media Access Error:", error.message);

    res.status(500).json({
      message: "Unable to access media."
    });
  }
});
// Secure access to Lost & Found images and audio
router.get("/lost-found-media/:filename", verifyAdmin, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    const filePath = path.join(
      __dirname,
      "../uploads/lost-found",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Lost & Found media file not found."
      });
    }

    res.sendFile(filePath);

  } catch (error) {
    console.error("Lost Found Media Access Error:", error.message);

    res.status(500).json({
      message: "Unable to access Lost & Found media."
    });
  }
});
module.exports = router;