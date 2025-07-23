const express = require("express");
const {
  createSessionRequest,
  getMySessionRequests,
  getMentorRequests,
  acceptSessionRequest
} = require("../controllers/session.controller");

const { verifyJWT } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/request/:mentorId", verifyJWT, createSessionRequest);
router.get("/my-requests", verifyJWT, getMySessionRequests);
router.get("/mentor-requests", verifyJWT, getMentorRequests);
router.put("/accept/:requestId", verifyJWT, acceptSessionRequest);

module.exports = router;