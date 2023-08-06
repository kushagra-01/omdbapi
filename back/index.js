const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;
require('dotenv').config();
app.use(express.static('public'));
app.use(cors())
app.get('/search', (req, res) => {
  const movieTitle = req.query.title;
  const apiKey = process.env.apiKey; 
  const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${movieTitle}`;

  axios.get(apiUrl)
    .then(response => {
      const movies = response.data.Search;
      res.send(movies);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching data from OMDB API');
    });
});




// User model (in-memory for demonstration)
const users = [];

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.sendStatus(401);
    }
};

// Registration route
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: uuidv4(), username, password: hashedPassword, email, playlists: [] });
    res.sendStatus(201);
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    req.session.userId = user.id;
    res.sendStatus(200);
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

// Create profile route
app.post('/create-profile', isAuthenticated, (req, res) => {
    const user = users.find(u => u.id === req.session.userId);
    // In a real app, you might store profile data in a database
    // For this example, we'll assume that the user is already authenticated and has a profile
    res.sendStatus(200);
});

// Create playlist route
app.post('/create-playlist', isAuthenticated, (req, res) => {
    const { name, isPrivate } = req.body;
    const user = users.find(u => u.id === req.session.userId);
    user.playlists.push({ id: uuidv4(), name, isPrivate });
    res.sendStatus(201);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
