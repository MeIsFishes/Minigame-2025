# 精灵系统架构图

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Game Loop                             │
│                       (game.js)                              │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
                 ▼                            ▼
    ┌────────────────────────┐   ┌────────────────────────┐
    │    Enemy System        │   │    Weapon System       │
    │    (enemy.js)          │   │    (weapon.js)         │
    │                        │   │                        │
    │  • update()            │   │  • shoot()             │
    │  • draw() ────────┐    │   │  • update()            │
    │  • spawnEnemy()   │    │   │  • draw() ────────┐    │
    └───────────────────┘    │   └────────────────────┘   │
                             │                            │
                             └──────────┬─────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │     Sprite Renderer          │
                         │     (sprite.js)              │
                         │                              │
                         │  • drawEnemy(config)         │
                         │  • drawBullet(config)        │
                         │  • drawBatch(entities)       │
                         │                              │
                         │  ┌────────────────────────┐  │
                         │  │  Color Utils           │  │
                         │  │  • darkenColor()       │  │
                         │  │  • lightenColor()      │  │
                         │  │  • Cache Map           │  │
                         │  └────────────────────────┘  │
                         │                              │
                         │  ┌────────────────────────┐  │
                         │  │  Enemy Models          │  │
                         │  │  • drawBasicEnemy()    │  │
                         │  │  • drawHeavyEnemy()    │  │
                         │  │  • drawFastEnemy()     │  │
                         │  │  • drawBossEnemy()     │  │
                         │  └────────────────────────┘  │
                         │                              │
                         │  ┌────────────────────────┐  │
                         │  │  Bullet Styles         │  │
                         │  │  • drawStandardBullet()│  │
                         │  │  • drawEnergyBullet()  │  │
                         │  │  • drawLaserBullet()   │  │
                         │  └────────────────────────┘  │
                         └──────────────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │     Canvas 2D Context        │
                         │     (HTML5 Canvas)           │
                         └──────────────────────────────┘
```

## 数据流

```
Game Loop
   │
   ├─► Enemy System
   │      │
   │      ├─► enemies[] array
   │      │      │
   │      │      └─► {x, y, width, height, direction, model, color, health, ...}
   │      │
   │      └─► draw(ctx)
   │             │
   │             └─► spriteRenderer.drawBatch(ctx, enemies, 'enemy')
   │                    │
   │                    └─► for each enemy:
   │                           spriteRenderer.drawEnemy(ctx, enemyConfig)
   │                              │
   │                              ├─► Apply transformations (direction, scale)
   │                              ├─► Call model-specific draw method
   │                              └─► Draw health bar
   │
   └─► Weapon System
          │
          ├─► bullets[] array
          │      │
          │      └─► {x, y, width, height, angle, color, style, ...}
          │
          └─► draw(ctx)
                 │
                 └─► spriteRenderer.drawBatch(ctx, bullets, 'bullet')
                        │
                        └─► for each bullet:
                               spriteRenderer.drawBullet(ctx, bulletConfig)
                                  │
                                  ├─► Apply transformations (rotation, scale)
                                  └─► Call style-specific draw method
```

## 配置对象结构

### Enemy配置
```javascript
{
    // 位置和大小
    x: number,              // X坐标
    y: number,              // Y坐标
    width: number,          // 宽度
    height: number,         // 高度
    
    // 变换参数
    direction: 1 | -1,      // 1=向右, -1=向左
    scale: number,          // 缩放比例（默认1.0）
    
    // 外观参数
    model: string,          // 'basic' | 'heavy' | 'fast' | 'boss'
    color: string,          // 主要颜色（十六进制）
    
    // 状态参数（可选）
    health: number,         // 当前血量
    maxHealth: number       // 最大血量
}
```

### Bullet配置
```javascript
{
    // 位置和大小
    x: number,              // X坐标
    y: number,              // Y坐标
    width: number,          // 宽度
    height: number,         // 高度
    
    // 变换参数
    angle: number,          // 旋转角度（度数）
    scale: number,          // 缩放比例（默认1.0）
    
    // 外观参数
    color: string,          // 主要颜色（十六进制）
    style: string           // 'standard' | 'energy' | 'laser'
}
```

## 模块依赖关系

```
index.html
   │
   ├─► sprite.js ───────────┐
   │                        │
   ├─► weapon.js ───────────┤
   │      │                 │
   │      └─ depends on ────┘
   │
   ├─► enemy.js ────────────┤
   │      │                 │
   │      └─ depends on ────┘
   │
   ├─► player.js
   ├─► effect.js
   ├─► lobby.js
   ├─► ui.js
   ├─► menu.js
   └─► game.js
