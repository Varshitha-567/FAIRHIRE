const express = require("express");
const router = express.Router();

const {
  createAudit,
  getAudits,
  deleteAudit
} = require("../controllers/auditController");

router.post("/", createAudit);
router.get("/", getAudits);
router.delete("/:id", deleteAudit);

module.exports = router;