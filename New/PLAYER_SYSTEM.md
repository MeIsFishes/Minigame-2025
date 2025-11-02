# 玩家系统使用指南

## 概述

`player.js` 提供了完整的玩家数据管理系统，包括：
- 生命值和护盾
- 得分和等级系统
- 武器配置（按排配置）
- 游戏统计数据
- 本地存储支持

## 玩家属性

### 基础属性
```javascript
player.health          // 当前生命值
player.maxHealth       // 最大生命值 (默认: 100)
player.shield          // 当前护盾值
player.maxShield       // 最大护盾值 (默认: 50)
player.score           // 当前得分
player.level           // 当前等级
player.experience      // 当前经验值
```

### 游戏统计
```javascript
player.stats.totalShots       // 总射击次数
player.stats.totalHits        // 总命中次数
player.stats.enemiesKilled    // 击杀敌人数
player.stats.accuracy         // 准确率 (%)
player.stats.maxCombo         // 最大连击数
player.stats.currentCombo     // 当前连击数
```

## 武器配置系统

### 按排配置武器

玩家可以为键盘的三排分别配置不同的武器：

```javascript
// 第一排 (Q W E R T Y U I O P) - 配置速射炮
player.setWeaponForRow(1, WeaponPresets.RAPID_FIRE);

// 第二排 (A S D F G H J K L) - 配置霰弹枪
player.setWeaponForRow(2, WeaponPresets.SHOTGUN);

// 第三排 (Z X C V B N M) - 配置狙击炮
player.setWeaponForRow(3, WeaponPresets.SNIPER);
```

### 获取武器配置

```javascript
// 获取指定键位的武器
const weapon = player.getWeaponForKey('Q'); // 返回第一排的武器

// 获取完整配置
const loadout = player.getLoadout();
console.log(loadout.row1); // 第一排的武器
console.log(loadout.row2); // 第二排的武器
console.log(loadout.row3); // 第三排的武器
```

## 常用方法

### 生命值管理

```javascript
// 受到伤害
const isDead = player.takeDamage(10); // 返回是否死亡

// 恢复生命值
player.heal(20);

// 恢复护盾
player.rechargeShield(10);

// 检查是否存活
if (player.isAlive()) {
    // 玩家还活着
}
```

### 得分和等级

```javascript
// 增加分数（自动处理升级）
player.addScore(100);

// 增加击杀统计
player.addKill();

// 获取状态
const status = player.getStatus();
console.log(`等级: ${status.level}`);
console.log(`生命值: ${status.health}/${status.maxHealth}`);
console.log(`分数: ${status.score}`);
```

### 游戏统计

```javascript
// 记录射击
player.addShot();

// 记录命中
player.addHit();

// 获取统计数据
const stats = player.getStats();
console.log(`准确率: ${stats.accuracy}%`);
console.log(`最大连击: ${stats.maxCombo}`);
```

### 重置和保存

```javascript
// 重置玩家状态（开始新游戏）
player.reset();

// 保存武器配置到本地存储
player.saveLoadout();

// 从本地存储加载配置
player.loadLoadout();

// 导出玩家数据
const saveData = player.exportData();
localStorage.setItem('gameSave', JSON.stringify(saveData));

// 导入玩家数据
const saveData = JSON.parse(localStorage.getItem('gameSave'));
player.importData(saveData);
```

## 在游戏中的集成

### game.js 中的使用

```javascript
class Game {
    constructor() {
        // 创建玩家
        this.player = new Player();
        
        // 将玩家传递给武器系统
        this.weaponSystem = new WeaponSystem(this.canvas, this.player);
    }
    
    startGame() {
        // 重置玩家状态
        this.player.reset();
        
        // 配置武器（可选）
        this.player.setWeaponForRow(1, WeaponPresets.RAPID_FIRE);
        this.player.setWeaponForRow(2, WeaponPresets.SHOTGUN);
        this.player.setWeaponForRow(3, WeaponPresets.SNIPER);
        
        // 重新加载武器配置
        this.weaponSystem.initializeWeapons();
    }
}
```

## 预设武器示例

目前可用的预设武器：

1. **BASIC_GUN (基础机枪)**
   - 伤害: 1
   - 冷却: 1000ms
   - 颜色: 金色 (#FFD700)

2. **RAPID_FIRE (速射炮)**
   - 伤害: 1
   - 冷却: 500ms
   - 颜色: 红色 (#FF6B6B)
   - 特点: 射速快，轻微散射

3. **SHOTGUN (霰弹枪)**
   - 伤害: 1
   - 冷却: 1500ms
   - 单发数量: 5
   - 颜色: 橙色 (#FFA500)
   - 特点: 一次发射多发子弹，大范围散射

4. **SNIPER (狙击炮)**
   - 伤害: 5
   - 冷却: 2000ms
   - 穿透: 3
   - 颜色: 蓝色 (#4169E1)
   - 特点: 高伤害，可穿透，精准

## 自定义武器配置示例

```javascript
// 创建自定义武器
const CUSTOM_WEAPON = new WeaponData({
    name: '我的武器',
    damage: 3,
    cooldown: 800,
    bulletsPerShot: 2,
    burstCount: 3,
    burstInterval: 150,
    bulletSpeed: 350,
    bulletSpreadAngle: 10,
    color: '#00FF00'
});

// 为第一排配置自定义武器
player.setWeaponForRow(1, CUSTOM_WEAPON);
```

## 未来扩展

玩家系统预留了以下功能供未来扩展：
- 护盾系统（已实现基础结构）
- 等级系统（已实现基础结构）
- 经验值和升级（已实现）
- 更多的统计数据跟踪
- 成就系统
- 技能树系统
