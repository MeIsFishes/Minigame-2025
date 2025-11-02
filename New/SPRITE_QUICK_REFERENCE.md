# Sprite System - Quick Reference Card

## 🎯 快速开始

### 1. 绘制敌机
```javascript
spriteRenderer.drawEnemy(ctx, {
    x: 100, y: 50,
    width: 40, height: 30,
    direction: 1,        // 1=右, -1=左
    model: 'basic',      // basic/heavy/fast/boss
    color: '#FF4444',
    health: 15,
    maxHealth: 15
});
```

### 2. 绘制子弹
```javascript
spriteRenderer.drawBullet(ctx, {
    x: 200, y: 300,
    width: 4, height: 15,
    angle: 0,
    color: '#FFD700',
    style: 'standard'    // standard/energy/laser
});
```

### 3. 批量绘制
```javascript
// 敌机
spriteRenderer.drawBatch(ctx, enemiesArray, 'enemy');
// 子弹
spriteRenderer.drawBatch(ctx, bulletsArray, 'bullet');
```

## 📋 参数速查

### Enemy Config
| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| x | number | ✅ | - | X坐标 |
| y | number | ✅ | - | Y坐标 |
| width | number | ✅ | - | 宽度 |
| height | number | ✅ | - | 高度 |
| direction | number | ❌ | 1 | 1=右, -1=左 |
| scale | number | ❌ | 1.0 | 缩放比例 |
| model | string | ❌ | 'basic' | 模型类型 |
| color | string | ❌ | '#FF4444' | 主色 |
| health | number | ❌ | null | 当前血量 |
| maxHealth | number | ❌ | null | 最大血量 |

### Bullet Config
| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| x | number | ✅ | - | X坐标 |
| y | number | ✅ | - | Y坐标 |
| width | number | ✅ | - | 宽度 |
| height | number | ✅ | - | 高度 |
| angle | number | ❌ | 0 | 旋转角度 |
| scale | number | ❌ | 1.0 | 缩放比例 |
| color | string | ❌ | '#FFD700' | 主色 |
| style | string | ❌ | 'standard' | 样式类型 |

## 🎨 模型和样式

### Enemy Models
- `basic` - 基础战机（流线型）
- `heavy` - 重型战机（装甲厚重）
- `fast` - 快速战机（细长敏捷）
- `boss` - BOSS战机（巨大威猛）

### Bullet Styles
- `standard` - 标准子弹（简单矩形）
- `energy` - 能量子弹（椭圆渐变）
- `laser` - 激光子弹（光束强光）

## 🔧 工具方法

```javascript
// 颜色变暗（factor < 1.0）
const darker = spriteRenderer.darkenColor('#FF0000', 0.7);

// 颜色变亮（factor > 1.0）
const lighter = spriteRenderer.lightenColor('#FF0000', 1.3);
```

## 📦 集成到现有系统

### enemy.js
```javascript
draw(ctx) {
    // 新方式（自动使用spriteRenderer）
    spriteRenderer.drawBatch(ctx, this.enemies, 'enemy');
    
    // 或单个绘制
    this.enemies.forEach(enemy => {
        spriteRenderer.drawEnemy(ctx, {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height,
            direction: enemy.direction,
            model: enemy.model,
            color: enemy.type.color,
            health: enemy.health,
            maxHealth: enemy.maxHealth
        });
    });
}
```

### weapon.js
```javascript
draw(ctx) {
    // 新方式（自动使用spriteRenderer）
    spriteRenderer.drawBatch(ctx, this.bullets, 'bullet');
    
    // 或单个绘制
    this.bullets.forEach(bullet => {
        spriteRenderer.drawBullet(ctx, {
            x: bullet.x,
            y: bullet.y,
            width: bullet.width,
            height: bullet.height,
            angle: bullet.angle,
            color: bullet.color,
            style: bullet.style || 'standard'
        });
    });
}
```

## ⚡ 性能优化技巧

1. **使用批量绘制**
   ```javascript
   // 好 ✅
   spriteRenderer.drawBatch(ctx, entities, 'enemy');
   
   // 差 ❌
   entities.forEach(e => spriteRenderer.drawEnemy(ctx, e));
   ```

