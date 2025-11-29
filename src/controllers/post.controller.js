import { asynchandler } from '../utils/asynchandler.js';
import ApiError from '../utils/apierror.js';
import { Post } from '../models/post.modle.js';
import { Like } from '../models/like.modle.js';
import { Comment } from '../models/comment.modle.js';
import uploadonCloudnary from '../utils/cloudenery.js';
import ApiResponse from '../utils/apiResponse.js';
import mongoose from 'mongoose';
import { validateObjectId, validatePagination } from '../utils/validators.js';

// Create a new post
// const createPost = asynchandler(async (req, res) => {
//     const { content } = req.body;

//     if (!content || content.trim() === '') {
//         throw new ApiError(400, 'Content is required');
//     }

//     // Handle image uploads (up to 5 images)
//     const imageUrls = [];
//     if (req.files && req.files.length > 0) {
//         for (const file of req.files) {
//             const uploadedImage = await uploadonCloudnary(file.path);
//             if (uploadedImage) {
//                 imageUrls.push(uploadedImage.url);
//             }
//         }
//     }

//     const post = await Post.create({
//         content,
//         images: imageUrls,
//         owner: req.user._id,
//     });

//     return res.status(201).json(
//         new ApiResponse(201, post, 'Post created successfully')
//     );
// });

const createPost = asynchandler(async (req, res) => {
    const { content } = req.body;

    // Allow text-only OR image-only OR both, but block empty posts
    if (!content && (!req.files || req.files.length === 0)) {
        throw new ApiError(400, "Post must contain text or at least one image");
    }

    const imageUrls = [];

    // Upload each image to Cloudinary
    if (Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            const uploadedImage = await uploadonCloudnary(file.path);
            if (uploadedImage) {
                imageUrls.push(uploadedImage.url);
            }
        }
    }

    const post = await Post.create({
        content: content || "",
        images: imageUrls,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, post, "Post created successfully"));
});


// Get all posts (Feed) - Paginated
const getAllPosts = asynchandler(async (req, res) => {
    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    const aggregate = Post.aggregate([
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

    const options = { page, limit };

    const posts = await Post.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, posts, 'Posts fetched successfully')
    );
});

// Get posts by specific user
const getUserPosts = asynchandler(async (req, res) => {
    const { userId } = req.params;
    validateObjectId(userId, 'User ID');
    
    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    const aggregate = Post.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
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

    const options = { page, limit };

    const posts = await Post.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, posts, 'User posts fetched successfully')
    );
});

// Get single post by ID
const getPostById = asynchandler(async (req, res) => {
    const { postId } = req.params;
    validateObjectId(postId, 'Post ID');

    const post = await Post.findById(postId).populate('owner', 'username fullName avatar');

    if (!post) {
        throw new ApiError(404, 'Post not found or has been deleted');
    }

    return res.status(200).json(
        new ApiResponse(200, post, 'Post fetched successfully')
    );
});

// Update post
const updatePost = asynchandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    validateObjectId(postId, 'Post ID');

    if (!content || content.trim() === '') {
        throw new ApiError(400, 'Content is required to update the post');
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, 'Post not found or has been deleted');
    }

    // Check if user is the owner
    if (post.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this post");
    }

    post.content = content;
    await post.save();

    return res.status(200).json(
        new ApiResponse(200, post, 'Post updated successfully')
    );
});

// Delete post
const deletePost = asynchandler(async (req, res) => {
    const { postId } = req.params;
    validateObjectId(postId, 'Post ID');

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, 'Post not found or has been deleted');
    }

    // Check if user is the owner
    if (post.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this post");
    }

    await Post.findByIdAndDelete(postId);

    // Also delete associated likes and comments
    await Like.deleteMany({ post: postId });
    await Comment.deleteMany({ post: postId });

    return res.status(200).json(
        new ApiResponse(200, {}, 'Post deleted successfully')
    );
});

export {
    createPost,
    getAllPosts,
    getUserPosts,
    getPostById,
    updatePost,
    deletePost,
};
