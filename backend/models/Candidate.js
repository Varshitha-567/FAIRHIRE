const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
{
  name: String,
  gender: String,
  age: Number,
  qualification: String,
  experience: Number,
  score: Number
},
{ timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);