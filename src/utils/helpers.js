const jwt = require("jsonwebtoken");

function createToken(data) {
  const token = jwt.sign(data, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "10s",
  });
  return token;
}

function createRefreshToken(data) {
  const token = jwt.sign(data, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "20s",
  });
  return token;
}

module.exports = { createToken, createRefreshToken };
