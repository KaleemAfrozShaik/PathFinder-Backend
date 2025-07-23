const Roadmap = require("../models/roadmap.model");
const User = require("../models/user.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");


const getAllRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, roadmaps, "All roadmaps fetched"));
});


const getSingleRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) throw new ApiError(404, "Roadmap not found");

  res.status(200).json(new ApiResponse(200, roadmap, "Roadmap fetched"));
});


const createRoadmap = asyncHandler(async (req, res) => {
  const { title, description, steps } = req.body;

  if (!title || !steps || !Array.isArray(steps)) {
    throw new ApiError(400, "Title and steps are required");
  }

  const roadmap = await Roadmap.create({
    title,
    description,
    steps,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, roadmap, "Roadmap created"));
});


const updateRoadmap = asyncHandler(async (req, res) => {
  const { title, description, steps } = req.body;

  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) throw new ApiError(404, "Roadmap not found");

  roadmap.title = title || roadmap.title;
  roadmap.description = description || roadmap.description;
  if (steps) roadmap.steps = steps;

  await roadmap.save();

  res.status(200).json(new ApiResponse(200, roadmap, "Roadmap updated"));
});


const deleteRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) throw new ApiError(404, "Roadmap not found");

  await roadmap.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, "Roadmap deleted"));
});


const toggleSaveRoadmap = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const roadmapId = req.params.id;

  if (!user) throw new ApiError(404, "User not found");

  const index = user.savedRoadmaps.indexOf(roadmapId);
  if (index === -1) {
    user.savedRoadmaps.push(roadmapId);
  } else {
    user.savedRoadmaps.splice(index, 1);
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, user.savedRoadmaps, "Saved roadmap toggled")
  );
});

module.exports = {
  getAllRoadmaps,
  getSingleRoadmap,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleSaveRoadmap,
};