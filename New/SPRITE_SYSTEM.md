# 精灵绘制系统文档 (Sprite Rendering System)

## 概述

`sprite.js` 是一个统一的精灵绘制系统，用于集中管理游戏中所有实体（敌机、子弹等）的渲染逻辑。

## 核心特性

### 1. 统一接口
- 所有实体使用相同的配置对象格式
- 支持通用参数：位置、大小、方向、缩放、颜色

### 2. 自动处理
- 自动应用方向翻转（左右飞行）
- 自动应用缩放变换
- 自动管理Canvas状态（save/restore）

### 3. 性能优化
- 颜色计算结果缓存
- 批量绘制支持
- 降级渲染策略

## API 文档

### SpriteRenderer 类

#### 敌机绘制

```javascript
spriteRenderer.drawEnemy(ctx, {
    x: 100,              // X坐标
    y: 50,               // Y坐标
    width: 40,           // 宽度
    height: 30,          // 高度
    direction: 1,        // 方向: 1=向右, -1=向左
    scale: 1.0,          // 缩放: 1.0=正常大小
    model: 'basic',      // 模型: 'basic', 'heavy', 'fast', 'boss'
    color: '#FF4444',    // 主要颜色
    health: 15,          // 当前血量（可选）
    maxHealth: 15        // 最大血量（可选）
});
```

#### 子弹绘制

```javascript
spriteRenderer.drawBullet(ctx, {
    x: 200,              // X坐标
    y: 300,              // Y坐标
    width: 4,            // 宽度
    height: 15,          // 高度
    angle: 0,            // 旋转角度（度数）
    color: '#FFD700',    // 主要颜色
    scale: 1.0,          // 缩放: 1.0=正常大小
    style: 'standard'    // 样式: 'standard', 'energy', 'laser'
});
```

#### 批量绘制

```javascript
// 绘制多个敌机
spriteRenderer.drawBatch(ctx, enemiesArray, 'enemy');

// 绘制多个子弹
spriteRenderer.drawBatch(ctx, bulletsArray, 'bullet');
```

## 敌机模型类型

### Basic（基础战机）
- 流线型机身
- 标准机翼配置
- 青色发光驾驶舱
- 橙色引擎尾焰

### Heavy（重型战机）
- 厚重装甲机身
- 大型机翼
- 双引擎配置
- 装甲板高光

### Fast（快速战机）
- 细长流线型机身
- 前掠翼设计
- 黄色喷射尾焰
- 青色驾驶舱

### Boss（BOSS战机）
- 巨大机身
- 主翼 + 副翼
- 三组引擎喷射口
- 紫色发光核心

## 子弹样式类型

### Standard（标准）
- 简单矩形子弹
- 白色头部光效
- 适合常规武器

### Energy（能量）
- 椭圆形子弹
- 渐变色效果
- 强光晕
- 适合能量武器

### Laser（激光）
- 细长光束
- 强烈外层光晕
- 白色核心
- 头部辉光效果
- 适合激光武器

## 颜色工具方法

### darkenColor(color, factor)
使颜色变暗
```javascript
const darker = spriteRenderer.darkenColor('#FF0000', 0.7);
// 返回: '#B20000'
```

### lightenColor(color, factor)
使颜色变亮
```javascript
const lighter = spriteRenderer.lightenColor('#FF0000', 1.3);
// 返回: '#FF1A1A'
```

## 集成方式

### 1. HTML引入
```html
<!-- sprite.js 必须在 weapon.js 和 enemy.js 之前加载 -->
<script src="sprite.js"></script>
<script src="weapon.js"></script>
<script src="enemy.js"></script>
```

### 2. 在现有系统中使用

#### Enemy系统集成
```javascript
// enemy.js 中的 draw() 方法会自动使用 spriteRenderer
enemySystem.draw(ctx);
```

#### Weapon系统集成
```javascript
// weapon.js 中的 draw() 方法会自动使用 spriteRenderer
weaponSystem.draw(ctx);
```

### 3. 降级支持

如果 `sprite.js` 未加载，系统会自动降级到旧的绘制方法，确保游戏正常运行。

## 扩展指南

### 添加新的敌机模型

1. 在 `SpriteRenderer` 类中添加绘制方法：
```javascript
drawNewEnemy(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    // ... 绘制逻辑
}
```

2. 在 `drawEnemy()` 方法的 switch 中添加分支：
```javascript
case 'new':
    this.drawNewEnemy(ctx, x, y, width, height, color);
    break;
```

3. 在 `enemy.js` 的 `EnemyPresets` 中添加配置：
```javascript
NEW: new EnemyData({
    name: '新敌机',
    model: 'new',
    // ... 其他配置
})
```

### 添加新的子弹样式

1. 在 `SpriteRenderer` 类中添加绘制方法：
```javascript
drawNewBullet(ctx, width, height, color) {
    // ... 绘制逻辑
}
```

2. 在 `drawBullet()` 方法的 switch 中添加分支：
```javascript
case 'new':
    this.drawNewBullet(ctx, width, height, color);
    break;
```

3. 在创建子弹时指定样式：
```javascript
const bullet = {
    // ... 其他属性
    style: 'new'
};
```

## 性能考虑

1. **颜色缓存**: 颜色计算结果会被缓存，避免重复计算
2. **批量绘制**: 使用 `drawBatch()` 可以减少函数调用开销
3. **Canvas状态管理**: 每个实体的绘制都使用 save/restore 确保状态隔离

## 常见问题

### Q: 为什么敌机没有翻转？
A: 确保 `direction` 参数设置正确（1=向右，-1=向左）

### Q: 血条没有显示？
A: 确保同时传入 `health` 和 `maxHealth` 参数

### Q: 子弹样式没有变化？
A: 检查 `style` 参数是否为有效值（'standard', 'energy', 'laser'）

### Q: 游戏运行但看不到新效果？
A: 确保 `sprite.js` 在 HTML 中的加载顺序正确（在 weapon.js 和 enemy.js 之前）

## 版本历史

### v1.0.0 (2025-11-02)
- 初始版本
- 支持4种敌机模型
- 支持3种子弹样式
- 实现颜色缓存
- 实现批量绘制
- 实现降级支持
