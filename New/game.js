// ============================================
// 游戏常量
// ============================================
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 2;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 20;
const ENEMY_WIDTH = 50;
const ENEMY_HEIGHT = 40;

// ============================================
// 武器系统
// ============================================
const WeaponSystem = {
    // 武器配置数据
    WEAPONS: {
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
    },

    // 键位到武器的映射
    KEY_WEAPONS: {
        // 第一排：速射炮
        'q': null, 'w': null, 'e': null, 'r': null,
        't': null, 'y': null, 'u': null, 'i': null,
        'o': null, 'p': null,

        // 第二排：机枪
        'a': null, 's': null, 'd': null, 'f': null,
        'g': null, 'h': null, 'j': null, 'k': null,
        'l': null,

        // 第三排：霰弹
        'z': null, 'x': null, 'c': null, 'v': null,
        'b': null, 'n': null, 'm': null
    },

    // 初始化键位映射
    init() {
        // 第一排：速射炮
        for (const key of ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']) {
            this.KEY_WEAPONS[key] = this.WEAPONS.rapid_fire;
        }
        // 第二排：机枪
        for (const key of ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']) {
            this.KEY_WEAPONS[key] = this.WEAPONS.machine_gun;
        }
        // 第三排：霰弹
        for (const key of ['z', 'x', 'c', 'v', 'b', 'n', 'm']) {
            this.KEY_WEAPONS[key] = this.WEAPONS.shotgun;
        }
    },

    // 获取武器配置
    getWeapon(key) {
        return this.KEY_WEAPONS[key] || null;
    },

    // 发射武器
    fireWeapon(key, weapon) {
        let shotFired = 0;

        // 射击函数
        const fireShot = () => {
            if (shotFired >= weapon.shotCount) return;

            // 计算这一轮的基础角度（向上发射加上中心线偏移）
            const baseAngle = -Math.PI / 2 + ((Math.random() - 0.5) * weapon.centerLineOffset * Math.PI / 180);

            // 创建指定数量的子弹
            for (let i = 0; i < weapon.bulletCount; i++) {
                BulletSystem.createBullet(key, weapon, baseAngle);
            }

            shotFired++;

            // 如果还有射击次数，设置下一个射击的定时器
            if (shotFired < weapon.shotCount) {
                setTimeout(fireShot, weapon.shotInterval);
            }
        };

        // 开始第一发射击
        fireShot();

        // 播放音效
        this.playSound(weapon.sound);
    },

    // 播放音效（预留接口）
    playSound(soundName) {
        // 这里可以添加音效播放逻辑
        // 例如: new Audio(`sounds/${soundName}.mp3`).play();
        console.log(`播放音效: ${soundName}`);
    }
};

// ============================================
// 子弹系统
// ============================================
const BulletSystem = {
    bullets: [],

    // 按键位置映射（网格中的行列位置）
    keyPositions: {
        'q': { row: 0, col: 0 }, 'w': { row: 0, col: 1 }, 'e': { row: 0, col: 2 }, 'r': { row: 0, col: 3 },
        't': { row: 0, col: 4 }, 'y': { row: 0, col: 5 }, 'u': { row: 0, col: 6 }, 'i': { row: 0, col: 7 },
        'o': { row: 0, col: 8 }, 'p': { row: 0, col: 9 },
        'a': { row: 1, col: 0 }, 's': { row: 1, col: 1 }, 'd': { row: 1, col: 2 }, 'f': { row: 1, col: 3 },
        'g': { row: 1, col: 4 }, 'h': { row: 1, col: 5 }, 'j': { row: 1, col: 6 }, 'k': { row: 1, col: 7 },
        'l': { row: 1, col: 8 },
        'z': { row: 2, col: 1 }, 'x': { row: 2, col: 2 }, 'c': { row: 2, col: 3 }, 'v': { row: 2, col: 4 },
        'b': { row: 2, col: 5 }, 'n': { row: 2, col: 6 }, 'm': { row: 2, col: 7 }
    },

    // 计算按键发射位置
    getBulletSpawnPosition(key) {
        const position = this.keyPositions[key];
        if (!position) return { x: GAME_WIDTH / 2, y: GAME_HEIGHT * 0.7 };

        // 计算网格单元的大小（键盘占四分之一）
        const gridCols = 10;
        const cellWidth = GAME_WIDTH / gridCols;

        // 子弹发射位置：X轴跟随按键位置，Y轴固定在键盘UI上方
        const x = (position.col + 0.5) * cellWidth - BULLET_WIDTH / 2;
        const y = GAME_HEIGHT * 0.7; // 固定在键盘UI上方发射

        return { x, y };
    },

    // 创建子弹（从对应按键位置发射）
    createBullet(key, weapon, baseAngle) {
        // 从对应按键位置发射
        const spawnPos = this.getBulletSpawnPosition(key);

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
        this.setBulletStyle(bullet.element, weapon.name);

        bullet.element.style.left = bullet.x + 'px';
        bullet.element.style.top = bullet.y + 'px';
        gameArea.appendChild(bullet.element);

        this.bullets.push(bullet);
    },

    // 设置子弹样式
    setBulletStyle(element, weaponName) {
        if (weaponName === "霰弹") {
            element.style.background = 'linear-gradient(45deg, #ff6600, #ff3300)';
            element.style.boxShadow = '0 0 6px #ff6600';
        } else if (weaponName === "机枪") {
            element.style.background = 'linear-gradient(45deg, #ffaa00, #ff8800)';
            element.style.boxShadow = '0 0 4px #ffaa00';
        } else {
            element.style.background = '#ffff00';
            element.style.boxShadow = '0 0 5px #ffff00';
        }
    },

    // 更新子弹位置
    update() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // 处理追踪逻辑（只有霰弹有追踪能力）
            if (bullet.trackingSpeed > 0) {
                this.updateTracking(bullet);
            }

            // 更新位置
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // 检查是否超出屏幕边界
            if (bullet.x < -bullet.width || bullet.x > GAME_WIDTH ||
                bullet.y < -bullet.height || bullet.y > GAME_HEIGHT) {
                gameArea.removeChild(bullet.element);
                this.bullets.splice(i, 1);
            } else {
                bullet.element.style.left = bullet.x + 'px';
                bullet.element.style.top = bullet.y + 'px';
            }
        }
    },

    // 更新子弹追踪逻辑
    updateTracking(bullet) {
        // 寻找最近的敌机
        let nearestEnemy = null;
        let minDistance = Infinity;

        for (const enemy of EnemySystem.enemies) {
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
    },

    // 移除子弹
    remove(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            if (bullet.element && bullet.element.parentNode) {
                gameArea.removeChild(bullet.element);
            }
            this.bullets.splice(index, 1);
        }
    }
};

