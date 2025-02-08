import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res)=> {
    // get user details from frontend
    const {fullname, email, username, password} = req.body
    console.log("email", email);

    // validation - not empty
    if(
        [fullname, email, username, password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400, "Please fill in all fields");
    }

    // check if user already exists: username, email
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // create user object - create entry in db
    const createdUser = await User.create({
        fullname,
        email,
        username,
        password,
    })

    // return res
    return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));

})


const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const {email, password} = req.body;

    // validation - not empty
    if([email, password].some((field)=> field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }

    // check if user exists
    const existingUser = await User.findOne({email});

    if(!existingUser) {
        throw new ApiError(404, "User not found");
    }

    // check if password is correct
    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    // generate token
    const accessToken = existingUser.generateAccessToken();
    const refreshToken = existingUser.generateRefreshToken();

    // save refresh token in db
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    // return res
    return res.status(200).json(new ApiResponse(200, {accessToken, refreshToken}, "Login successful"));

})

export {registerUser, loginUser};