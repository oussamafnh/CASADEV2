
import User from "../models/user.model.js";
import Avatar from '../models/avatar.model.js';
import Post from "../models/post.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {
        // Check if all required fields are provided
        if (!email || !password || !confirmPassword) {
            throw new Error("All fields are required");
        }

        // Check if the password matches confirmPassword
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Check if the user already exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
        });

        // Save the user
        await user.save();

        // Log in the user directly after signup
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Use your JWT secret

        // Store the token in the user document
        user.Token = token;
        await user.save();

        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            path: '/',
        });

        // Respond with success and user information (excluding password)
        res.status(200).json({
            message: "User registered and logged in successfully",
            user: { ...user._doc, password: undefined }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Use your JWT secret

        // Store the token in the user document
        user.Token = token;
        await user.save();

        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            path: '/',
        });

        // Respond with success and user information (excluding password)
        res.status(200).json({
            message: "Login successful",
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        // The user is already attached to the request object by the verifyToken middleware
        const user = req.user;

        // Respond with the user information (excluding the password)
        user.Token = null;
        await user.save();

        // Clear the token cookie from the client
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0) // Set the cookie to expire immediately
        });
        res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getUserByToken = async (req, res) => {
    try {
        // The user is already attached to the request object by the verifyToken middleware
        const user = req.user;

        // Respond with the user information (excluding the password)
        res.status(200).json({
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




export const getAvatars = async (req, res) => {
    try {
        const avatars = await Avatar.find(); // Fetch all avatars
        res.status(200).json(avatars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getAvatarById = async (req, res) => {
    const { id } = req.params; // Extract the avatar ID from the request parameters
    try {
        const avatar = await Avatar.findById(id); // Find the avatar by ID
        if (!avatar) {
            return res.status(404).json({ error: "Avatar not found" });
        }
        res.status(200).json(avatar); // Send back the avatar if found
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const setAvatar = async (req, res) => {
    const userId = req.user._id; // Assuming you are using some authentication to get the user ID
    const { avatarId } = req.body; // The ID of the chosen avatar

    try {
        // Validate if avatarId exists
        const avatar = await Avatar.findById(avatarId);
        if (!avatar) {
            return res.status(404).json({ error: "Avatar not found" });
        }

        // Update the user's avatar
        const user = await User.findByIdAndUpdate(userId, { avatar: avatarId }, { new: true });

        res.status(200).json({ message: "Avatar updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




export const setupProfile = async (req, res) => {
    const { avatar, firstName, lastName, username, bio, birthday } = req.body;

    try {
        const user = await User.findById(req.user._id); // Assuming the user is authenticated and their ID is available

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user profile fields
        user.avatar = avatar;
        user.firstName = firstName;
        user.lastName = lastName;
        user.username = username;

        // Set bio only if provided
        if (bio) {
            user.bio = bio;
        }

        user.birthday = birthday;

        // Set isVerified to true
        user.isVerified = true;

        await user.save();

        res.status(200).json({
            message: "Profile setup successfully",
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params; // Extract the user ID from the request parameters

    try {
        const currentuser = req.user;
        let isAllowed = false;
        if (currentuser) {
            isAllowed = true;
        }
        const user = await User.findById(id); // Find the user by ID
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Count the total number of posts by this user
        const postCount = await Post.countDocuments({ authorId: id });

        // Respond with user information, excluding sensitive fields
        res.status(200).json({
            _id: user._id,
            isAllowed,
            email: user.email,
            avatar: user.avatar,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            bio: user.bio,
            birthday: user.birthday,
            isVerified: user.isVerified,
            totalPosts: postCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
