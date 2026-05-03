const Candidate = require("../models/Candidate");

const addCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getCandidates = async (req, res) => {
  const candidates = await Candidate.find();
  res.json(candidates);
};

module.exports = {
  addCandidate,
  getCandidates
};