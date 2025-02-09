const express = require('express');
const session = require('express-session');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const songs = require("./songs");
const { title } = require('process');

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

app.get("/addSongs", (req, res) => {
    res.render("addSongs"); // Render addSongs.ejs
});

app.get("/home", (req, res) => {
    res.render("home");
});

//register user
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // check if user already exists in database
    const existingUser = await collection.findOne({name: data.name});

    if(existingUser) {
        res.send("User already exists! Please choose a different username.");
    }else {
        // hash password using bcrypt
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;


        const userdata = await collection.insertMany(data);
        console.log(userdata);
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

app.post("/addSongs", async (req, res) => {
    try {
        const newSong = new songs({ // Use the 'songs' model to create a new entry
            title: req.body.title,
            artist: req.body.artist,
            lyrics: req.body.lyrics,
            youtube: req.body.youtube,
        });

        // Save to the database
        await newSong.save();
        console.log("Song added:", newSong);

        res.send("Song added successfully!"); // You can redirect to another page if needed
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding song.");
    }
});



const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
})