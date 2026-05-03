const express = require("express");
const router = express.Router();

const {
  addCandidate,
  getCandidates
} = require("../controllers/candidateController");

router.post("/", addCandidate);
router.get("/", getCandidates);

module.exports = router;