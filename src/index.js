const express = require('express');
const session = require('express-session');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const songs = require("./songs");
const { title } = require('process');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/addsongs", (req, res) => {
    res.render("addsongs"); // Render addSongs.ejs
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get('/loading', (req, res) => {
    res.render('login');
});

//register user

app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await collection.findOne({ name: username });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists! Please choose a different username." });
        }

        // Hash password using bcrypt
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new collection({ name: username, password: hashedPassword });
        await newUser.save();

        return res.json({ success: true, message: "User successfully created!" });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "Server error. Please try again later." });
    }
});



// User Login
app.post("/login", async (req, res) => {
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check) {
            res.send("User not found.");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            res.render("home");

        }else {
            req.send("invalid password");
        }
    }catch{
        res.send("Invalid Login Details");
    }
});

app.post("/addsongs", async (req, res) => {
    try {
        const newSong = new songs({
            title: req.body.title,
            artist: req.body.artist,
            lyrics: req.body.lyrics,
            youtube: req.body.youtube,
        });

        await newSong.save();
        console.log("Song added:", newSong);

        // Send a response to the frontend that the song was added
        res.redirect("/musicfeed");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding song.");
    }
});

app.get("/musicfeed", async (req, res) => {
    try {
        const songList = await songs.find(); // Fetch all songs from Atlas
        console.log("Fetched Songs:", songList);// Debugging Log
        res.render("musicfeed", { songs: songList }); // Pass songs to EJS
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/musicfeed/:id", async (req, res) => {
    try {
        // Ensure the ID is a valid ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Invalid song ID");
        }

        const song = await songs.findById(req.params.id).lean();

        if (!song) {
            return res.status(404).send("Song not found");
        }

        res.render("songdetails", { song }); // Render song details page
    } catch (error) {
        console.error("Error fetching song:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete("/musicfeed/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Invalid song ID");
        }

        const result = await songs.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).send("Song not found");
        }

        res.status(200).send("Song deleted successfully");
    } catch (error) {
        console.error("Error deleting song:", error);
        res.status(500).send("Internal Server Error");
    }
});



 
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
})