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

// Schema creation
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
    },
    submittedBy: { type: String, default: "Anonymous" 
    },
    status: {
        type: String,
        enum: ["active", "approved", "modified", "deleted"],
        default: "approved"
    },
    modifiedBy: String, // Store user who modified the song
    deletedBy: String,// Store user who deleted the song
    createdAt: String, // Store the date when the song was created
}, { timestamps: true });

//collection Part
const songs = new mongoose.model("songs", SongsSchema);

module.exports = songs;