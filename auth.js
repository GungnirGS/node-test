const jwt = require("jsonwebtoken");

// Get value from .env 
const config = process.env;

const verifyToken = (req, res, next) => {
  // Find token from request body
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    // Verify JWT
    const decoded = jwt.verify(token, config.TOKEN_SECRET);
    // Append user information from decoded JWT to request
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;