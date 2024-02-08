const jwt = require("jsonwebtoken");

function createToken(data) {
  const token = jwt.sign(data, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
  });
  return token;
}

function createRefreshToken(data) {
  const token = jwt.sign(data, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME,
  });
  return token;
}

module.exports = { createToken, createRefreshToken };
