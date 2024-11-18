import User from "../models/user.model.js";
import Avatar from '../models/avatar.model.js';
import Post from "../models/post.model.js";
import Follow from "../models/follow.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup function
export const signup = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {
        if (!email || !password || !confirmPassword) {
            throw new Error("All fields are required");
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Use your JWT secret
        user.Token = token;
        await user.save();
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
        });
        res.status(200).json({
            message: "User registered and logged in successfully",
            user: { ...user._doc, password: undefined }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Login function
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Use your JWT secret
        user.Token = token;
        await user.save();
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 14 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: "Login successful",
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Logout function
export const logout = async (req, res) => {
    try {
        const user = req.user;

        user.Token = null;
        await user.save();

        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: true,
            sameSite: 'None',
            path: '/',
        });
        res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Get user by token function
export const getUserByToken = async (req, res) => {
    try {
        const user = req.user;

        const postCount = await Post.countDocuments({ authorId: user._id });

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                avatar: user.avatar,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                bio: user.bio,
                birthday: user.birthday,
                isVerified: user.isVerified,
                totalPosts: postCount,
                password: undefined
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





// Get all avatars function
export const getAvatars = async (req, res) => {
    try {
        const avatars = await Avatar.find();
        res.status(200).json(avatars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getAvatarById = async (req, res) => {
    const { id } = req.params;
    try {
        const avatar = await Avatar.findById(id);
        if (!avatar) {
            return res.status(404).json({ error: "Avatar not found" });
        }
        res.status(200).json(avatar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





// Set avatar function
export const setAvatar = async (req, res) => {
    const userId = req.user._id;
    const { avatarId } = req.body;

    try {
        const avatar = await Avatar.findById(avatarId);
        if (!avatar) {
            return res.status(404).json({ error: "Avatar not found" });
        }

        const user = await User.findByIdAndUpdate(userId, { avatar: avatarId }, { new: true });

        res.status(200).json({ message: "Avatar updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Setup profile function
export const setupProfile = async (req, res) => {
    const { avatar, firstName, lastName, username, bio, birthday } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Set default avatar if the provided avatar is empty
        user.avatar = avatar || 'https://res.cloudinary.com/dq7kjds8s/image/upload/v1731950268/x31lamftbwev3nyogmqy.jpg';

        user.firstName = firstName;
        user.lastName = lastName;
        user.username = username;

        if (bio) {
            user.bio = bio;
        }

        user.birthday = birthday;
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






// Get User by Id function
export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const currentuser = req.user;
        let isAllowed = false;
        let isFollowed = false;
        let isFollowing = false;

        if (currentuser) {
            isAllowed = true;
            const followed = await Follow.findOne({ followerId: currentuser._id, followingId: id });
            isFollowed = !!followed;
            const following = await Follow.findOne({ followerId: id, followingId: currentuser._id });
            isFollowing = !!following;
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const postCount = await Post.countDocuments({ authorId: id });
        res.status(200).json({
            _id: user._id,
            isAllowed,
            isFollowed,
            isFollowing,
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
