// slot.js - 键位强化系统：管理玩家键位的强化因子

// 强化因子数据结构
class EnhancementFactor {
    constructor(config) {
        this.id = config.id; // 唯一标识符
        this.name = config.name; // 因子名称
        this.description = config.description; // 因子描述
        this.purchaseCost = config.purchaseCost || {}; // 购买消耗 { iron: 0, copper: 0, cobalt: 0, nickel: 0, gold: 0 }
        this.enhancements = config.enhancements || {}; // 强化属性及强化量（绝对值加法）
        this.cooldownReduction = config.cooldownReduction || 0; // 冷却时间百分比减少（0-1之间的值，如0.2表示-20%）
        this.appliedValue = null; // 记录实际应用的数值变化（装配时计算并存储）
    }
    
    // 获取强化效果描述
    getEffectDescription() {
        const effects = [];
        
        // 绝对值强化
        for (const [key, value] of Object.entries(this.enhancements)) {
            const sign = value >= 0 ? '+' : '';
            effects.push(`${key}: ${sign}${value}`);
        }
        
        // 百分比冷却缩减
        if (this.cooldownReduction > 0) {
            effects.push(`冷却: -${Math.round(this.cooldownReduction * 100)}%`);
        }
        
        return effects.join(', ');
    }
    
    // 检查是否可以购买
    canPurchase(player) {
        if (!player) return false;
        
        for (const [resourceType, amount] of Object.entries(this.purchaseCost)) {
            if (!player.hasResource(resourceType, amount)) {
                return false;
            }
        }
        return true;
    }
}

