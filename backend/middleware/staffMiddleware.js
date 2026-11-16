const jwt = require("jsonwebtoken");

const verifyStaff = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Staff authentication required."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "staff") {
      return res.status(403).json({
        message: "Railway Staff access only."
      });
    }

    req.staff = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired staff token."
    });
  }
};

module.exports = verifyStaff;