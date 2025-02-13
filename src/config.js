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
const User = mongoose.model("users", LoginSchema);

module.exports = User;
