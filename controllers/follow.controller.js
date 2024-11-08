import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';

// Toggle follow (follow or unfollow)
export const followToggle = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const currentUserId = req.user._id;

        if (userIdToFollow === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const followEntry = await Follow.findOne({
            followerId: currentUserId,
            followingId: userIdToFollow,
        });

        if (followEntry) {
            await Follow.deleteOne({ _id: followEntry._id }); // Use deleteOne instead of remove
            return res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            await Follow.create({
                followerId: currentUserId,
                followingId: userIdToFollow,
            });
            return res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const followers = await Follow.find({ followingId: userId })
            .populate('followerId', 'username firstName lastName avatar')
            .sort({ createdAt: -1 }); // Sort by latest

        res.status(200).json({
            followersCount: followers.length,
            followers: followers
                .filter(follow => follow.followerId) // Ensure followerId exists
                .map(follow => ({
                    ...follow.followerId._doc,
                    followDate: follow.createdAt // Include the follow date
                })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const following = await Follow.find({ followerId: userId })
            .populate('followingId', 'username firstName lastName avatar')
            .sort({ createdAt: -1 }); // Sort by latest

        res.status(200).json({
            followingCount: following.length,
            following: following
                .filter(follow => follow.followingId) // Ensure followingId exists
                .map(follow => ({
                    ...follow.followingId._doc,
                    followDate: follow.createdAt // Include the follow date
                })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
