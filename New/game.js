// 游戏常量
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 2;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 20;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;

// 武器系统数据结构
const WEAPONS = {
    // 第一排键位：速射炮 (Q~P)
    rapid_fire: {
        name: "速射炮",
        damage: 8,            // 攻击力
        cooldown: 2500,       // 冷却时间（毫秒）- 较短
        bulletCount: 1,       // 单次射击数量
        shotCount: 1,         // 射击次数（连发）
        shotInterval: 150,    // 射击间隔（毫秒）
        sound: "rapid_fire",  // 射击音效
        bulletSize: 2.0,      // 子弹大小倍数
        centerLineOffset: 0,   // 中心线散射角（度数）
        bulletSpreadAngle: 0, // 子弹散射角（度数）
        trackingSpeed: 0      // 追踪角速度（度/帧）
    },

    // 第二排键位：机枪 (A~L)
    machine_gun: {
        name: "机枪",
        damage: 4,            // 攻击力 - 较低
        cooldown: 8000,       // 冷却时间（毫秒）- 较长
        bulletCount: 1,       // 单次射击数量
        shotCount: 6,         // 射击次数（5轮）
        shotInterval: 60,    // 射击间隔（毫秒）
        sound: "machine_gun", // 射击音效
        bulletSize: 1,      // 子弹大小倍数
        centerLineOffset: 0,   // 中心线散射角（度数）
        bulletSpreadAngle: 15, // 子弹散射角（度数）
        trackingSpeed: 0      // 追踪角速度（度/帧）
    },

    // 第三排键位：霰弹 (Z~M)
    shotgun: {
        name: "霰弹",
        damage: 2,            // 攻击力 - 较低但多发
        cooldown: 12000,      // 冷却时间（毫秒）- 极长
        bulletCount: 10,       // 单次射击数量 - 5发
        shotCount: 1,         // 射击次数
        shotInterval: 0,      // 射击间隔
        sound: "shotgun",     // 射击音效
        bulletSize: 0.6,      // 子弹大小倍数
        centerLineOffset: 40,   // 中心线散射角（度数）
        bulletSpreadAngle: 5, // 子弹散射角（度数）
        trackingSpeed: 0      // 追踪角速度（度/帧）
    }
};

// 键位到武器的映射
const KEY_WEAPONS = {
    // 第一排：速射炮
    'q': WEAPONS.rapid_fire, 'w': WEAPONS.rapid_fire, 'e': WEAPONS.rapid_fire, 'r': WEAPONS.rapid_fire,
    't': WEAPONS.rapid_fire, 'y': WEAPONS.rapid_fire, 'u': WEAPONS.rapid_fire, 'i': WEAPONS.rapid_fire,
    'o': WEAPONS.rapid_fire, 'p': WEAPONS.rapid_fire,

    // 第二排：机枪
    'a': WEAPONS.machine_gun, 's': WEAPONS.machine_gun, 'd': WEAPONS.machine_gun, 'f': WEAPONS.machine_gun,
    'g': WEAPONS.machine_gun, 'h': WEAPONS.machine_gun, 'j': WEAPONS.machine_gun, 'k': WEAPONS.machine_gun,
    'l': WEAPONS.machine_gun,

    // 第三排：霰弹
    'z': WEAPONS.shotgun, 'x': WEAPONS.shotgun, 'c': WEAPONS.shotgun, 'v': WEAPONS.shotgun,
    'b': WEAPONS.shotgun, 'n': WEAPONS.shotgun, 'm': WEAPONS.shotgun
};

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
    if (!position) return { x: GAME_WIDTH / 2, y: GAME_HEIGHT * 0.7 };

    // 计算网格单元的大小（键盘占四分之一）
    const gridCols = 10;
    const cellWidth = GAME_WIDTH / gridCols;

    // 子弹发射位置：X轴跟随按键位置，Y轴固定在键盘UI上方
    const x = (position.col + 0.5) * cellWidth - BULLET_WIDTH / 2;
    const y = GAME_HEIGHT * 0.7; // 固定在键盘UI上方发射

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
    const weapon = KEY_WEAPONS[key];

    if (!weapon) return; // 无效按键

    // 检查按键是否在冷却中
    if (keyCooldowns[key] && now < keyCooldowns[key]) {
        return; // 还在冷却中
    }

    // 使用对应武器发射子弹
    fireWeapon(key, weapon);

    // 设置冷却时间
    keyCooldowns[key] = now + weapon.cooldown;

    // 更新UI显示冷却状态
    updateKeyCooldownUI(key);
}

