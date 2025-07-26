const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, bio } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Name, Email, and Password are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    let profileUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // default
    const profilePicturePath = req.file?.path;

    if (profilePicturePath) {
    try {
        console.log("🟡 Uploading to Cloudinary:", profilePicturePath);
        const uploaded = await uploadOnCloudinary(profilePicturePath);
        console.log("✅ Cloudinary Upload Result:", uploaded);

        if (!uploaded?.url) {
        throw new ApiError(400, "Failed to upload profile picture");
        }
        profileUrl = uploaded.url;
    } catch (err) {
        console.error("❌ Cloudinary Upload Error:", err);
        throw new ApiError(500, "Cloudinary upload failed");
    }
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        bio,
        profilePicture: profileUrl,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully"
        )
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) throw new ApiError(404, "User not found");
    res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true,
    };
    if(!req.user) {
        return res.status(401).json(new ApiResponse(401, {}, "Unauthorized request"));
    }
    if (req.user._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
        );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
    httpOnly: true,
    secure: true,
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save(); 

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);
    console.log("File received:", req.file);
console.log("Body received:", req.body);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (name?.trim()) user.name = name.trim();
    if (bio?.trim()) user.bio = bio.trim();
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (!uploaded?.url) {
            throw new ApiError(400, "Failed to upload profile picture");
        }
        user.profilePicture = uploaded.url;
    }
    await user.save();
    return res.status(200).json(new ApiResponse(200, {
        name: user.name,
        bio: user.bio,
        profilePicture: user.profilePicture,
        email: user.email,
        role: user.role
    }, "Profile updated successfully"));
});

const getSavedPaths = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("savedRoadmaps");
    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json(
        new ApiResponse(200, user.savedRoadmaps, "Saved roadmaps fetched successfully")
    );
});

const updateRole = asyncHandler(async (req, res) => {
    const { role, bio } = req.body;

    if (!["mentor", "user"].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { role, bio },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, updatedUser, "Role updated"));
});

const getAllMentors = asyncHandler(async (req, res) => {
    const mentors = await User.find({ role: "mentor" }).select("name email bio profilePicture");
    res.status(200).json({ success: true, data: mentors });
});

const getMentorById = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    
    if (!mentorId) {
        throw new ApiError(400, "Mentor ID is required");
    }

    const mentor = await User.findById(mentorId).select("name email bio profilePicture");
    
    if (!mentor) {
        throw new ApiError(404, "Mentor not found");
    }

    res.status(200).json(new ApiResponse(200, mentor, "Mentor fetched successfully"));
});

const toggleSavedRoadmap = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { roadmapId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.savedRoadmaps.includes(roadmapId);

    if (alreadySaved) {
        user.savedRoadmaps.pull(roadmapId);
        await user.save();
        return res.json({ saved: false, message: "Roadmap unsaved" });
    } else {
        user.savedRoadmaps.push(roadmapId);
        await user.save();
        return res.json({ saved: true, message: "Roadmap saved" });
    }
});

const googleLogin = asyncHandler(async (req, res, next) => {
    const { user } = req;
    if (!user) {
        throw new ApiError(401, "Google authentication failed");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };


    res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, { ...options, maxAge: 30 * 24 * 60 * 60 * 1000 })
        .redirect('http://localhost:5173/login?google=true'); 
});

module.exports = {
    registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateProfile,
    getSavedPaths,
    getCurrentUser,
    updateRole,
    getAllMentors,
    getMentorById,
    toggleSavedRoadmap,
    googleLogin
};