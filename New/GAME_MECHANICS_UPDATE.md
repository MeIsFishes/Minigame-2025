# 游戏机制更新文档

## 更新概述
本次更新实现了玩家血量系统、敌机横向飞行机制、游戏失败逻辑以及完整的数据重置系统。

---

## 1. 玩家血量系统

### player.js 修改

#### 血量设置
- **初始血量**：5 点
- **血量上限**：10 点

```javascript
// 构造函数
this.maxHealth = 10;
this.health = 5;

// 重置方法
reset() {
    this.health = 5; // 重置为初始血量
    // ...
}
```

#### 血量显示
在 `ui.js` 中新增血量显示系统：
- 位置：左上角
- 格式：`❤️ 5 / 10`
- 颜色动态变化：
  - 血量 ≤ 2：红色 `#FF0000`
  - 血量 3-4：橙色 `#FF8800`
  - 血量 ≥ 5：绿色 `#00FF00`

---

## 2. 敌机横向飞行机制

### enemy.js 修改

#### 生成位置
敌机现在只从屏幕左右两侧生成：
- **左侧生成**：x = -enemyWidth（屏幕外左侧）→ 向右飞行（direction = 1）
- **右侧生成**：x = canvas.width（屏幕外右侧）→ 向左飞行（direction = -1）

```javascript
const spawnFromLeft = Math.random() > 0.5;
const direction = spawnFromLeft ? 1 : -1;
const x = spawnFromLeft ? -enemyType.width : this.canvas.width;
```

#### 移动逻辑
- **横向速度**：使用敌机类型的速度范围（minSpeed ~ maxSpeed）
- **纵向速度**：改为 0（不再向下移动）
- **移动方向**：持续向一个方向飞行，不再反弹

```javascript
// 创建敌机
speed: 0, // 不再向下移动
horizontalSpeed: speedPixelsPerFrame, // 横向移动速度
direction: direction, // 1=向右, -1=向左

// 更新位置
enemy.x += enemy.horizontalSpeed * enemy.direction;
```

#### 逃脱惩罚
敌机飞出屏幕时扣除玩家血量：
```javascript
const hasEscaped = (enemy.direction > 0 && enemy.x > this.canvas.width) || 
                  (enemy.direction < 0 && enemy.x + enemy.width < 0);

if (hasEscaped) {
    if (!enemy.escapesPenalty && this.player) {
        this.player.takeDamage(1); // 扣除1点血量
        enemy.escapesPenalty = true;
    }
    return false; // 移除逃脱的敌机
}
```

---

## 3. 游戏失败机制

### game.js 修改

#### 失败条件
- 原条件：~~敌机到达屏幕底部~~（已移除）
- 新条件：**玩家血量归零**

```javascript
// 检查游戏结束（玩家血量为0）
if (!this.player.isAlive()) {
    this.endGame();
}
```

#### 游戏结束流程
1. 停止游戏循环
2. **重置所有游戏系统**（新增）
3. 显示游戏结束界面
4. 播放游戏结束音效

```javascript
endGame() {
    this.isRunning = false;
    
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
    }
    
    // 重置所有游戏系统
    this.resetGameSystems();
    
    // 显示游戏结束画面
    this.menuSystem.showGameOver(this.player.score);
    
    this.playGameOverSound();
}
```

---

## 4. 数据重置系统

### resetGameSystems() 方法

确保游戏结束后所有数据正确重置：

```javascript
resetGameSystems() {
    // 重置玩家（包括血量、分数等）
    if (this.player) {
        this.player.reset();
    }
    
    // 重置武器系统
    if (this.weaponSystem) {
        this.weaponSystem.reset();
        this.weaponSystem.initializeWeapons();
    }
    
    // 重置敌机系统
    if (this.enemySystem) {
        this.enemySystem.reset();
    }
    
    // 重置特效系统
    if (this.effectSystem) {
        this.effectSystem.reset();
    }
    
    // 重置UI系统
    if (this.uiSystem) {
        this.uiSystem.reset();
    }
}
```

### 各系统重置内容

#### Player.reset()
- ✅ health → 5
- ✅ maxHealth → 10
- ✅ score → 0
- ✅ level → 1
- ✅ experience → 0
- ✅ stats → 清零
- ✅ shield → 0

#### WeaponSystem.reset()
- ✅ bullets → []
- ✅ cooldowns → 全部 ready

#### EnemySystem.reset()
- ✅ enemies → []
- ✅ explosions → []
- ✅ score → 0
- ✅ lastSpawn → 0
- ✅ nextEnemyId → 0

#### EffectSystem.reset()
- ✅ effects → []
- ✅ effectPool → []
- ✅ nextEffectId → 0

#### UISystem.reset()
- ✅ 所有按钮状态恢复
- ✅ 血量显示更新

---

## 5. 游戏结束界面修改

