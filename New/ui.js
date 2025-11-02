// ui.js - UI系统：处理游戏内UI和键盘冷却显示

class UISystem {
    constructor(weaponSystem, player = null, levelSystem = null) {
        this.weaponSystem = weaponSystem;
        this.player = player;
        this.levelSystem = levelSystem;
        this.keyboardUIContainer = document.getElementById('keyboard-ui');
        this.scoreDisplay = document.getElementById('score');
        this.keyButtons = {};
        
        // 创建血量显示
        this.createHealthDisplay();
        
        // 创建关卡倒计时显示
        this.createLevelTimerDisplay();
        
        this.initializeKeyboardUI();
    }
    
    // 设置关卡系统引用
    setLevelSystem(levelSystem) {
        this.levelSystem = levelSystem;
    }
    
    // 创建血量显示
    createHealthDisplay() {
        // 检查是否已存在血量显示
        let healthDisplay = document.getElementById('health-display');
        if (!healthDisplay) {
            healthDisplay = document.createElement('div');
            healthDisplay.id = 'health-display';
            healthDisplay.style.position = 'fixed'; // 使用fixed定位相对于整个视口
            healthDisplay.style.top = '15px';
            healthDisplay.style.left = '15px';
            healthDisplay.style.fontSize = '28px';
            healthDisplay.style.fontWeight = 'normal';
            healthDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
            healthDisplay.style.zIndex = '1000';
            healthDisplay.style.letterSpacing = '2px'; // 爱心之间的间距
            healthDisplay.style.userSelect = 'none'; // 防止选中
            healthDisplay.style.display = 'none'; // 默认隐藏
            document.body.appendChild(healthDisplay); // 直接添加到body
        }
        
        this.healthDisplay = healthDisplay;
        this.updateHealthDisplay();
        
        // 设置玩家血量变化回调
        if (this.player) {
            this.player.setHealthChangeCallback((newHealth, oldHealth, type) => {
                this.updateHealthDisplay();
            });
        }
    }
    
    // 创建关卡倒计时显示
    createLevelTimerDisplay() {
        // 检查是否已存在倒计时显示
        let timerDisplay = document.getElementById('level-timer-display');
        if (!timerDisplay) {
            timerDisplay = document.createElement('div');
            timerDisplay.id = 'level-timer-display';
            timerDisplay.style.position = 'fixed';
            timerDisplay.style.top = '15px';
            timerDisplay.style.left = '50%';
            timerDisplay.style.transform = 'translateX(-50%)';
            timerDisplay.style.fontSize = '32px';
            timerDisplay.style.fontWeight = 'bold';
            timerDisplay.style.color = '#FFFFFF';
            timerDisplay.style.textShadow = '3px 3px 6px rgba(0,0,0,0.8)';
            timerDisplay.style.zIndex = '1000';
            timerDisplay.style.userSelect = 'none';
            timerDisplay.style.display = 'none'; // 默认隐藏
            timerDisplay.style.padding = '10px 30px';
            timerDisplay.style.background = 'linear-gradient(135deg, rgba(0, 150, 255, 0.3), rgba(0, 100, 200, 0.3))';
            timerDisplay.style.borderRadius = '25px';
            timerDisplay.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            timerDisplay.style.backdropFilter = 'blur(10px)';
            document.body.appendChild(timerDisplay);
        }
        
        this.timerDisplay = timerDisplay;
    }
    
    // 显示血量UI
    show() {
        if (this.healthDisplay) {
            this.healthDisplay.style.display = 'block';
            
            // 确保回调已设置（防止在构造时player为null的情况）
            if (this.player && !this.player.onHealthChangeCallback) {
                this.player.setHealthChangeCallback((newHealth, oldHealth, type) => {
                    this.updateHealthDisplay();
                });
            }
            
            // 立即更新一次显示
            this.updateHealthDisplay();
        }
        
        // 显示倒计时
        if (this.timerDisplay) {
            this.timerDisplay.style.display = 'block';
        }
    }
    
    // 隐藏血量UI
    hide() {
        if (this.healthDisplay) {
            this.healthDisplay.style.display = 'none';
        }
        
        // 隐藏倒计时
        if (this.timerDisplay) {
            this.timerDisplay.style.display = 'none';
        }
    }
    
