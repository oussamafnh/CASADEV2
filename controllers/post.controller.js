import Post from '../models/post.model.js';
import User from "../models/user.model.js";
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
import Save from '../models/save.model.js';




// Create a new post
export const createPost = async (req, res) => {
  try {

    const user = req.user;
    const { title, content, image, video } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const newPost = new Post({
      title: title,
      content: content,
      image: image || null,
      video: video || null,
      author: user.username,
      authorAvatar: user.avatar,
      authorId: user._id
    });

    await newPost.save();


    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







// Get all posts
export const getAllPostsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
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
          likes: 0,
          comments: 0,
        },
      },
    ]);

    const currentUser = req.user;
    let isAllowed = false;
    if (!currentUser) {
      return res.status(200).json({ isAllowed, posts });
    }
    const currentUserId = currentUser._id.toString();
    isAllowed = true;

    const postsWithLikeIsMeAndSaved = await Promise.all(
      posts.map(async (post) => {
        const isLiked = !!(await Like.findOne({ postId: post._id, userId: currentUserId }));
        const isMe = post.authorId === currentUserId;
        const isSaved = !!(await Save.findOne({ postId: post._id, userId: currentUserId }));

        return { ...post, isLiked, isMe, isSaved };
      })
    );

    res.status(200).json({ isAllowed, posts: postsWithLikeIsMeAndSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Get latest posts
export const getLatestPostsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
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
          likes: 0,
          comments: 0,
        },
      },
    ]);

    const user = req.user;
    let isAllowed = false;

    if (!user) {
      return res.status(200).json({ isAllowed, posts });
    }
    const userId = user._id.toString();
    isAllowed = true;

    const postsWithLikeIsMeAndSaved = await Promise.all(
      posts.map(async (post) => {
        const isLiked = !!(await Like.findOne({ postId: post._id, userId: userId }));
        const isMe = post.authorId.toString() === userId;
        const isSaved = !!(await Save.findOne({ postId: post._id, userId: userId }));

        return { ...post, isLiked, isMe, isSaved };
      })
    );
    res.status(200).json({ isAllowed, posts: postsWithLikeIsMeAndSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Get a posts posted by a user
export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params; 
    const posts = await Post.aggregate([
      { $match: { authorId: userId } },
      { $sort: { createdAt: -1 } },
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
          likes: 0,
          comments: 0,
        },
      },
    ]);

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    const currentUser = req.user;
    let isAllowed = false;

    if (!currentUser) {
      return res.status(200).json({ isAllowed, posts });
    }

    const currentUserId = currentUser._id.toString();
    isAllowed = true;

    const postsWithLikeIsMeAndSaved = await Promise.all(
      posts.map(async (post) => {
        const isLiked = !!(await Like.findOne({ postId: post._id, userId: currentUserId }));
        const isMe = post.authorId.toString() === currentUserId;
        const isSaved = !!(await Save.findOne({ postId: post._id, userId: currentUserId }));

        return { ...post, isLiked, isMe, isSaved };
      })
    );

    res.status(200).json({ isAllowed, posts: postsWithLikeIsMeAndSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Get Most Liked Posts
export const getMostLikedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    const userId = user ? user._id.toString() : null;
    let isAllowed = Boolean(user);
    const posts = await Post.aggregate([
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
        $sort: { likeCount: -1 },
      },
      {
        $skip: (page - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          likes: 0,
          comments: 0,
        },
      },
    ]);

    const postsWithLikeIsMeAndSaved = await Promise.all(
      posts.map(async (post) => {
        const isLiked = !!(await Like.findOne({ postId: post._id, userId: userId }));
        const isMe = post.authorId.toString() === userId;
        const isSaved = !!(await Save.findOne({ postId: post._id, userId: userId }));

        return { ...post, isLiked, isMe, isSaved };
      })
    );

    res.status(200).json({
      isAllowed,
      posts: postsWithLikeIsMeAndSaved,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







// Get my posts (client posts)
export const getMyPosts = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const posts = await Post.find({ authorId: user._id }).sort({ createdAt: -1 });
    const postsWithDetailsAndSaved = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id });
        const isSaved = !!(await Save.findOne({ postId: post._id, userId: user._id }));

        return {
          ...post._doc,
          likeCount,
          commentCount,
          isMe: true,
          isSaved
        };
      })
    );

    res.status(200).json(postsWithDetailsAndSaved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};








// Get a post by ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const likeCount = await Like.countDocuments({ postId: id });

    const user = req.user;
    let isAllowed = false;
    let isLiked = false;
    let isMe = false;
    let isSaved = false; 

    if (user) {
      isAllowed = true;
      const userId = user._id.toString();

      const like = await Like.findOne({ postId: id, userId });
      isLiked = !!like;
      isMe = post.authorId.toString() === userId;
      isSaved = !!(await Save.findOne({ postId: post._id, userId: userId }));
    }

    res.status(200).json({
      post,
      likeCount,
      isAllowed,
      isLiked,
      isMe,
      isSaved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};










// Edit a post
export const editPost = async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (image === null) {
      post.image = null;
    } else if (image) {
      post.image = image;
    }

    await post.save();

    res.status(200).json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};









// Get Post Count By User (how much posts a user has posed)
export const getPostCountByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const postCount = await Post.countDocuments({ authorId: userId });

    res.status(200).json({ userId, postCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Delete a post
export const deletePost = async (req, res) => {
  try {
      const { postId } = req.params;
      const userId = req.user._id;
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      if (post.authorId.toString() !== userId.toString()) {
          return res.status(403).json({ message: "Unauthorized to delete this post" });
      }

      await Post.findByIdAndDelete(postId);
      await Comment.deleteMany({ postId });
      await Like.deleteMany({ postId });
      await Save.deleteMany({ postId });

      res.status(200).json({ message: "Post and related data successfully deleted" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
