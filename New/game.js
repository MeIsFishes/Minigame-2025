// 游戏常量
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 2;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 20;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;

// 游戏状态
let score = 0;
let bullets = [];
let enemies = [];
let gameRunning = true;
let animationFrame;

// 按键冷却状态跟踪
let keyCooldowns = {};

// DOM 元素
const gameArea = document.getElementById('game-area');
const scoreValue = document.getElementById('score-value');
const instructions = document.getElementById('instructions');
const keyboardUI = document.getElementById('keyboard-ui');

// 可用的按键
const availableKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];

// 按键位置映射（网格中的行列位置）
const keyPositions = {
    'q': { row: 0, col: 0 }, 'w': { row: 0, col: 1 }, 'e': { row: 0, col: 2 }, 'r': { row: 0, col: 3 },
    't': { row: 0, col: 4 }, 'y': { row: 0, col: 5 }, 'u': { row: 0, col: 6 }, 'i': { row: 0, col: 7 },
    'o': { row: 0, col: 8 }, 'p': { row: 0, col: 9 },
    'a': { row: 1, col: 0 }, 's': { row: 1, col: 1 }, 'd': { row: 1, col: 2 }, 'f': { row: 1, col: 3 },
    'g': { row: 1, col: 4 }, 'h': { row: 1, col: 5 }, 'j': { row: 1, col: 6 }, 'k': { row: 1, col: 7 },
    'l': { row: 1, col: 8 },
    'z': { row: 2, col: 1 }, 'x': { row: 2, col: 2 }, 'c': { row: 2, col: 3 }, 'v': { row: 2, col: 4 },
    'b': { row: 2, col: 5 }, 'n': { row: 2, col: 6 }, 'm': { row: 2, col: 7 }
};

// 计算按键发射位置
function getBulletSpawnPosition(key) {
    const position = keyPositions[key];
    if (!position) return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 };

    // 计算网格单元的大小
    const gridCols = 10;
    const gridRows = 3;
    const cellWidth = GAME_WIDTH / gridCols;
    const cellHeight = GAME_HEIGHT / gridRows;

    // 计算发射位置（按键中心位置）
    const x = (position.col + 0.5) * cellWidth - BULLET_WIDTH / 2;
    const y = (position.row + 0.5) * cellHeight - BULLET_HEIGHT / 2;

    return { x, y };
}

// 初始化游戏
function init() {
    // 隐藏说明文字
    setTimeout(() => {
        instructions.style.display = 'none';
    }, 3000);

    // 开始生成敌机
    setInterval(createEnemy, 2000);

    // 开始游戏循环
    gameLoop();
}

// 键盘事件监听
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (availableKeys.includes(key)) {
        event.preventDefault();
        tryShootBullet(key);
    }
});

// 键盘UI点击事件监听
keyboardUI.addEventListener('click', (event) => {
    const keyElement = event.target.closest('.key');
    if (keyElement) {
        const key = keyElement.dataset.key;
        tryShootBullet(key);
    }
});

// 尝试发射子弹（检查冷却）
function tryShootBullet(key) {
    const now = Date.now();

    // 检查按键是否在冷却中
    if (keyCooldowns[key] && now < keyCooldowns[key]) {
        return; // 还在冷却中
    }

    // 发射子弹
    createBullet(key);

    // 设置冷却时间（8秒）
    keyCooldowns[key] = now + 8000;

    // 更新UI显示冷却状态
    updateKeyCooldownUI(key);
}

// 创建子弹（从对应按键位置发射）
function createBullet(key) {
    // 从对应按键位置发射
    const spawnPos = getBulletSpawnPosition(key);

    const bullet = {
        x: spawnPos.x,
        y: spawnPos.y,
        element: null
    };

    // 创建DOM元素
    bullet.element = document.createElement('div');
    bullet.element.className = 'bullet';
    bullet.element.style.left = bullet.x + 'px';
    bullet.element.style.top = bullet.y + 'px';
    gameArea.appendChild(bullet.element);

    bullets.push(bullet);
}

