const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    timestamps: true
  }
);

module.exports = mongoose.model("Audit", auditSchema);