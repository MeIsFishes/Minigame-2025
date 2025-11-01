// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// Keyboard layout mapping (QWERTY layout)
const keyboardLayout = {
    'Q': 0, 'W': 1, 'E': 2, 'R': 3, 'T': 4, 'Y': 5, 'U': 6, 'I': 7, 'O': 8, 'P': 9,
    'A': 0.5, 'S': 1.5, 'D': 2.5, 'F': 3.5, 'G': 4.5, 'H': 5.5, 'J': 6.5, 'K': 7.5, 'L': 8.5,
    'Z': 1.5, 'X': 2.5, 'C': 3.5, 'V': 4.5, 'B': 5.5, 'N': 6.5, 'M': 7.5
};

// Game state
let gameState = {
    running: false,
    paused: false,
    score: 0,
    highScore: localStorage.getItem('highScore') || 0
};

// Game objects
let bullets = [];
let enemies = [];
let particles = [];

// Enemy spawn timer
let enemySpawnTimer = 0;
let enemySpawnInterval = 120; // frames

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 20;
        this.speed = 8;
        this.color = '#00ff88';
    }
    
    update() {
        this.y -= this.speed;
    }
    
    draw() {
        // Draw bullet with glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Add bright core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - this.width / 4, this.y, this.width / 2, this.height);
    }
    
    isOffScreen() {
        return this.y + this.height < 0;
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.width = 50;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 1 + Math.random() * 2;
        this.horizontalSpeed = (Math.random() - 0.5) * 3;
        this.color = '#ff3366';
        this.health = 1;
    }
    
    update() {
        this.y += this.speed;
        this.x += this.horizontalSpeed;
        
        // Bounce off walls
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.horizontalSpeed *= -1;
            this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        }
    }
    
    draw() {
        // Draw enemy ship body
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        // Main body
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#ff6699';
        ctx.fillRect(this.x - 10, this.y + 10, 15, 8);
        ctx.fillRect(this.x + this.width - 5, this.y + 10, 15, 8);
        
        ctx.shadowBlur = 0;
        
        // Cockpit
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    isOffScreen() {
        return this.y > canvas.height;
    }
    
    checkCollision(bullet) {
        return bullet.x > this.x && 
               bullet.x < this.x + this.width &&
               bullet.y < this.y + this.height &&
               bullet.y + bullet.height > this.y;
    }
}

// Particle class for explosion effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.radius = Math.random() * 4 + 2;
        this.color = color;
        this.life = 1;
        this.decay = 0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.radius *= 0.96;
    }
    
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Create explosion effect
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Get bullet spawn position based on key
function getBulletPosition(key) {
    const keyUpper = key.toUpperCase();
    if (keyboardLayout.hasOwnProperty(keyUpper)) {
        const position = keyboardLayout[keyUpper];
        return (position / 10) * canvas.width + canvas.width * 0.05;
    }
    return null;
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (!gameState.running || gameState.paused) return;
    
    const key = e.key.toUpperCase();
    if (keyboardLayout.hasOwnProperty(key)) {
        const x = getBulletPosition(key);
        if (x !== null) {
            bullets.push(new Bullet(x, canvas.height - 30));
        }
    }
});

// Game loop
function gameLoop() {
    if (!gameState.running) return;
    
    if (!gameState.paused) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.isOffScreen()) {
            bullets.splice(index, 1);
        }
    });
    
    // Update enemies
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.isOffScreen()) {
            enemies.splice(index, 1);
        }
    });
    
    // Update particles
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.isDead()) {
            particles.splice(index, 1);
        }
    });
    
    // Spawn enemies
    enemySpawnTimer++;
    if (enemySpawnTimer >= enemySpawnInterval) {
        enemies.push(new Enemy());
        enemySpawnTimer = 0;
        // Gradually increase difficulty
        enemySpawnInterval = Math.max(60, enemySpawnInterval - 0.5);
    }
    
    // Check collisions
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (enemy.checkCollision(bullet)) {
                // Hit!
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ffaa00');
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                gameState.score += 10;
                updateScore();
            }
        });
    });
    
    // Check if any enemy reached bottom (game over condition)
    enemies.forEach(enemy => {
        if (enemy.y > canvas.height - 50) {
            gameOver();
        }
    });
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars background
    drawStars();
    
    // Draw particles
    particles.forEach(particle => particle.draw());
    
    // Draw bullets
    bullets.forEach(bullet => bullet.draw());
    
    // Draw enemies
    enemies.forEach(enemy => enemy.draw());
    
    // Draw keyboard indicator at bottom
    drawKeyboardIndicator();
    
    // Draw pause overlay
    if (gameState.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Draw stars in background
let stars = [];
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Move stars down
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Draw keyboard position indicator
function drawKeyboardIndicator() {
    const indicatorY = canvas.height - 20;
    const keys = Object.keys(keyboardLayout);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    keys.forEach(key => {
        const x = getBulletPosition(key);
        ctx.fillText(key, x, indicatorY);
    });
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
        document.getElementById('highScore').textContent = gameState.highScore;
    }
}

// Start game
function startGame() {
    gameState.running = true;
    gameState.paused = false;
    gameState.score = 0;
    bullets = [];
    enemies = [];
    particles = [];
    enemySpawnTimer = 0;
    enemySpawnInterval = 120;
    
    initStars();
    updateScore();
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    document.getElementById('gameOver').style.display = 'none';
    
    gameLoop();
}

// Pause game
function togglePause() {
    gameState.paused = !gameState.paused;
    document.getElementById('pauseBtn').textContent = gameState.paused ? 'Resume' : 'Pause';
}

// Game over
function gameOver() {
    gameState.running = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('startBtn').style.display = 'inline-block';
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Initialize high score display
document.getElementById('highScore').textContent = gameState.highScore;

// Draw initial canvas
initStars();
draw();

