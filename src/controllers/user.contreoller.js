import { asynchandler } from '../utils/asynchandler.js';
import  ApiError  from '../utils/apierror.js';
import  {User}  from '../models/user.modle.js';
import uploadonCloudnary from '../utils/cloudenery.js';
import ApiResponse from '../utils/apiResponse.js';

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

    if ([email, password, fullName, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, 'All fields are required');
    }

    // check if user already exists: email, username
    existedUser = User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError (409, 'User already exists with this email or username');
    }

    // check images, check for avatar
    const avatarOnlocalPath = req.files?.avatar[0]?.path;
    const coverImageOnLocalPath = req.files?.cover[0]?.path;

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
    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createdUser) {
        throw new ApiError(500, 'Error creating user');
    }

    // return user details to frontend or if user exist and any other error sent the error message
    return res.status(201).json(
        new ApiResponse(200 , createdUser, 'User registered successfully')
    )

})

export { registerUser };