// 创建敌机
function createEnemy() {
    const x = Math.random() * (GAME_WIDTH - ENEMY_WIDTH);
    const direction = Math.random() > 0.5 ? 1 : -1;
    // 随机速度：1-4之间的随机数
    const speed = 1 + Math.random() * 3;
    // 随机生成高度：顶部1/4区域内随机
    const y = Math.random() * (GAME_HEIGHT * 0.25);

    const enemy = {
        x: x,
        y: y,
        direction: direction,
        speed: speed,
        element: null
    };

    // 创建DOM元素
    enemy.element = document.createElement('div');
    enemy.element.className = 'enemy';
    enemy.element.style.left = enemy.x + 'px';
    enemy.element.style.top = enemy.y + 'px';
    gameArea.appendChild(enemy.element);

    enemies.push(enemy);
}

// 更新子弹位置
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= BULLET_SPEED;

        if (bullet.y < -BULLET_HEIGHT) {
            // 子弹超出屏幕，移除
            gameArea.removeChild(bullet.element);
            bullets.splice(i, 1);
        } else {
            bullet.element.style.top = bullet.y + 'px';
        }
    }
}

// 更新敌机位置
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x += enemy.direction * enemy.speed;

        // 边界检查
        if (enemy.x <= 0 || enemy.x >= GAME_WIDTH - ENEMY_WIDTH) {
            enemy.direction *= -1;
            enemy.x = Math.max(0, Math.min(GAME_WIDTH - ENEMY_WIDTH, enemy.x));
        }

        enemy.element.style.left = enemy.x + 'px';
    }
}

// 碰撞检测
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            if (bullet.x < enemy.x + ENEMY_WIDTH &&
                bullet.x + BULLET_WIDTH > enemy.x &&
                bullet.y < enemy.y + ENEMY_HEIGHT &&
                bullet.y + BULLET_HEIGHT > enemy.y) {

                // 碰撞发生
                createExplosion(enemy.x + ENEMY_WIDTH/2, enemy.y + ENEMY_HEIGHT/2);
                score += 10;
                updateScore();

                // 移除子弹和敌机
                gameArea.removeChild(bullet.element);
                gameArea.removeChild(enemy.element);
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }
}

// 创建爆炸效果
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = (x - 30) + 'px';
    explosion.style.top = (y - 30) + 'px';
    gameArea.appendChild(explosion);

    // 动画结束后移除
    setTimeout(() => {
        if (explosion.parentNode) {
            gameArea.removeChild(explosion);
        }
    }, 500);
}

// 更新分数显示
function updateScore() {
    scoreValue.textContent = score;
}

// 更新按键冷却UI
function updateKeyCooldownUI(key) {
    const keyElement = document.querySelector(`.key[data-key="${key}"]`);
    if (keyElement) {
        keyElement.classList.add('cooldown');

        // 8秒后移除冷却状态
        setTimeout(() => {
            keyElement.classList.remove('cooldown');
        }, 8000);
    }
}

// 更新所有按键的冷却状态（在游戏循环中调用）
function updateCooldowns() {
    const now = Date.now();

    for (const key of availableKeys) {
        const keyElement = document.querySelector(`.key[data-key="${key}"]`);

        if (keyCooldowns[key] && now >= keyCooldowns[key]) {
            // 冷却结束
            if (keyElement && keyElement.classList.contains('cooldown')) {
                keyElement.classList.remove('cooldown');
            }
            delete keyCooldowns[key];
        }
    }
}

// 游戏主循环
function gameLoop() {
    if (gameRunning) {
        updateBullets();
        updateEnemies();
        updateCooldowns(); // 更新按键冷却状态
        checkCollisions();

        animationFrame = requestAnimationFrame(gameLoop);
    }
}

// 窗口大小改变时调整游戏尺寸
window.addEventListener('resize', () => {
    // 可以在这里添加响应式调整逻辑
});

// 启动游戏
init();
