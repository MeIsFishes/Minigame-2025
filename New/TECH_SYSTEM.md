# 科技升级系统文档

## 概述
科技系统实现了局外成长机制，玩家可以使用资源升级武器属性。升级是永久性的，每次进入游戏时会自动应用到武器上。

## 系统架构

```
TechSystem (tech.js)
├── TechUpgrade - 科技升级数据结构
├── TechUpgrades - 所有科技升级库
└── TechSystem - 科技管理器

Player (player.js)
└── techLevels - 存储玩家的科技等级 { techId: level }

WeaponSystem (weapon.js)
└── initializeWeapons() - 初始化时应用科技升级
```

## 科技数据结构

每个科技升级包含以下字段：

```javascript
{
    id: 'BASIC_GUN_DAMAGE',           // 科技ID
    name: '速射炮 - 伤害强化',         // 显示名称
    description: '提升速射炮的伤害值', // 描述
    weaponId: 'BASIC_GUN',             // 绑定的武器ID
    maxLevel: 10,                      // 最大等级
    costPerLevel: [                    // 每级的资源消耗
        { iron: 10, copper: 5 },       // Lv1
        { iron: 15, copper: 10 },      // Lv2
        // ...
    ],
    upgradeValues: {                   // 每级的属性值（绝对数值）
        1: { damage: 12 },
        2: { damage: 14 },
        // ...
    }
}
```

## 可升级的武器属性

科技可以修改以下武器属性：
- `damage` - 伤害值
- `cooldown` - 冷却时间（毫秒）
- `bulletSpeed` - 子弹速度
- `bulletsPerShot` - 单次射击子弹数
- `burstCount` - 连发次数
- `centerSpreadAngle` - 中心散射角
- `bulletSpreadAngle` - 子弹散射角
- `penetration` - 穿透次数
- `explosionRadius` - 爆炸范围
- `trackingAngularSpeed` - 追踪速度

## 现有科技列表

### 速射炮 (BASIC_GUN)
1. **BASIC_GUN_DAMAGE** - 伤害强化 (10级)
   - 伤害: 10 → 35
   
2. **BASIC_GUN_COOLDOWN** - 冷却缩减 (10级)
   - 冷却: 2500ms → 750ms
   
3. **BASIC_GUN_SPEED** - 子弹加速 (8级)
   - 速度: 700 → 1800

### 霰弹枪 (SHOTGUN)
1. **SHOTGUN_DAMAGE** - 伤害强化 (10级)
   - 伤害: 2 → 14
   
2. **SHOTGUN_BULLETS** - 弹丸增量 (5级)
   - 子弹数: 10 → 20
   
3. **SHOTGUN_SPREAD** - 精准控制 (8级)
   - 散射角: 8° → 3.5°

### 狙击枪 (SNIPER)
1. **SNIPER_DAMAGE** - 伤害强化 (10级)
   - 伤害: 20 → 120
   
2. **SNIPER_COOLDOWN** - 冷却缩减 (10级)
   - 冷却: 15000ms → 2500ms
   
3. **SNIPER_PENETRATION** - 穿透增强 (7级)
   - 穿透: 3 → 15

### 机枪 (MACHINE_GUN)
1. **MACHINE_GUN_DAMAGE** - 伤害强化 (10级)
   - 伤害: 3 → 16
   
2. **MACHINE_GUN_BURST** - 连发增强 (8级)
   - 连发: 6 → 20
   
3. **MACHINE_GUN_ACCURACY** - 精准控制 (6级)
   - 散射角: 5° → 1.5°

### 导弹 (MISSILE)
1. **MISSILE_DAMAGE** - 伤害强化 (10级)
   - 伤害: 30 → 220
   
2. **MISSILE_EXPLOSION** - 爆炸范围 (8级)
   - 范围: 280 → 700
   
3. **MISSILE_TRACKING** - 追踪强化 (6级)
   - 追踪速度: 180°/s → 420°/s

### 穿透弹 (PENETRATOR)
1. **PENETRATOR_DAMAGE** - 伤害强化 (10级)
   - 伤害: 18 → 78
   
2. **PENETRATOR_COOLDOWN** - 冷却缩减 (8级)
   - 冷却: 1200ms → 400ms
   
3. **PENETRATOR_EXPLOSION** - 爆炸范围 (6级)
   - 范围: 100 → 270

## 使用方法

### 1. 检查是否可以升级
```javascript
const result = techSystem.canUpgrade('BASIC_GUN_DAMAGE');
if (result.success) {
    console.log('可以升级！消耗:', result.cost);
    console.log('下一级:', result.nextLevel);
} else {
    console.log('无法升级:', result.reason);
}
```

