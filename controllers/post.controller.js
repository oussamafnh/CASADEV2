import Post from '../models/post.model.js';
import User from "../models/user.model.js";
import Like from '../models/like.model.js';

export const createPost = async (req, res) => {
  try {

    const user = req.user;
    const { title, subtitle, content, image, video } = req.body;

    // Validation: Ensure that the required fields are present
    if (!title || !subtitle || !content) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Create a new post object
    const newPost = new Post({
      title: title,
      subtitle: subtitle,
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
    // Get the current page number from the query string, default to 1 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Aggregate posts with like counts
    const posts = await Post.aggregate([
      {
        // Join with the Like collection
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        // Add a field to count the number of likes
        $addFields: {
          likeCount: { $size: '$likes' },
        },
      },
      {
        // Skip and limit for pagination
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        // Exclude the 'likes' array from the final result (optional)
        $project: {
          likes: 0,
        },
      },
    ]);

    // Respond with the paginated posts and their like counts
    // res.status(200).json(posts);
    const user = req.user;

    if (!user) {
      // If the user is not logged in (no token), return the posts as they are
      res.status(200).json(posts);
    } else {
      const userId = user._id;

      // If the user is logged in, check if they've liked the posts
      const postsWithIsLiked = await Promise.all(
        posts.map(async (post) => {
          let isLiked = false;

          // Check if the user has liked the post
          const like = await Like.findOne({ postId: post._id, userId });
          if (like) {
            isLiked = true; // Set isLiked to true if the like is found
          }

          return { ...post, isLiked }; // Add isLiked to the post object
        })
      );

      // Respond with the posts including the isLiked field
      res.status(200).json(postsWithIsLiked);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getLatestPostsPaginated = async (req, res) => {
  try {
    // Get the current page number from the query string, default to 1 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Aggregate posts with like counts and sort by latest
    const posts = await Post.aggregate([
      {
        // Join with the Like collection
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        // Add a field to count the number of likes
        $addFields: {
          likeCount: { $size: '$likes' },
        },
      },
      {
        // Sort by the latest posts (descending order by createdAt)
        $sort: { createdAt: -1 },
      },
      {
        // Skip and limit for pagination
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        // Exclude the 'likes' array from the final result (optional)
        $project: {
          likes: 0,
        },
      },
    ]);


    const user = req.user;
    let isAllowed = false;

    if (!user) {
      // If the user is not logged in (no token), return the posts as they are
      isAllowed = false;
      res.status(200).json({ isAllowed, posts });
    } else {
      const userId = user._id;
      isAllowed = true;

      // If the user is logged in, check if they've liked the posts
      const postsWithIsLiked = await Promise.all(
        posts.map(async (post) => {
          let isLiked = false;

          // Check if the user has liked the post
          const like = await Like.findOne({ postId: post._id, userId });
          if (like) {
            isLiked = true; // Set isLiked to true if the like is found
          }

          return { ...post, isLiked }; // Add isLiked to the post object
        })
      );

      // Respond with the posts including the isLiked field
      res.status(200).json({ isAllowed, posts: postsWithIsLiked });
    }


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;  // The user ID should be passed in the request parameters

    // Fetch posts by user ID
    const posts = await Post.find({ authorId: userId });

    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    // Loop through each post and count the likes
    const postsWithLikeCount = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id }); // Count the likes for each post
        return { ...post._doc, likeCount }; // Combine post data with likeCount
      })
    );

    // Respond with the list of posts, including like counts
    res.status(200).json(postsWithLikeCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getMostLikedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Pagination variables (defaults: page 1, 10 posts per page)

    // Step 1: Aggregate posts with their like counts
    const posts = await Post.aggregate([
      {
        // Join with the Like collection to count likes
        $lookup: {
          from: 'likes', // The name of the 'likes' collection
          localField: '_id', // The post's _id in the Post model
          foreignField: 'postId', // The postId in the Like model
          as: 'likes', // Store the likes as an array in the 'likes' field
        },
      },
      {
        // Step 2: Add a field to count the number of likes
        $addFields: {
          likeCount: { $size: '$likes' }, // Count the number of likes (length of the 'likes' array)
        },
      },
      {
        // Step 3: Sort the posts by the likeCount in descending order
        $sort: { likeCount: -1 },
      },
      {
        // Step 4: Apply pagination (skip previous pages and limit to 10 posts per page)
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit), // Limit the result to the given number (default is 10)
      },
      {
        // Step 5: Exclude the 'likes' array from the result (optional)
        $project: {
          likes: 0,
        },
      },
    ]);

    // Step 6: Return the paginated posts
    res.status(200).json({
      message: 'Posts retrieved successfully',
      page: parseInt(page),
      limit: parseInt(limit),
      posts,
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


    // Respond with the post and like count
    res.status(200).json({
      post,
      likeCount
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