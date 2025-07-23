const SessionRequest = require("../models/SessionRequest");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

// ✅ Create Session Request
const createSessionRequest = asyncHandler(async (req, res) => {
  const mentorId = req.params.mentorId;

  if (!mentorId) throw new ApiError(400, "Mentor ID is required");

  if (req.user._id.toString() === mentorId) {
    throw new ApiError(400, "You cannot request a session with yourself.");
  }

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== "mentor") {
    throw new ApiError(404, "Mentor not found");
  }

  const existing = await SessionRequest.findOne({
    student: req.user._id,
    mentor: mentorId,
  });

  if (existing) {
    throw new ApiError(409, "You have already requested a session with this mentor");
  }

  const session = await SessionRequest.create({
    student: req.user._id,
    mentor: mentorId,
  });

  res.status(201).json(new ApiResponse(201, session, "Session request created"));
});

// ✅ Get all session requests made by student
const getMySessionRequests = asyncHandler(async (req, res) => {
  const sessions = await SessionRequest.find({ student: req.user._id })
    .populate("mentor", "name email profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, sessions, "Your session requests"));
});

// ✅ Get all requests mentor received
const getMentorRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== "mentor") {
    throw new ApiError(403, "Only mentors can view session requests.");
  }

  const sessions = await SessionRequest.find({ mentor: req.user._id })
    .populate("student", "name email profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, sessions, "Requests received"));
});

// ✅ Accept session request
const acceptSessionRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.requestId;

  const session = await SessionRequest.findById(requestId);
  if (!session) throw new ApiError(404, "Session request not found");

  if (session.mentor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to accept this request");
  }

  session.status = "accepted";
  await session.save();

  res.status(200).json(new ApiResponse(200, session, "Session request accepted"));
});

module.exports = {
  createSessionRequest,
  getMySessionRequests,
  getMentorRequests,
  acceptSessionRequest,
};