### 2. 执行升级
```javascript
const result = techSystem.upgrade('BASIC_GUN_DAMAGE');
if (result.success) {
    console.log('升级成功！当前等级:', result.newLevel);
} else {
    console.log('升级失败:', result.reason);
}
```

### 3. 获取武器的所有科技
```javascript
const techs = techSystem.getWeaponTechs('BASIC_GUN');
techs.forEach(({ id, tech, currentLevel }) => {
    console.log(`${tech.name}: Lv${currentLevel}/${tech.maxLevel}`);
});
```

### 4. 查看升级效果
```javascript
const upgrades = techSystem.getWeaponUpgrades('BASIC_GUN');
console.log('速射炮的所有升级:', upgrades);
// 输出: { damage: 35, cooldown: 750, bulletSpeed: 1800 }
```

## 工作流程

### 游戏启动时
```javascript
// 1. 创建科技系统
this.techSystem = new TechSystem(this.player);

// 2. 设置到武器系统
this.weaponSystem.setTechSystem(this.techSystem);

// 3. 初始化武器（自动应用升级）
this.weaponSystem.initializeWeapons();
```

### 升级流程
```javascript
// 玩家在商店/升级界面
function onUpgradeButtonClick(techId) {
    const result = techSystem.canUpgrade(techId);
    
    if (!result.success) {
        showMessage(result.reason);
        return;
    }
    
    // 显示确认对话框
    showConfirmDialog(
        `升级 ${TechUpgrades[techId].name} 到 Lv${result.nextLevel}?`,
        `消耗: ${formatCost(result.cost)}`,
        () => {
            const upgradeResult = techSystem.upgrade(techId);
            if (upgradeResult.success) {
                showMessage(`升级成功！当前等级: ${upgradeResult.newLevel}`);
                updateUI();
            }
        }
    );
}
```

### 数据持久化
```javascript
// 保存游戏
const saveData = player.exportData();
// saveData.techLevels 包含所有科技等级
localStorage.setItem('gameSave', JSON.stringify(saveData));

// 加载游戏
const saveData = JSON.parse(localStorage.getItem('gameSave'));
player.importData(saveData);
// 科技等级会自动恢复
```

## 数据隔离机制

科技系统确保**原始武器数据永不被修改**：

1. **WeaponPresets** 中的武器是只读的原始数据
2. `applyUpgradesToWeapon()` 创建**新的武器实例**
3. 科技升级值覆盖到新实例上
4. 每次初始化都从原始数据重新应用

```javascript
// ✅ 正确：从原始数据创建新实例
const originalWeapon = WeaponPresets.BASIC_GUN;  // 原始数据
const upgradedWeapon = techSystem.applyUpgradesToWeapon(originalWeapon);

// ❌ 错误：直接修改原始数据（系统不会这样做）
// WeaponPresets.BASIC_GUN.damage = 100;  // 这会污染数据
```

## 添加新科技

要添加新的科技升级：

```javascript
// 在 tech.js 的 TechUpgrades 中添加
NEW_TECH_ID: new TechUpgrade({
    id: 'NEW_TECH_ID',
    name: '新科技名称',
    description: '新科技描述',
    weaponId: 'WEAPON_ID',  // 绑定的武器
    maxLevel: 10,
    costPerLevel: [
        { iron: 10, copper: 5 },     // Lv1
        { iron: 20, copper: 10 },    // Lv2
        // ... 更多等级
    ],
    upgradeValues: {
        1: { damage: 15 },    // Lv1 的属性值
        2: { damage: 18 },    // Lv2 的属性值
        // ... 更多等级
    }
})
```

## 资源消耗平衡

资源消耗设计原则：
- **前期** (Lv1-3): 主要消耗铁和铜
- **中期** (Lv4-6): 引入钴，增加铁铜消耗
- **后期** (Lv7-9): 引入镍，大幅增加消耗
- **满级** (Lv10): 需要金，所有资源大量消耗

稀有度：铁 < 铜 < 钴 < 镍 < 金

## 注意事项

1. **升级是永久的** - 一旦升级，效果会一直保留
2. **升级值是绝对值** - 不是增量，直接替换原始值
3. **多个科技可以同时生效** - 但相同属性会被覆盖（最后应用的生效）
4. **科技绑定武器** - 每个科技只影响特定武器
5. **数据自动保存** - 使用 `player.exportData()` 和 `importData()`

## 未来扩展

可以添加的新功能：
- 科技树系统（解锁前置科技）
- 科技重置（返还部分资源）
- 临时增益（战斗内生效）
- 科技组合效果（多个科技配合）
- 科技预览（升级前查看效果）
