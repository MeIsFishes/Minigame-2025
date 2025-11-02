# 玩家资源系统文档

## 概述
player.js 现在集中管理所有玩家数据，包括：
- 生命值（health/maxHealth）
- 资源（铁、铜、钴、镍、金）
- 分数和统计
- 武器配置

## 资源类型
```javascript
player.resources = {
    iron: 0,    // 铁
    copper: 0,  // 铜
    cobalt: 0,  // 钴
    nickel: 0,  // 镍
    gold: 0     // 金
}
```

## 资源管理方法

### 添加资源
```javascript
// 添加特定资源
player.addResource('iron', 10);      // 添加10个铁
player.addResource('copper', 5);     // 添加5个铜
player.addResource('gold', 1);       // 添加1个金

// 返回 true（成功）或 false（资源类型不存在）
```

### 消耗资源
```javascript
// 消耗资源（需要有足够的资源）
const success = player.consumeResource('iron', 5);
if (success) {
    console.log('资源消耗成功');
} else {
    console.log('资源不足');
}
```

### 检查资源
```javascript
// 检查是否有足够的资源
if (player.hasResource('copper', 10)) {
    console.log('有足够的铜');
}

// 获取特定资源数量
const ironCount = player.getResource('iron');
console.log(`当前铁数量: ${ironCount}`);

// 获取所有资源
const allResources = player.getAllResources();
console.log(allResources);
// 输出: { iron: 10, copper: 5, cobalt: 0, nickel: 0, gold: 1 }
```

### 资源变化回调
```javascript
// 设置资源变化回调（用于更新UI）
player.setResourceChangeCallback((resourceType, newAmount, oldAmount) => {
    console.log(`${resourceType}: ${oldAmount} -> ${newAmount}`);
    // 更新UI显示
});
```

## 生命值管理

### 访问生命值
```javascript
// 获取当前生命值
const health = player.health;

// 获取最大生命值
const maxHealth = player.maxHealth;

// 获取生命值百分比
const healthPercent = player.getHealthPercentage();
```

### 修改生命值
```javascript
// 受到伤害
const isDead = player.takeDamage(2);

// 治疗
const healedAmount = player.heal(3);
```

### 生命值回调
```javascript
// 设置生命值变化回调（用于更新UI）
player.setHealthChangeCallback((newHealth, oldHealth, type) => {
    console.log(`生命值: ${oldHealth} -> ${newHealth} (${type})`);
});

// 设置受伤回调（用于特效和音效）
player.setDamageCallback((damage, currentHealth, oldHealth) => {
    console.log(`受到 ${damage} 点伤害`);
    // 播放受伤音效和特效
});
```

## 玩家状态

### 获取完整状态
```javascript
const status = player.getStatus();
console.log(status);
/* 输出:
{
    health: 5,
    maxHealth: 10,
    healthPercentage: 50,
    shield: 0,
    maxShield: 50,
    shieldPercentage: 0,
    score: 100,
    combo: 5,
    resources: {
        iron: 10,
        copper: 5,
        cobalt: 0,
        nickel: 0,
        gold: 1
    }
}
*/
```

## 数据持久化

### 导出数据（存档）
```javascript
const saveData = player.exportData();
localStorage.setItem('playerSave', JSON.stringify(saveData));
```

### 导入数据（读档）
```javascript
const saveData = JSON.parse(localStorage.getItem('playerSave'));
player.importData(saveData);
```

## 使用示例

### 敌人掉落资源
```javascript
// 在enemy.js中，敌人死亡时
function onEnemyDeath(enemy) {
    // 根据敌人类型掉落资源
    if (enemy.type === 'IRON_DRONE') {
        player.addResource('iron', 1);
    } else if (enemy.type === 'GOLD_BOSS') {
        player.addResource('gold', 1);
        player.addResource('iron', 5);
    }
}
```

### 购买升级
```javascript
// 在商店系统中
function buyUpgrade(upgradeName) {
    const cost = {
        iron: 10,
        copper: 5
    };
    
    // 检查资源
    if (player.hasResource('iron', cost.iron) && 
        player.hasResource('copper', cost.copper)) {
        
        // 消耗资源
        player.consumeResource('iron', cost.iron);
        player.consumeResource('copper', cost.copper);
        
        // 应用升级
        applyUpgrade(upgradeName);
        return true;
    }
    
    alert('资源不足！');
    return false;
}
```

### 显示资源UI
```javascript
// 在ui.js中
function updateResourceDisplay() {
    const resources = player.getAllResources();
    
    document.getElementById('iron-count').textContent = resources.iron;
    document.getElementById('copper-count').textContent = resources.copper;
    document.getElementById('cobalt-count').textContent = resources.cobalt;
    document.getElementById('nickel-count').textContent = resources.nickel;
    document.getElementById('gold-count').textContent = resources.gold;
}

// 设置回调自动更新
player.setResourceChangeCallback((type, newAmount, oldAmount) => {
    updateResourceDisplay();
});
```

## 注意事项

1. **集中管理**: 所有玩家数据都在player.js中，不要在其他文件中重复存储
2. **使用回调**: 使用回调函数来响应数据变化，保持UI和游戏逻辑同步
3. **资源验证**: 消耗资源前一定要先检查是否足够
4. **数据持久化**: 使用exportData()和importData()来保存和加载游戏进度

## 迁移说明

如果之前在其他文件中有玩家数据的存储，需要：
1. 删除重复的数据存储
2. 改为访问 `player.health`、`player.maxHealth`、`player.resources` 等
3. 使用回调函数来响应数据变化
4. 确保所有修改都通过player对象的方法进行
