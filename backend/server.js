const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const complaintsRoutes = require("./routes/complaintsRoutes");
const trainRoutes = require("./routes/trainRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/trains", trainRoutes);
// Welcome Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to RailSahay Backend!",
    status: "Server is running successfully"
  });
});

// Database Test Route
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "RailSahay Database Connected Successfully!",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      message: "Database Connection Failed",
      error: error.message
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`RailSahay server running on port ${PORT}`);
});