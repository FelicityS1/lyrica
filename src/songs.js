const { name } = require("ejs");
const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Logins");

//check database connection
connect.then(() => {
    console.log("Database connected Successfully");
})
.catch(() => {
    console.log("Database connection failed");
});

// Schema creation
const LoginSchema = new mongoose.Schema({
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

//collection Part
const songs = new mongoose.model("songs", LoginSchema);

module.exports = songs;