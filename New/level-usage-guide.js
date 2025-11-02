// 关卡系统使用示例

/*
=== 关卡系统集成指南 ===

1. 在 game.js 中初始化关卡系统：
   this.levelSystem = new LevelSystem(this.player);

2. 开始关卡：
   this.levelSystem.startLevel('LEVEL_1');

3. 在游戏循环中更新关卡：
   this.levelSystem.update();

4. 在敌机系统中使用关卡数据：
   - 使用 levelSystem.getCurrentSpawnInterval() 获取生成间隔
   - 使用 levelSystem.isEnemyTypeAllowed(enemyId) 检查敌机类型
   - 使用 levelSystem.recordSpawn() 记录生成

5. 显示关卡信息：
   const info = this.levelSystem.getCurrentLevelInfo();
   // info 包含：name, progress, remainingTime 等

6. 关卡完成时自动发放奖励：
   - 固定奖励自动添加到玩家资源
   - 概率掉落独立计算

=== 关卡数据结构示例 ===

new LevelData({
    id: 'LEVEL_1',
    name: '第一关：初次交锋',
    description: '熟悉基本操作，击败基础敌机',
    duration: 60000, // 60秒
    enemyTypes: ['BASIC', 'FAST'], // 允许的敌机类型
    initialSpawnInterval: 2500, // 初始2.5秒生成一次
    intervalDecreaseRate: 80, // 每次减少80ms
    minSpawnInterval: 1000, // 最小1秒
    fixedRewards: {
        iron: 50,
        copper: 20,
        cobalt: 0,
        nickel: 0,
        gold: 0
    },
    dropTable: [
        { 
            resourceType: 'iron', 
            probability: 0.8,  // 80%概率
            minAmount: 10, 
            maxAmount: 30 
        },
        { 
            resourceType: 'copper', 
            probability: 0.5,  // 50%概率
            minAmount: 5, 
            maxAmount: 15 
        }
    ]
})

=== 敌机ID列表 ===

- BASIC: 基础战机
- FAST: 快速战机
- HEAVY: 重型战机
- BOSS: BOSS战机
- LIGHT_MEDIC: 轻型医疗机
- HEAVY_MEDIC: 重型医疗机

=== 预设关卡列表 ===

- LEVEL_1: 第一关（60秒，基础+快速）
- LEVEL_2: 第二关（75秒，基础+快速+重型）
- LEVEL_3: 第三关（90秒，增加医疗机）
- LEVEL_4: 第四关（100秒，重装突击）
- LEVEL_5: 第五关（120秒，BOSS来袭）
- ENDLESS: 无尽模式（无限时间，无奖励）

*/
