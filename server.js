const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8081;
let highScore = 0;

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/score', (req, res) => res.json({ highScore }));
app.post('/api/score', (req, res) => {
    const { score } = req.body;
    if (score > highScore) highScore = score;
    res.json({ message: 'Score recorded', highScore });
});
app.get('/health', (req, res) => res.status(200).send('OK'));

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server on ${PORT}`));
}
module.exports = app;