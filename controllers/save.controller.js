import Post from '../models/post.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
import Save from '../models/save.model.js';



// Save/Unsave a post
export const toggleSave = async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;
  
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      const existingSave = await Save.findOne({ userId, postId });
  
      if (existingSave) {
        await Save.deleteOne({ _id: existingSave._id });
        return res.status(200).json({ message: 'Post unsaved' });
      } else {
        const newSave = new Save({ userId, postId });
        await newSave.save();
        return res.status(201).json({ message: 'Post saved' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  
  



  // Get saved posts
  export const getSavedPosts = async (req, res) => {
    try {
      const userId = req.user._id;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }
  
      const savedPosts = await Save.find({ userId }).populate({
        path: 'postId',
        model: 'Post',
      });
  
      if (savedPosts.length === 0) {
        return res.status(404).json({ message: 'No saved posts found for this user' });
      }
  
      const posts = await Promise.all(savedPosts.map(async (save) => {
        const post = save.postId;
  
        const likeCount = await Like.countDocuments({ postId: post._id });
        const commentCount = await Comment.countDocuments({ postId: post._id });
  
        const isLiked = !!(await Like.findOne({ postId: post._id, userId: userId }));
  
        const isMe = post.authorId.toString() === userId.toString(); // Compare string IDs
  
        return {
          _id: post._id,
          title: post.title,
          content: post.content,
          image: post.image,
          video: post.video,
          author: post.author,
          authorId: post.authorId,
          authorAvatar: post.authorAvatar,
          isEdited: post.isEdited,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          __v: post.__v,
          likeCount,
          commentCount,
          isMe,
          isLiked,
          isSaved: true 
        };
      }));
  
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  