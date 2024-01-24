const express = require("express");
const {
  registerUser,
  getUser,
  login,
  updateUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);

router.get("/getUser/:userId", getUser);

router.put("/updateuser", updateUser);

module.exports = router;
