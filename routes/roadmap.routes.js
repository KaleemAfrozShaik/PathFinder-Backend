const express = require("express");
const {
  getAllRoadmaps,
  getSingleRoadmap,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleSaveRoadmap,
  getRoadmapsByCareerPath,
} = require("../controllers/roadmap.controller");

const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", getAllRoadmaps);
router.get("/career/:careerId", getRoadmapsByCareerPath); 
router.get("/:id", getSingleRoadmap);

// Protected routes
router.post("/", verifyJWT, createRoadmap);
router.put("/:id", verifyJWT, updateRoadmap);
router.delete("/:id", verifyJWT, deleteRoadmap);
router.post("/save/:id", verifyJWT, toggleSaveRoadmap);

module.exports = router;