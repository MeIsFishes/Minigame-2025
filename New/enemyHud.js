// enemyHud.js - 敌机HUD系统：管理敌机血条显示

/**
 * 敌机血条类
 */
class EnemyHealthBar {
    constructor(enemy) {
        this.enemy = enemy;
        this.visible = true;
        
        // 缓存的血条数据（由敌机的takeDamage/heal方法更新）
        this.cachedHealthRatio = enemy.cachedHealthRatio || 1.0;
        this.cachedHealthColor = enemy.cachedHealthColor || '#00FF00';
        
        // 血条样式配置
        this.barHeight = 4;
        this.barOffsetY = -10; // 血条相对于敌机顶部的偏移
        this.backgroundColor = '#333333';
        
        // 注册到敌机的健康变化事件
        this.setupHealthListeners();
    }
    
    /**
     * 设置健康变化监听器
     */
    setupHealthListeners() {
        // 保存原始的takeDamage和heal方法
        const originalTakeDamage = this.enemy.takeDamage;
        const originalHeal = this.enemy.heal;
        
        // 包装takeDamage方法，添加血条更新
        this.enemy.takeDamage = (damage, callback) => {
            const result = originalTakeDamage.call(this.enemy, damage, callback);
            // 更新血条缓存
            this.updateCache();
            return result;
        };
        
        // 包装heal方法，添加血条更新
        this.enemy.heal = (amount, callback) => {
            const result = originalHeal.call(this.enemy, amount, callback);
            // 更新血条缓存
            this.updateCache();
            return result;
        };
    }
    
    /**
     * 更新缓存数据
     */
    updateCache() {
        this.cachedHealthRatio = this.enemy.cachedHealthRatio;
        this.cachedHealthColor = this.enemy.cachedHealthColor;
    }
    
    /**
     * 绘制血条
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    draw(ctx) {
        if (!this.visible || !this.enemy.isAlive) {
            return;
        }
        
        const barWidth = this.enemy.width;
        const barX = this.enemy.x;
        const barY = this.enemy.y + this.barOffsetY;
        
        ctx.save();
        ctx.shadowBlur = 0;
        
        // 背景
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(barX, barY, barWidth, this.barHeight);
        
        // 血量
        ctx.fillStyle = this.cachedHealthColor;
        ctx.fillRect(barX, barY, barWidth * this.cachedHealthRatio, this.barHeight);
        
        // 护盾条（如果有护盾）
        if (this.enemy.maxShield > 0) {
            const shieldRatio = Math.max(0, Math.min(1, this.enemy.shield / this.enemy.maxShield));
            const shieldBarY = barY - this.barHeight - 2; // 护盾条在血条上方
            
            // 护盾背景（深灰色）
            ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
            ctx.fillRect(barX, shieldBarY, barWidth, this.barHeight);
            
            // 护盾值（渐变蓝色）
            if (shieldRatio > 0) {
                const gradient = ctx.createLinearGradient(barX, shieldBarY, barX + barWidth * shieldRatio, shieldBarY);
                gradient.addColorStop(0, 'rgba(0, 180, 255, 0.9)');
                gradient.addColorStop(1, 'rgba(0, 120, 220, 0.9)');
                ctx.fillStyle = gradient;
                ctx.fillRect(barX, shieldBarY, barWidth * shieldRatio, this.barHeight);
                
                // 护盾发光效果
                ctx.shadowColor = 'rgba(0, 180, 255, 0.5)';
                ctx.shadowBlur = 3;
                ctx.fillRect(barX, shieldBarY, barWidth * shieldRatio, this.barHeight);
                ctx.shadowBlur = 0;
            }
            
            // 护盾边框（亮蓝色）
            ctx.strokeStyle = 'rgba(120, 220, 255, 0.95)';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, shieldBarY, barWidth, this.barHeight);
        }
        
        ctx.restore();
    }
    
    /**
     * 显示血条
     */
    show() {
        this.visible = true;
    }
    
    /**
     * 隐藏血条
     */
    hide() {
        this.visible = false;
    }
    
    /**
     * 销毁血条（清理引用）
     */
    destroy() {
        this.enemy = null;
    }
}

/**
 * 敌机HUD管理器
 */
class EnemyHudManager {
    constructor() {
        this.healthBars = new Map(); // 使用Map存储敌机ID到血条的映射
    }
    
    /**
     * 为敌机创建血条
     * @param {Object} enemy - 敌机对象
     * @returns {EnemyHealthBar} 创建的血条对象
     */
    createHealthBar(enemy) {
        if (!enemy || enemy.id === undefined || enemy.id === null) {
            console.warn('Invalid enemy object for health bar creation');
            return null;
        }
        
        // 如果已存在，先移除
        if (this.healthBars.has(enemy.id)) {
            this.removeHealthBar(enemy.id);
        }
        
        const healthBar = new EnemyHealthBar(enemy);
        this.healthBars.set(enemy.id, healthBar);
        
        return healthBar;
    }
    
    /**
     * 移除血条
     * @param {number} enemyId - 敌机ID
     */
    removeHealthBar(enemyId) {
        const healthBar = this.healthBars.get(enemyId);
        if (healthBar) {
            healthBar.destroy();
            this.healthBars.delete(enemyId);
        }
    }
    
    /**
     * 获取敌机的血条
     * @param {number} enemyId - 敌机ID
     * @returns {EnemyHealthBar|null} 血条对象
     */
    getHealthBar(enemyId) {
        return this.healthBars.get(enemyId) || null;
    }
    
    /**
     * 绘制所有血条
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    drawAll(ctx) {
        this.healthBars.forEach(healthBar => {
            healthBar.draw(ctx);
        });
    }
    
    /**
     * 清理所有血条
     */
    clear() {
        this.healthBars.forEach(healthBar => healthBar.destroy());
        this.healthBars.clear();
    }
    
    /**
     * 清理死亡敌机的血条
     * @param {Array} enemies - 当前存活的敌机数组
     */
    cleanupDeadEnemies(enemies) {
        const aliveEnemyIds = new Set(enemies.map(e => e.id));
        
        // 删除不在存活列表中的血条
        for (const [enemyId, healthBar] of this.healthBars) {
            if (!aliveEnemyIds.has(enemyId)) {
                healthBar.destroy();
                this.healthBars.delete(enemyId);
            }
        }
    }
    
    /**
     * 获取当前血条数量
     * @returns {number} 血条数量
     */
    getCount() {
        return this.healthBars.size;
    }
    
    /**
     * 显示所有血条
     */
    showAll() {
        this.healthBars.forEach(healthBar => healthBar.show());
    }
    
    /**
     * 隐藏所有血条
     */
    hideAll() {
        this.healthBars.forEach(healthBar => healthBar.hide());
    }
}

// 创建全局单例
const enemyHudManager = new EnemyHudManager();
