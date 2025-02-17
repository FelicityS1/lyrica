const express = require('express');
const app = express();
const port = 5000;

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Serve static files (if you have CSS, JS, images, etc.)
app.use(express.static('public'));

// Route for your login page
app.get('/login', (req, res) => {
  res.render('login');  // Render the login.ejs file
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
