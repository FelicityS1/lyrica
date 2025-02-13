require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI; // Get the URI from .env

const connect = mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Check database connection
connect.then(() => {
    console.log("Database connected successfully to MongoDB Atlas");
}).catch((err) => {
    console.error("Database connection failed", err);
});

// Schema creation
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Collection Part
const collection = mongoose.model("users", LoginSchema);

module.exports = collection;
