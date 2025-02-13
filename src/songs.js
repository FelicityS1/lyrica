const { name } = require("ejs");
const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb+srv://Lizzy123:Testing123abc@lyricadb.mngvl.mongodb.net/LyricaDB");

//check database connection
connect.then(() => {
    console.log("Database connected Successfully");
})
.catch(() => {
    console.log("Database connection failed");
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