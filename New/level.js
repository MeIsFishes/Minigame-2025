// level.js - 关卡系统：管理游戏关卡和奖励

// 资源掉落配置
class ResourceDrop {
    constructor(config) {
        this.resourceType = config.resourceType; // 资源种类：'iron', 'copper', 'cobalt', 'nickel', 'gold'
        this.probability = config.probability; // 掉落概率 (0-1)
        this.minAmount = config.minAmount || 1; // 最小掉落数量
        this.maxAmount = config.maxAmount || 1; // 最大掉落数量
    }
    
    // 尝试掉落资源
    tryDrop() {
        if (Math.random() < this.probability) {
            const amount = Math.floor(Math.random() * (this.maxAmount - this.minAmount + 1)) + this.minAmount;
            return {
                type: this.resourceType,
                amount: amount
            };
        }
        return null;
    }
}

// 关卡数据结构
class LevelData {
    constructor(config) {
        this.id = config.id; // 关卡ID
        this.name = config.name || '未命名关卡'; // 关卡名称
        this.description = config.description || ''; // 关卡描述
        this.difficulty = config.difficulty || 1; // 难度星级（1-5星，仅作提示用）
        this.duration = config.duration || 60000; // 关卡持续时间（毫秒）
        this.enemyTypes = config.enemyTypes || []; // 关卡包含的敌机ID列表
        this.enemyWeights = config.enemyWeights || {}; // 覆盖敌机权重配置 { 'BASIC': 50, 'HEAVY': 10 }
        this.initialSpawnInterval = config.initialSpawnInterval || 2000; // 初始生成敌机间隔（毫秒）
        this.intervalDecreaseRate = config.intervalDecreaseRate || 50; // 每次生成后减少的间隔（毫秒）
        this.minSpawnInterval = config.minSpawnInterval || 500; // 最小生成间隔（毫秒）
        
        // 固定奖励资源
        this.fixedRewards = config.fixedRewards || {
            iron: 0,
            copper: 0,
            cobalt: 0,
            nickel: 0,
            gold: 0
        };
        
        // 概率掉落资源列表
        this.dropTable = config.dropTable || [];
        // 将配置转换为 ResourceDrop 对象
        if (this.dropTable.length > 0 && !(this.dropTable[0] instanceof ResourceDrop)) {
            this.dropTable = this.dropTable.map(drop => new ResourceDrop(drop));
        }
    }
    
    // 计算关卡奖励
    calculateRewards() {
        const rewards = { ...this.fixedRewards };
        
        // 处理概率掉落
        this.dropTable.forEach(drop => {
            const result = drop.tryDrop();
            if (result) {
                rewards[result.type] = (rewards[result.type] || 0) + result.amount;
            }
        });
        
        return rewards;
    }
    
    // 获取当前生成间隔（基于已生成敌机数量）
    getSpawnInterval(spawnCount) {
        const decreased = this.initialSpawnInterval - (spawnCount * this.intervalDecreaseRate);
        return Math.max(this.minSpawnInterval, decreased);
    }
}

