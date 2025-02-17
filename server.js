const express = require('express');
const path = require('path'); // To manage file paths
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Where your EJS files are located

// Serve static files (like CSS and JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
  res.render('login'); // Render index.ejs for the homepage
});

app.get('/login', (req, res) => {
  res.render('login'); // Render login.ejs for the login page
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

app.get("/musicfeed", (req, res) => {
  res.render("musicfeed");
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
