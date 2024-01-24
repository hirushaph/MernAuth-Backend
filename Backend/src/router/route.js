const express = require("express");
const {
  registerUser,
  getUser,
  login,
  updateUser,
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);

router.get("/user/:username", authenticate, getUser);

router.put("/updateuser", authenticate, updateUser);

module.exports = router;
