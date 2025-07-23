const express = require("express");
const {
  getAllRoadmaps,
  getSingleRoadmap,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleSaveRoadmap
} = require("../controllers/roadmap.controller");

const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAllRoadmaps);
router.get("/:id", getSingleRoadmap);
router.post("/", verifyJWT, createRoadmap);
router.put("/:id", verifyJWT, updateRoadmap);
router.delete("/:id", verifyJWT, deleteRoadmap);
router.post("/:id/save", verifyJWT, toggleSaveRoadmap);

module.exports = router;