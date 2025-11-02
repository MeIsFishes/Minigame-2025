// 科技系统使用示例
// 这个文件展示了如何在游戏中使用科技系统

// ===== 初始化示例 =====
function initializeTechSystem() {
    // 在 game.js 中已经完成
    // this.techSystem = new TechSystem(this.player);
    // this.weaponSystem.setTechSystem(this.techSystem);
    
    console.log('科技系统已初始化');
}

// ===== 测试：添加资源并升级 =====
function testTechUpgrade() {
    // 假设玩家有足够的资源
    game.player.addResource('iron', 100);
    game.player.addResource('copper', 100);
    
    console.log('当前资源:', game.player.getAllResources());
    
    // 检查是否可以升级速射炮伤害
    const canUpgrade = game.techSystem.canUpgrade('BASIC_GUN_DAMAGE');
    console.log('可以升级速射炮伤害吗?', canUpgrade);
    
    if (canUpgrade.success) {
        // 执行升级
        const result = game.techSystem.upgrade('BASIC_GUN_DAMAGE');
        console.log('升级结果:', result);
        
        if (result.success) {
            console.log('升级后的速射炮属性:', 
                game.techSystem.getWeaponUpgrades('BASIC_GUN'));
            
            // 重新初始化武器以应用升级
            game.weaponSystem.initializeWeapons();
            console.log('武器已更新！');
        }
    }
    
    console.log('升级后资源:', game.player.getAllResources());
}

// ===== 查看所有科技 =====
function listAllTechs() {
    const allTechs = game.techSystem.getAllTechs();
    
    console.log('=== 所有科技升级 ===');
    for (const [techId, tech] of Object.entries(allTechs)) {
        const currentLevel = game.player.getTechLevel(techId);
        console.log(`${tech.name} (${tech.weaponId})`);
        console.log(`  当前等级: ${currentLevel}/${tech.maxLevel}`);
        
        if (currentLevel < tech.maxLevel) {
            const nextCost = tech.getCost(currentLevel + 1);
            console.log(`  下一级消耗:`, nextCost);
            const nextValues = tech.getUpgradeValues(currentLevel + 1);
            console.log(`  下一级属性:`, nextValues);
        }
        console.log('---');
    }
}

// ===== 查看特定武器的科技 =====
function listWeaponTechs(weaponId) {
    const techs = game.techSystem.getWeaponTechs(weaponId);
    
    console.log(`=== ${weaponId} 的科技 ===`);
    techs.forEach(({ id, tech, currentLevel }) => {
        console.log(`${tech.name}: Lv${currentLevel}/${tech.maxLevel}`);
        
        if (currentLevel > 0) {
            const values = tech.getUpgradeValues(currentLevel);
            console.log('  当前效果:', values);
        }
    });
    
    // 查看总升级效果
    const totalUpgrades = game.techSystem.getWeaponUpgrades(weaponId);
    console.log('总升级效果:', totalUpgrades);
}

// ===== 模拟完整的升级流程 =====
function simulateUpgradeFlow() {
    console.log('=== 模拟升级流程 ===');
    
    // 1. 玩家获得资源（假设击败敌人后获得）
    console.log('1. 玩家击败敌人，获得资源...');
    game.player.addResource('iron', 50);
    game.player.addResource('copper', 30);
    console.log('当前资源:', game.player.getAllResources());
    
    // 2. 检查可以升级哪些科技
    console.log('\n2. 检查可升级的科技...');
    const upgradableTechs = [];
    const allTechs = game.techSystem.getAllTechs();
    
    for (const [techId, tech] of Object.entries(allTechs)) {
        const check = game.techSystem.canUpgrade(techId);
        if (check.success) {
            upgradableTechs.push({ techId, tech, cost: check.cost });
        }
    }
    
    console.log(`可升级的科技数量: ${upgradableTechs.length}`);
    upgradableTechs.forEach(({ tech, cost }) => {
        console.log(`  - ${tech.name}, 消耗:`, cost);
    });
    
    // 3. 选择一个科技升级
    if (upgradableTechs.length > 0) {
        const selectedTech = upgradableTechs[0];
        console.log(`\n3. 选择升级: ${selectedTech.tech.name}`);
        
        const result = game.techSystem.upgrade(selectedTech.techId);
        if (result.success) {
            console.log(`✅ 升级成功！等级: ${result.newLevel}`);
            console.log('剩余资源:', game.player.getAllResources());
            
            // 4. 重新初始化武器以应用升级
            console.log('\n4. 应用升级到武器...');
            game.weaponSystem.initializeWeapons();
            console.log('✅ 武器已更新！');
            
            // 5. 查看升级后的武器属性
            const weaponId = selectedTech.tech.weaponId;
            const upgrades = game.techSystem.getWeaponUpgrades(weaponId);
            console.log(`${weaponId} 当前属性:`, upgrades);
        }
    }
}

// ===== 保存和加载科技数据 =====
function testSaveAndLoad() {
    console.log('=== 测试保存和加载 ===');
    
    // 保存数据
    const saveData = game.player.exportData();
    console.log('导出的数据:', saveData);
    console.log('科技等级:', saveData.techLevels);
    
    // 模拟重新加载
    const newPlayer = new Player();
    newPlayer.importData(saveData);
    console.log('加载后的科技等级:', newPlayer.getAllTechLevels());
}

// ===== 批量升级示例 =====
function maxOutWeapon(weaponId) {
    console.log(`=== 尝试最大化 ${weaponId} ===`);
    
    // 先给予大量资源
    game.player.addResource('iron', 10000);
    game.player.addResource('copper', 10000);
    game.player.addResource('cobalt', 5000);
    game.player.addResource('nickel', 2000);
    game.player.addResource('gold', 500);
    
    const techs = game.techSystem.getWeaponTechs(weaponId);
    
    techs.forEach(({ id, tech }) => {
        console.log(`\n升级 ${tech.name}...`);
        
        // 尝试升级到最大等级
        for (let level = 1; level <= tech.maxLevel; level++) {
            const result = game.techSystem.upgrade(id);
            if (result.success) {
                console.log(`  Lv${result.newLevel} ✓`);
            } else {
                console.log(`  无法升级到 Lv${level}: ${result.reason}`);
                break;
            }
        }
    });
    
    console.log('\n最终武器属性:');
    const finalUpgrades = game.techSystem.getWeaponUpgrades(weaponId);
    console.log(finalUpgrades);
    
    console.log('\n剩余资源:', game.player.getAllResources());
}

// ===== 在浏览器控制台使用 =====
console.log(`
科技系统测试函数已加载！
可用命令：
- testTechUpgrade() - 测试升级流程
- listAllTechs() - 列出所有科技
- listWeaponTechs('BASIC_GUN') - 查看特定武器的科技
- simulateUpgradeFlow() - 模拟完整升级流程
- testSaveAndLoad() - 测试保存和加载
- maxOutWeapon('BASIC_GUN') - 最大化某个武器的所有升级

示例：
> testTechUpgrade()
> listWeaponTechs('SHOTGUN')
> maxOutWeapon('MISSILE')
`);