2. **颜色重用**
   ```javascript
   // 颜色计算会自动缓存
   const dark1 = spriteRenderer.darkenColor('#FF0000', 0.7);
   const dark2 = spriteRenderer.darkenColor('#FF0000', 0.7); // 从缓存读取
   ```

3. **避免频繁变换**
   ```javascript
   // 好 ✅ - scale参数在sprite内部处理
   spriteRenderer.drawEnemy(ctx, {..., scale: 1.5});
   
   // 差 ❌ - 手动scale会累积
   ctx.scale(1.5, 1.5);
   spriteRenderer.drawEnemy(ctx, {...});
   ```

## 🐛 常见问题

### Q: 敌机没有翻转？
```javascript
// 确保设置direction参数
spriteRenderer.drawEnemy(ctx, {
    ...,
    direction: -1  // ← 添加这个
});
```

### Q: 血条不显示？
```javascript
// 必须同时提供health和maxHealth
spriteRenderer.drawEnemy(ctx, {
    ...,
    health: 15,      // ← 必需
    maxHealth: 15    // ← 必需
});
```

### Q: 子弹样式没变？
```javascript
// 检查style参数
spriteRenderer.drawBullet(ctx, {
    ...,
    style: 'energy'  // ← 必须是有效值
});
```

### Q: sprite.js加载失败？
```html
<!-- 确保在HTML中正确加载 -->
<script src="sprite.js"></script>  ← 必须在weapon.js和enemy.js之前
<script src="weapon.js"></script>
<script src="enemy.js"></script>
```

## 🔄 降级支持

```javascript
// 系统会自动检测spriteRenderer是否存在
if (typeof spriteRenderer !== 'undefined') {
    // 使用新的sprite系统
    spriteRenderer.drawEnemy(ctx, config);
} else {
    // 降级到旧的绘制方法
    this.drawBasicEnemy(ctx, enemy);
}
```

## 📝 实例代码

### 完整示例：绘制一个BOSS
```javascript
spriteRenderer.drawEnemy(ctx, {
    x: canvas.width / 2 - 40,
    y: 50,
    width: 80,
    height: 60,
    direction: -1,           // 向左飞
    scale: 1.5,              // 放大1.5倍
    model: 'boss',           // BOSS模型
    color: '#8800FF',        // 紫色
    health: 50,              // 当前50血
    maxHealth: 100           // 最大100血
});
```

### 完整示例：绘制激光子弹
```javascript
spriteRenderer.drawBullet(ctx, {
    x: playerX,
    y: playerY - 20,
    width: 6,
    height: 30,
    angle: -5,               // 向左偏5度
    scale: 1.2,              // 放大1.2倍
    color: '#00FFFF',        // 青色
    style: 'laser'           // 激光样式
});
```

## 🎓 最佳实践

1. **统一配置对象**
   ```javascript
   const config = {
       x: entity.x,
       y: entity.y,
       width: entity.width,
       height: entity.height,
       // ... 其他参数
   };
   spriteRenderer.drawEnemy(ctx, config);
   ```

2. **批量绘制优先**
   ```javascript
   // 收集所有实体
   const allEnemies = [...type1Enemies, ...type2Enemies];
   // 一次性绘制
   spriteRenderer.drawBatch(ctx, allEnemies, 'enemy');
   ```

3. **保持实体对象一致**
   ```javascript
   // 实体对象包含所有必要属性
   const enemy = {
       x: 0, y: 0,
       width: 40, height: 30,
       direction: 1,
       model: 'basic',
       type: { color: '#FF4444' },
       health: 15,
       maxHealth: 15
   };
   ```

## 📚 相关文档

- `SPRITE_SYSTEM.md` - 完整系统文档
- `SPRITE_ARCHITECTURE.md` - 架构设计
- `SPRITE_REFACTOR_SUMMARY.md` - 重构总结

## 🚀 版本信息

- **Version**: 1.0.0
- **Date**: 2025-11-02
- **Compatibility**: ES6+
- **Dependencies**: None (standalone)
