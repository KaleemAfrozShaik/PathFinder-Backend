const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const User = require('../models/user.model');

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        console.log("🪙 Token received:", token);

        if (!token) {
            console.error("❌ No token provided in request");
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("🔓 Decoded token:", decodedToken);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            console.error("❌ No user found for token ID:", decodedToken?._id);
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("🔥 verifyJWT Error:", error?.message);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

module.exports = {
    verifyJWT
};