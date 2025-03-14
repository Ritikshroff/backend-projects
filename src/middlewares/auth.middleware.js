import { User } from "../models/user.modle.js";
import ApiError from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const varifyJwt =  asynchandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log("Cookies:", req.cookies);
        console.log("Authorization header:", req.header("Authorization"));
        console.log("Token extracted:", token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        if (!token.includes('.') || token.split('.').length !== 3) {
            throw new ApiError(401, "Malformed JWT token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded token:", decodedToken); 

        const userId = decodedToken?._id || decodedToken?.id; // Try both common ID field names
        console.log("Looking for user with ID:", userId);

        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
            throw new ApiError(401, "invalid acess token or problem");
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "invalid request");
    }
});