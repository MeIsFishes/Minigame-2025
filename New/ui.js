// ============================================
// UI系统
// ============================================
const UISystem = {
    // DOM 元素
    gameArea: null,
    scoreValue: null,
    instructions: null,
    keyboardUI: null,
    playerHealthContainer: null,

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

        // 创建玩家血量UI
        this.createPlayerHealthUI();

        // 隐藏说明文字
        setTimeout(() => {
            this.instructions.style.display = 'none';
        }, 3000);

        // 绑定事件监听
        this.bindEvents();

        // 初始化键位颜色
        this.initKeyColors();
    },

    // 创建玩家血量UI
    createPlayerHealthUI() {
        // 创建血量容器
        this.playerHealthContainer = document.createElement('div');
        this.playerHealthContainer.id = 'player-health-container';
        document.body.appendChild(this.playerHealthContainer);

        // 创建血量标题
        const healthLabel = document.createElement('div');
        healthLabel.id = 'player-health-label';
        healthLabel.textContent = '生命值:';
        this.playerHealthContainer.appendChild(healthLabel);

        // 创建血量显示容器
        const healthDisplay = document.createElement('div');
        healthDisplay.id = 'player-health-display';
        this.playerHealthContainer.appendChild(healthDisplay);

        // 初始化血量显示
        this.updatePlayerHealth();
    },

    // 更新玩家血量UI
    updatePlayerHealth() {
        if (!this.playerHealthContainer) return;

        const healthDisplay = this.playerHealthContainer.querySelector('#player-health-display');
        if (!healthDisplay) return;

        // 清空现有血量图标
        healthDisplay.innerHTML = '';

        const maxHp = PlayerSystem.getMaxHp();
        const currentHp = PlayerSystem.getHp();

        // 创建血量图标
        for (let i = 0; i < maxHp; i++) {
            const heart = document.createElement('div');
            heart.className = 'player-heart';
            
            if (i < currentHp) {
                heart.classList.add('full');
            } else {
                heart.classList.add('empty');
            }
            
            healthDisplay.appendChild(heart);
        }
    },

    // 显示游戏结束
    showGameOver() {
        // 创建游戏结束提示
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'game-over';
        gameOverDiv.innerHTML = `
            <div class="game-over-content">
                <h2>游戏结束</h2>
                <p>最终得分: ${this.score}</p>
                <button id="restart-button">重新开始</button>
            </div>
        `;
        document.body.appendChild(gameOverDiv);

        // 绑定重新开始按钮
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
    },

    // 重新开始游戏
    restartGame() {
        // 移除游戏结束UI
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.remove();
        }

        // 重置分数
        this.score = 0;
        this.updateScore();

        // 清空所有敌机和子弹
        EnemySystem.enemies.forEach(enemy => {
            if (enemy.element && enemy.element.parentNode) {
                gameArea.removeChild(enemy.element);
            }
        });
        EnemySystem.enemies = [];

        BulletSystem.bullets.forEach(bullet => {
            if (bullet.element && bullet.element.parentNode) {
                gameArea.removeChild(bullet.element);
            }
        });
        BulletSystem.bullets = [];

        // 重置玩家并重新开始游戏
        PlayerSystem.restart();
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

    // 初始化所有键位颜色
    initKeyColors() {
        // 获取所有按键元素
        const keyElements = document.querySelectorAll('.key');

        keyElements.forEach(keyElement => {
            const key = keyElement.dataset.key;
            const weapon = WeaponSystem.getWeapon(key);

            if (weapon && weapon.color) {
                // 设置键位颜色（基于武器颜色）
                keyElement.style.setProperty('--weapon-color', weapon.color);
                keyElement.style.setProperty('--weapon-color-light', this.adjustColorBrightness(weapon.color, 0.3));
            }
        });
    },

    // 更新按键冷却UI
    updateKeyCooldownUI(key) {
        const keyElement = document.querySelector(`.key[data-key="${key}"]`);
        const weapon = WeaponSystem.getWeapon(key);

        if (keyElement && weapon) {
            // 确保颜色已设置（以防万一）
            keyElement.style.setProperty('--weapon-color', weapon.color);
            keyElement.style.setProperty('--weapon-color-light', this.adjustColorBrightness(weapon.color, 0.3));

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

