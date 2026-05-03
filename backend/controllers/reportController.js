const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getReports = async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
};

module.exports = {
  createReport,
  getReports
};