// 创建子弹（从对应按键位置发射）
function createBullet(key, weapon, baseAngle) {
    // 从对应按键位置发射
    const spawnPos = getBulletSpawnPosition(key);

    // 计算子弹散射角度（围绕调整后的中心线）
    const spreadRad = (weapon.bulletSpreadAngle * Math.PI / 180); // 转换为弧度
    const randomSpread = (Math.random() - 0.5) * spreadRad * 2; // 在散射范围内随机
    const finalAngle = baseAngle + randomSpread;

    // 计算子弹大小
    const bulletWidth = Math.round(BULLET_WIDTH * weapon.bulletSize);
    const bulletHeight = Math.round(BULLET_HEIGHT * weapon.bulletSize);

    const bullet = {
        x: spawnPos.x - (bulletWidth - BULLET_WIDTH) / 2, // 居中调整
        y: spawnPos.y - (bulletHeight - BULLET_HEIGHT) / 2,
        vx: Math.cos(finalAngle) * BULLET_SPEED, // X轴速度
        vy: Math.sin(finalAngle) * BULLET_SPEED, // Y轴速度
        angle: finalAngle,       // 当前角度
        damage: weapon.damage,   // 子弹伤害
        width: bulletWidth,      // 子弹宽度
        height: bulletHeight,    // 子弹高度
        trackingSpeed: weapon.trackingSpeed, // 追踪角速度
        targetEnemy: null,       // 追踪的目标敌机
        element: null
    };

    // 创建DOM元素
    bullet.element = document.createElement('div');
    bullet.element.className = 'bullet';

    // 设置子弹大小
    bullet.element.style.width = bulletWidth + 'px';
    bullet.element.style.height = bulletHeight + 'px';

    // 根据武器类型设置不同的视觉效果
    if (weapon.name === "霰弹") {
        bullet.element.style.background = 'linear-gradient(45deg, #ff6600, #ff3300)';
        bullet.element.style.boxShadow = '0 0 6px #ff6600';
    } else if (weapon.name === "机枪") {
        bullet.element.style.background = 'linear-gradient(45deg, #ffaa00, #ff8800)';
        bullet.element.style.boxShadow = '0 0 4px #ffaa00';
    } else {
        bullet.element.style.background = '#ffff00';
        bullet.element.style.boxShadow = '0 0 5px #ffff00';
    }

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
    // 随机生成高度：游戏区域（上75%）内随机
    const gameAreaHeight = GAME_HEIGHT * 0.75;
    const y = Math.random() * (gameAreaHeight - ENEMY_HEIGHT);

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

        // 处理追踪逻辑（只有霰弹有追踪能力）
        if (bullet.trackingSpeed > 0) {
            updateBulletTracking(bullet);
        }

        // 更新位置
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // 检查是否超出屏幕边界
        if (bullet.x < -bullet.width || bullet.x > GAME_WIDTH ||
            bullet.y < -bullet.height || bullet.y > GAME_HEIGHT) {
            gameArea.removeChild(bullet.element);
            bullets.splice(i, 1);
        } else {
            bullet.element.style.left = bullet.x + 'px';
            bullet.element.style.top = bullet.y + 'px';
        }
    }
}

