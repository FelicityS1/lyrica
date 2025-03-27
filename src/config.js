const { name } = require("ejs");
const mongoose = require("mongoose");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Lizzy123:Testing123abc@lyricadb.mngvl.mongodb.net/LyricaDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Database connected successfully"))
.catch((error) => console.log("Database connection failed:", error));

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
    role: { 
        type: String, 
        enum: ["admin", "user"],  // Admin or User roles only
        default: "user"  // Default role
    }
});

// Create Model
const User = mongoose.model("users", UserSchema);

module.exports = User;

