// player.js - 玩家系统：管理玩家数据、血量、得分和武器配置

class Player {
    constructor() {
        // 基础属性
        this.maxHealth = 10;
        this.health = 5;
        this.score = 0;
        
        // 资源系统
        this.resources = {
            iron: 0,    // 铁
            copper: 0,  // 铜
            cobalt: 0,  // 钴
            nickel: 0,  // 镍
            gold: 0     // 金
        };
        
        // 科技升级系统（局外成长）
        this.techLevels = {}; // 存储每个科技的等级 { techId: level }
        
        // 回调函数
        this.onHealthChangeCallback = null; // 血量变化时的回调
        this.onDamageCallback = null; // 受伤时的回调（用于特效和音效）
        this.onResourceChangeCallback = null; // 资源变化时的回调
        
        // 武器配置 - 按排分配
        this.weaponLoadout = {
            row1: null, // Q W E R T Y U I O P
            row2: null, // A S D F G H J K L
            row3: null  // Z X C V B N M
        };
        
        // 默认武器配置
        this.initializeDefaultLoadout();
        
        // 游戏统计
        this.stats = {
            totalShots: 0,
            totalHits: 0,
            enemiesKilled: 0,
            accuracy: 0,
            maxCombo: 0,
            currentCombo: 0,
            playTime: 0
        };
        
        // 护盾/额外能力（预留）
        this.shield = 0;
        this.maxShield = 50;
    }
    
    // 初始化默认武器配置
    initializeDefaultLoadout() {
        // 默认所有排都使用基础机枪
        this.weaponLoadout.row1 = WeaponPresets.BASIC_GUN;
        this.weaponLoadout.row2 = WeaponPresets.SNIPER;
        this.weaponLoadout.row3 = WeaponPresets.SHOTGUN;
    }
    
    // 为指定排设置武器
    setWeaponForRow(rowNumber, weaponData) {
        const rowKey = `row${rowNumber}`;
        if (this.weaponLoadout[rowKey] !== undefined) {
            this.weaponLoadout[rowKey] = weaponData;
            return true;
        }
        return false;
    }
    
    // 获取指定键位所在排的武器
    getWeaponForKey(key) {
        key = key.toUpperCase();
        
        // 第一排：Q W E R T Y U I O P
        if ('QWERTYUIOP'.includes(key)) {
            return this.weaponLoadout.row1;
        }
        // 第二排：A S D F G H J K L
        else if ('ASDFGHJKL'.includes(key)) {
            return this.weaponLoadout.row2;
        }
        // 第三排：Z X C V B N M
        else if ('ZXCVBNM'.includes(key)) {
            return this.weaponLoadout.row3;
        }
        
        return null;
    }
    
    // 获取所有武器配置
    getLoadout() {
        return {
            row1: this.weaponLoadout.row1,
            row2: this.weaponLoadout.row2,
            row3: this.weaponLoadout.row3
        };
    }
    
    // 受到伤害
    takeDamage(damage) {
        const oldHealth = this.health;
        const oldShield = this.shield;
        
        // 先扣除护盾
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, damage);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        
        // 扣除生命值
        let actualDamage = 0;
        if (damage > 0) {
            this.health = Math.max(0, this.health - damage);
            actualDamage = oldHealth - this.health;
        }
        
        // 重置连击
        this.stats.currentCombo = 0;
        
        // 如果血量发生变化，触发UI回调
        if (this.health !== oldHealth && this.onHealthChangeCallback) {
            this.onHealthChangeCallback(this.health, oldHealth, 'damage');
        }
        
        // 如果受到实际伤害，触发受伤回调（特效和音效）
        if (actualDamage > 0 && this.onDamageCallback) {
            this.onDamageCallback(actualDamage, this.health, oldHealth);
        }
        
