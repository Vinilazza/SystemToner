const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "30d";

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}
function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}
function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccess,
  verifyAccess,
  signRefresh,
  verifyRefresh,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
};
