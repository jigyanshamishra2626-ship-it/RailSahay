const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Submit a new complaint
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { complaint_type, description, train_number } = req.body;

    if (!complaint_type || !description) {
      return res.status(400).json({
        message: "Complaint type and description are required."
      });
    }

    const result = await pool.query(
      `INSERT INTO complaints
       (passenger_id, complaint_type, description, train_number)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        req.passenger.id,
        complaint_type,
        description,
        train_number || null
      ]
    );

    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaint: result.rows[0]
    });

  } catch (error) {
    console.error("Complaint Error:", error.message);
    res.status(500).json({
      message: "Failed to submit complaint."
    });
  }
});

// Get complaints of logged-in passenger
router.get("/my-complaints", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM complaints
       WHERE passenger_id = $1
       ORDER BY created_at DESC`,
      [req.passenger.id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Fetch Complaints Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch complaints."
    });
  }
});

module.exports = router;