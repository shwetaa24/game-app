cat << 'EOF' > server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 8080;
let highScore = 0;

app.use(bodyParser.json());

// --- THE NEW GAME (HTML + CSS + JS) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Space Dodge (Hard Mode)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; overflow: hidden; background: #1a1a2e; font-family: 'Courier New', sans-serif; touch-action: none; }
            #gameCanvas { display: block; margin: 0 auto; background: #16213e; border-left: 2px solid #0f3460; border-right: 2px solid #0f3460; }
            #ui { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: white; text-align: center; pointer-events: none; }
            h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            p { margin: 5px 0; font-size: 18px; color: #e94560; }
            #startMsg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: rgba(0,0,0,0.8); padding: 20px; border: 2px solid #e94560; text-align: center; cursor: pointer; }
        </style>
    </head>
    <body>

        <div id="ui">
            <h1>Space Dodge 🚀</h1>
            <p>Score: <span id="scoreVal">0</span> | Best: <span id="highVal">${highScore}</span></p>
        </div>

        <div id="startMsg" onclick="startGame()">
            <h2>TAP TO START</h2>
            <p>Move mouse to dodge rocks!</p>
        </div>

        <canvas id="gameCanvas"></canvas>

        <script>
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            const scoreEl = document.getElementById('scoreVal');
            const highEl = document.getElementById('highVal');
            const startMsg = document.getElementById('startMsg');

            let player = { x: 0, y: 0, size: 30 };
            let rocks = [];
            let score = 0;
            let gameRunning = false;
            let speed = 5;

            function resize() {
                canvas.width = Math.min(window.innerWidth, 500);
                canvas.height = window.innerHeight;
                player.y = canvas.height - 100;
                player.x = canvas.width / 2;
            }
            window.addEventListener('resize', resize);
            resize();

            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                player.x = e.clientX - rect.left;
            });
            canvas.addEventListener('touchmove', (e) => {
                const rect = canvas.getBoundingClientRect();
                player.x = e.touches[0].clientX - rect.left;
            });

            function startGame() {
                if (gameRunning) return;
                gameRunning = true;
                score = 0;
                rocks = [];
                startMsg.style.display = 'none';
                loop();
                spawnRock();
            }

            function spawnRock() {
                if (!gameRunning) return;
                const size = Math.random() * 30 + 20;
                rocks.push({
                    x: Math.random() * canvas.width,
                    y: -50,
                    size: size,
                    speed: Math.random() * 3 + 3
                });
                
                // --- HARD MODE CHANGE IS HERE (400) ---
                setTimeout(spawnRock, 400); 
            }

            function gameOver() {
                gameRunning = false;
                startMsg.style.display = 'block';
                startMsg.innerHTML = "<h2>GAME OVER 💥</h2><p>Final Score: " + score + "</p><p>Tap to Retry</p>";
                
                fetch('/api/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score: Math.floor(score / 60) })
                })
                .then(res => res.json())
                .then(data => {
                    highEl.innerText = data.highScore;
                });
            }

            function loop() {
                if (!gameRunning) return;
                ctx.fillStyle = '#16213e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillText("🚀", player.x, player.y);
                for (let i = 0; i < rocks.length; i++) {
                    let r = rocks[i];
                    r.y += r.speed;
                    ctx.fillText("🪨", r.x, r.y);
                    let dx = player.x - r.x;
                    let dy = player.y - r.y + 10;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < 30) {
                        gameOver();
                    }
                }
                score++;
                if (score % 60 === 0) {
                   scoreEl.innerText = Math.floor(score / 60);
                }
                requestAnimationFrame(loop);
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/api/score', (req, res) => res.json({ highScore }));

app.post('/api/score', (req, res) => {
    const { score } = req.body;
    if (score > highScore) {
        highScore = score;
    }
    res.json({ message: 'Score saved', highScore });
});

app.get('/health', (req, res) => res.status(200).send('OK'));

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
module.exports = app;
EOF