// 预设强化因子库
const EnhancementFactors = {
    // ===== 爆炸强化 =====
    EXPLOSION_RADIUS: new EnhancementFactor({
        id: 'EXPLOSION_RADIUS',
        name: '高爆弹药',
        description: '增加该键位武器爆炸范围 +40',
        purchaseCost: { iron: 10, copper: 10 },
        enhancements: {
            explosionRadius: 40
        }
    }),

    EXPLOSION_RADIUS_LARGE: new EnhancementFactor({
        id: 'EXPLOSION_RADIUS_LARGE',
        name: '实验级火药',
        description: '大幅增加该键位武器爆炸范围 +60',
        purchaseCost: { iron: 200, copper: 200, nickel: 15 },
        enhancements: {
            explosionRadius: 60
        }
    }),
    
    // ===== 子弹数量强化 =====
    BULLETS_PER_SHOT: new EnhancementFactor({
        id: 'BULLETS_PER_SHOT',
        name: '加装炮管',
        description: '增加该键位武器单轮子弹数 +1',
        purchaseCost: { iron: 100, copper: 30 },
        enhancements: {
            bulletsPerShot: 1
        }
    }),
    
    // ===== 伤害强化 =====
    DAMAGE_BOOST: new EnhancementFactor({
        id: 'DAMAGE_BOOST',
        name: '穿甲弹',
        description: '增加该键位武器伤害 +1',
        purchaseCost: { iron: 25, copper: 25 },
        enhancements: {
            damage: 1
        }
    }),
    
    // ===== 子弹尺寸强化 =====
    BULLET_SIZE: new EnhancementFactor({
        id: 'BULLET_SIZE',
        name: '扩大口径',
        description: '增加该键位子弹尺寸 宽度+10 长度+20',
        purchaseCost: { iron: 30, copper: 10 },
        enhancements: {
            bulletWidth: 10,
            bulletHeight: 20
        }
    }),

    BULLET_SIZE_LARGE: new EnhancementFactor({
        id: 'BULLET_SIZE_LARGE',
        name: '实验级炮口',
        description: '大幅增加该键位子弹尺寸 宽度+30 长度+20',
        purchaseCost: { iron: 150, copper: 100, nickel: 20 },
        enhancements: {
            bulletWidth: 30,
            bulletHeight: 20
        }
    }),
    
    // ===== 冷却时间强化 =====
    COOLDOWN_REDUCTION: new EnhancementFactor({
        id: 'COOLDOWN_REDUCTION',
        name: '改进水冷技术',
        description: '减少该键位武器冷却时间 -20%',
        purchaseCost: { iron: 30, copper: 30 },
        enhancements: {},
        cooldownReduction: 0.2  // 20% 减少
    }),
    
    COOLDOWN_REDUCTION_40: new EnhancementFactor({
        id: 'COOLDOWN_REDUCTION_40',
        name: '液氮冷却系统',
        description: '减少该键位武器冷却时间 -40%',
        purchaseCost: { iron: 60, copper: 60, cobalt: 10 },
        enhancements: {},
        cooldownReduction: 0.4  // 40% 减少
    }),
    
    COOLDOWN_REDUCTION_50: new EnhancementFactor({
        id: 'COOLDOWN_REDUCTION_50',
        name: '实验级冷却技术',
        description: '减少该键位武器冷却时间 -50%',
        purchaseCost: { iron: 80, copper: 80, cobalt: 40, nickel: 20, gold: 5 },
        enhancements: {},
        cooldownReduction: 0.5  // 50% 减少
    }),
    
    // ===== 穿透强化 =====
    PENETRATION_BOOST: new EnhancementFactor({
        id: 'PENETRATION_BOOST',
        name: '锥头弹',
        description: '增加该键位子弹穿透数 +1',
        purchaseCost: { iron: 100, copper: 20 },
        enhancements: {
            penetration: 1
        }
    }),
    
    // ===== 追踪强化 =====
    TRACKING_BOOST: new EnhancementFactor({
        id: 'TRACKING_BOOST',
        name: '制导系统',
        description: '增加该键位追踪角速度 +60度/秒',
        purchaseCost: { iron: 30, copper: 20 },
        enhancements: {
            trackingAngularSpeed: 60
        }
    }),
    
    // ===== 索敌系统 =====
    LOCK_ON_SYSTEM: new EnhancementFactor({
        id: 'LOCK_ON_SYSTEM',
        name: '智能索敌系统',
        description: '启用该键位武器索敌，且索敌范围+400',
        purchaseCost: { iron: 100, copper: 100, cobalt: 30, nickel: 30 },
        enhancements: {
            lockOnTarget: true,
            lockOnRange: 400
        }
    }),
    
    // ===== 射击轮数强化 =====
    BURST_COUNT_BOOST: new EnhancementFactor({
        id: 'BURST_COUNT_BOOST',
        name: '延长弹链',
        description: '增加该键位武器射击轮数 +1',
        purchaseCost: { iron: 60, copper: 40 },
        enhancements: {
            burstCount: 1
        }
    }),
    
    // ===== 冷却时间强化（绝对值） =====
    COOLDOWN_REDUCTION_500MS: new EnhancementFactor({
        id: 'COOLDOWN_REDUCTION_500MS',
        name: '优化装填流程',
        description: '减少该键位武器冷却时间 -0.5秒',
        purchaseCost: { iron: 10, copper: 10 },
        enhancements: {
            cooldown: -500
        }
    }),
    
    COOLDOWN_REDUCTION_800MS: new EnhancementFactor({
        id: 'COOLDOWN_REDUCTION_800MS',
        name: '快速装填系统',
        description: '减少该键位武器冷却时间 -0.8秒',
        purchaseCost: { iron: 20, copper: 20, cobalt: 3 },
        enhancements: {
            cooldown: -800
        }
    })
};

// 键位强化系统管理器
class SlotEnhancementSystem {
    constructor(player) {
        this.player = player;
        // 存储每个键位装备的强化因子 { 'Q': 'DAMAGE_BOOST_1', 'W': null, ... }
        this.slotEnhancements = {};
        
        // 初始化所有键位
        this.initializeSlots();
    }
    
    // 初始化所有键位
    initializeSlots() {
        const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM';
        for (const key of keys) {
            this.slotEnhancements[key] = null;
        }
    }
    
    // 为指定键位装备强化因子
    equipEnhancement(key, factorId) {
        key = key.toUpperCase();
        
        if (!this.slotEnhancements.hasOwnProperty(key)) {
            return { success: false, reason: '无效的键位' };
        }
        
        const factor = EnhancementFactors[factorId];
        if (!factor) {
            return { success: false, reason: '未知的强化因子' };
        }
        
        // 装备强化因子（不消耗资源，假设已在购买时消耗）
        this.slotEnhancements[key] = factorId;
        
        return { success: true };
    }
    
    // 卸载键位的强化因子
    unequipEnhancement(key) {
        key = key.toUpperCase();
        
        if (!this.slotEnhancements.hasOwnProperty(key)) {
            return { success: false, reason: '无效的键位' };
        }
        
        this.slotEnhancements[key] = null;
        return { success: true };
    }
    
