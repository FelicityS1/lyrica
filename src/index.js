const express = require('express');
require("dotenv").config();
const session = require('express-session');
const MongoStore = require('connect-mongo');  // MongoDB session storage
const passport = require('./passport');  // OAuth
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("./config");
const songs = require("./songs");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// MongoDB Session Storage
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://lyrica-1.onrender.com/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Middleware to store user session and make it available globally
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Make user accessible in all EJS templates
    next();
});

// Routes
app.get("/", (req, res) => res.render("login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/addsongs", (req, res) => res.render("addsongs"));
app.get("/loading", (req, res) => res.render("login"));

// Home route - passing user info
app.get("/home", (req, res) => {
    console.log("User at home route:", req.session.user);  // Debugging
    res.render("home", { user: req.session.user || null });
});

// Google OAuth Login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/home'
}));

// Register User (Manual Signup)
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name: username, password: hashedPassword });
        await newUser.save();

        req.session.user = newUser; // Store user in session
        return res.redirect("/home");
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "Server error. Please try again." });
    }
});

// User Login
app.post("/login", async (req, res) => {
    try {
        const check = await User.findOne({ name: req.body.username });
        if (!check) return res.json({ success: false, message: "User not found." });

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) return res.json({ success: false, message: "Invalid Password." });

        req.session.user = check; // Store user in session
        return res.redirect("/home");
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong." });
    }
});

// Logout (Clear session)
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Songs CRUD
app.post("/addsongs", async (req, res) => {
    try {
        const newSong = new songs(req.body);
        await newSong.save();
        res.redirect("/musicfeed");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding song.");
    }
});

app.get("/musicfeed", async (req, res) => {
    try {
        const songList = await songs.find();
        res.render("musicfeed", { songs: songList });
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Server Start
const port = 5000;
app.listen(port, () => console.log(`Server running on Port: ${port}`));
