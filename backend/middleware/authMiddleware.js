const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please login."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "passenger") {
      return res.status(403).json({
        message: "Passenger access only."
      });
    }

    req.passenger = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again."
    });
  }
};

module.exports = verifyToken;