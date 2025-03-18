import { asynchandler } from '../utils/asynchandler.js';
import ApiError from '../utils/apierror.js';
import { User } from '../models/user.modle.js';
import uploadonCloudnary from '../utils/cloudenery.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken'; 
import { json } from 'express';

const genrateAceessTokenandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.genrateAceessToken();
        const refreshToken = await user.genrateRefreshToken();

        // user.refreshToken = refreshToken;
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.error("Token generation error:", error);
        throw new ApiError(500, 'Error generating tokens, something went wrong');
    }
}

const registerUser = asynchandler(async (req, res) => {
    // res.status(200).json({
    //     message: 'User registered successfully',
    //     success: true
    // });


    // get user details from frontend
    // validate user details
    // check if user already exists: email, username
    // check images, check for avatar
    // upload images to cloudinary, avatar
    // create user object - craete entery in database
    // remove password and refresh token field from response
    // check for user cretion
    // return user details to frontend or if user exist and any other error sent the error message

    // get user details from frontend
    const { fullName, email, username, password } = req.body
    console.log("email", email);
    console.log("username", username);
    console.log("password", password);
    console.log("fullName", fullName);



    if ([email, password, fullName, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, 'All fields are required');
    }

    // check if user already exists: email, username
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, 'User already exists with this email or username');
    }

    if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
        throw new ApiError(400, 'Avatar file is required');
    }

    if (!req.files.coverImage || !req.files.coverImage[0]) {
        throw new ApiError(400, 'Cover image is required');
    }

    // check images, check for avatar
    const avatarOnlocalPath = req.files?.avatar[0]?.path;
    const coverImageOnLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarOnlocalPath) {
        throw new ApiError(400, 'Avatar is required');
    }
    if (!coverImageOnLocalPath) {
        throw new ApiError(400, 'Cover image is required');
    }

    const avatar = await uploadonCloudnary(avatarOnlocalPath);
    const coverImage = await uploadonCloudnary(coverImageOnLocalPath);

    if (!avatar || !coverImage) {
        throw new ApiError(500, 'Error uploading images');
    }

    // create user object - craete entery in database
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage.url,
        password
    })

    // remove password and refresh token field from response
    // const createdUser = await user.findById(user._id).select('-password -refreshToken');
    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createdUser) {
        throw new ApiError(500, 'Error creating user');
    }

    // return user details to frontend or if user exist and any other error sent the error message
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered successfully')
    )

})

const loginUser = asynchandler(async (req, res) => {

    // get user details from frontend (req body)
    // validate user details with username or email
    // check if user exists
    // check password
    // if user exist login either send a error message that user does not exist
    // generate access token and refresh token
    // send cookies to frontend
    // return user details and tokens to frontend

    // get user details from frontend (req body)
    const { email, username, password } = req.body

    if (!email && !username) {
        throw new ApiError(400, 'Email or username is required');
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }

    const ispasswordValid = await user.isPasswordCorrect(password);

    if (!ispasswordValid) {
        throw new ApiError(401, 'Password is incorrect');
    }

    // generate access token and refresh token
    const { accessToken, refreshToken } = await genrateAceessTokenandRefreshToken(user._id)

    // send cookies to frontend
    const loggedInuser = await User.findById(user._id).select('-password -refreshToken');
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(200,
            new ApiResponse(200,
                {
                    user: loggedInuser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asynchandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asynchandler(async (req, res) => {
    const IncomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!IncomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request we do not found refresh token');
    }

    try {
        const decodedToken = jwt.verify(
            IncomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, 'User not found invalid refresh token');
        }

        if (IncomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'refresh token is expired or used');
        }

        const { NewAccessToken, refreshToken } = await genrateAceessTokenandRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie('accessToken', NewAccessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(new ApiResponse(
                200,
                { NewAccessToken, refreshToken },
                'New access token generated successfully'
            ))
    } catch (error) {
        throw new ApiError(401, 'Invalid refresh token');
    }
})

const ChangeCurrentUserPassword = asynchandler(async (req, res) => {

    // get user details from frontend
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id)
    const ispasswordcorrect = await user.isPasswordCorrect(oldPassword);

    if (!ispasswordcorrect) {
        throw new ApiError(401, 'Old password is invalid');
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false });

    return res.status(200), json(new ApiResponse(200, {}, "password changed successfully"));

})

const getCurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiError(200, req.user, "User details fetched successfully"));
})

const updateAccountDetails = asynchandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, 'All fields are required');
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { fullName, email }
        }, {
        new: true,
    }).select('-password');

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'User details updated successfully'));
})

const updateUserAvatar = asynchandler(async (req, res) => {
    const avatartLoaclPath = req.files?.path
    if (!avatartLoaclPath) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const avatart = await uploadonCloudnary(avatartLoaclPath)
    if (!avatart) {
        throw new ApiError(500, 'Error uploading avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatart.url }
        },
        { new: true }
    ).select('-password')
    return res
        .status(200)
        .json(new ApiResponse(200, user, 'Avatar updated successfully'));
})

const updateUserCoverImage = asynchandler(async (req, res) => {
    const covertLoaclPath = req.files?.path
    if (!covertLoaclPath) {
        throw new ApiError(400, 'Cover image file is required');
    }

    const coverImage = await uploadonCloudnary(covertLoaclPath)
    if (!coverImage) {
        throw new ApiError(500, 'Error uploading avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage: coverImage.url }
        },
        { new: true }
    ).select('-password')

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'Cover image updated successfully'));
})

const getUserChanelProfile = asynchandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, 'Username is missing');
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    if (!channel || channel.length === 0) {
        throw new ApiError(404, 'Channel not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], 'Channel profile fetched successfully'));
})

const getWatchHistory = asynchandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0]?.watchHistory, 'Watch history fetched successfully'));
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    ChangeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChanelProfile,
    getWatchHistory
};