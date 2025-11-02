// tech.js - 科技升级系统：管理局外成长和武器升级

// 科技升级数据结构
class TechUpgrade {
    constructor(config) {
        this.id = config.id; // 升级项ID
        this.name = config.name; // 升级项名称
        this.description = config.description; // 升级项描述
        this.weaponId = config.weaponId; // 绑定的武器ID
        this.maxLevel = config.maxLevel || 10; // 最大升级等级
        this.costPerLevel = config.costPerLevel || []; // 每级消耗资源列表
        this.upgradePerLevel = config.upgradePerLevel || {}; // 每级提升的数值（增量）
    }
    
    // 获取指定等级的消耗
    getCost(level) {
        if (level < 1 || level > this.maxLevel) return null;
        return this.costPerLevel[level - 1] || null;
    }
    
    // 获取指定等级的总升级数值（增量值 × 等级）
    getTotalUpgrade(level) {
        if (level < 1 || level > this.maxLevel) return null;
        
        const result = {};
        for (const [key, valuePerLevel] of Object.entries(this.upgradePerLevel)) {
            result[key] = valuePerLevel * level;
        }
        return result;
    }
}

// 科技升级库
const TechUpgrades = {
    // ===== 速射炮升级 =====
    BASIC_GUN_DAMAGE: new TechUpgrade({
        id: 'BASIC_GUN_DAMAGE',
        name: '速射炮 - 伤害强化',
        description: '每级提升速射炮伤害 +2',
        weaponId: 'BASIC_GUN',
        maxLevel: 8,
        costPerLevel: [
            { iron: 10, copper: 5 },      // Lv1
            { iron: 20, copper: 10 },     // Lv2
            { iron: 30, copper: 15 },     // Lv3
            { iron: 50, copper: 20, cobalt: 5 },     // Lv4
            { iron: 60, copper: 30, cobalt: 10 },     // Lv5
            { iron: 70, copper: 35, cobalt: 10, nickel: 5, gold: 2 },     // Lv6
            { iron: 80, copper: 40, cobalt: 10, nickel: 5, gold: 5 },     // Lv7
            { iron: 90, copper: 45, cobalt: 10, nickel: 5, gold: 10 },     // Lv8
        ],
        upgradePerLevel: {
            damage: 2  // 每级 +2 伤害
        }
    }),
    
    BASIC_GUN_COOLDOWN: new TechUpgrade({
        id: 'BASIC_GUN_COOLDOWN',
        name: '速射炮 - 冷却缩减',
        description: '每级减少速射炮冷却时间 -0.2s',
        weaponId: 'BASIC_GUN',
        maxLevel: 6,
        costPerLevel: [
            { iron: 10 },      // Lv1
            { iron: 20, copper: 5 },     // Lv2
            { iron: 40, copper: 10 },     // Lv3
            { iron: 45, copper: 15, nickel: 10 },     // Lv4
            { iron: 50, copper: 25, nickel: 10, cobalt: 20 },     // Lv5
            { iron: 60, copper: 35, nickel: 20, cobalt: 40, gold: 10 }  // Lv6
        ],
        upgradePerLevel: {
            cooldown: -200  // 每级 -200ms (-0.2s)
        }
    }),
    
    BASIC_GUN_TRACKING: new TechUpgrade({
        id: 'BASIC_GUN_TRACKING',
        name: '速射炮 - 追踪强化',
        description: '每级提升速射炮追踪速度 +20°/s',
        weaponId: 'BASIC_GUN',
        maxLevel: 3,
        costPerLevel: [
            { iron: 15, copper: 8 },      // Lv1 (便宜)
            { iron: 30, copper: 20, nickel: 15 },     // Lv2 (消耗镍矿)
            { iron: 40, copper: 30, nickel: 15, gold: 5 }     // Lv3
        ],
        upgradePerLevel: {
            trackingAngularSpeed: 20  // 每级 +20°/s
        }
    }),
    
    // ===== 霰弹枪升级 =====
    SHOTGUN_SPEED: new TechUpgrade({
        id: 'SHOTGUN_SPEED',
        name: '霰弹枪 - 子弹加速',
        description: '每级提升霰弹枪子弹速度 +300',
        weaponId: 'SHOTGUN',
        maxLevel: 5,
        costPerLevel: [
            { iron: 10, copper: 5 },     // Lv1
            { iron: 35, copper: 15 },     // Lv2
            { iron: 50, copper: 30, cobalt: 2 },     // Lv3 (开始消耗稀有资源)
            { iron: 50, copper: 25, nickel: 10, cobalt: 15 },     // Lv4
            { iron: 40, copper: 35, nickel: 15, cobalt: 25 }      // Lv5
        ],
        upgradePerLevel: {
            bulletSpeed: 300  // 每级 +300
        }
    }),
    
    SHOTGUN_BURST: new TechUpgrade({
        id: 'SHOTGUN_BURST',
        name: '霰弹枪 - 单轮发数',
        description: '每级增加霰弹枪单轮发数 +1',
        weaponId: 'SHOTGUN',
        maxLevel: 5,
        costPerLevel: [
            { iron: 25, copper: 12 },     // Lv1 (不消耗稀有资源)
            { iron: 40, copper: 20 },     // Lv2 (不消耗稀有资源)
            { iron: 50, copper: 30, cobalt: 5 },     // Lv3
            { iron: 55, copper: 35, nickel: 10, cobalt: 20 },     // Lv4
            { iron: 50, copper: 45, nickel: 40, cobalt: 40, gold: 10 }  // Lv5
        ],
        upgradePerLevel: {
            bulletsPerShot: 1  // 每级 +1 发射次数
        }
    }),
    
    SHOTGUN_PRECISION: new TechUpgrade({
        id: 'SHOTGUN_PRECISION',
        name: '霰弹枪 - 精准',
        description: '每级减少霰弹枪扩散角 -3°',
        weaponId: 'SHOTGUN',
        maxLevel: 5,
        costPerLevel: [
            { iron: 10 },      // Lv1
            { iron: 15, copper: 5 },     // Lv2
            { iron: 20, copper: 10 },     // Lv3
            { iron: 25, copper: 15 },     // Lv4
            { iron: 30, copper: 20 }  // Lv5
        ],
        upgradePerLevel: {
            bulletSpreadAngle: -3  // 每级 -3°
        }
    }),
    
    SHOTGUN_DAMAGE: new TechUpgrade({
        id: 'SHOTGUN_DAMAGE',
        name: '霰弹枪 - 伤害强化',
        description: '提升霰弹枪伤害 +1',
        weaponId: 'SHOTGUN',
        maxLevel: 1,
        costPerLevel: [
            { iron: 30, copper: 20, nickel: 40, cobalt: 60 }  // Lv1 (消耗大量稀有资源)
        ],
        upgradePerLevel: {
            damage: 1  // +1 伤害
        }
    }),
    
    SHOTGUN_COOLDOWN: new TechUpgrade({
        id: 'SHOTGUN_COOLDOWN',
        name: '霰弹枪 - 冷却缩减',
        description: '减少霰弹枪冷却时间 -1s',
        weaponId: 'SHOTGUN',
        maxLevel: 1,
        costPerLevel: [
            { iron: 35, copper: 25, nickel: 70, cobalt: 80 }  // Lv1 (消耗大量稀有资源)
        ],
        upgradePerLevel: {
            cooldown: -1000  // -1s (-1000ms)
        }
    }),
    
    // ===== 狙击枪升级 =====
    SNIPER_DAMAGE: new TechUpgrade({
        id: 'SNIPER_DAMAGE',
        name: '狙击枪 - 伤害强化',
        description: '每级提升狙击枪伤害 +4',
        weaponId: 'SNIPER',
        maxLevel: 5,
        costPerLevel: [
            { iron: 8, copper: 25 },      // Lv1 (重铜轻铁)
            { iron: 12, copper: 45 },     // Lv2
            { iron: 18, copper: 65 },     // Lv3
            { iron: 25, copper: 80, nickel: 10, cobalt: 15 },     // Lv4 (开始消耗稀有资源)
            { iron: 30, copper: 100, nickel: 20, cobalt: 35 }     // Lv5
        ],
        upgradePerLevel: {
            damage: 4  // 每级 +4 伤害
        }
    }),
    
    SNIPER_COOLDOWN: new TechUpgrade({
        id: 'SNIPER_COOLDOWN',
        name: '狙击枪 - 冷却缩减',
        description: '每级减少狙击枪冷却时间 -0.5s',
        weaponId: 'SNIPER',
        maxLevel: 5,
        costPerLevel: [
            { iron: 10, copper: 30 },     // Lv1
            { iron: 15, copper: 50, nickel: 5 },     // Lv2 (开始消耗稀有资源)
            { iron: 22, copper: 70, nickel: 15, cobalt: 5 },     // Lv3
            { iron: 28, copper: 90, nickel: 30, cobalt: 20 },     // Lv4
            { iron: 35, copper: 110, nickel: 60, cobalt: 40, gold: 10 }  // Lv5
        ],
        upgradePerLevel: {
            cooldown: -500  // 每级 -500ms (-0.5s)
        }
    }),
    
    SNIPER_BURST: new TechUpgrade({
        id: 'SNIPER_BURST',
        name: '狙击枪 - 二连发',
        description: '狙击枪获得二连发能力',
        weaponId: 'SNIPER',
        maxLevel: 1,
        costPerLevel: [
            { iron: 40, copper: 80, nickel: 60, cobalt: 80, gold: 15 }  // Lv1 (消耗金矿)
        ],
        upgradePerLevel: {
            burstCount: 1  // 从1发变为2发 (实际游戏中需要调整burstCount为2)
        }
    }),
    

    
    // ===== 机枪升级 =====
    MACHINE_GUN_BURST: new TechUpgrade({
        id: 'MACHINE_GUN_BURST',
        name: '机枪 - 射击次数',
        description: '每级增加机枪射击次数 +1',
        weaponId: 'MACHINE_GUN',
        maxLevel: 5,
        costPerLevel: [
            { iron: 10, copper: 5 },     // Lv1
            { iron: 20, copper: 10 },     // Lv2
            { iron: 30, copper: 15 },     // Lv3
            { iron: 40, copper: 20, nickel: 15, cobalt: 5 },     // Lv4 (开始消耗稀有资源)
            { iron: 45, copper: 30, nickel: 35, cobalt: 15, gold: 8 }  // Lv5
        ],
        upgradePerLevel: {
            burstCount: 1  // 每级 +1 射击次数
        }
    }),
    
    MACHINE_GUN_PENETRATION: new TechUpgrade({
        id: 'MACHINE_GUN_PENETRATION',
        name: '机枪 - 穿透强化',
        description: '机枪获得穿透能力 +1',
        weaponId: 'MACHINE_GUN',
        maxLevel: 1,
        costPerLevel: [
            { iron: 40, copper: 30, nickel: 40, cobalt: 30, gold: 15 }  // Lv1 (消耗大量稀有资源和金矿)
        ],
        upgradePerLevel: {
            penetration: 1  // +1 穿透
        }
    }),
    
    MACHINE_GUN_DAMAGE: new TechUpgrade({
        id: 'MACHINE_GUN_DAMAGE',
        name: '机枪 - 伤害强化',
        description: '提升机枪伤害 +1',
        weaponId: 'MACHINE_GUN',
        maxLevel: 1,
        costPerLevel: [
            { iron: 35, copper: 25, nickel: 20, cobalt: 20 }  // Lv1 (消耗大量稀有资源)
        ],
        upgradePerLevel: {
            damage: 1  // +1 伤害
        }
    }),
    
    MACHINE_GUN_COOLDOWN: new TechUpgrade({
        id: 'MACHINE_GUN_COOLDOWN',
        name: '机枪 - 冷却缩减',
        description: '减少机枪冷却时间 -0.5s',
        weaponId: 'MACHINE_GUN',
        maxLevel: 2,
        costPerLevel: [
            { iron: 20, copper: 10, nickel: 5 },  // Lv1 (消耗稀有资源)
            { iron: 30, copper: 20, nickel: 10, cobalt: 5 }  // Lv2 (消耗稀有资源)
        ],
        upgradePerLevel: {
            cooldown: -500  // -0.5s (-500ms)
        }
    }),
    
    // ===== 导弹升级 =====
    MISSILE_COOLDOWN: new TechUpgrade({
        id: 'MISSILE_COOLDOWN',
        name: '导弹 - 冷却缩减',
        description: '每级减少导弹冷却时间 -5s',
        weaponId: 'MISSILE',
        maxLevel: 4,
        costPerLevel: [
            { iron: 30, copper: 15 },     // Lv1
            { iron: 50, copper: 25, nickel: 10, cobalt: 5 },     // Lv2 (开始消耗稀有资源)
            { iron: 55, copper: 35, nickel: 30, cobalt: 10 },     // Lv3
            { iron: 50, copper: 45, nickel: 45, cobalt: 30, gold: 12 }  // Lv4
        ],
        upgradePerLevel: {
            cooldown: -5000  // 每级 -5000ms (-5s)
        }
    }),
    
    MISSILE_DAMAGE: new TechUpgrade({
        id: 'MISSILE_DAMAGE',
        name: '导弹 - 伤害强化',
        description: '提升导弹伤害 +5',
        weaponId: 'MISSILE',
        maxLevel: 1,
        costPerLevel: [
            { iron: 35, copper: 20, nickel: 25, cobalt: 20 }  // Lv1 (消耗稀有资源)
        ],
        upgradePerLevel: {
            damage: 5  // +5 伤害
        }
    }),
    
    MISSILE_EXPLOSION: new TechUpgrade({
        id: 'MISSILE_EXPLOSION',
        name: '导弹 - 爆炸范围',
        description: '每级增加导弹爆炸范围 +25',
        weaponId: 'MISSILE',
        maxLevel: 5,
        costPerLevel: [
            { iron: 22, copper: 8 },      // Lv1
            { iron: 38, copper: 15 },     // Lv2
            { iron: 52, copper: 20, nickel: 10, cobalt: 5 },     // Lv3 (开始消耗稀有资源)
            { iron: 52, copper: 25, nickel: 15, cobalt: 15 },     // Lv4
            { iron: 42, copper: 35, nickel: 50, cobalt: 25, gold: 10 }  // Lv5
        ],
        upgradePerLevel: {
            explosionRadius: 25  // 每级 +25 范围
        }
    }),
    
    MISSILE_DOUBLE_SHOT: new TechUpgrade({
        id: 'MISSILE_DOUBLE_SHOT',
        name: '导弹 - 双发齐射',
        description: '导弹获得双发能力，但伤害-10',
        weaponId: 'MISSILE',
        maxLevel: 1,
        costPerLevel: [
            { iron: 60, copper: 60, nickel: 50, cobalt: 50, gold: 30 }  // Lv1 (消耗大量金矿和稀有资源)
        ],
        upgradePerLevel: {
            burstCount: 1,     // +1 发射次数 (从1变2)
            damage: -10      // -10 伤害
        }
    }),
    
    // ===== 穿透弹升级 =====
    PENETRATOR_DAMAGE: new TechUpgrade({
        id: 'PENETRATOR_DAMAGE',
        name: '穿透弹 - 伤害强化',
        description: '每级提升穿透弹伤害 +2',
        weaponId: 'PENETRATOR',
        maxLevel: 5,
        costPerLevel: [
            { iron: 18, copper: 8 },      // Lv1
            { iron: 32, copper: 12 },     // Lv2
            { iron: 48, copper: 28, nickel: 5, cobalt: 5 },     // Lv3 (开始消耗稀有资源)
            { iron: 48, copper: 22, nickel: 10, cobalt: 15 },     // Lv4
            { iron: 38, copper: 32, nickel: 20, cobalt: 30 }      // Lv5
        ],
        upgradePerLevel: {
            damage: 2  // 每级 +2 伤害
        }
    }),
    
    PENETRATOR_SIZE: new TechUpgrade({
        id: 'PENETRATOR_SIZE',
        name: '穿透弹 - 尺寸扩大',
        description: '每级增加穿透弹宽度 +3、长度 +1',
        weaponId: 'PENETRATOR',
        maxLevel: 4,
        costPerLevel: [
            { iron: 35, copper: 15, nickel: 5, cobalt: 5 },     // Lv1
            { iron: 45, copper: 25, nickel: 10, cobalt: 10 },     // Lv2
            { iron: 48, copper: 35, nickel: 30, cobalt: 30, gold: 5 },  // Lv3
            { iron: 42, copper: 45, nickel: 50, cobalt: 50, gold: 12 }  // Lv4
        ],
        upgradePerLevel: {
            bulletWidth: 3,   // 每级 +3 宽度
            bulletHeight: 1   // 每级 +1 长度
        }
    }),
    
    PENETRATOR_COOLDOWN: new TechUpgrade({
        id: 'PENETRATOR_COOLDOWN',
        name: '穿透弹 - 冷却缩减',
        description: '每级减少穿透弹冷却时间 -1s',
        weaponId: 'PENETRATOR',
        maxLevel: 2,
        costPerLevel: [
            { iron: 30, copper: 15, nickel: 5, cobalt: 10 },     // Lv1
            { iron: 40, copper: 25, nickel: 20, cobalt: 30, gold: 8 }  // Lv2 (消耗稀有资源)
        ],
        upgradePerLevel: {
            cooldown: -1000  // 每级 -1000ms (-1s)
        }
    }),
    
    PENETRATOR_EXPLOSION: new TechUpgrade({
        id: 'PENETRATOR_EXPLOSION',
        name: '穿透弹 - 爆炸强化',
        description: '穿透弹获得爆炸效果，范围+140',
        weaponId: 'PENETRATOR',
        maxLevel: 1,
        costPerLevel: [
            { iron: 50, copper: 50, nickel: 70, cobalt: 70, gold: 20 }  // Lv1 (消耗金矿和大量稀有资源)
        ],
        upgradePerLevel: {
            explosionRadius: 140  // +140 爆炸范围
        }
    }),
    
    // ===== 散射机炮升级 =====
    SCATTER_CANNON_BULLETS: new TechUpgrade({
        id: 'SCATTER_CANNON_BULLETS',
        name: '散射机炮 - 子母连珠',
        description: '每级增加散射机炮每轮射击弹药数 +1',
        weaponId: 'SCATTER_CANNON',
        maxLevel: 3,
        costPerLevel: [
            { iron: 40, copper: 40 },  // Lv1 (不消耗金矿)
            { gold: 8, iron: 40, copper: 40, nickel: 10, cobalt: 10 },  // Lv2 (消耗金矿)
            { gold: 15, iron: 50, copper: 50, nickel: 30, cobalt: 30 }  // Lv3 (更多金矿)
        ],
        upgradePerLevel: {
            bulletsPerShot: 1  // 每级 +1 弹药数
        }
    }),
    
    SCATTER_CANNON_BURST: new TechUpgrade({
        id: 'SCATTER_CANNON_BURST',
        name: '散射机炮 - 预热炮管',
        description: '增加散射机炮射击轮数 +1',
        weaponId: 'SCATTER_CANNON',
        maxLevel: 1,
        costPerLevel: [
            { gold: 20, iron: 60, copper: 60, nickel: 40, cobalt: 40 }  // Lv1 (消耗大量金矿和稀有资源)
        ],
        upgradePerLevel: {
            burstCount: 1  // +1 射击轮数
        }
    }),
    
    SCATTER_CANNON_SIZE: new TechUpgrade({
        id: 'SCATTER_CANNON_SIZE',
        name: '散射机炮 - 超大口径',
        description: '每级增加散射机炮子弹宽度 +6、高度 +6',
        weaponId: 'SCATTER_CANNON',
        maxLevel: 2,
        costPerLevel: [
            { iron: 45, copper: 45 },  // Lv1
            { gold: 5, iron: 55, copper: 55 }   // Lv2
        ],
        upgradePerLevel: {
            bulletWidth: 6,   // 每级 +4 宽度
            bulletHeight: 6   // 每级 +4 高度
        }
    }),
    
    SCATTER_CANNON_COOLDOWN: new TechUpgrade({
        id: 'SCATTER_CANNON_COOLDOWN',
        name: '散射机炮 - 自动化装弹技术',
        description: '减少散射机炮冷却时间 -5s',
        weaponId: 'SCATTER_CANNON',
        maxLevel: 1,
        costPerLevel: [
            { gold: 20, iron: 70, copper: 70, nickel: 30, cobalt: 30 }  // Lv1 (消耗大量金矿和稀有资源)
        ],
        upgradePerLevel: {
            cooldown: -5000  // -5s (-5000ms)
        }
    })
};