// 预设关卡库
const LevelPresets = {
    LEVEL_1: new LevelData({
        id: 'LEVEL_1',
        name: '无名深空',
        description: '这是你的第一个战场，你有信心吗？',
        difficulty: 1, // ⭐ 难度：1星
        duration: 40000,
        enemyTypes: ['BASIC', 'FAST'],
        initialSpawnInterval: 2500,
        intervalDecreaseRate: 80,
        minSpawnInterval: 1000,
        fixedRewards: {
            iron: 40,
            copper: 20,
            cobalt: 0,
            nickel: 0,
            gold: 0
        },
        dropTable: [
            { resourceType: 'iron', probability: 1.0, minAmount: 0, maxAmount: 20 },
            { resourceType: 'copper', probability: 1.0, minAmount: 0, maxAmount: 10 },
            { resourceType: 'cobalt', probability: 1.0, minAmount: 0, maxAmount: 2 },
            { resourceType: 'nickel', probability: 1.0, minAmount: 0, maxAmount: 2 }
        ]
    }),
    
    LEVEL_2: new LevelData({
        id: 'LEVEL_2',
        name: '遮天蔽日',
        description: '敌机密度极高，小心应对！',
        difficulty: 2, // ⭐⭐ 难度：2星
        duration: 80000,
        enemyTypes: ['BASIC', 'FAST', 'LIGHT_MEDIC'],
        enemyWeights: {
            'BASIC': 20,        // 普通战机为主
            'FAST': 25,         // 快速战机
            'LIGHT_MEDIC': 4    // 降低医疗机权重
        },
        initialSpawnInterval: 800, // 初始间隔很短
        intervalDecreaseRate: 20,
        minSpawnInterval: 400, // 最小间隔极短
        fixedRewards: {
            iron: 120,
            copper: 40,
            cobalt: 0,
            nickel: 10,
            gold: 0
        },
        dropTable: [
            { resourceType: 'cobalt', probability: 1, minAmount: 0, maxAmount: 5 },
            { resourceType: 'nickel', probability: 1, minAmount: 0, maxAmount: 5 }
        ]
    }),
    
    LEVEL_3: new LevelData({
        id: 'LEVEL_3',
        name: '航天中队',
        description: '各种战机组成的混编中队，且战且退。',
        difficulty: 2, // ⭐⭐ 难度：2星
        duration: 80000,
        enemyTypes: ['BASIC', 'FAST', 'LIGHT_MEDIC', 'HEAVY'],
        initialSpawnInterval: 2500,
        intervalDecreaseRate: 80,
        minSpawnInterval: 1000,
        fixedRewards: {
            iron: 40,
            copper: 120,
            cobalt: 10,
            nickel: 0,
            gold: 0
        },
        dropTable: [
            { resourceType: 'cobalt', probability: 1, minAmount: 0, maxAmount: 5 },
            { resourceType: 'nickel', probability: 1, minAmount: 0, maxAmount: 5 }
        ]
    }),
    
    LEVEL_4: new LevelData({
        id: 'LEVEL_4',
        name: '第十五铁甲师',
        description: '装甲部队来袭！铁甲舰会格挡伤害，需要强大的火力才能突破。',
        difficulty: 3, // ⭐⭐⭐ 难度：3星
        duration: 100000,
        enemyTypes: ['ARMORED', 'HEAVY_ARMORED', 'HEAVY_MEDIC'],
        initialSpawnInterval: 3000,
        intervalDecreaseRate: 70,
        minSpawnInterval: 1500,
        fixedRewards: {
            iron: 100,
            copper: 100,
            cobalt: 5,
            nickel: 5,
            gold: 0
        },
        dropTable: [
            { resourceType: 'cobalt', probability: 1, minAmount: 1, maxAmount: 10 },
            { resourceType: 'nickel', probability: 1, minAmount: 1, maxAmount: 10 }
        ]
    }),
    
    LEVEL_5: new LevelData({
        id: 'LEVEL_5',
        name: '民兵总预备队',
        description: '边境星域的最后防线已被激活！久经训练的预备役部队倾巢而出，重型战斗机群如钢铁洪流般涌来，传奇王牌驾驶员更是亲自出战。他们誓死保卫家园，绝不后退半步。这将是一场生死存亡的血战！',
        difficulty: 3, // ⭐⭐⭐ 难度：3星
        duration: 100000,
        enemyTypes: ['HEAVY', 'BOSS', 'BASIC', 'LIGHT_MEDIC'],
        enemyWeights: {
            'HEAVY': 25,         // 大量重型战机
            'BOSS': 10,          // 强调BOSS机
            'BASIC': 30,         // 一定数量普通战机
            'LIGHT_MEDIC': 5     // 少量医疗机
        },
        initialSpawnInterval: 2200,
        intervalDecreaseRate: 60,
        minSpawnInterval: 1500,
        fixedRewards: {
            iron: 30,
            copper: 30,
            cobalt: 5,
            nickel: 5,
            gold: 10
        },
        dropTable: [
            { resourceType: 'gold', probability: 1.0, minAmount: 0, maxAmount: 15 },  // 大量金矿
            { resourceType: 'cobalt', probability: 1.0, minAmount: 0, maxAmount: 10 }, // 大量钴矿
            { resourceType: 'nickel', probability: 1.0, minAmount: 0, maxAmount: 10 }, // 大量镍矿
            { resourceType: 'iron', probability: 1, minAmount: 0, maxAmount: 15 },   // 少量铁矿
            { resourceType: 'copper', probability: 1, minAmount: 0, maxAmount: 15 }  // 少量铜矿
        ]
    }),
    
    LEVEL_6: new LevelData({
        id: 'LEVEL_6',
        name: '第二联合舰队',
        description: '第二星系地方太空力量联合出击，极其危险！',
        difficulty: 4, // ⭐⭐⭐⭐ 难度：4星
        duration: 120000,
        enemyTypes: ['SHIELD', 'MOTHERSHIP', 'FAST', 'BOSS', 'LIGHT_MEDIC', 'HEAVY_MEDIC'],
        enemyWeights: {
            'SHIELD': 20,        // 提高护盾飞机出现率
            'MOTHERSHIP': 8,     // 提高母舰出现率
            'FAST': 15,          // 快速战机
            'BOSS': 5,           // BOSS机
            'LIGHT_MEDIC': 8,    // 轻型医疗
            'HEAVY_MEDIC': 4     // 重型医疗
        },
        initialSpawnInterval: 2800,
        intervalDecreaseRate: 60,
        minSpawnInterval: 1200,
        fixedRewards: {
            iron: 120,
            copper: 120,
            cobalt: 20,
            nickel: 20,
            gold: 5
        },
        dropTable: [
            { resourceType: 'gold', probability: 1.0, minAmount: 0, maxAmount: 10 },
            { resourceType: 'cobalt', probability: 1, minAmount: 0, maxAmount: 15 },
            { resourceType: 'nickel', probability: 1, minAmount: 0, maxAmount: 15 }
        ]
    })
};

