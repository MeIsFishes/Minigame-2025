// ============================================
// 玩家系统
// ============================================
const PlayerSystem = {
    // 玩家状态
    hp: 5,
    maxHp: 10,
    
    // 初始化玩家
    init() {
        this.hp = 5; // 初始5点血量
    },
    
    // 玩家受到伤害
    takeDamage(damage = 1) {
        this.hp -= damage;
        
        // 确保血量不为负数
        if (this.hp < 0) {
            this.hp = 0;
        }
        
        // 更新UI
        UISystem.updatePlayerHealth();
        
        // 检查是否游戏结束
        if (this.hp <= 0) {
            this.gameOver();
        }
        
        return this.hp;
    },
    
    // 玩家回血
    heal(amount) {
        this.hp += amount;
        
        // 确保不超过最大血量
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        
        // 更新UI
        UISystem.updatePlayerHealth();
        
        return this.hp;
    },
    
    // 游戏结束
    gameOver() {
        Game.gameRunning = false;
        
        // 停止游戏循环
        if (Game.animationFrame) {
            cancelAnimationFrame(Game.animationFrame);
        }
        
        // 停止敌机生成
        Game.stopEnemySpawning();
        
        // 显示游戏结束UI（可以后续扩展）
        UISystem.showGameOver();
    },
    
    // 重新开始游戏
    restart() {
        this.hp = this.maxHp;
        UISystem.updatePlayerHealth();
        Game.gameRunning = true;
        Game.startEnemySpawning();
        Game.gameLoop();
    },
    
    // 获取当前血量
    getHp() {
        return this.hp;
    },
    
    // 获取最大血量
    getMaxHp() {
        return this.maxHp;
    }
};

