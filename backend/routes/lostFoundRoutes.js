const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/lostFoundUploadMiddleware");

const router = express.Router();

// Submit Lost & Found Report
router.post(
  "/create",
  verifyToken,
  upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 }
]),
  async (req, res) => {
    try {
      const {
        report_type,
        item_name,
        category,
        description,
        train_number,
        coach_number,
        seat_number,
        journey_date,
        location
      } = req.body;

      // Validate required fields
      if (
        !report_type ||
        !item_name ||
        !description ||
        !train_number ||
        !journey_date ||
        !location
      ) {
        return res.status(400).json({
          message: "Please fill all required fields."
        });
      }

      // Validate report type
      if (!["Lost", "Found"].includes(report_type)) {
        return res.status(400).json({
          message: "Invalid report type."
        });
      }

      // Uploaded image filename
     const imagePath = req.files?.image?.[0]?.filename || null;
const audioPath = req.files?.audio?.[0]?.filename || null;
      // Save report in PostgreSQL
      const result = await pool.query(
        `INSERT INTO lost_found_complaints
        (
          passenger_id,
          report_type,
          item_name,
          category,
          description,
          train_number,
          coach_number,
          seat_number,
          journey_date,
         location,
image_path,
audio_path
        )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *`,
        [
          req.passenger.id,
          report_type,
          item_name,
          category,
          description,
          train_number,
          coach_number || null,
          seat_number || null,
          journey_date,
        location,
imagePath,
audioPath
        ]
      );

      res.status(201).json({
        message: "Lost & Found report submitted successfully!",
        report: result.rows[0]
      });

    } catch (error) {
      console.error("Lost Found Error:", error.message);

      res.status(500).json({
        message: "Failed to submit Lost & Found report."
      });
    }
  }
);

// Get Passenger's Own Lost & Found Reports
router.get("/my-reports", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM lost_found_complaints
       WHERE passenger_id = $1
       ORDER BY created_at DESC`,
      [req.passenger.id]
    );

    res.json({
      message: "Lost & Found reports fetched successfully.",
      reports: result.rows
    });

  } catch (error) {
    console.error("Fetch Lost Found Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch Lost & Found reports."
    });
  }
});
// Admin: Update Lost & Found Report Status
router.patch("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status."
      });
    }

    const result = await pool.query(
      `UPDATE lost_found_complaints
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Lost & Found report not found."
      });
    }

    res.json({
      message: "Lost & Found status updated successfully.",
      report: result.rows[0]
    });

  } catch (error) {
    console.error("Update Lost Found Status Error:", error.message);

    res.status(500).json({
      message: "Failed to update Lost & Found status."
    });
  }
});
module.exports = router;