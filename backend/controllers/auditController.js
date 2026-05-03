const Audit = require("../models/Audit");

const createAudit = async (req, res) => {
  try {
    const audit = await Audit.create(req.body);
    res.status(201).json(audit);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getAudits = async (req, res) => {
  const audits = await Audit.find();
  res.json(audits);
};

const deleteAudit = async (req, res) => {
  await Audit.findByIdAndDelete(req.params.id);
  res.json({
    message: "Deleted"
  });
};

module.exports = {
  createAudit,
  getAudits,
  deleteAudit
};