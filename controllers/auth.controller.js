// import User from "../models/user.model.js";
// import bcryptjs from "bcryptjs";
// import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

// export const signup = async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         if (!username || !email || !password ) {
//             throw new Error ("all field are required");
//         }
//         const userAlreadyExists = await User.findOne({ email });
//         if (userAlreadyExists) {
//             return res.status(400).json({ error: "User already exists" });
//         }

//         const hashedPassword =await bcryptjs.hash(password,10)
//         const user = new User({
//             username,
//             email,
//             password: hashedPassword,
//             verificationToken: verificationToken,
//             verificationTokenExpiresAt :Date.now() +24*60*60*1000 //24hrs
//         });

//         await user.save();


//         generateTokenAndSetCookie(res, user._id)

//         res.status(200).json({ 
//             message: "User registered successfully",
//             user: {...user._doc, password: undefined}
//         });


//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }





import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto"; // Import crypto for generating verification token
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    
    try {
        // Check if all required fields are provided
        if (!username || !email || !password || !confirmPassword) {
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

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex'); // 32 bytes for token

        // Create the user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken, // Assign the generated token
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token valid for 24 hours
        });

        // Save the user
        await user.save();

        // Generate token and set cookie
        generateTokenAndSetCookie(res, user._id);

        // Respond with success message (excluding the password)
        res.status(200).json({
            message: "User registered successfully",
            user: { ...user._doc, password: undefined }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// authController.js
import passport from 'passport';

// Google Auth
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google Callback
export const googleCallback = passport.authenticate('google', { failureRedirect: '/login' });

export const googleRedirect = (req, res) => {
  // Here, you can send back the user info or a success message
  res.status(200).json({ message: 'Successfully authenticated with Google', user: req.user });
};

// GitHub Auth
export const githubAuth = passport.authenticate('github', {
  scope: ['user:email']
});

// GitHub Callback
export const githubCallback = passport.authenticate('github', { failureRedirect: '/login' });

export const githubRedirect = (req, res) => {
  // Here, you can send back the user info or a success message
  res.status(200).json({ message: 'Successfully authenticated with GitHub', user: req.user });
};

// Logout
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
