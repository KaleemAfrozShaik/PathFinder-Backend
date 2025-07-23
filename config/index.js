const mongoose = require("mongoose");
const dotenv = require("dotenv");
const DB_NAME = "PathFinder";

dotenv.config();


const connectDB=async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB conncected successfully !!DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(error);
        console.log("MongoDB conncection failed !!");
        process.exit(1);
    }
};

module.exports = {
    connectDB
};