    // 更新血量显示
    updateHealthDisplay() {
        if (this.healthDisplay && this.player) {
            const health = Math.ceil(this.player.health); // 向上取整显示
            const maxHealth = this.player.maxHealth;
            
            // 用爱心图标表示血量
            let heartDisplay = '';
            
            // 显示当前血量（红心）
            for (let i = 0; i < health; i++) {
                heartDisplay += '❤️';
            }
            
            // 显示失去的血量（空心）
            for (let i = health; i < maxHealth; i++) {
                heartDisplay += '🤍';
            }
            
            this.healthDisplay.textContent = heartDisplay;
            
            // 根据血量改变颜色/透明度
            if (health <= 2) {
                this.healthDisplay.style.opacity = '1';
                this.healthDisplay.style.filter = 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.8))';
            } else if (health <= 4) {
                this.healthDisplay.style.opacity = '1';
                this.healthDisplay.style.filter = 'drop-shadow(0 0 3px rgba(255, 136, 0, 0.5))';
            } else {
                this.healthDisplay.style.opacity = '0.9';
                this.healthDisplay.style.filter = 'none';
            }
        }
    }
    
    // 更新UI位置（用于窗口大小改变时）
    updatePositions() {
        const layout = this.weaponSystem.getKeyboardLayout();
        
        layout.forEach((row, rowIndex) => {
            row.forEach(key => {
                const button = this.keyButtons[key];
                if (button) {
                    // 重新计算该键在游戏画布中的X位置
                    const canvasX = this.weaponSystem.getKeyPosition(key);
                    button.style.left = `${canvasX}px`;
                }
            });
        });
    }
    
    // 初始化键盘UI
    initializeKeyboardUI() {
        this.keyboardUIContainer.innerHTML = '';
        this.keyboardUIContainer.style.position = 'relative';
        this.keyboardUIContainer.style.width = '100%';
        this.keyboardUIContainer.style.height = '100%';
        
        const layout = this.weaponSystem.getKeyboardLayout();
        const canvas = this.weaponSystem.canvas;
        const uiContainer = document.getElementById('game-ui');
        
        // 为每一排创建容器
        layout.forEach((row, rowIndex) => {
            row.forEach(key => {
                const keyButton = this.createKeyButton(key, rowIndex);
                this.keyButtons[key] = keyButton;
                
                // 获取该键在游戏画布中的X位置
                const canvasX = this.weaponSystem.getKeyPosition(key);
                
                // 计算在UI容器中的相对位置
                // UI容器宽度与canvas宽度相同
                const uiX = canvasX;
                
                // 使用绝对定位，精确对应画布位置
                keyButton.style.position = 'absolute';
                keyButton.style.left = `${uiX}px`;
                keyButton.style.transform = 'translateX(-50%)'; // 居中对齐
                
                // 根据行号设置Y位置（三排分布）
                const rowY = 10 + rowIndex * 80; // 每排间隔80px（增大间距）
                keyButton.style.top = `${rowY}px`;
                
                this.keyboardUIContainer.appendChild(keyButton);
            });
        });
    }
    
    // 创建单个键按钮
    createKeyButton(key, rowIndex) {
        const button = document.createElement('div');
        button.className = 'key-button ready';
        button.textContent = key;
        button.dataset.key = key;
        
        // 获取武器信息并设置颜色
        const weapon = this.weaponSystem.getWeapon(key);
        button.dataset.weaponColor = weapon.color;
        this.updateButtonColor(button, weapon.color, true);
        
        // 添加冷却遮罩
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay';
        button.appendChild(cooldownOverlay);
        
        // 点击事件（用于鼠标点击发射）
        button.addEventListener('click', () => {
            this.triggerKeyPress(key);
        });
        
        return button;
    }
    
    // 触发键盘按下（用于鼠标点击）
    triggerKeyPress(key) {
        // 创建模拟键盘事件
        const event = new KeyboardEvent('keydown', { key: key });
        document.dispatchEvent(event);
    }
    
    // 更新键盘UI状态
    update(currentTime) {
        // 不再在update中更新血量显示，改为通过回调触发
        
        Object.keys(this.keyButtons).forEach(key => {
            const button = this.keyButtons[key];
            const cooldownInfo = this.weaponSystem.getCooldownInfo(key);
            const weapon = this.weaponSystem.getWeapon(key);
            const overlay = button.querySelector('.cooldown-overlay');
            
            if (cooldownInfo.ready) {
                button.className = 'key-button ready';
                this.updateButtonColor(button, weapon.color, true);
                overlay.style.height = '0%';
            } else {
                button.className = 'key-button cooldown';
                this.updateButtonColor(button, weapon.color, false);
                const percentage = (cooldownInfo.remainingTime / weapon.cooldown) * 100;
                overlay.style.height = `${percentage}%`;
            }
        });
        
        // 更新关卡倒计时
        this.updateLevelTimer();
    }
    
    // 更新关卡倒计时显示
    updateLevelTimer() {
        if (!this.timerDisplay || !this.levelSystem) return;
        
        const levelInfo = this.levelSystem.getCurrentLevelInfo();
        if (!levelInfo || !levelInfo.isActive) {
            this.timerDisplay.style.display = 'none';
            return;
        }
        
        this.timerDisplay.style.display = 'block';
        
        const remainingTime = levelInfo.remainingTime;
        if (remainingTime === Infinity) {
            // 无尽模式
            this.timerDisplay.textContent = '∞ 无尽模式';
            this.timerDisplay.style.color = '#FFD700';
        } else {
            // 转换为分:秒格式
            const totalSeconds = Math.ceil(remainingTime / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            this.timerDisplay.textContent = `⏱️ ${timeString}`;
            
            // 根据剩余时间改变颜色
            if (totalSeconds <= 10) {
                this.timerDisplay.style.color = '#FF4444';
                this.timerDisplay.style.animation = 'pulse 0.5s infinite';
            } else if (totalSeconds <= 30) {
                this.timerDisplay.style.color = '#FF8800';
                this.timerDisplay.style.animation = 'none';
            } else {
                this.timerDisplay.style.color = '#FFFFFF';
                this.timerDisplay.style.animation = 'none';
            }
        }
    }
    
    // 更新按钮颜色
    updateButtonColor(button, weaponColor, isReady) {
        if (isReady) {
            // 就绪状态：使用武器颜色的亮色版本
            button.style.background = `linear-gradient(135deg, ${weaponColor}DD 0%, ${weaponColor}AA 100%)`;
            button.style.borderColor = weaponColor;
        } else {
            // 冷却状态：使用灰色
            button.style.background = 'linear-gradient(135deg, #757575 0%, #424242 100%)';
            button.style.borderColor = '#616161';
        }
    }
    
    // 更新分数显示
    updateScore(score) {
        this.scoreDisplay.textContent = score;
        
        // 分数增加时的动画效果
        this.scoreDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.scoreDisplay.style.transform = 'scale(1)';
        }, 200);
    }
    
    // 高亮按下的键
    highlightKey(key) {
        const button = this.keyButtons[key.toUpperCase()];
        if (button) {
            // 保持居中对齐的同时添加缩放效果
            button.style.transform = 'translateX(-50%) scale(0.9)';
            setTimeout(() => {
                button.style.transform = 'translateX(-50%) scale(1)';
            }, 100);
        }
    }
    
    // 重置UI
    reset() {
        this.updateScore(0);
        this.refreshWeaponColors(); // 刷新武器颜色
        Object.keys(this.keyButtons).forEach(key => {
            const button = this.keyButtons[key];
            button.className = 'key-button ready';
            const overlay = button.querySelector('.cooldown-overlay');
            overlay.style.height = '0%';
        });
    }
    
    // 刷新所有键位的武器颜色
    refreshWeaponColors() {
        Object.keys(this.keyButtons).forEach(key => {
            const button = this.keyButtons[key];
            const weapon = this.weaponSystem.getWeapon(key);
            button.dataset.weaponColor = weapon.color;
            this.updateButtonColor(button, weapon.color, true);
        });
    }
    
    // 显示提示信息
    showMessage(message, duration = 2000) {
        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.background = 'rgba(0, 0, 0, 0.8)';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '20px 40px';
        messageDiv.style.borderRadius = '10px';
        messageDiv.style.fontSize = '2rem';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.animation = 'fadeInOut 0.5s';
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, duration);
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -60%); }
        20% { opacity: 1; transform: translate(-50%, -50%); }
        80% { opacity: 1; transform: translate(-50%, -50%); }
        100% { opacity: 0; transform: translate(-50%, -40%); }
    }
    
    #score {
        transition: transform 0.2s;
    }
`;
document.head.appendChild(style);