```

## 渲染流程

```
1. Game Loop 调用 draw()
        ↓
2. Enemy System
   enemies.forEach(enemy => ...)
        ↓
3. Sprite Renderer
   drawBatch(ctx, enemies, 'enemy')
        ↓
4. For Each Enemy:
   ┌─────────────────────────────┐
   │ ctx.save()                  │
   │                             │
   │ Apply direction transform   │
   │ if (direction < 0)          │
   │   ctx.scale(-1, 1)          │
   │                             │
   │ Apply scale transform       │
   │ if (scale !== 1.0)          │
   │   ctx.scale(scale, scale)   │
   │                             │
   │ Draw model                  │
   │ switch(model) {             │
   │   case 'basic': ...         │
   │   case 'heavy': ...         │
   │   ...                       │
   │ }                           │
   │                             │
   │ ctx.restore()               │
   └─────────────────────────────┘
        ↓
5. Draw health bar
   (outside transform)
        ↓
6. Repeat for all enemies
        ↓
7. Clear shadow blur
   ctx.shadowBlur = 0
```

## 性能优化策略

```
┌─────────────────────────────────────┐
│     Color Calculation Cache         │
│                                     │
│  Map<string, string>                │
│  ├─ "FF0000_dark_0.7" → "#B20000"  │
│  ├─ "FF0000_light_1.3" → "#FF1A1A" │
│  └─ ...                             │
│                                     │
│  Benefits:                          │
│  • Avoid repeated calculations      │
│  • O(1) lookup time                 │
│  • Automatic cache management       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        Batch Rendering              │
│                                     │
│  drawBatch(ctx, entities, type)     │
│  ├─ Single function call            │
│  ├─ Loop over entities              │
│  ├─ Shared context operations       │
│  └─ Single shadowBlur clear         │
│                                     │
│  Benefits:                          │
│  • Reduced function call overhead   │
│  • Better CPU cache utilization     │
│  • Cleaner code                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Canvas State Management        │
│                                     │
│  ctx.save()                         │
│    └─ All transformations           │
│       └─ All drawing operations     │
│          └─ ctx.restore()           │
│                                     │
│  Benefits:                          │
│  • Isolated state per entity        │
│  • No state pollution               │
│  • Predictable rendering            │
└─────────────────────────────────────┘
```

## 降级策略

```
┌───────────────────────────────────┐
│   Is spriteRenderer defined?     │
└─────────────┬─────────────────────┘
              │
      ┌───────┴───────┐
      │               │
     Yes             No
      │               │
      ▼               ▼
┌──────────┐    ┌──────────┐
│ Use new  │    │ Use old  │
│ sprite   │    │ inline   │
│ renderer │    │ drawing  │
└──────────┘    └──────────┘
      │               │
      └───────┬───────┘
              │
              ▼
        ┌──────────┐
        │  Result  │
        │  Drawn   │
        └──────────┘
```

## 扩展点

```
Add New Enemy Model:
    1. SpriteRenderer.drawNewEnemy(ctx, x, y, w, h, color)
    2. Update drawEnemy() switch statement
    3. Add to EnemyPresets in enemy.js

Add New Bullet Style:
    1. SpriteRenderer.drawNewBullet(ctx, width, height, color)
    2. Update drawBullet() switch statement
    3. Set style property when creating bullet

Add New Entity Type:
    1. SpriteRenderer.drawNewEntity(ctx, config)
    2. Update drawBatch() to handle new type
    3. Create system file (e.g., powerup.js)
```

## 总结

这个架构实现了：
- ✅ **关注点分离**: 渲染逻辑与游戏逻辑分离
- ✅ **单一职责**: 每个模块专注于特定功能
- ✅ **开放封闭**: 易于扩展，无需修改现有代码
- ✅ **依赖倒置**: 系统依赖于抽象接口，而非具体实现
- ✅ **性能优化**: 缓存、批处理、状态管理
- ✅ **向后兼容**: 降级支持保证稳定性
