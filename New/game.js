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

                // 检查该子弹是否已经击中过这个敌人
                if (bullet.hitEnemies.has(enemy.id)) {
                    continue; // 跳过已经击中过的敌人
                }

                if (this.isColliding(bullet, enemy)) {
                    // 碰撞发生 - 记录击中并处理碰撞
                    bullet.hitEnemies.add(enemy.id);
                    this.handleCollision(bullet, enemy);

                    // 如果是普通子弹（非穿透），立即停止检测其他敌人
                    if (bullet.pierceCount <= 1) {
                        break;
                    }
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

        // 如果子弹有爆炸范围，触发爆炸效果
        if (bullet.explosionRadius > 0) {
            this.triggerExplosion(bullet, enemy);
            bullet.hasExploded = true; // 标记为已爆炸，避免在remove时重复爆炸
        }

        // 处理穿透逻辑
        bullet.pierceCount--;

        // 如果穿透次数用完或不是穿透炮，移除子弹
        if (bullet.pierceCount <= 0) {
            BulletSystem.remove(bullet);
        } else {
            // 穿透炮：伤害衰减，继续飞行
            bullet.damage = Math.max(1, Math.floor(bullet.damage * 0.7));
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
    },

    // 触发爆炸效果
    triggerExplosion(bullet, hitEnemy) {
        // 爆炸中心点（击中敌人的中心）
        const explosionX = hitEnemy.x + hitEnemy.width / 2;
        const explosionY = hitEnemy.y + hitEnemy.height / 2;
        const radius = bullet.explosionRadius;

        // 创建子弹爆炸视觉效果（与敌机爆炸不同）
        EffectSystem.createBulletExplosion(explosionX, explosionY, bullet.explosionRadius, bullet.color);

        // 对范围内的其他敌人造成爆炸伤害
        for (const enemy of EnemySystem.enemies) {
            // 跳过已经直接击中的敌人（避免重复伤害）
            if (enemy.id === hitEnemy.id) continue;

            // 检查敌人是否在爆炸范围内
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const distance = Math.sqrt(
                Math.pow(enemyCenterX - explosionX, 2) +
                Math.pow(enemyCenterY - explosionY, 2)
            );

            if (distance <= radius) {
                // 对范围内的敌人造成爆炸伤害
                const isExplosionKill = EnemySystem.takeDamage(enemy, bullet.damage);

                // 如果爆炸击杀了敌人
                if (isExplosionKill) {
                    // 更新分数（爆炸击杀也算分数）
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
        }
    }
};

// ============================================
// 特效系统
// ============================================
const EffectSystem = {
    // 创建敌机爆炸效果
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
    },

    // 创建子弹爆炸效果
    createBulletExplosion(x, y, explosionRadius = 50, bulletColor = '#ffffff') {
        const explosion = document.createElement('div');
        explosion.className = 'bullet-explosion';

        // 根据爆炸半径调整爆炸效果大小
        const explosionSize = Math.max(30, explosionRadius * 0.8); // 最小30px，最大根据半径调整
        explosion.style.width = explosionSize + 'px';
        explosion.style.height = explosionSize + 'px';
        explosion.style.left = (x - explosionSize / 2) + 'px';
        explosion.style.top = (y - explosionSize / 2) + 'px';

        // 根据子弹颜色设置爆炸颜色
        const lighterColor = this.adjustColorBrightness(bulletColor, 0.4);
        const darkerColor = this.adjustColorBrightness(bulletColor, -0.2);
        explosion.style.background = `radial-gradient(circle, ${lighterColor}, ${bulletColor}, ${darkerColor}, transparent)`;

        gameArea.appendChild(explosion);

        // 动画结束后移除
        setTimeout(() => {
            if (explosion.parentNode) {
                gameArea.removeChild(explosion);
            }
        }, 300); // 子弹爆炸持续时间更短
    },

    // 调整颜色亮度（辅助函数）
    adjustColorBrightness(hex, percent) {
        // 将hex转换为rgb
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // 调整亮度
        const newR = Math.max(0, Math.min(255, Math.round(r * (1 + percent))));
        const newG = Math.max(0, Math.min(255, Math.round(g * (1 + percent))));
        const newB = Math.max(0, Math.min(255, Math.round(b * (1 + percent))));

        // 转换回hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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

        // 开始游戏循环
        this.gameLoop();
    },
    
    StartEnemySpawning() {
        this.startEnemySpawning();
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
