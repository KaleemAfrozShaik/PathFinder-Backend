const mongoose = require("mongoose");

// Step sub-schema (no _id since steps are not individually managed yet)
const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: String,
  resourceLink: String,
  order: Number,
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  careerPath: {
    type: String,
    required: true,
  },

  steps: [stepSchema], // Array of learning steps

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Likely a mentor or admin
  }
}, { timestamps: true });

module.exports = mongoose.model("Roadmap", roadmapSchema);