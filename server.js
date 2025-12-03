const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// PORT variable is harmless but no longer used in Vercel environment
const PORT = process.env.PORT || 8081; 
let highScore = 0;

app.use(bodyParser.json());
// This line serves your game (public/index.html) when the root path is requested
app.use(express.static('public'));

app.get('/api/score', (req, res) => res.json({ highScore }));
app.post('/api/score', (req, res) => {
    const { score } = req.body;
    // Note: highScore is in memory and resets between Vercel serverless function calls.
    if (score > highScore) highScore = score;
    res.json({ message: 'Score recorded', highScore });
});
app.get('/health', (req, res) => res.status(200).send('OK'));

// IMPORTANT: The app.listen block has been REMOVED.

// This is the CRITICAL line. Vercel uses this exported app instance
// to execute your Express routes as a serverless function.
module.exports = app;