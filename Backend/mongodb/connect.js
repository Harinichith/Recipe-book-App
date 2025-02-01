import mongoose from "mongoose";

const connectDB = (url, callback) => {
    console.log("🔍 Attempting to connect to MongoDB with URL:", url);

    if (!url) {
        console.error("❌ ERROR: MongoDB URL is undefined. Please check your .env file.");
        process.exit(1);
    }

    mongoose.set("strictQuery", true);

    mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log(`✅ Successfully connected to MongoDB at: ${url}`);
            if (callback) callback();
        })
        .catch((error) => {
            console.error("❌ MongoDB Connection Error Details:");
            console.error("Error Name:", error.name);
            console.error("Error Message:", error.message);
            console.error("Error Code:", error.code);
            console.error("Error Reason:", error.reason);
            console.error("Full Error Object:", JSON.stringify(error, null, 2));
            console.error(`Failed to connect to MongoDB URL: ${url}`);
            process.exit(1);
        });
};

export default connectDB;