// 更新子弹追踪逻辑
function updateBulletTracking(bullet) {
    // 寻找最近的敌机
    let nearestEnemy = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
        const dx = enemy.x + ENEMY_WIDTH/2 - bullet.x - BULLET_WIDTH/2;
        const dy = enemy.y + ENEMY_HEIGHT/2 - bullet.y - BULLET_HEIGHT/2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    }

    if (nearestEnemy) {
        // 计算目标角度
        const dx = nearestEnemy.x + ENEMY_WIDTH/2 - bullet.x - BULLET_WIDTH/2;
        const dy = nearestEnemy.y + ENEMY_HEIGHT/2 - bullet.y - BULLET_HEIGHT/2;
        const targetAngle = Math.atan2(dy, dx);

        // 计算角度差
        let angleDiff = targetAngle - bullet.angle;

        // 归一化角度差到 [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // 限制转向速度
        const maxTurn = bullet.trackingSpeed * Math.PI / 180; // 转换为弧度
        angleDiff = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

        // 更新角度
        bullet.angle += angleDiff;

        // 更新速度向量
        bullet.vx = Math.cos(bullet.angle) * BULLET_SPEED;
        bullet.vy = Math.sin(bullet.angle) * BULLET_SPEED;
    }
}

// 更新敌机位置
function updateEnemies() {
    const gameAreaHeight = GAME_HEIGHT / 2;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x += enemy.direction * enemy.speed;

        // 边界检查 - 只在游戏区域（上半部分）内移动
        if (enemy.x <= 0 || enemy.x >= GAME_WIDTH - ENEMY_WIDTH) {
            enemy.direction *= -1;
            enemy.x = Math.max(0, Math.min(GAME_WIDTH - ENEMY_WIDTH, enemy.x));
        }

        // 如果敌机超出游戏区域，从数组中移除
        if (enemy.y < -ENEMY_HEIGHT) {
            gameArea.removeChild(enemy.element);
            enemies.splice(i, 1);
            continue;
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
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + ENEMY_HEIGHT &&
                bullet.y + bullet.height > enemy.y) {

                // 碰撞发生
                createExplosion(enemy.x + ENEMY_WIDTH/2, enemy.y + ENEMY_HEIGHT/2);
                score += bullet.damage; // 使用子弹的伤害值
                updateScore();

                // 移除子弹和敌机
                gameArea.removeChild(bullet.element);
                gameArea.removeChild(enemy.element);
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break; // 每个子弹只能击中一个敌机
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

// 武器发射函数
function fireWeapon(key, weapon) {
    let shotFired = 0;

    // 射击函数
    const fireShot = () => {
        if (shotFired >= weapon.shotCount) return;

        // 计算这一轮的基础角度（向上发射加上中心线偏移）
        const baseAngle = -Math.PI / 2 + ((Math.random() - 0.5) * weapon.centerLineOffset * Math.PI / 180);

        // 创建指定数量的子弹
        for (let i = 0; i < weapon.bulletCount; i++) {
            createBullet(key, weapon, baseAngle);
        }

        shotFired++;

        // 如果还有射击次数，设置下一个射击的定时器
        if (shotFired < weapon.shotCount) {
            setTimeout(fireShot, weapon.shotInterval);
        }
    };

    // 开始第一发射击
    fireShot();

    // 播放音效（预留接口）
    playSound(weapon.sound);
}

// 播放音效（预留接口）
function playSound(soundName) {
    // 这里可以添加音效播放逻辑
    // 例如: new Audio(`sounds/${soundName}.mp3`).play();
    console.log(`播放音效: ${soundName}`);
}

// 更新按键冷却UI
function updateKeyCooldownUI(key) {
    const keyElement = document.querySelector(`.key[data-key="${key}"]`);
    const weapon = KEY_WEAPONS[key];

    if (keyElement && weapon) {
        // 强制重新开始动画：先移除class，再重新添加
        keyElement.classList.remove('cooldown');
        // 触发重绘
        void keyElement.offsetWidth;

        // 设置冷却动画时间CSS变量
        keyElement.style.setProperty('--cooldown-duration', weapon.cooldown + 'ms');

        keyElement.classList.add('cooldown');

        // 根据武器冷却时间移除冷却状态
        setTimeout(() => {
            if (keyElement.classList.contains('cooldown')) {
                keyElement.classList.remove('cooldown');
            }
        }, weapon.cooldown);
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
                // 清理CSS变量
                keyElement.style.removeProperty('--cooldown-duration');
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
