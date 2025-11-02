# 科技系统快速参考

## 核心概念
- **科技升级**: 永久性局外成长系统
- **资源消耗**: 铁、铜、钴、镍、金
- **数据隔离**: 原始武器数据永不被修改
- **自动应用**: 进入游戏时自动应用到武器

## 快速API

### 升级操作
```javascript
// 检查能否升级
game.techSystem.canUpgrade('BASIC_GUN_DAMAGE')
// → { success: true, cost: {iron: 10, copper: 5}, nextLevel: 1 }

// 执行升级
game.techSystem.upgrade('BASIC_GUN_DAMAGE')
// → { success: true, newLevel: 1 }
```

### 查询信息
```javascript
// 当前等级
game.player.getTechLevel('BASIC_GUN_DAMAGE')  // → 0

// 武器所有科技
game.techSystem.getWeaponTechs('BASIC_GUN')
// → [{ id, tech, currentLevel }, ...]

// 武器总升级效果
game.techSystem.getWeaponUpgrades('BASIC_GUN')
// → { damage: 35, cooldown: 750, bulletSpeed: 1800 }
```

### 资源管理
```javascript
// 添加资源
game.player.addResource('iron', 100)
game.player.addResource('copper', 50)

// 查询资源
game.player.hasResource('iron', 10)  // → true/false
game.player.getResource('iron')      // → 100
game.player.getAllResources()        // → {iron: 100, ...}
```

## 26个科技ID速查

### 速射炮 (BASIC_GUN)
- `BASIC_GUN_DAMAGE` - 伤害 10→35 (10级)
- `BASIC_GUN_COOLDOWN` - 冷却 2500→750ms (10级)
- `BASIC_GUN_SPEED` - 速度 700→1800 (8级)

### 霰弹枪 (SHOTGUN)
- `SHOTGUN_DAMAGE` - 伤害 2→14 (10级)
- `SHOTGUN_BULLETS` - 子弹数 10→20 (5级)
- `SHOTGUN_SPREAD` - 散射 8°→3.5° (8级)

### 狙击枪 (SNIPER)
- `SNIPER_DAMAGE` - 伤害 20→120 (10级)
- `SNIPER_COOLDOWN` - 冷却 15000→2500ms (10级)
- `SNIPER_PENETRATION` - 穿透 3→15 (7级)

### 机枪 (MACHINE_GUN)
- `MACHINE_GUN_DAMAGE` - 伤害 3→16 (10级)
- `MACHINE_GUN_BURST` - 连发 6→20 (8级)
- `MACHINE_GUN_ACCURACY` - 散射 5°→1.5° (6级)

### 导弹 (MISSILE)
- `MISSILE_DAMAGE` - 伤害 30→220 (10级)
- `MISSILE_EXPLOSION` - 爆炸 280→700 (8级)
- `MISSILE_TRACKING` - 追踪 180→420°/s (6级)

### 穿透弹 (PENETRATOR)
- `PENETRATOR_DAMAGE` - 伤害 18→78 (10级)
- `PENETRATOR_COOLDOWN` - 冷却 1200→400ms (8级)
- `PENETRATOR_EXPLOSION` - 爆炸 100→270 (6级)

## 资源稀有度
```
铁 (iron)   ← 最常见
铜 (copper)
钴 (cobalt)
镍 (nickel)
金 (gold)   ← 最稀有
```

## 升级成本规律
| 等级范围 | 主要消耗 | 稀有资源 |
|---------|---------|---------|
| Lv 1-3  | 铁、铜   | -       |
| Lv 4-6  | 铁、铜   | 钴      |
| Lv 7-9  | 铁、铜   | 钴、镍   |
| Lv 10   | 全部    | 金      |

## 控制台测试命令

```javascript
// 给予资源
game.player.addResource('iron', 10000)
game.player.addResource('copper', 10000)
game.player.addResource('cobalt', 5000)
game.player.addResource('nickel', 2000)
game.player.addResource('gold', 500)

// 查看所有科技
listAllTechs()

// 查看某武器科技
listWeaponTechs('BASIC_GUN')

// 升级到满级
maxOutWeapon('BASIC_GUN')

// 模拟完整流程
simulateUpgradeFlow()

// 测试保存/加载
testSaveAndLoad()
```

## UI集成示例

```javascript
// 升级按钮点击处理
function onUpgradeClick(techId) {
    const result = game.techSystem.canUpgrade(techId);
    
    if (!result.success) {
        alert(result.reason);
        return;
    }
    
    // 显示确认对话框
    if (confirm(`升级需要: ${formatCost(result.cost)}`)) {
        const upgradeResult = game.techSystem.upgrade(techId);
        
        if (upgradeResult.success) {
            alert(`升级成功！当前等级: ${upgradeResult.newLevel}`);
            updateTechUI();
            game.weaponSystem.initializeWeapons();
        }
    }
}

// 格式化资源显示
function formatCost(cost) {
    return Object.entries(cost)
        .map(([type, amount]) => `${type}: ${amount}`)
        .join(', ');
}
```

## 注意事项

1. ⚠️ 升级后记得调用 `game.weaponSystem.initializeWeapons()` 重新应用
2. ⚠️ 升级值是**绝对值**，不是增量
3. ⚠️ 科技等级自动保存在 `player.exportData()` 中
4. ✅ 原始武器数据永远不会被修改
5. ✅ 每次升级都会触发资源变化回调

## 完整文档
- 详细文档: `TECH_SYSTEM.md`
- 实现总结: `TECH_IMPLEMENTATION_SUMMARY.md`
- 测试示例: `tech_examples.js`