        return this.health <= 0; // 返回是否死亡
    }
    
    // 恢复生命值
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHeal = this.health - oldHealth;
        
        // 如果血量发生变化，触发回调
        if (actualHeal > 0 && this.onHealthChangeCallback) {
            this.onHealthChangeCallback(this.health, oldHealth, 'heal');
        }
        
        return actualHeal; // 返回实际治疗量
    }
    
    // 设置血量变化回调
    setHealthChangeCallback(callback) {
        this.onHealthChangeCallback = callback;
    }
    
    // 设置受伤回调
    setDamageCallback(callback) {
        this.onDamageCallback = callback;
    }
    
    // 恢复护盾
    rechargeShield(amount) {
        this.shield = Math.min(this.maxShield, this.shield + amount);
    }
    
    // ===== 资源管理 =====
    
    // 添加资源
    addResource(resourceType, amount) {
        if (this.resources.hasOwnProperty(resourceType)) {
            const oldAmount = this.resources[resourceType];
            this.resources[resourceType] += amount;
            
            // 触发资源变化回调
            if (this.onResourceChangeCallback) {
                this.onResourceChangeCallback(resourceType, this.resources[resourceType], oldAmount);
            }
            
            return true;
        }
        return false;
    }
    
    // 消耗资源
    consumeResource(resourceType, amount) {
        if (this.resources.hasOwnProperty(resourceType) && this.resources[resourceType] >= amount) {
            const oldAmount = this.resources[resourceType];
            this.resources[resourceType] -= amount;
            
            // 触发资源变化回调
            if (this.onResourceChangeCallback) {
                this.onResourceChangeCallback(resourceType, this.resources[resourceType], oldAmount);
            }
            
            return true;
        }
        return false;
    }
    
    // 检查是否有足够的资源
    hasResource(resourceType, amount) {
        return this.resources.hasOwnProperty(resourceType) && this.resources[resourceType] >= amount;
    }
    
    // 获取资源数量
    getResource(resourceType) {
        return this.resources[resourceType] || 0;
    }
    
    // 获取所有资源
    getAllResources() {
        return { ...this.resources };
    }
    
    // 设置资源变化回调
    setResourceChangeCallback(callback) {
        this.onResourceChangeCallback = callback;
    }
    
    // ===== 科技升级管理 =====
    
    // 获取科技等级
    getTechLevel(techId) {
        return this.techLevels[techId] || 0;
    }
    
    // 设置科技等级
    setTechLevel(techId, level) {
        this.techLevels[techId] = level;
    }
    
    // 获取所有科技等级
    getAllTechLevels() {
        return { ...this.techLevels };
    }
    
    // 重置所有科技（慎用）
    resetAllTechs() {
        this.techLevels = {};
    }
    
    // ===== 分数和统计 =====
    
    // 增加分数
    addScore(points) {
        this.score += points;
    }
    
    // 增加击杀统计
    addKill() {
        this.stats.enemiesKilled++;
        this.stats.currentCombo++;
        
        // 更新最大连击
        if (this.stats.currentCombo > this.stats.maxCombo) {
            this.stats.maxCombo = this.stats.currentCombo;
        }
    }
    
    // 增加射击统计
    addShot() {
        this.stats.totalShots++;
    }
    
    // 增加命中统计
    addHit() {
        this.stats.totalHits++;
        this.updateAccuracy();
    }
    
    // 更新准确率
    updateAccuracy() {
        if (this.stats.totalShots > 0) {
            this.stats.accuracy = (this.stats.totalHits / this.stats.totalShots * 100).toFixed(2);
        }
    }
    
    // 检查是否存活
    isAlive() {
        return this.health > 0;
    }
    
    // 获取生命值百分比
    getHealthPercentage() {
        return (this.health / this.maxHealth * 100);
    }
    
    // 获取护盾百分比
    getShieldPercentage() {
        return (this.shield / this.maxShield * 100);
    }
    
    // 获取玩家状态摘要
    getStatus() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            healthPercentage: this.getHealthPercentage(),
            shield: this.shield,
            maxShield: this.maxShield,
            shieldPercentage: this.getShieldPercentage(),
            score: this.score,
            combo: this.stats.currentCombo,
            resources: this.getAllResources()
        };
    }
    
    // 获取统计数据
    getStats() {
        return {
            ...this.stats,
            score: this.score
        };
    }
    
    // 重置玩家状态（开始新游戏时调用）
    reset() {
        const oldHealth = this.health;
        this.health = 5; // 重置为初始血量5
        this.shield = 0;
        this.score = 0;
        
        // 重置统计
        this.stats = {
            totalShots: 0,
            totalHits: 0,
            enemiesKilled: 0,
            accuracy: 0,
            maxCombo: 0,
            currentCombo: 0,
            playTime: 0
        };
        
        // 触发血量变化回调（用于更新UI）
        if (this.health !== oldHealth && this.onHealthChangeCallback) {
            this.onHealthChangeCallback(this.health, oldHealth, 'reset');
        }
        
        // 保持武器配置不变
    }
    
    // 保存玩家配置到本地存储
    saveLoadout() {
        const loadoutData = {
            row1: this.weaponLoadout.row1?.name || 'BASIC_GUN',
            row2: this.weaponLoadout.row2?.name || 'BASIC_GUN',
            row3: this.weaponLoadout.row3?.name || 'BASIC_GUN'
        };
        
        try {
            localStorage.setItem('playerLoadout', JSON.stringify(loadoutData));
            return true;
        } catch (e) {
            console.error('Failed to save loadout:', e);
            return false;
        }
    }
    
    // 从本地存储加载玩家配置
    loadLoadout() {
        try {
            const savedData = localStorage.getItem('playerLoadout');
            if (savedData) {
                const loadoutData = JSON.parse(savedData);
                
                // 根据武器名称恢复武器配置
                // 这里需要一个武器名称到武器对象的映射
                // 暂时使用默认配置
                console.log('Loaded loadout:', loadoutData);
                return true;
            }
        } catch (e) {
            console.error('Failed to load loadout:', e);
        }
        return false;
    }
    
    // 导出玩家数据（用于存档）
    exportData() {
        return {
            maxHealth: this.maxHealth,
            health: this.health,
            score: this.score,
            resources: this.getAllResources(),
            techLevels: this.getAllTechLevels(),
            weaponLoadout: {
                row1: this.weaponLoadout.row1?.name,
                row2: this.weaponLoadout.row2?.name,
                row3: this.weaponLoadout.row3?.name
            },
            stats: this.stats
        };
    }
    
    // 导入玩家数据（用于读档）
    importData(data) {
        if (!data) return false;
        
        try {
            this.health = data.health || this.maxHealth;
            this.score = data.score || 0;
            
            // 导入资源数据
            if (data.resources) {
                this.resources = { ...this.resources, ...data.resources };
            }
            
            // 导入科技等级数据
            if (data.techLevels) {
                this.techLevels = { ...data.techLevels };
            }
            
            if (data.stats) {
                this.stats = { ...this.stats, ...data.stats };
            }
            
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
}
