# Lobby System Documentation

## 概述
LobbySystem 是游戏的开始界面系统，提供了一个美观的主菜单，包含动画效果、粒子背景和交互式按钮。

## 主要功能

### 1. 界面元素
- **标题动画**：带有光晕效果的标题，上下浮动动画
- **粒子背景**：50个随机移动的粒子，营造太空氛围
- **交互按钮**：
  - 开始游戏（绿色）
  - 游戏说明（蓝色）
  - 设置（橙色）

### 2. 帮助界面
点击"游戏说明"按钮后显示帮助界面，包含：
- 游戏规则说明
- 敌机类型介绍
- 武器类型说明
- 操作指南

### 3. 视觉效果
- 渐变背景（深蓝色太空主题）
- 按钮悬停效果（颜色变化 + 光晕）
- 粒子动画
- 标题浮动动画

## 类结构

### LobbySystem
```javascript
class LobbySystem {
    constructor(canvas)
    
    // 核心方法
    update(deltaTime)      // 更新动画
    draw(ctx)              // 绘制界面
    activate()             // 激活大厅
    deactivate()           // 停用大厅
    destroy()              // 清理资源
    
    // 回调方法（由外部设置）
    onStartGame()          // 开始游戏回调
    onSettings()           // 设置回调
}
```

## 按钮配置

每个按钮包含以下属性：
- `x, y` - 位置坐标
- `width, height` - 尺寸
- `text` - 按钮文字
- `color` - 默认颜色
- `hoverColor` - 悬停颜色
- `isHovered` - 悬停状态

## 粒子系统

背景粒子属性：
- `x, y` - 位置
- `vx, vy` - 速度
- `size` - 大小（1-3像素）
- `alpha` - 透明度（0.3-0.8）

粒子会在画布边界反弹，创造动态背景效果。

## 集成到游戏

### 在 game.js 中集成

```javascript
// 初始化
this.lobbySystem = new LobbySystem(this.canvas);

// 设置回调
this.lobbySystem.onStartGame = () => {
    this.hideLobby();
    this.startGame();
};

this.lobbySystem.onSettings = () => {
    console.log('打开设置');
};

// 显示大厅
this.showLobby();

// 大厅循环
lobbyLoop() {
    if (!this.inLobby) return;
    
    this.lobbySystem.update(deltaTime);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.lobbySystem.draw(this.ctx);
    
    requestAnimationFrame(() => this.lobbyLoop());
}
```

## 事件处理

### 鼠标事件
- **mousemove**：检测按钮悬停状态，更新鼠标样式
- **click**：处理按钮点击，执行相应回调

### 自动清理
当大厅停用时，自动移除事件监听器，避免内存泄漏。

## 响应式设计

- 按钮位置基于画布尺寸自动计算
- `updateButtonPositions()` 方法在画布大小改变时调用
- 所有元素相对于画布中心定位

## 样式配置

### 颜色主题
- 背景渐变：`#0a0a2e` → `#16213e` → `#0f3460`
- 标题颜色：`#00FFFF`（青色光晕）
- 按钮颜色：
  - 开始：`#4CAF50` / `#45a049`
  - 帮助：`#2196F3` / `#1976D2`
  - 设置：`#FF9800` / `#F57C00`

### 字体
- 标题：`bold 72px Arial`
- 副标题：`24px Arial`
- 按钮：`bold 24px Arial`
- 帮助内容：`18-20px Arial`

## 帮助界面内容

### 游戏规则
- 键盘操作说明
- 得分机制
- 回血机制

### 敌机类型
- 基础战机：1血，10分
- 快速战机：1血，15分，快速移动
- 重型战机：3血，30分，回血+1
- BOSS战机：10血，100分，回血+5

### 武器类型
- 速射炮：基础武器
- 霰弹枪：散射攻击
- 狙击枪：高伤害穿透

## 性能优化

1. **粒子数量限制**：50个粒子，保持流畅性能
2. **事件监听器管理**：激活时绑定，停用时解绑
3. **动画优化**：使用简单的正弦波动画，避免复杂计算
4. **画布重用**：不创建新画布，使用游戏主画布

## 扩展建议

### 可添加功能
1. **音效**：按钮点击音效、背景音乐
2. **更多动画**：星星闪烁、彗星划过
3. **排行榜**：显示最高分记录
4. **难度选择**：简单/普通/困难
5. **成就系统**：展示已解锁的成就
6. **皮肤系统**：更换游戏主题颜色

### 设置界面建议
```javascript
settings: {
    音效音量：0-100
    音乐音量：0-100
    粒子效果：开/关
    画质：低/中/高
    键位绑定：自定义
}
```

## 使用示例

```javascript
// 创建大厅
const lobby = new LobbySystem(canvas);

// 设置回调
lobby.onStartGame = () => {
    console.log('游戏开始！');
    lobby.deactivate();
    startGameFunction();
};

lobby.onSettings = () => {
    console.log('打开设置面板');
    showSettingsPanel();
};

// 游戏循环中
function update(deltaTime) {
    lobby.update(deltaTime);
}

function render(ctx) {
    lobby.draw(ctx);
}
```

## 注意事项

1. **画布尺寸**：大厅界面适配 75% 高度的游戏画布
2. **事件清理**：游戏结束时调用 `destroy()` 清理资源
3. **状态管理**：使用 `isActive` 标志控制大厅激活状态
4. **响应式**：窗口大小改变时调用 `updateButtonPositions()`

## 版本信息
当前版本：v1.0.0（显示在界面右下角）
