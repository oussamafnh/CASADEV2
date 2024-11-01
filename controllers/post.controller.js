import Post from '../models/post.model.js';
import User from "../models/user.model.js";
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';

export const createPost = async (req, res) => {
  try {

    const user = req.user;
    const { title, content, image, video } = req.body;

    // Validation: Ensure that the required fields are present
    if (!title || !content) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Create a new post object
    const newPost = new Post({
      title: title,
      content: content,
      image: image || null,  // Optional field, so it defaults to null if not provided
      video: video || null,  // Optional field, so it defaults to null if not provided
      author: user.username, // Extracted from the authenticated user
      authorAvatar: user.avatar, // Extracted from the authenticated user
      authorId: user._id
    });

    // Save the new post to the database
    await newPost.save();

    // Respond with success and return the newly created post
    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    // Catch any errors and respond with a 500 status code
    res.status(500).json({ error: error.message });
  }
};


export const getAllPostsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      // Lookup likes to count them
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
        },
      },
      // Lookup comments to count them
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          likes: 0, // Exclude likes array
          comments: 0, // Exclude comments array
        },
      },
    ]);

    const user = req.user;
    const userId = user ? user._id.toString() : null;

    const postsWithIsMe = await Promise.all(
      posts.map(async (post) => {
        const isLiked = user ? !!(await Like.findOne({ postId: post._id, userId })) : false;
        const isMe = userId && post.authorId.toString() === userId;

        return { ...post, isLiked, isMe };
      })
    );

    res.status(200).json(postsWithIsMe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getLatestPostsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      // Lookup likes to count them
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
        },
      },
      // Lookup comments to count them
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          likes: 0, // Exclude likes array
          comments: 0, // Exclude comments array
        },
      },
    ]);

    const user = req.user;
    let isAllowed = false;

    // If user is not logged in, return posts without isLiked and isMe fields
    if (!user) {
      return res.status(200).json({ isAllowed, posts });
    }

    // User is logged in, include isLiked and isMe fields
    const userId = user._id.toString();
    isAllowed = true;

    const postsWithIsLikedAndIsMe = await Promise.all(
      posts.map(async (post) => {
        const isLiked = !!(await Like.findOne({ postId: post._id, userId }));
        const isMe = post.authorId.toString() === userId;

        return { ...post, isLiked, isMe };
      })
    );

    res.status(200).json({ isAllowed, posts: postsWithIsLikedAndIsMe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the request parameters

    // Aggregation pipeline to fetch posts by specified user ID, include like and comment counts, and sort by latest
    const posts = await Post.aggregate([
      // Match posts with the specified user ID as the author
      { $match: { authorId: userId } },

      // Sort by latest created posts first
      { $sort: { createdAt: -1 } },

      // Lookup likes to count them
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
        },
      },

      // Lookup comments to count them
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },

      {
        $project: {
          likes: 0, // Exclude likes array
          comments: 0, // Exclude comments array
        },
      },
    ]);

    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    const currentUser = req.user; // Get the logged-in user from middleware
    let isAllowed = false;

    // If user is not logged in, return posts without isLiked and isMe fields
    if (!currentUser) {
      return res.status(200).json({ isAllowed, posts });
    }

    // User is logged in, include isLiked and isMe fields
    const currentUserId = currentUser._id.toString();
    isAllowed = true;

    const postsWithLikeAndIsMe = await Promise.all(
      posts.map(async (post) => {
        const isLiked = !!(await Like.findOne({ postId: post._id, userId: currentUserId })); // Check if the current user liked the post
        const isMe = post.authorId.toString() === currentUserId; // Check if the current user is the author

        return { ...post, isLiked, isMe }; // Combine post data with isLiked and isMe fields
      })
    );

    // Respond with the list of posts, including like counts, comment counts, isLiked, and isMe fields
    res.status(200).json({ isAllowed, posts: postsWithLikeAndIsMe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getMyPosts = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Fetch posts authored by the logged-in user
    const posts = await Post.find({ authorId: user._id }).sort({ createdAt: -1 });

    // Retrieve like counts and comment counts, and add `isMe` field for each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id }); // Count comments
        return {
          ...post._doc,
          likeCount,
          commentCount, // Include total comments
          isMe: true,
        };
      })
    );

    // Respond with the user's posts including like counts and comment counts
    res.status(200).json(postsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getMostLikedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    const userId = user ? user._id.toString() : null;
    let isAllowed = Boolean(user);

    // Aggregate posts with like counts and comment counts
    const posts = await Post.aggregate([
      {
        // Join with the Like collection to count likes
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' }, // Count likes
        },
      },
      {
        // Join with the Comment collection to count comments
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }, // Count comments
        },
      },
      {
        $sort: { likeCount: -1 }, // Sort posts by like count
      },
      {
        $skip: (page - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          likes: 0, // Exclude the likes array
          comments: 0, // Exclude the comments array
        },
      },
    ]);

    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const isLiked = user ? !!(await Like.findOne({ postId: post._id, userId })) : false;
        const isMe = userId && post.authorId.toString() === userId;

        return { ...post, isLiked, isMe };
      })
    );

    res.status(200).json({
      isAllowed,
      posts: postsWithExtras,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the post by its ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Fetch the like count for the post
    const likeCount = await Like.countDocuments({ postId: id });

    // Determine if the user is logged in (isAllowed) and if they liked the post (isLiked)
    const user = req.user;
    let isAllowed = false;
    let isLiked = false;
    let isMe = false; // Initialize isMe

    if (user) {
      isAllowed = true;
      const userId = user._id.toString();

      // Check if the user has liked the post
      const like = await Like.findOne({ postId: id, userId });
      isLiked = !!like; // Set isLiked to true if a like is found

      // Check if the logged-in user is the author of the post
      isMe = post.authorId.toString() === userId;
    }

    // Respond with the post, like count, isAllowed, isLiked, and isMe fields
    res.status(200).json({
      post,
      likeCount,
      isAllowed,
      isLiked,
      isMe, // Include isMe in the response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const editPost = async (req, res) => {
  try {
    const { title, subtitle, content, image, video } = req.body;
    const post = req.post; // Retrieved from the middleware

    // Update the post fields
    if (title) post.title = title;
    if (subtitle) post.subtitle = subtitle;
    if (content) post.content = content;
    if (image) post.image = image;
    if (video) post.video = video;

    // Mark the post as edited
    post.isEdited = true;

    // Save the updated post to the database
    await post.save();

    // Respond with the updated post
    res.status(200).json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getPostCountByUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming the user ID is passed as a URL parameter

    // Count posts by the specific user
    const postCount = await Post.countDocuments({ authorId: userId });

    res.status(200).json({ userId, postCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
