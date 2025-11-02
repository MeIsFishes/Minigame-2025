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
        this.upgradeValues = config.upgradeValues || {}; // 每级的升级数值
    }
    
    // 获取指定等级的消耗
    getCost(level) {
        if (level < 1 || level > this.maxLevel) return null;
        return this.costPerLevel[level - 1] || null;
    }
    
    // 获取指定等级的升级数值
    getUpgradeValues(level) {
        if (level < 1 || level > this.maxLevel) return null;
        return this.upgradeValues[level] || null;
    }
}

// 科技升级库
const TechUpgrades = {
    // ===== 速射炮升级 =====
    BASIC_GUN_DAMAGE: new TechUpgrade({
        id: 'BASIC_GUN_DAMAGE',
        name: '速射炮 - 伤害强化',
        description: '提升速射炮的伤害值',
        weaponId: 'BASIC_GUN',
        maxLevel: 10,
        costPerLevel: [
            { iron: 10, copper: 5 },      // Lv1
            { iron: 15, copper: 10 },     // Lv2
            { iron: 20, copper: 15 },     // Lv3
            { iron: 30, copper: 20 },     // Lv4
            { iron: 40, copper: 30 },     // Lv5
            { iron: 50, copper: 40, cobalt: 5 },  // Lv6
            { iron: 70, copper: 50, cobalt: 10 }, // Lv7
            { iron: 90, copper: 70, cobalt: 15 }, // Lv8
            { iron: 120, copper: 90, cobalt: 20, nickel: 5 },  // Lv9
            { iron: 150, copper: 120, cobalt: 30, nickel: 10, gold: 1 }  // Lv10
        ],
        upgradeValues: {
            1: { damage: 12 },
            2: { damage: 14 },
            3: { damage: 16 },
            4: { damage: 18 },
            5: { damage: 20 },
            6: { damage: 23 },
            7: { damage: 26 },
            8: { damage: 29 },
            9: { damage: 32 },
            10: { damage: 35 }
        }
    }),
    
    BASIC_GUN_COOLDOWN: new TechUpgrade({
        id: 'BASIC_GUN_COOLDOWN',
        name: '速射炮 - 冷却缩减',
        description: '减少速射炮的冷却时间',
        weaponId: 'BASIC_GUN',
        maxLevel: 10,
        costPerLevel: [
            { iron: 8, copper: 8 },
            { iron: 12, copper: 12 },
            { iron: 18, copper: 18 },
            { iron: 25, copper: 25 },
            { iron: 35, copper: 35 },
            { iron: 45, copper: 45, cobalt: 5 },
            { iron: 60, copper: 60, cobalt: 10 },
            { iron: 80, copper: 80, cobalt: 15 },
            { iron: 100, copper: 100, cobalt: 20, nickel: 5 },
            { iron: 130, copper: 130, cobalt: 30, nickel: 10, gold: 1 }
        ],
        upgradeValues: {
            1: { cooldown: 2300 },
            2: { cooldown: 2100 },
            3: { cooldown: 1900 },
            4: { cooldown: 1700 },
            5: { cooldown: 1500 },
            6: { cooldown: 1350 },
            7: { cooldown: 1200 },
            8: { cooldown: 1050 },
            9: { cooldown: 900 },
            10: { cooldown: 750 }
        }
    }),
    
    BASIC_GUN_SPEED: new TechUpgrade({
        id: 'BASIC_GUN_SPEED',
        name: '速射炮 - 子弹加速',
        description: '提升速射炮的子弹速度',
        weaponId: 'BASIC_GUN',
        maxLevel: 8,
        costPerLevel: [
            { iron: 12, copper: 6 },
            { iron: 18, copper: 10 },
            { iron: 25, copper: 15 },
            { iron: 35, copper: 20 },
            { iron: 50, copper: 30, cobalt: 5 },
            { iron: 70, copper: 40, cobalt: 10 },
            { iron: 90, copper: 60, cobalt: 15, nickel: 5 },
            { iron: 120, copper: 80, cobalt: 25, nickel: 10, gold: 1 }
        ],
        upgradeValues: {
            1: { bulletSpeed: 800 },
            2: { bulletSpeed: 900 },
            3: { bulletSpeed: 1000 },
            4: { bulletSpeed: 1100 },
            5: { bulletSpeed: 1250 },
            6: { bulletSpeed: 1400 },
            7: { bulletSpeed: 1600 },
            8: { bulletSpeed: 1800 }
        }
    }),
    
    // ===== 霰弹枪升级 =====
    SHOTGUN_DAMAGE: new TechUpgrade({
        id: 'SHOTGUN_DAMAGE',
        name: '霰弹枪 - 伤害强化',
        description: '提升霰弹枪每颗子弹的伤害值',
        weaponId: 'SHOTGUN',
        maxLevel: 10,
        costPerLevel: [
            { iron: 8, copper: 8 },
            { iron: 12, copper: 12 },
            { iron: 18, copper: 18 },
            { iron: 25, copper: 25 },
            { iron: 35, copper: 35 },
            { iron: 50, copper: 50, cobalt: 5 },
            { iron: 70, copper: 70, cobalt: 10 },
            { iron: 90, copper: 90, cobalt: 15 },
            { iron: 120, copper: 120, cobalt: 25, nickel: 8 },
            { iron: 150, copper: 150, cobalt: 35, nickel: 12, gold: 2 }
        ],
        upgradeValues: {
            1: { damage: 3 },
            2: { damage: 4 },
            3: { damage: 5 },
            4: { damage: 6 },
            5: { damage: 7 },
            6: { damage: 8 },
            7: { damage: 9 },
            8: { damage: 10 },
            9: { damage: 12 },
            10: { damage: 14 }
        }
    }),
    
    SHOTGUN_BULLETS: new TechUpgrade({
        id: 'SHOTGUN_BULLETS',
        name: '霰弹枪 - 弹丸增量',
        description: '增加霰弹枪的子弹数量',
        weaponId: 'SHOTGUN',
        maxLevel: 5,
        costPerLevel: [
            { iron: 20, copper: 15 },
            { iron: 35, copper: 25 },
            { iron: 55, copper: 40, cobalt: 5 },
            { iron: 80, copper: 60, cobalt: 15, nickel: 5 },
            { iron: 120, copper: 90, cobalt: 30, nickel: 15, gold: 2 }
        ],
        upgradeValues: {
            1: { bulletsPerShot: 12 },
            2: { bulletsPerShot: 14 },
            3: { bulletsPerShot: 16 },
            4: { bulletsPerShot: 18 },
            5: { bulletsPerShot: 20 }
        }
    }),
    
    SHOTGUN_SPREAD: new TechUpgrade({
        id: 'SHOTGUN_SPREAD',
        name: '霰弹枪 - 精准控制',
        description: '减少霰弹枪的散射角度，提高精准度',
        weaponId: 'SHOTGUN',
        maxLevel: 8,
        costPerLevel: [
            { iron: 10, copper: 10 },
            { iron: 15, copper: 15 },
            { iron: 22, copper: 22 },
            { iron: 32, copper: 32, cobalt: 5 },
            { iron: 45, copper: 45, cobalt: 10 },
            { iron: 65, copper: 65, cobalt: 15 },
            { iron: 90, copper: 90, cobalt: 25, nickel: 8 },
            { iron: 120, copper: 120, cobalt: 35, nickel: 15, gold: 1 }
        ],
        upgradeValues: {
            1: { bulletSpreadAngle: 7 },
            2: { bulletSpreadAngle: 6.5 },
            3: { bulletSpreadAngle: 6 },
            4: { bulletSpreadAngle: 5.5 },
            5: { bulletSpreadAngle: 5 },
            6: { bulletSpreadAngle: 4.5 },
            7: { bulletSpreadAngle: 4 },
            8: { bulletSpreadAngle: 3.5 }
        }
    }),
    
    // ===== 狙击枪升级 =====
    SNIPER_DAMAGE: new TechUpgrade({
        id: 'SNIPER_DAMAGE',
        name: '狙击枪 - 伤害强化',
        description: '提升狙击枪的伤害值',
        weaponId: 'SNIPER',
        maxLevel: 10,
        costPerLevel: [
            { iron: 15, copper: 10, cobalt: 5 },
            { iron: 25, copper: 15, cobalt: 10 },
            { iron: 35, copper: 25, cobalt: 15 },
            { iron: 50, copper: 35, cobalt: 20 },
            { iron: 70, copper: 50, cobalt: 30, nickel: 5 },
            { iron: 95, copper: 70, cobalt: 40, nickel: 10 },
            { iron: 125, copper: 95, cobalt: 55, nickel: 15 },
            { iron: 160, copper: 125, cobalt: 75, nickel: 25 },
            { iron: 200, copper: 160, cobalt: 100, nickel: 35, gold: 2 },
            { iron: 250, copper: 200, cobalt: 130, nickel: 50, gold: 5 }
        ],
        upgradeValues: {
            1: { damage: 25 },
            2: { damage: 30 },
            3: { damage: 35 },
            4: { damage: 40 },
            5: { damage: 50 },
            6: { damage: 60 },
            7: { damage: 70 },
            8: { damage: 85 },
            9: { damage: 100 },
            10: { damage: 120 }
        }
    }),
    
    SNIPER_COOLDOWN: new TechUpgrade({
        id: 'SNIPER_COOLDOWN',
        name: '狙击枪 - 冷却缩减',
        description: '减少狙击枪的冷却时间',
        weaponId: 'SNIPER',
        maxLevel: 10,
        costPerLevel: [
            { iron: 12, copper: 12, cobalt: 8 },
            { iron: 18, copper: 18, cobalt: 12 },
            { iron: 28, copper: 28, cobalt: 18 },
            { iron: 40, copper: 40, cobalt: 25 },
            { iron: 55, copper: 55, cobalt: 35, nickel: 5 },
            { iron: 75, copper: 75, cobalt: 50, nickel: 10 },
            { iron: 100, copper: 100, cobalt: 70, nickel: 15 },
            { iron: 130, copper: 130, cobalt: 90, nickel: 25 },
            { iron: 170, copper: 170, cobalt: 120, nickel: 35, gold: 2 },
            { iron: 220, copper: 220, cobalt: 150, nickel: 50, gold: 5 }
        ],
        upgradeValues: {
            1: { cooldown: 13500 },
            2: { cooldown: 12000 },
            3: { cooldown: 10500 },
            4: { cooldown: 9000 },
            5: { cooldown: 7500 },
            6: { cooldown: 6500 },
            7: { cooldown: 5500 },
            8: { cooldown: 4500 },
            9: { cooldown: 3500 },
            10: { cooldown: 2500 }
        }
    }),
    
    SNIPER_PENETRATION: new TechUpgrade({
        id: 'SNIPER_PENETRATION',
        name: '狙击枪 - 穿透增强',
        description: '增加狙击枪的穿透次数',
        weaponId: 'SNIPER',
        maxLevel: 7,
        costPerLevel: [
            { iron: 20, copper: 15, cobalt: 10 },
            { iron: 35, copper: 25, cobalt: 20 },
            { iron: 55, copper: 40, cobalt: 35, nickel: 5 },
            { iron: 80, copper: 60, cobalt: 55, nickel: 15 },
            { iron: 110, copper: 85, cobalt: 80, nickel: 25, gold: 2 },
            { iron: 150, copper: 120, cobalt: 110, nickel: 40, gold: 5 },
            { iron: 200, copper: 160, cobalt: 150, nickel: 60, gold: 10 }
        ],
        upgradeValues: {
            1: { penetration: 4 },
            2: { penetration: 5 },
            3: { penetration: 6 },
            4: { penetration: 7 },
            5: { penetration: 9 },
            6: { penetration: 11 },
            7: { penetration: 15 }
        }
    }),
    
    // ===== 机枪升级 =====
    MACHINE_GUN_DAMAGE: new TechUpgrade({
        id: 'MACHINE_GUN_DAMAGE',
        name: '机枪 - 伤害强化',
        description: '提升机枪的伤害值',
        weaponId: 'MACHINE_GUN',
        maxLevel: 10,
        costPerLevel: [
            { iron: 10, copper: 8 },
            { iron: 15, copper: 12 },
            { iron: 22, copper: 18 },
            { iron: 32, copper: 25 },
            { iron: 45, copper: 35 },
            { iron: 60, copper: 50, cobalt: 8 },
            { iron: 80, copper: 70, cobalt: 15 },
            { iron: 105, copper: 95, cobalt: 25, nickel: 5 },
            { iron: 140, copper: 125, cobalt: 40, nickel: 10 },
            { iron: 180, copper: 160, cobalt: 60, nickel: 20, gold: 2 }
        ],
        upgradeValues: {
            1: { damage: 4 },
            2: { damage: 5 },
            3: { damage: 6 },
            4: { damage: 7 },
            5: { damage: 8 },
            6: { damage: 9 },
            7: { damage: 10 },
            8: { damage: 12 },
            9: { damage: 14 },
            10: { damage: 16 }
        }
    }),
    
    MACHINE_GUN_BURST: new TechUpgrade({
        id: 'MACHINE_GUN_BURST',
        name: '机枪 - 连发增强',
        description: '增加机枪的连发次数',
        weaponId: 'MACHINE_GUN',
        maxLevel: 8,
        costPerLevel: [
            { iron: 18, copper: 15 },
            { iron: 28, copper: 25 },
            { iron: 42, copper: 38 },
            { iron: 60, copper: 55, cobalt: 10 },
            { iron: 85, copper: 80, cobalt: 20 },
            { iron: 115, copper: 110, cobalt: 35, nickel: 10 },
            { iron: 150, copper: 145, cobalt: 55, nickel: 20 },
            { iron: 200, copper: 190, cobalt: 80, nickel: 35, gold: 3 }
        ],
        upgradeValues: {
            1: { burstCount: 7 },
            2: { burstCount: 8 },
            3: { burstCount: 9 },
            4: { burstCount: 10 },
            5: { burstCount: 12 },
            6: { burstCount: 14 },
            7: { burstCount: 16 },
            8: { burstCount: 20 }
        }
    }),
    
    MACHINE_GUN_ACCURACY: new TechUpgrade({
        id: 'MACHINE_GUN_ACCURACY',
        name: '机枪 - 精准控制',
        description: '减少机枪的散射角度',
        weaponId: 'MACHINE_GUN',
        maxLevel: 6,
        costPerLevel: [
            { iron: 15, copper: 12 },
            { iron: 25, copper: 22 },
            { iron: 40, copper: 35, cobalt: 5 },
            { iron: 60, copper: 55, cobalt: 15 },
            { iron: 85, copper: 80, cobalt: 30, nickel: 10 },
            { iron: 120, copper: 115, cobalt: 50, nickel: 25, gold: 2 }
        ],
        upgradeValues: {
            1: { centerSpreadAngle: 2.5, bulletSpreadAngle: 4 },
            2: { centerSpreadAngle: 2, bulletSpreadAngle: 3.5 },
            3: { centerSpreadAngle: 1.5, bulletSpreadAngle: 3 },
            4: { centerSpreadAngle: 1, bulletSpreadAngle: 2.5 },
            5: { centerSpreadAngle: 0.5, bulletSpreadAngle: 2 },
            6: { centerSpreadAngle: 0, bulletSpreadAngle: 1.5 }
        }
    }),
    
    // ===== 导弹升级 =====
    MISSILE_DAMAGE: new TechUpgrade({
        id: 'MISSILE_DAMAGE',
        name: '导弹 - 伤害强化',
        description: '提升导弹的伤害值',
        weaponId: 'MISSILE',
        maxLevel: 10,
        costPerLevel: [
            { iron: 20, copper: 20, cobalt: 15 },
            { iron: 35, copper: 35, cobalt: 25 },
            { iron: 55, copper: 55, cobalt: 40 },
            { iron: 80, copper: 80, cobalt: 60, nickel: 10 },
            { iron: 110, copper: 110, cobalt: 85, nickel: 20 },
            { iron: 150, copper: 150, cobalt: 120, nickel: 35 },
            { iron: 200, copper: 200, cobalt: 160, nickel: 55, gold: 3 },
            { iron: 260, copper: 260, cobalt: 210, nickel: 80, gold: 5 },
            { iron: 330, copper: 330, cobalt: 270, nickel: 110, gold: 8 },
            { iron: 420, copper: 420, cobalt: 350, nickel: 150, gold: 12 }
        ],
        upgradeValues: {
            1: { damage: 40 },
            2: { damage: 50 },
            3: { damage: 60 },
            4: { damage: 75 },
            5: { damage: 90 },
            6: { damage: 110 },
            7: { damage: 130 },
            8: { damage: 155 },
            9: { damage: 185 },
            10: { damage: 220 }
        }
    }),
    
    MISSILE_EXPLOSION: new TechUpgrade({
        id: 'MISSILE_EXPLOSION',
        name: '导弹 - 爆炸范围',
        description: '增加导弹的爆炸范围',
        weaponId: 'MISSILE',
        maxLevel: 8,
        costPerLevel: [
            { iron: 25, copper: 25, cobalt: 20 },
            { iron: 40, copper: 40, cobalt: 35 },
            { iron: 60, copper: 60, cobalt: 55, nickel: 10 },
            { iron: 90, copper: 90, cobalt: 80, nickel: 20 },
            { iron: 125, copper: 125, cobalt: 115, nickel: 35 },
            { iron: 170, copper: 170, cobalt: 155, nickel: 55, gold: 3 },
            { iron: 225, copper: 225, cobalt: 205, nickel: 80, gold: 6 },
            { iron: 295, copper: 295, cobalt: 270, nickel: 115, gold: 10 }
        ],
        upgradeValues: {
            1: { explosionRadius: 320 },
            2: { explosionRadius: 360 },
            3: { explosionRadius: 400 },
            4: { explosionRadius: 450 },
            5: { explosionRadius: 500 },
            6: { explosionRadius: 560 },
            7: { explosionRadius: 630 },
            8: { explosionRadius: 700 }
        }
    }),
    
    MISSILE_TRACKING: new TechUpgrade({
        id: 'MISSILE_TRACKING',
        name: '导弹 - 追踪强化',
        description: '提升导弹的追踪速度',
        weaponId: 'MISSILE',
        maxLevel: 6,
        costPerLevel: [
            { iron: 30, copper: 30, cobalt: 25 },
            { iron: 50, copper: 50, cobalt: 45, nickel: 10 },
            { iron: 75, copper: 75, cobalt: 70, nickel: 20 },
            { iron: 110, copper: 110, cobalt: 105, nickel: 35, gold: 2 },
            { iron: 155, copper: 155, cobalt: 150, nickel: 55, gold: 5 },
            { iron: 215, copper: 215, cobalt: 210, nickel: 85, gold: 10 }
        ],
        upgradeValues: {
            1: { trackingAngularSpeed: 210 },
            2: { trackingAngularSpeed: 240 },
            3: { trackingAngularSpeed: 270 },
            4: { trackingAngularSpeed: 310 },
            5: { trackingAngularSpeed: 360 },
            6: { trackingAngularSpeed: 420 }
        }
    }),
    
    // ===== 穿透弹升级 =====
    PENETRATOR_DAMAGE: new TechUpgrade({
        id: 'PENETRATOR_DAMAGE',
        name: '穿透弹 - 伤害强化',
        description: '提升穿透弹的伤害值',
        weaponId: 'PENETRATOR',
        maxLevel: 10,
        costPerLevel: [
            { iron: 15, copper: 12, cobalt: 10 },
            { iron: 25, copper: 20, cobalt: 18 },
            { iron: 38, copper: 32, cobalt: 28 },
            { iron: 55, copper: 48, cobalt: 42, nickel: 8 },
            { iron: 78, copper: 70, cobalt: 62, nickel: 15 },
            { iron: 108, copper: 98, cobalt: 88, nickel: 25 },
            { iron: 145, copper: 135, cobalt: 120, nickel: 40, gold: 2 },
            { iron: 195, copper: 182, cobalt: 165, nickel: 60, gold: 4 },
            { iron: 255, copper: 240, cobalt: 220, nickel: 85, gold: 7 },
            { iron: 330, copper: 315, cobalt: 290, nickel: 120, gold: 12 }
        ],
        upgradeValues: {
            1: { damage: 22 },
            2: { damage: 26 },
            3: { damage: 30 },
            4: { damage: 35 },
            5: { damage: 40 },
            6: { damage: 46 },
            7: { damage: 52 },
            8: { damage: 60 },
            9: { damage: 68 },
            10: { damage: 78 }
        }
    }),
    
    PENETRATOR_COOLDOWN: new TechUpgrade({
        id: 'PENETRATOR_COOLDOWN',
        name: '穿透弹 - 冷却缩减',
        description: '减少穿透弹的冷却时间',
        weaponId: 'PENETRATOR',
        maxLevel: 8,
        costPerLevel: [
            { iron: 12, copper: 10, cobalt: 8 },
            { iron: 20, copper: 18, cobalt: 15 },
            { iron: 32, copper: 30, cobalt: 25 },
            { iron: 48, copper: 46, cobalt: 40, nickel: 8 },
            { iron: 70, copper: 68, cobalt: 60, nickel: 15 },
            { iron: 98, copper: 96, cobalt: 88, nickel: 28, gold: 2 },
            { iron: 135, copper: 132, cobalt: 125, nickel: 45, gold: 4 },
            { iron: 180, copper: 178, cobalt: 170, nickel: 68, gold: 8 }
        ],
        upgradeValues: {
            1: { cooldown: 1100 },
            2: { cooldown: 1000 },
            3: { cooldown: 900 },
            4: { cooldown: 800 },
            5: { cooldown: 700 },
            6: { cooldown: 600 },
            7: { cooldown: 500 },
            8: { cooldown: 400 }
        }
    }),
    
    PENETRATOR_EXPLOSION: new TechUpgrade({
        id: 'PENETRATOR_EXPLOSION',
        name: '穿透弹 - 爆炸范围',
        description: '增加穿透弹的爆炸范围',
        weaponId: 'PENETRATOR',
        maxLevel: 6,
        costPerLevel: [
            { iron: 18, copper: 15, cobalt: 12 },
            { iron: 32, copper: 28, cobalt: 24 },
            { iron: 52, copper: 48, cobalt: 42, nickel: 10 },
            { iron: 78, copper: 74, cobalt: 68, nickel: 20 },
            { iron: 115, copper: 110, cobalt: 105, nickel: 35, gold: 3 },
            { iron: 165, copper: 160, cobalt: 155, nickel: 58, gold: 6 }
        ],
        upgradeValues: {
            1: { explosionRadius: 120 },
            2: { explosionRadius: 140 },
            3: { explosionRadius: 165 },
            4: { explosionRadius: 195 },
            5: { explosionRadius: 230 },
            6: { explosionRadius: 270 }
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
    
    // 获取武器的所有升级加成
    getWeaponUpgrades(weaponId) {
        const upgrades = {};
        
        // 遍历所有科技，找到绑定该武器的科技
        for (const [techId, tech] of Object.entries(TechUpgrades)) {
            if (tech.weaponId === weaponId) {
                const level = this.player.getTechLevel(techId);
                if (level > 0) {
                    const values = tech.getUpgradeValues(level);
                    if (values) {
                        // 合并升级数值
                        Object.assign(upgrades, values);
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
        
        // 应用升级数值
        Object.assign(upgradedConfig, upgrades);
        
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
