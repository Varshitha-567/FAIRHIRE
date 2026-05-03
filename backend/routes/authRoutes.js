const express = require("express");
const router = express.Router();

const {
  registerUser
} = require("../controllers/authController");

router.post("/register", registerUser);
router.get("/", (req, res) => {
  res.send("Auth route working");
});
module.exports = router;