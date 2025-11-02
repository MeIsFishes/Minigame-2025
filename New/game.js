// game.js - 游戏主控制器：整合所有系统并控制游戏循环

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 初始化玩家系统
        this.player = new Player();
        
        // 初始化科技系统
        this.techSystem = new TechSystem(this.player);
        
        // 初始化关卡系统
        this.levelSystem = new LevelSystem(this.player);
        
        // 初始化特效系统（先初始化，因为其他系统可能需要它）
        this.effectSystem = new EffectSystem(this.canvas);
        
        // 初始化各个系统
        this.weaponSystem = new WeaponSystem(this.canvas, this.player, this.effectSystem);
        this.weaponSystem.setTechSystem(this.techSystem); // 设置科技系统引用
        this.enemySystem = new EnemySystem(this.canvas, this.player); // 传入player引用用于扣血
        this.enemySystem.setLevelSystem(this.levelSystem); // 设置关卡系统引用
        this.uiSystem = new UISystem(this.weaponSystem, this.player, this.levelSystem); // 传入player和levelSystem引用
        this.menuSystem = new MenuSystem();
        this.lobbySystem = new LobbySystem(this.canvas);
        
        // 游戏状态
        this.isRunning = false;
        this.inLobby = true; // 是否在大厅界面
        this.lastTime = 0;
        this.animationFrameId = null;
        this.lobbyFrameId = null;
        
        // 设置大厅回调
        this.setupLobbyCallbacks();
        
        // 设置菜单回调
        this.setupMenuCallbacks();
        
        // 键盘事件监听
        this.setupKeyboardListeners();
        
        // 显示大厅界面
        this.showLobby();
    }
    
    // 调整画布大小
    resizeCanvas() {
        const container = document.getElementById('game-screen');
        const gameUI = document.getElementById('game-ui');
        
        // 画布占75%高度
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight * 0.75;
        
        // 如果武器系统已初始化，需要更新
        if (this.weaponSystem) {
            this.weaponSystem.canvas = this.canvas;
        }
        if (this.enemySystem) {
            this.enemySystem.canvas = this.canvas;
        }
        if (this.effectSystem) {
            this.effectSystem.canvas = this.canvas;
        }
        if (this.lobbySystem) {
            this.lobbySystem.canvas = this.canvas;
            this.lobbySystem.updateButtonPositions();
        }
        // 更新UI键位位置
        if (this.uiSystem) {
            this.uiSystem.updatePositions();
        }
    }
    
    // 设置大厅回调
    setupLobbyCallbacks() {
        this.lobbySystem.onStartGame = (levelId) => {
            this.hideLobby();
            this.startGame(levelId);
        };
    }
    
    // 设置菜单回调
    setupMenuCallbacks() {
        this.menuSystem.setStartGameCallback(() => this.startGame());
        // 游戏结束后不能直接重新开始，必须返回大厅
        this.menuSystem.setRestartGameCallback(() => this.returnToMenu());
        this.menuSystem.setReturnToMenuCallback(() => this.returnToMenu());
    }
    
    // 显示大厅
    showLobby() {
        this.inLobby = true;
        this.isRunning = false;
        
        // 取消任何正在运行的游戏循环
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.lobbySystem.activate();
        
        // 隐藏HTML菜单和游戏UI，但保持game-screen可见（画布容器）
        this.menuSystem.hideAll();
        const gameScreen = document.getElementById('game-screen');
        const gameUI = document.getElementById('game-ui');
        
        // 确保画布容器可见，但隐藏游戏UI
        gameScreen.classList.add('active');
        gameUI.style.display = 'none';
        
        // 重置时间戳
        this.lastTime = Date.now();
        
        // 开始大厅循环
        if (!this.lobbyFrameId) {
            this.lobbyLoop();
        }
    }
    
    // 隐藏大厅
    hideLobby() {
        this.inLobby = false;
        
        // 取消大厅循环
        if (this.lobbyFrameId) {
            cancelAnimationFrame(this.lobbyFrameId);
            this.lobbyFrameId = null;
        }
        
        this.lobbySystem.deactivate();
        
        // 显示游戏UI
        document.getElementById('game-ui').style.display = 'block';
    }
    
    // 大厅循环
    lobbyLoop() {
        if (!this.inLobby) {
            this.lobbyFrameId = null;
            return;
        }
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新大厅
        this.lobbySystem.update(deltaTime);
        
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制大厅
        this.lobbySystem.draw(this.ctx);
        
        // 继续循环
        this.lobbyFrameId = requestAnimationFrame(() => this.lobbyLoop());
    }
    
    // 设置键盘监听
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            
            const key = e.key.toUpperCase();
            
            // 检查是否是字母键
            if (key.length === 1 && key >= 'A' && key <= 'Z') {
                const currentTime = Date.now();
                const fired = this.weaponSystem.shoot(key, currentTime, this.enemySystem);
                
                if (fired) {
                    this.uiSystem.highlightKey(key);
                    this.playShootSound(key);
                }
            }
        });
    }
    
    // 开始游戏
    startGame(levelId = 'LEVEL_1') {
        // 重置玩家
        this.player.reset();
        
        // 设置玩家受伤回调（触发全屏闪光和音效）
        this.player.setDamageCallback((damage, currentHealth, oldHealth) => {
            // 创建红色全屏闪光
            this.effectSystem.createScreenFlash({
                color: 'rgba(255, 0, 0, 0.4)',
                duration: 150,
                fadeOut: true
            });
            
            // 播放受伤音效
            if (typeof audioSystem !== 'undefined') {
                audioSystem.playHitSound();
            }
        });
        
        // 重置所有系统
        this.weaponSystem.reset();
        this.weaponSystem.initializeWeapons(); // 重新加载玩家的武器配置
        this.enemySystem.reset();
        this.effectSystem.reset();
        this.uiSystem.reset();
        this.levelSystem.reset();
        
        // 启动指定关卡（如果未指定则使用默认关卡）
        this.levelSystem.startLevel(levelId);
        
        // 显示血量UI
        this.uiSystem.show();
        
        // 设置游戏状态
        this.isRunning = true;
        this.lastTime = Date.now();
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    // 游戏循环
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新游戏逻辑
        this.update(deltaTime, currentTime);
        
        // 渲染
        this.render();
        
        // 继续循环
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新游戏逻辑
    update(deltaTime, currentTime) {
        // 更新关卡系统
        this.levelSystem.update();
        
        // 更新武器系统
        this.weaponSystem.update(deltaTime, currentTime);
        
        // 更新敌机系统
        this.enemySystem.update(deltaTime);
        this.enemySystem.spawnEnemy(currentTime);
        
        // 检测碰撞
        this.enemySystem.checkCollisions(
            this.weaponSystem.getBullets(),
            this.weaponSystem,
            this.effectSystem
        );
        
        // 更新特效系统
        this.effectSystem.update(deltaTime);
        
        // 更新爆炸效果（旧系统，保留兼容）
        this.enemySystem.updateExplosions();
        
        // 同步分数到玩家系统
        const currentScore = this.enemySystem.getScore();
        if (currentScore > this.player.score) {
            const scoreDiff = currentScore - this.player.score;
            this.player.addScore(scoreDiff);
        }
        
        // 更新UI
        this.uiSystem.update(currentTime);
        this.uiSystem.updateScore(this.player.score);
        
        // 检查关卡是否完成
        if (this.levelSystem.levelCompleted) {
            this.endGame(true); // 关卡完成
        }
        
        // 检查游戏结束（玩家血量为0）
        if (!this.player.isAlive()) {
            this.levelSystem.failLevel(); // 关卡失败
            this.endGame(false); // 玩家死亡
        }
    }
    
    // 渲染
    render() {
        // 绘制深蓝色天空渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a1929');
        gradient.addColorStop(0.5, '#1a3a52');
        gradient.addColorStop(1, '#2a4a6a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制星空背景
        this.drawStarfield();
        
        // 绘制游戏元素
        this.weaponSystem.draw(this.ctx);
        this.enemySystem.draw(this.ctx);
        this.effectSystem.draw(this.ctx); // 绘制特效
        this.enemySystem.drawExplosions(this.ctx); // 旧特效系统（保留兼容）
    }
    
    // 绘制星空背景
    drawStarfield() {
        if (!this.stars) {
            this.stars = [];
            for (let i = 0; i < 100; i++) {
                this.stars.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 2,
                    speed: Math.random() * 0.5 + 0.1
                });
            }
        }
        
        // 更新和绘制星星
        this.ctx.fillStyle = 'white';
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
            
            this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    // 结束游戏
    endGame(levelCompleted = false) {
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // 隐藏血量UI
        this.uiSystem.hide();
        
        // 保存最终得分和奖励信息
        const finalScore = this.player.score;
        let rewards = null;
        
        // 如果关卡完成，获取奖励信息
        if (levelCompleted) {
            const levelInfo = this.levelSystem.getCurrentLevelInfo();
            console.log(`恭喜！关卡完成：${levelInfo.name}`);
            console.log(`最终得分：${finalScore}`);
            
            // 获取已经发放的奖励信息（completeLevel 已经在 update 中被自动调用）
            rewards = this.levelSystem.getLastRewards();
            
            console.log('获得奖励:', rewards);
        } else {
            console.log(`游戏失败，最终得分：${finalScore}`);
            console.log('失败不会获得奖励');
        }
        
        // 重置所有游戏系统
        this.resetGameSystems();
        
        // 显示游戏结束画面，使用玩家的最终分数和奖励信息
        this.menuSystem.showGameOver(finalScore, levelCompleted, rewards);
        
        this.playGameOverSound();
    }
    
    // 重置所有游戏系统
    resetGameSystems() {
        // 重置玩家（包括血量、分数等）
        if (this.player) {
            this.player.reset();
        }
        
        // 重置武器系统
        if (this.weaponSystem) {
            this.weaponSystem.reset();
            this.weaponSystem.initializeWeapons();
        }
        
        // 重置敌机系统
        if (this.enemySystem) {
            this.enemySystem.reset();
        }
        
        // 重置特效系统
        if (this.effectSystem) {
            this.effectSystem.reset();
        }
        
        // 重置UI系统
        if (this.uiSystem) {
            this.uiSystem.reset();
        }
    }
    
    // 返回主菜单
    returnToMenu() {
        // 停止游戏循环
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // 隐藏血量UI
        this.uiSystem.hide();
        
        // 显示大厅界面
        this.showLobby();
    }
    
    // 音效（简单的音频反馈）
    playShootSound(key) {
        // 使用Web Audio API创建简单的射击音效
        try {
            const weapon = this.weaponSystem.getWeapon(key);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 根据武器类型调整音效
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // 浏览器不支持Web Audio API
            console.log('Audio not supported');
        }
    }
    
    playGameOverSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}

// 初始化游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    window.game = game; // 设置为全局变量，供其他模块访问
});
