const pool = require("./db");
const bcrypt = require("bcryptjs");

const createStaff = async () => {
  try {
    const full_name = "Railway Staff";
    const email = "staff@railsahay.com";
    const phone = "9876543210";
    const password = "Staff@12345";
    const designation = "Railway Assistant";
    const station_name = "Bhubaneswar";

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
     `INSERT INTO railway_staff
(full_name, email, phone, password, designation, station_name)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (email)
DO UPDATE SET password = EXCLUDED.password
RETURNING id, full_name, email, designation, station_name`,
      [
        full_name,
        email,
        phone,
        hashedPassword,
        designation,
        station_name
      ]
    );

    console.log("Staff Account Created Successfully!");
    console.log(result.rows[0]);

  } catch (error) {
    console.error("Staff Creation Error:", error.message);

  } finally {
    await pool.end();
  }
};

createStaff();