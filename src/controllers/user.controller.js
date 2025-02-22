import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"; // make sure this is imported

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    // console.log("email", email);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const createdUser = await User.create({
        fullname,
        email,
        username,
        password,
    });

    return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = existingUser.generateAccessToken();
    const refreshToken = existingUser.generateRefreshToken();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "None",
        maxAge: 3600000,
    });

    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken }, "Login successful"));
});

// Get Current User (using cookie to verify token)
const getMe = asyncHandler(async (req, res) => {
    // get token from headers
    const token = req.headers.authorization?.split(" ")[1];
    // console.log("token", token);

    if (!token) {
        throw new ApiError(401, "Authentication token is missing");
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded._id).select("-password"); // Exclude password for security

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"));
});

export { registerUser, loginUser, getMe };
