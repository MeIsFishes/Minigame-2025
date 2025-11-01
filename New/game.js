// ============================================
// 游戏常量
// ============================================
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 2;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 20;
const ENEMY_WIDTH = 75;
const ENEMY_HEIGHT = 35;

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
        return bullet.x < enemy.x + enemy.width &&
               bullet.x + bullet.width > enemy.x &&
               bullet.y < enemy.y + enemy.height &&
               bullet.y + bullet.height > enemy.y;
    },

    // 处理碰撞
    handleCollision(bullet, enemy) {
        // 对敌机造成伤害
        const isKilled = EnemySystem.takeDamage(enemy, bullet.damage);

        // 检查是否为穿透炮
        const weapon = WeaponSystem.getWeapon(bullet.key);
        const isPiercing = weapon && weapon.pierceCount && weapon.pierceCount > 1;

        if (isPiercing && bullet.pierceCount > 1) {
            // 穿透炮：减少穿透次数，继续飞行
            bullet.pierceCount--;
            bullet.damage = Math.max(1, Math.floor(bullet.damage * 0.7)); // 每次穿透伤害衰减
        } else {
            // 普通子弹或穿透次数用完：移除子弹
            BulletSystem.remove(bullet);
        }

        // 如果敌机被击杀
        if (isKilled) {
            // 创建爆炸效果
            EffectSystem.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);

            // 更新分数
            UISystem.addScore(bullet.damage);

            // 获取敌机类型配置
            const enemyType = EnemySystem.getEnemyType(enemy.type);

            // 处理击杀回血
            if (enemyType.killHeal > 0) {
                PlayerSystem.heal(enemyType.killHeal);
            }

            // 处理击杀掉落升级（预留）
            if (enemyType.killUpgrade) {
                // TODO: 实现掉落升级逻辑
                // UpgradeSystem.dropUpgrade(enemy.x, enemy.y, enemyType.killUpgrade);
            }

            // 移除敌机
            EnemySystem.remove(enemy);
        }
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
// 游戏主循环
// ============================================
const Game = {
    gameRunning: true,
    animationFrame: null,
    enemySpawnInterval: null,

    // 初始化游戏
    init() {
        // 初始化玩家系统
        PlayerSystem.init();

        // 初始化武器系统
        WeaponSystem.init();

        // 初始化UI系统
        UISystem.init();

        // 开始生成敌机
        this.startEnemySpawning();

        // 开始游戏循环
        this.gameLoop();
    },

    // 开始敌机生成
    startEnemySpawning() {
        // 清除现有的定时器（如果存在）
        if (this.enemySpawnInterval) {
            clearInterval(this.enemySpawnInterval);
        }
        
        // 开始生成敌机
        this.enemySpawnInterval = setInterval(() => {
            if (this.gameRunning) {
                EnemySystem.createEnemy();
            }
        }, 2000);
    },

    // 停止敌机生成
    stopEnemySpawning() {
        if (this.enemySpawnInterval) {
            clearInterval(this.enemySpawnInterval);
            this.enemySpawnInterval = null;
        }
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