// 科技系统管理器
class TechSystem {
    constructor(player) {
        this.player = player;
    }
    
    // 检查是否可以升级
    canUpgrade(techId) {
        const tech = TechUpgrades[techId];
        if (!tech) return { success: false, reason: '未知的科技项' };
        
        const currentLevel = this.player.getTechLevel(techId);
        if (currentLevel >= tech.maxLevel) {
            return { success: false, reason: '已达到最大等级' };
        }
        
        const nextLevel = currentLevel + 1;
        const cost = tech.getCost(nextLevel);
        if (!cost) return { success: false, reason: '无效的等级' };
        
        // 检查资源是否足够
        for (const [resourceType, amount] of Object.entries(cost)) {
            if (!this.player.hasResource(resourceType, amount)) {
                return { success: false, reason: `${resourceType} 不足` };
            }
        }
        
        return { success: true, cost, nextLevel };
    }
    
    // 执行升级
    upgrade(techId) {
        const check = this.canUpgrade(techId);
        if (!check.success) return check;
        
        const tech = TechUpgrades[techId];
        const { cost, nextLevel } = check;
        
        // 消耗资源
        for (const [resourceType, amount] of Object.entries(cost)) {
            this.player.consumeResource(resourceType, amount);
        }
        
        // 提升等级
        this.player.setTechLevel(techId, nextLevel);
        
        return { success: true, newLevel: nextLevel };
    }
    