// ============================================
// 敌机系统
// ============================================
const EnemySystem = {
    enemies: [],

    // 创建敌机
    createEnemy() {
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
        
        // 根据方向设置朝向
        // direction为1表示向右移动，应该面朝右
        // direction为-1表示向左移动，应该面朝左
        if (direction === 1) {
            enemy.element.classList.add('facing-right');
        } else {
            enemy.element.classList.add('facing-left');
        }
        
        // 添加尾翼元素
        const wing = document.createElement('div');
        wing.className = 'wing';
        enemy.element.appendChild(wing);
        
        // 添加上下机翼装饰
        const wingTop = document.createElement('div');
        wingTop.className = 'wing-top';
        enemy.element.appendChild(wingTop);
        
        const wingBottom = document.createElement('div');
        wingBottom.className = 'wing-bottom';
        enemy.element.appendChild(wingBottom);
        
        enemy.element.style.left = enemy.x + 'px';
        enemy.element.style.top = enemy.y + 'px';
        gameArea.appendChild(enemy.element);

        this.enemies.push(enemy);
    },

    // 更新敌机位置
    update() {
        const gameAreaHeight = GAME_HEIGHT / 2;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.x += enemy.direction * enemy.speed;

            // 边界检查 - 只在游戏区域（上半部分）内移动
            if (enemy.x <= 0 || enemy.x >= GAME_WIDTH - ENEMY_WIDTH) {
                enemy.direction *= -1;
                enemy.x = Math.max(0, Math.min(GAME_WIDTH - ENEMY_WIDTH, enemy.x));
                
                // 更新朝向
                enemy.element.classList.remove('facing-left', 'facing-right');
                if (enemy.direction === 1) {
                    enemy.element.classList.add('facing-right');
                } else {
                    enemy.element.classList.add('facing-left');
                }
            }

            // 如果敌机超出游戏区域，从数组中移除
            if (enemy.y < -ENEMY_HEIGHT) {
                gameArea.removeChild(enemy.element);
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.element.style.left = enemy.x + 'px';
        }
    },

    // 移除敌机
    remove(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            if (enemy.element && enemy.element.parentNode) {
                gameArea.removeChild(enemy.element);
            }
            this.enemies.splice(index, 1);
        }
    }
};

// ============================================
// 碰撞检测系统
// ============================================
const CollisionSystem = {
    // 检测碰撞
    checkCollisions() {
        for (let i = BulletSystem.bullets.length - 1; i >= 0; i--) {
            const bullet = BulletSystem.bullets[i];

            for (let j = EnemySystem.enemies.length - 1; j >= 0; j--) {
                const enemy = EnemySystem.enemies[j];

                if (this.isColliding(bullet, enemy)) {
                    // 碰撞发生
                    this.handleCollision(bullet, enemy);
                    break; // 每个子弹只能击中一个敌机
                }
            }
        }
    },

    // 检测两个对象是否碰撞
    isColliding(bullet, enemy) {
        return bullet.x < enemy.x + ENEMY_WIDTH &&
               bullet.x + bullet.width > enemy.x &&
               bullet.y < enemy.y + ENEMY_HEIGHT &&
               bullet.y + bullet.height > enemy.y;
    },

    // 处理碰撞
    handleCollision(bullet, enemy) {
        // 创建爆炸效果
        EffectSystem.createExplosion(enemy.x + ENEMY_WIDTH/2, enemy.y + ENEMY_HEIGHT/2);
        
        // 更新分数
        UISystem.addScore(bullet.damage);

        // 移除子弹和敌机
        BulletSystem.remove(bullet);
        EnemySystem.remove(enemy);
    }
};

