const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

// Connect to MongoDB Atlas and specify the database "LyricaDB"
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Lizzy123:Testing123abc@lyricadb.mngvl.mongodb.net/LyricaDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Database connected successfully to LyricaDB");
}).catch((err) => {
    console.error("❌ Database connection failed:", err);
});

// Define Songs Schema
const SongsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    lyrics: {
        type: String,
        required: true
    },
    youtube: {
        type: String,
        required: true
    }
});

// Create collection named "songs" in LyricaDB
const Song = mongoose.model("songs", SongsSchema);

module.exports = Song;