// 关卡系统管理器
class LevelSystem {
    constructor(player) {
        this.player = player;
        this.currentLevel = null;
        this.levelStartTime = null;
        this.levelEndTime = null;
        this.isLevelActive = false;
        this.spawnCount = 0;
        this.levelCompleted = false;
        this.levelFailed = false;
        this.lastRewards = null; // 存储最后一次的奖励信息
    }
    
    // 开始关卡
    startLevel(levelId) {
        const levelData = LevelPresets[levelId];
        if (!levelData) {
            console.error(`关卡 ${levelId} 不存在`);
            return false;
        }
        
        this.currentLevel = levelData;
        this.levelStartTime = Date.now();
        this.levelEndTime = levelData.duration === Infinity ? Infinity : this.levelStartTime + levelData.duration;
        this.isLevelActive = true;
        this.spawnCount = 0;
        this.levelCompleted = false;
        this.levelFailed = false;
        
        console.log(`关卡开始: ${levelData.name}`);
        return true;
    }
    
    // 更新关卡状态
    update() {
        if (!this.isLevelActive || !this.currentLevel) return;
        
        const currentTime = Date.now();
        
        // 检查关卡是否超时完成
        if (currentTime >= this.levelEndTime && !this.levelCompleted && !this.levelFailed) {
            this.completeLevel();
        }
    }
    
    // 完成关卡
    completeLevel() {
        if (!this.currentLevel || this.levelCompleted) return;
        
        this.levelCompleted = true;
        this.isLevelActive = false;
        
        // 计算并发放奖励
        const rewards = this.currentLevel.calculateRewards();
        this.lastRewards = rewards; // 保存奖励信息用于UI显示
        
        console.log(`关卡完成: ${this.currentLevel.name}`);
        console.log('获得奖励:', rewards);
        
        // 将奖励添加到玩家资源
        if (this.player) {
            for (const [type, amount] of Object.entries(rewards)) {
                if (amount > 0) {
                    this.player.addResource(type, amount);
                }
            }
        }
        
        return rewards;
    }
    
    // 获取最后一次的奖励信息
    getLastRewards() {
        return this.lastRewards;
    }
    
    // 关卡失败
    failLevel() {
        if (!this.currentLevel || this.levelFailed) return;
        
        this.levelFailed = true;
        this.isLevelActive = false;
        
        console.log(`关卡失败: ${this.currentLevel.name}`);
    }
    
    // 记录敌机生成
    recordSpawn() {
        this.spawnCount++;
    }
    
    // 获取当前生成间隔
    getCurrentSpawnInterval() {
        if (!this.currentLevel) return 2000;
        return this.currentLevel.getSpawnInterval(this.spawnCount);
    }
    
    // 获取关卡剩余时间
    getRemainingTime() {
        if (!this.isLevelActive || !this.currentLevel) return 0;
        if (this.levelEndTime === Infinity) return Infinity;
        
        const remaining = this.levelEndTime - Date.now();
        return Math.max(0, remaining);
    }
    
    // 获取关卡进度 (0-1)
    getLevelProgress() {
        if (!this.isLevelActive || !this.currentLevel) return 0;
        if (this.currentLevel.duration === Infinity) return 0;
        
        const elapsed = Date.now() - this.levelStartTime;
        return Math.min(1, elapsed / this.currentLevel.duration);
    }
    
    // 检查敌机类型是否在当前关卡中
    isEnemyTypeAllowed(enemyId) {
        if (!this.currentLevel) return true;
        return this.currentLevel.enemyTypes.includes(enemyId);
    }
    
    // 获取当前关卡信息
    getCurrentLevelInfo() {
        if (!this.currentLevel) return null;
        
        return {
            id: this.currentLevel.id,
            name: this.currentLevel.name,
            description: this.currentLevel.description,
            difficulty: this.currentLevel.difficulty,
            progress: this.getLevelProgress(),
            remainingTime: this.getRemainingTime(),
            spawnCount: this.spawnCount,
            isActive: this.isLevelActive,
            isCompleted: this.levelCompleted,
            isFailed: this.levelFailed
        };
    }
    
    // 获取所有关卡列表
    getAllLevels() {
        const levels = [];
        for (const [key, level] of Object.entries(LevelPresets)) {
            levels.push({
                id: level.id,
                name: level.name,
                description: level.description,
                difficulty: level.difficulty,
                duration: level.duration,
                fixedRewards: level.fixedRewards
            });
        }
        return levels;
    }
    
    // 重置关卡系统
    reset() {
        this.currentLevel = null;
        this.levelStartTime = null;
        this.levelEndTime = null;
        this.isLevelActive = false;
        this.spawnCount = 0;
        this.levelCompleted = false;
        this.levelFailed = false;
        this.lastRewards = null;
    }
}
