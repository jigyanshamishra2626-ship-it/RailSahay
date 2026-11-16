const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Submit Emergency Request
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
      emergency_type,
      description,
      location,
      train_number,
      coach_number,
      seat_number
    } = req.body;

    if (!emergency_type || !description || !location) {
      return res.status(400).json({
        message: "Emergency type, description and location are required."
      });
    }

    const allowedTypes = ["Medical", "Security"];

    if (!allowedTypes.includes(emergency_type)) {
      return res.status(400).json({
        message: "Invalid emergency type."
      });
    }

    const imagePath = req.files?.image?.[0]?.filename || null;
const audioPath = req.files?.audio?.[0]?.filename || null;

const result = await pool.query(
  `INSERT INTO emergency_requests
  (
    passenger_id,
    emergency_type,
    description,
    location,
    train_number,
    coach_number,
    seat_number,
    image_path,
    audio_path
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *`,
  [
    req.passenger.id,
    emergency_type,
    description,
    location,
    train_number || null,
    coach_number || null,
    seat_number || null,
    imagePath,
    audioPath
  ]
);
    res.status(201).json({
      message: "Emergency request submitted successfully!",
      emergency: result.rows[0]
    });

  } catch (error) {
    console.error("Emergency Request Error:", error.message);

    res.status(500).json({
      message: "Failed to submit emergency request."
    });
  }
});

// Get Passenger's Emergency Requests
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM emergency_requests
       WHERE passenger_id = $1
       ORDER BY created_at DESC`,
      [req.passenger.id]
    );

    res.json({
      message: "Emergency requests fetched successfully.",
      emergencies: result.rows
    });

  } catch (error) {
    console.error("Fetch Emergency Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch emergency requests."
    });
  }
});
// View passenger's own emergency attachment
router.get("/emergency-media/:filename", verifyToken, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    const result = await pool.query(
      `SELECT id
       FROM emergency_requests
       WHERE passenger_id = $1
       AND (image_path = $2 OR audio_path = $2)
       LIMIT 1`,
      [req.passenger.id, filename]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Attachment not found." });
    }

    const filePath = path.join(__dirname, "../uploads/emergencies", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Attachment file not found." });
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Passenger Media Error:", error.message);
    return res.status(500).json({ message: "Unable to open attachment." });
  }
});
module.exports = router;