    // 获取武器的所有升级加成（返回增量值）
    getWeaponUpgrades(weaponId) {
        const upgrades = {};
        
        // 遍历所有科技，找到绑定该武器的科技
        for (const [techId, tech] of Object.entries(TechUpgrades)) {
            if (tech.weaponId === weaponId) {
                const level = this.player.getTechLevel(techId);
                if (level > 0) {
                    const totalUpgrade = tech.getTotalUpgrade(level);
                    if (totalUpgrade) {
                        // 累加升级数值（支持多个科技影响同一属性）
                        for (const [key, value] of Object.entries(totalUpgrade)) {
                            upgrades[key] = (upgrades[key] || 0) + value;
                        }
                    }
                }
            }
        }
        
        return upgrades;
    }
    
    // 应用科技升级到武器（创建一个新的武器实例，避免污染原始数据）
    applyUpgradesToWeapon(weaponPreset) {
        const upgrades = this.getWeaponUpgrades(weaponPreset.id);
        
        // 创建一个新的武器配置，避免修改原始数据
        const upgradedConfig = {
            id: weaponPreset.id,
            name: weaponPreset.name,
            damage: weaponPreset.damage,
            cooldown: weaponPreset.cooldown,
            fireDelay: weaponPreset.fireDelay,
            bulletsPerShot: weaponPreset.bulletsPerShot,
            burstCount: weaponPreset.burstCount,
            burstInterval: weaponPreset.burstInterval,
            shootSound: weaponPreset.shootSound,
            bulletWidth: weaponPreset.bulletWidth,
            bulletHeight: weaponPreset.bulletHeight,
            bulletSpeed: weaponPreset.bulletSpeed,
            bulletAcceleration: weaponPreset.bulletAcceleration,
            bulletMinSpeed: weaponPreset.bulletMinSpeed,
            bulletMaxSpeed: weaponPreset.bulletMaxSpeed,
            enableSpeedLimit: weaponPreset.enableSpeedLimit,
            bulletLifetime: weaponPreset.bulletLifetime,
            fadeOut: weaponPreset.fadeOut,
            bulletModel: weaponPreset.bulletModel,
            centerSpreadAngle: weaponPreset.centerSpreadAngle,
            bulletSpreadAngle: weaponPreset.bulletSpreadAngle,
            trackingAngularSpeed: weaponPreset.trackingAngularSpeed,
            explosionRadius: weaponPreset.explosionRadius,
            penetration: weaponPreset.penetration,
            color: weaponPreset.color,
            lockOnTarget: weaponPreset.lockOnTarget,
            lockOnRange: weaponPreset.lockOnRange,
            targetEffect: weaponPreset.targetEffect
        };
        
        // 应用升级数值（增量叠加）
        for (const [key, value] of Object.entries(upgrades)) {
            if (upgradedConfig.hasOwnProperty(key)) {
                upgradedConfig[key] += value;
            }
        }
        
        // 创建并返回新的武器实例
        return new WeaponData(upgradedConfig);
    }
    
    // 获取所有可用的科技列表
    getAllTechs() {
        return TechUpgrades;
    }
    
    // 获取某个武器的所有科技
    getWeaponTechs(weaponId) {
        const techs = [];
        for (const [techId, tech] of Object.entries(TechUpgrades)) {
            if (tech.weaponId === weaponId) {
                techs.push({
                    id: techId,
                    tech: tech,
                    currentLevel: this.player.getTechLevel(techId)
                });
            }
        }
        return techs;
    }
}
