const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all trains
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM trains
       WHERE ($1 = '' OR train_number ILIKE $1 OR train_name ILIKE $1)
       AND ($2 = '' OR source_station ILIKE $2)
       AND ($3 = '' OR destination_station ILIKE $3)
       ORDER BY train_number`,
      [
        req.query.search || "",
        req.query.from || "",
        req.query.to || ""
      ]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Train search error:", error);
    res.status(500).json({ message: "Unable to search trains" });
  }
});

module.exports = router;