import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { User } from "./models/user.modle.js";

dotenv.config({
    path: './.env'
})

const fixIndex = async () => {
    try {
        await connectDB();
        console.log("Connected to DB. Attempting to drop index 'UserName_1'...");
        
        // Check if index exists first to avoid error
        const indexes = await User.collection.indexes();
        console.log(indexes, "this is index");
        
        const indexExists = indexes.some(idx => idx.name === 'UserName_1');

        if (indexExists) {
            await User.collection.dropIndex('UserName_1');
            console.log("SUCCESS: Index 'UserName_1' dropped successfully.");
        } else {
            console.log("INFO: Index 'UserName_1' does not exist. No action needed.");
        }

    } catch (error) {
        console.error("ERROR:", error.message);
    } finally {
        process.exit();
    }
};

fixIndex();
