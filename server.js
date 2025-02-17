const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Path to your EJS files

// Serve static assets (CSS, JS, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to render login page
app.get('/login', (req, res) => {
  res.render('login');  // Renders login.ejs
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
