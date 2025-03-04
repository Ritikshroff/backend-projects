import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})


connectDB();











// first way to connect to the database

// import express from "express";
// const app = express();

// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('listening', () => {
//             console.log('Server is running on port 3000')
//         }
//         )
//         app.listen(3000)
//     }catch (error) {
//         console.log(error)
//     }throw error
// })()