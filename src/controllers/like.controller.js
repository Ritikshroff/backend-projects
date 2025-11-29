import { asynchandler } from '../utils/asynchandler.js';
import ApiError from '../utils/apierror.js';
import { Like } from '../models/like.modle.js';
import { Post } from '../models/post.modle.js';
import ApiResponse from '../utils/apiResponse.js';
import { validateObjectId } from '../utils/validators.js';

// Toggle like on a post
const togglePostLike = asynchandler(async (req, res) => {
    const { postId } = req.params;
    validateObjectId(postId, 'Post ID');

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found. Cannot like a non-existent post');
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({
        post: postId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // Unlike: Remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        // Decrement like count
        post.likes = Math.max(0, post.likes - 1);
        await post.save();

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, 'Post unliked successfully')
        );
    } else {
        // Like: Create new like
        await Like.create({
            post: postId,
            likedBy: req.user._id
        });

        // Increment like count
        post.likes += 1;
        await post.save();

        return res.status(200).json(
            new ApiResponse(200, { liked: true }, 'Post liked successfully')
        );
    }
});

// Get all likes for a post
const getPostLikes = asynchandler(async (req, res) => {
    const { postId } = req.params;
    validateObjectId(postId, 'Post ID');

    const likes = await Like.find({ post: postId })
        .populate('likedBy', 'username fullName avatar');

    return res.status(200).json(
        new ApiResponse(200, likes, 'Likes fetched successfully')
    );
});

export {
    togglePostLike,
    getPostLikes,
};
