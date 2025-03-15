import Router from 'express';
import { ChangeCurrentUserPassword, getCurrentUser, getUserChanelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.contreoller.js';
import {upload} from '../middlewares/multer.middleware.js'; 
import { varifyJwt } from '../middlewares/auth.middleware.js';


const router = Router();
router.route('/register').post(
    upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    ]),
    registerUser
);

router.route('/login').post(loginUser);


// secured routes
router.route('/logout').post(varifyJwt, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-Password').post(varifyJwt, ChangeCurrentUserPassword);
router.route('/current-user').get(varifyJwt, getCurrentUser);
router.route('/updateaccount').patch(varifyJwt, updateAccountDetails);
router.route('/avatar').patch(varifyJwt, upload.single('avatar'), updateUserAvatar);
router.route('/cover-image').patch(varifyJwt, upload.single('coverImage'), updateUserCoverImage);
router.route('/c/:username').get(varifyJwt, getUserChanelProfile);
router.route('/history').get(varifyJwt, getWatchHistory);


export default router;