// ============================================
// 特效系统
// ============================================
const EffectSystem = {
    // 创建爆炸效果
    createExplosion(x, y) {
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
};

// ============================================
// UI系统
// ============================================
const UISystem = {
    // DOM 元素
    gameArea: null,
    scoreValue: null,
    instructions: null,
    keyboardUI: null,

    // 游戏状态
    score: 0,

    // 可用的按键
    availableKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],

    // 按键冷却状态跟踪
    keyCooldowns: {},

    // 初始化UI
    init() {
        this.gameArea = document.getElementById('game-area');
        this.scoreValue = document.getElementById('score-value');
        this.instructions = document.getElementById('instructions');
        this.keyboardUI = document.getElementById('keyboard-ui');

        // 更新全局变量引用
        gameArea = this.gameArea;

        // 隐藏说明文字
        setTimeout(() => {
            this.instructions.style.display = 'none';
        }, 3000);

        // 绑定事件监听
        this.bindEvents();
    },

    // 绑定事件监听
    bindEvents() {
        // 键盘事件监听
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();

            if (this.availableKeys.includes(key)) {
                event.preventDefault();
                this.tryShootBullet(key);
            }
        });

        // 键盘UI点击事件监听
        this.keyboardUI.addEventListener('click', (event) => {
            const keyElement = event.target.closest('.key');
            if (keyElement) {
                const key = keyElement.dataset.key;
                this.tryShootBullet(key);
            }
        });
    },

    // 尝试发射子弹（检查冷却）
    tryShootBullet(key) {
        const now = Date.now();
        const weapon = WeaponSystem.getWeapon(key);

        if (!weapon) return; // 无效按键

        // 检查按键是否在冷却中
        if (this.keyCooldowns[key] && now < this.keyCooldowns[key]) {
            return; // 还在冷却中
        }

        // 使用对应武器发射子弹
        WeaponSystem.fireWeapon(key, weapon);

        // 设置冷却时间
        this.keyCooldowns[key] = now + weapon.cooldown;

        // 更新UI显示冷却状态
        this.updateKeyCooldownUI(key);
    },

    // 更新按键冷却UI
    updateKeyCooldownUI(key) {
        const keyElement = document.querySelector(`.key[data-key="${key}"]`);
        const weapon = WeaponSystem.getWeapon(key);

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
    },

    // 更新所有按键的冷却状态（在游戏循环中调用）
    updateCooldowns() {
        const now = Date.now();

        for (const key of this.availableKeys) {
            const keyElement = document.querySelector(`.key[data-key="${key}"]`);

            if (this.keyCooldowns[key] && now >= this.keyCooldowns[key]) {
                // 冷却结束
                if (keyElement && keyElement.classList.contains('cooldown')) {
                    keyElement.classList.remove('cooldown');
                    // 清理CSS变量
                    keyElement.style.removeProperty('--cooldown-duration');
                }
                delete this.keyCooldowns[key];
            }
        }
    },

    // 添加分数
    addScore(points) {
        this.score += points;
        this.updateScore();
    },

    // 更新分数显示
    updateScore() {
        this.scoreValue.textContent = this.score;
    }
};

// ============================================
// 游戏主循环
// ============================================
const Game = {
    gameRunning: true,
    animationFrame: null,

    // 初始化游戏
    init() {
        // 初始化武器系统
        WeaponSystem.init();

        // 初始化UI系统
        UISystem.init();

        // 开始生成敌机
        setInterval(() => {
            EnemySystem.createEnemy();
        }, 2000);

        // 开始游戏循环
        this.gameLoop();
    },

    // 游戏主循环
    gameLoop() {
        if (this.gameRunning) {
            BulletSystem.update();
            EnemySystem.update();
            UISystem.updateCooldowns(); // 更新按键冷却状态
            CollisionSystem.checkCollisions();

            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
};

// ============================================
// 全局变量（用于兼容性）
// ============================================
let gameArea = null;
let score = 0;
let bullets = [];
let enemies = [];

// ============================================
// 窗口大小改变时调整游戏尺寸
// ============================================
window.addEventListener('resize', () => {
    // 可以在这里添加响应式调整逻辑
});

// ============================================
// 启动游戏
// ============================================
// 等待DOM加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
