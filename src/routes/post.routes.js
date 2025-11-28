import Router from 'express';
import {
    createPost,
    getAllPosts,
    getUserPosts,
    getPostById,
    updatePost,
    deletePost,
} from '../controllers/post.controller.js';
import { togglePostLike, getPostLikes } from '../controllers/like.controller.js';
import { addComment, getPostComments, deleteComment } from '../controllers/comment.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { varifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

// Post routes
router.route('/').post(varifyJwt, upload.array('images', 5), createPost);
router.route('/feed').get(varifyJwt, getAllPosts);
router.route('/user/:userId').get(varifyJwt, getUserPosts);
router.route('/:postId').get(varifyJwt, getPostById);
router.route('/:postId').patch(varifyJwt, updatePost);
router.route('/:postId').delete(varifyJwt, deletePost);

// Like routes
router.route('/:postId/like').post(varifyJwt, togglePostLike);
router.route('/:postId/likes').get(varifyJwt, getPostLikes);

// Comment routes
router.route('/:postId/comments').post(varifyJwt, addComment);
router.route('/:postId/comments').get(varifyJwt, getPostComments);
router.route('/comments/:commentId').delete(varifyJwt, deleteComment);

export default router;
