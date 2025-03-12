import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("mongo db conection failed")
}
)











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