### index.html 修改
移除了"返回菜单"按钮，只保留"返回主界面"按钮：

```html
<!-- 游戏结束界面 -->
<div id="game-over" class="screen">
    <h1>游戏结束</h1>
    <p>最终得分: <span id="final-score">0</span></p>
    <button id="restart-btn">返回主界面</button>
</div>
```

### menu.js 修改
简化事件监听器：

```javascript
// 移除了 menuBtn 相关代码
this.restartBtn.addEventListener('click', () => {
    this.hideGameOver();
    // 返回主界面（大厅）
    if (this.onRestartGame) {
        this.onRestartGame();
    }
});
```

### game.js 回调修改
游戏结束后必须返回大厅：

```javascript
setupMenuCallbacks() {
    this.menuSystem.setStartGameCallback(() => this.startGame());
    // 游戏结束后不能直接重新开始，必须返回大厅
    this.menuSystem.setRestartGameCallback(() => this.returnToMenu());
    this.menuSystem.setReturnToMenuCallback(() => this.returnToMenu());
}
```

---

## 6. 游戏流程图

```
[大厅界面 Lobby]
      ↓
   点击"开始游戏"
      ↓
[游戏进行中]
  - 敌机从左右两侧生成
  - 玩家血量: 5/10
  - 击杀敌机得分
  - 敌机逃脱扣血
      ↓
   玩家血量归零
      ↓
[游戏结束界面]
  - 显示最终得分
  - 所有系统重置
      ↓
   点击"返回主界面"
      ↓
[大厅界面 Lobby]
```

---

## 7. 测试检查清单

### 玩家系统
- [x] 初始血量为 5
- [x] 血量上限为 10
- [x] 血量显示在左上角
- [x] 血量颜色根据数值变化
- [x] reset() 后血量恢复为 5

### 敌机系统
- [x] 敌机从左侧生成向右飞
- [x] 敌机从右侧生成向左飞
- [x] 敌机不再向下移动
- [x] 敌机逃脱时玩家扣 1 血
- [x] 每架敌机只扣血一次

### 游戏失败
- [x] 血量归零时游戏结束
- [x] 显示游戏结束界面
- [x] 显示最终得分
- [x] 所有系统正确重置

### 界面流程
- [x] 大厅界面显示正常
- [x] 点击"开始游戏"进入游戏
- [x] 游戏结束后显示结束界面
- [x] 点击"返回主界面"回到大厅
- [x] 无法直接重新开始游戏

---

## 8. 敌机类型数据

所有敌机现在使用横向飞行：

| 类型 | 血量 | 速度范围(px/s) | 得分 | 回血 | 权重 |
|------|------|----------------|------|------|------|
| 基础战机 | 1 | 60-120 | 10 | 0 | 10 |
| 快速战机 | 1 | 120-200 | 15 | 0 | 5 |
| 重型战机 | 3 | 30-60 | 30 | 0 | 3 |
| BOSS战机 | 10 | 20-40 | 100 | 0 | 1 |

---

## 9. 关键代码位置

### 血量相关
- `player.js:3-5` - 血量初始化
- `player.js:161` - 血量重置
- `ui.js:10-11` - UISystem构造函数添加player参数
- `ui.js:15-36` - 创建血量显示
- `ui.js:38-52` - 更新血量显示
- `ui.js:149` - 在update中调用血量更新

### 敌机横向飞行
- `enemy.js:132-140` - 敌机生成位置
- `enemy.js:157-161` - 敌机移动速度
- `enemy.js:191-201` - 敌机逃脱检测

### 游戏失败
- `game.js:230-232` - 检查玩家存活
- `game.js:295-304` - 游戏结束处理
- `game.js:306-329` - 重置所有系统

### 界面修改
- `index.html:25-29` - 游戏结束界面
- `menu.js:10` - 移除menuBtn
- `menu.js:30-35` - 简化重新开始按钮
- `game.js:81-84` - 修改回调函数

---

## 10. 注意事项

1. **敌机回血已禁用**：所有敌机的 `killHeal` 设置为 0（如需启用可修改 EnemyPresets）
2. **敌机不再碰撞边界**：敌机持续向一个方向飞行直到离开屏幕
3. **血量扣除时机**：敌机完全飞出屏幕时（不是开始飞出时）
4. **数据重置完整**：游戏结束后所有系统都会重置，确保下次游戏正常开始
5. **必须返回大厅**：游戏结束后无法直接重新开始，必须回到大厅重新点击"开始游戏"

---

## 11. 后续优化建议

1. **血量恢复道具**：添加血包掉落系统
2. **难度递增**：随时间增加敌机生成速度
3. **击杀连击**：连续击杀敌机增加分数倍率
4. **完美防守奖励**：无敌机逃脱时额外奖励
5. **血量动画**：血量变化时添加闪烁或跳动效果
6. **逃脱提示**：敌机逃脱时显示文字提示"-1 HP"
