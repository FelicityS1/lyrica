const express = require('express');
require("dotenv").config();
const session = require('express-session');
const MongoStore = require('connect-mongo');  // Added for MongoDB session storage
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
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ success: false, message: "Access denied." });
};

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
                email: profile.emails[0].value,
                role: "user" // Default role assigned
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
    const user = await User.findById(id);
    done(null, user);
});

// Routes
app.get("/", (req, res) => res.render("login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/addsongs", (req, res) => {
    const user = req.user || req.session.user;
    res.render("addsongs", { users: user, activePage: "addsongs" }); 
    });
app.get("/home", (req, res) => {
    const user = req.user || req.session.user;
    res.render("home", { users: user, activePage: "home" }); 
});
app.get("/about", (req, res) => {
    const user = req.user || req.session.user;
    res.render("about", { users: user, activePage: "about" }); 
    });
app.get("/loading", (req, res) => res.render("login"));
app.get("/admin-promo", isAdmin, (req, res) => {
    res.render("admin-promo"); // Only accessible by admins
});
app.get("/feedback", (req, res) => {
    const user = req.user || req.session.user;
    res.render("feedback", { users: user, activePage: "feedback" }); 
});
app.get("/about", (req, res) => {
    const user = req.user || req.session.user;
    res.render("/about", { users: user, activePage: "about" }); 
});
// Google OAuth Login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
}), (req, res) => {
    // Redirect based on role
    if (req.user.role === "admin") {
        return res.redirect("/admin-home");
    }
    return res.redirect("/home");
});


// Register User
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: username,
            password: hashedPassword,
            role: "user" // Default role assigned
        });

        await newUser.save();
        return res.json({ success: true, message: "User successfully created!" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "Server error. Please try again." });
    }
});

app.post("/admin-promo", async (req, res) => {
    const { userId } = req.body;

    try {
        // Ensure only admins can change roles
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.role = "admin";
        await user.save();

        res.json({ success: true, message: "User promoted to admin." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// User Login
app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ name: req.body.username });
        if (!user) return res.json({ success: false, message: "User not found." });

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) return res.json({ success: false, message: "Invalid Password." });

        req.session.user = user; // Store user in session
        req.login(user, (err) => {
            if (err) return res.status(500).json({ success: false, message: "Login error." });

            // Redirect based on role
            if (user.role === "admin") {
                return res.json({ success: true, redirect: "/admin-home" });
            } else {
                return res.json({ success: true, redirect: "/home" });
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong." });
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { 
            console.error('Logout error:', err); 
            return res.redirect('/'); 
        }
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });
});

app.post("/addsongs", async (req, res) => {
    try {
        const newSong = new songs({
            title: req.body.title,
            artist: req.body.artist,
            lyrics: req.body.lyrics,
            youtube: req.body.youtube,
            submittedBy: req.user ? req.user.username || req.user.name : "Anonymous",
            status: "active"
        });
        await newSong.save();
        res.redirect("/musicfeed");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding song.");
    }
});

app.get("/musicfeed", async (req, res) => {
    try {
        const user = req.user || req.session.user;
        const songList = await songs.find({ status: { $ne: "deleted" } });
        res.render("musicfeed", { 
            users: user,
            songs: songList,
            activePage: "musicfeed"  
        }); 
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Single Song View
app.get("/song/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).send("Invalid song ID");

        const song = await songs.findById(req.params.id).lean();
        if (!song || song.status === "deleted") return res.status(404).send("Song not found");

        res.render("songdetails", { song, users: req.user || req.session.user });
    } catch (error) {
        console.error("Error fetching song:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Update Song
app.get("/updatesong/:id", async (req, res) => {
    try {
        const song = await songs.findById(req.params.id);
        if (!song) return res.status(404).send("Song not found");
        res.render('update', { song });
    } catch (error) {
        console.error("Error loading update page:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/updatesong/:id", async (req, res) => {
    try {
        const song = await songs.findById(req.params.id);
        if (!song) return res.status(404).send("Song not found");

        // Check if the logged-in user is the one who submitted the song
        if (!req.user || song.submittedBy !== req.user.name) {
            return res.status(403).send("You can only edit songs you submitted.");
        }

        // Update song details
        song.title = req.body.title;
        song.artist = req.body.artist;
        song.lyrics = req.body.lyrics;
        song.youtube = req.body.youtube;
        song.status = "modified";
        song.modifiedBy = req.user.name;
        song.dateModified = new Date();

        await song.save();
        res.redirect('/musicfeed');
    } catch (error) {
        console.error("Error updating song:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Delete Song
app.post("/deletesong/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).send("Invalid song ID");

        const song = await songs.findById(req.params.id);
        if (!song) return res.status(404).send("Song not found");

        // Check if the logged-in user is the one who submitted the song
        if (!req.user || song.submittedBy !== req.user.name) {
            return res.status(403).send("You can only delete songs you submitted.");
        }

        song.status = "deleted";
        song.deletedBy = req.user.name;
        await song.save();

        res.redirect("/musicfeed");
    } catch (error) {
        console.error("Error marking song as deleted:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/admin-home", isAdmin, async (req, res) => {
    try {
        const user = req.user || req.session.user;

        // Fetch all songs for each category (sorted by latest)
        const newSongs = await songs.find({ status: "active" }).sort({ createdAt: -1 });
        const modifiedSongs = await songs.find({ status: "modified" }).sort({ dateModified: -1 });
        const deletedSongs = await songs.find({ status: "deleted" }).sort({ dateDeleted: -1 });

        console.log("Fetched newSongs:", newSongs);
        console.log("Fetched modifiedSongs:", modifiedSongs);
        console.log("Fetched deletedSongs:", deletedSongs);

        res.render("admin-home", { newSongs, modifiedSongs, deletedSongs, users: user, activePage: "admin-home" });
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/admin-musicfeed", isAdmin, async (req, res) => {
    try {
        const user = req.user || req.session.user;
        const songList = await songs.find({ status: { $ne: "deleted" } });
        res.render("admin-musicfeed", { 
            users: user,
            songs: songList,
            activePage: "admin-musicfeed" 
        });
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).send("Internal Server Error");
    }
});



// Server Start
const port = 5000;
app.listen(port, () => console.log(`Server running on Port: ${port}`));