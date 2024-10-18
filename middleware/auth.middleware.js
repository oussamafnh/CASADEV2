import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Post from '../models/post.model.js';

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const verifyLike = async (req, res, next) => {
  const token = req.cookies.token; // Get the token from cookies

  if (!token) {
    req.user = null;
    return next(); // Proceed to the next middleware/controller
  }
  else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = user; // Attach user to the request object
      next(); // Proceed to the next middleware/controller
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  }

};




// Middleware to check if the authenticated user is the author of the post
export const checkIsAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Assuming the user ID is available after authentication

    // Find the post by its ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the authenticated user is the author of the post
    if (post.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    // Pass the post to the next middleware or route handler
    req.post = post;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
