import { asynchandler } from '../utils/asynchandler.js';
import ApiError from '../utils/apierror.js';
import { Comment } from '../models/comment.modle.js';
import { Post } from '../models/post.modle.js';
import ApiResponse from '../utils/apiResponse.js';
import mongoose from 'mongoose';

// Add a comment to a post
const addComment = asynchandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        throw new ApiError(400, 'Comment content is required');
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const comment = await Comment.create({
        content,
        post: postId,
        owner: req.user._id,
    });

    // Increment comment count
    post.comments += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
        .populate('owner', 'username fullName avatar');

    return res.status(201).json(
        new ApiResponse(201, populatedComment, 'Comment added successfully')
    );
});

// Get all comments for a post
const getPostComments = asynchandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const aggregate = Comment.aggregate([
        {
            $match: { post: new mongoose.Types.ObjectId(postId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: '$owner' }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const comments = await Comment.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, comments, 'Comments fetched successfully')
    );
});

// Delete a comment
const deleteComment = asynchandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    // Check if user is the owner
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this comment');
    }

    // Decrement comment count on post
    const post = await Post.findById(comment.post);
    if (post) {
        post.comments = Math.max(0, post.comments - 1);
        await post.save();
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, {}, 'Comment deleted successfully')
    );
});

export {
    addComment,
    getPostComments,
    deleteComment,
};
