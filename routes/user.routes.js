const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  refreshAccessToken,
  updateProfile,
  getSavedPaths,
  getCurrentUser,
  updateRole,
  getAllMentors,
  getMentorById,
  
} = require("../controllers/user.controller");

const { verifyJWT } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/multer.middleware");

const router = express.Router();

// Auth routes
router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);

// Protected user routes
router.get("/me", verifyJWT, getCurrentUser);
router.put("/update-profile",  upload.single("profilePicture"),verifyJWT,updateProfile);
router.put("/change-password", verifyJWT, changeCurrentPassword);
router.get("/saved-paths", verifyJWT, getSavedPaths);
router.put("/update-role", verifyJWT, updateRole);
router.get("/mentors", verifyJWT,getAllMentors);

router.get("/mentor/:mentorId", getMentorById);

module.exports = router;