    // 获取键位装备的强化因子
    getSlotEnhancement(key) {
        key = key.toUpperCase();
        const factorId = this.slotEnhancements[key];
        if (!factorId) return null;
        return EnhancementFactors[factorId];
    }
    
    // 应用键位强化到武器（返回强化后的武器配置）
    applySlotEnhancement(key, weaponData) {
        const factor = this.getSlotEnhancement(key);
        if (!factor || !weaponData) return weaponData;
        
        // 创建一个新的武器配置副本
        const enhanced = new WeaponData({
            id: weaponData.id,
            name: weaponData.name,
            damage: weaponData.damage,
            cooldown: weaponData.cooldown,
            fireDelay: weaponData.fireDelay,
            bulletsPerShot: weaponData.bulletsPerShot,
            burstCount: weaponData.burstCount,
            burstInterval: weaponData.burstInterval,
            shootSound: weaponData.shootSound,
            bulletWidth: weaponData.bulletWidth,
            bulletHeight: weaponData.bulletHeight,
            bulletSpeed: weaponData.bulletSpeed,
            bulletAcceleration: weaponData.bulletAcceleration,
            bulletMinSpeed: weaponData.bulletMinSpeed,
            bulletMaxSpeed: weaponData.bulletMaxSpeed,
            enableSpeedLimit: weaponData.enableSpeedLimit,
            bulletLifetime: weaponData.bulletLifetime,
            fadeOut: weaponData.fadeOut,
            bulletModel: weaponData.bulletModel,
            centerSpreadAngle: weaponData.centerSpreadAngle,
            bulletSpreadAngle: weaponData.bulletSpreadAngle,
            trackingAngularSpeed: weaponData.trackingAngularSpeed,
            explosionRadius: weaponData.explosionRadius,
            penetration: weaponData.penetration,
            color: weaponData.color,
            lockOnTarget: weaponData.lockOnTarget,
            lockOnRange: weaponData.lockOnRange,
            targetEffect: weaponData.targetEffect,
            unlockCost: weaponData.unlockCost
        });
        
        // 应用强化效果
        for (const [prop, value] of Object.entries(factor.enhancements)) {
            if (enhanced.hasOwnProperty(prop)) {
                // 特殊处理：百分比类强化（如冷却缩减）
                if (prop === 'cooldown' && value > -1 && value < 1) {
                    // 百分比增减，使用 Math.round 避免浮点数精度问题
                    const newValue = Math.round(enhanced[prop] * (1 + value));
                    enhanced[prop] = Math.max(100, newValue);
                }
                // 特殊处理：布尔值
                else if (typeof value === 'boolean') {
                    enhanced[prop] = value;
                }
                // 数值类强化（加法）
                else if (typeof enhanced[prop] === 'number') {
                    enhanced[prop] += value;
                    
                    // 确保某些属性不会变成负数
                    if (prop === 'damage' || prop === 'penetration' || 
                        prop === 'bulletsPerShot' || prop === 'burstCount') {
                        enhanced[prop] = Math.max(1, enhanced[prop]);
                    }
                    if (prop === 'cooldown') {
                        enhanced[prop] = Math.max(100, enhanced[prop]);
                    }
                }
            }
        }
        
        return enhanced;
    }
    
    // 获取所有键位的强化状态
    getAllSlotEnhancements() {
        const result = {};
        for (const [key, factorId] of Object.entries(this.slotEnhancements)) {
            result[key] = {
                factorId: factorId,
                factor: factorId ? EnhancementFactors[factorId] : null
            };
        }
        return result;
    }
    
    // 获取所有可用的强化因子
    getAllFactors() {
        return EnhancementFactors;
    }
    
    // 购买强化因子（添加到玩家库存，实际装备需要调用equipEnhancement）
    purchaseFactor(factorId) {
        const factor = EnhancementFactors[factorId];
        if (!factor) {
            return { success: false, reason: '未知的强化因子' };
        }
        
        // 检查资源是否足够
        if (!factor.canPurchase(this.player)) {
            return { success: false, reason: '资源不足' };
        }
        
        // 消耗资源
        for (const [resourceType, amount] of Object.entries(factor.purchaseCost)) {
            this.player.consumeResource(resourceType, amount);
        }
        
        // 这里可以扩展一个库存系统来存储已购买的因子
        // 目前简化处理，购买即可装备
        
        return { success: true, factor: factor };
    }
    
    // 重置所有键位强化
    resetAllEnhancements() {
        this.initializeSlots();
    }
}
