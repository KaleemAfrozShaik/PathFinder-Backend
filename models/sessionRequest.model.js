const mongoose = require("mongoose");

const sessionRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  topic: {
    type: String,
    required: true,
  },

  preferredTime: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Completed"],
    default: "Pending",
  }
}, { timestamps: true });

module.exports = mongoose.model("SessionRequest", sessionRequestSchema);