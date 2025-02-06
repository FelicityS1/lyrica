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
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//collection Part
const collection = new mongoose.model("users", LoginSchema);

module.exports = collection; 