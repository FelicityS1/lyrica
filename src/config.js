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
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb+srv://Lizzy123:Testing123abc@lyricadb.mngvl.mongodb.net/LyricaDB")
    .then(() => console.log("Database connected successfully"))
    .catch(() => console.log("Database connection failed"));

// Define User Schema
const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true, 
    },
    name: {
        type: String,
        required: function () {
            return !this.googleId; 
        }
    },
    email: {
        type: String,
        required: function () {
            return !!this.googleId; 
        },
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; 
        }
    },
});

// Create Model
const User = mongoose.model("users", UserSchema);

module.exports = User;

