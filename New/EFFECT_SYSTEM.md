# 特效系统文档

## 概述

特效系统（EffectSystem）是一个用于处理游戏中各种视觉特效的管理系统。它采用对象池模式来优化性能，支持多种预设特效类型，并提供灵活的自定义特效能力。

## 核心数据结构

### Effect 类

每个特效对象包含以下字段：

```javascript
{
    id: number,                    // 特效唯一ID
    type: string,                  // 特效类型（'explosion', 'spark', 'ring', 'trail', 'text'等）
    target: object | null,         // 目标对象（可选）
    x: number,                     // X坐标
    y: number,                     // Y坐标
    effectFunction: function,      // 特效函数
    duration: number,              // 持续时间（毫秒）
    createdTime: number,           // 创建时间戳
    isActive: boolean,             // 是否活跃
    data: object,                  // 特效特定数据
    elapsed: number,               // 已经过时间
    particles: array,              // 粒子列表
    followTarget: boolean          // 是否跟随目标
}
```

## 核心机制

### 1. 目标跟随机制

- **有目标对象时**：特效会持续跟随目标对象的位置，直到目标对象消失（死亡、销毁）
- **目标消失后**：特效停留在最后的位置继续播放，直到duration结束
- **无目标对象时**：特效直接在指定位置播放

目标存活检测逻辑：
```javascript
isTargetAlive() {
    if (!this.target) return false;
    
    // 检查 isAlive 标记
    if (this.target.isAlive !== undefined) {
        return this.target.isAlive;
    }
    
    // 检查 health 值
    if (this.target.health !== undefined) {
        return this.target.health > 0;
    }
    
    return true; // 默认认为存活
}
```

### 2. 对象池模式

特效系统使用对象池来减少频繁创建/销毁对象的开销：

- **获取对象**：从池中取出空闲对象，如果池为空则创建新对象
- **返回对象**：特效播放完毕后，对象被重置并返回池中
- **池容量管理**：默认最大池容量为100个对象

```javascript
// 从池中获取
const effect = effectSystem.getEffectFromPool();

// 返回池中
effectSystem.returnEffectToPool(effect);
```

### 3. 特效生命周期

1. **创建**：调用 `createEffect()` 或预设特效方法
2. **更新**：每帧调用 `update(deltaTime)` 更新位置和状态
3. **绘制**：每帧调用 `draw(ctx)` 渲染特效
4. **销毁**：duration结束后，isActive设为false，对象返回池中

## 预设特效类型

### 1. 爆炸特效 (Explosion)

```javascript
effectSystem.createExplosion(x, y, target, {
    particleCount: 15,    // 粒子数量
    radius: 30,           // 爆炸半径
    color: '#FF9600',     // 颜色
    duration: 600         // 持续时间（毫秒）
});
```

**特点**：
- 放射状粒子扩散
- 粒子随时间淡出
- 适用于敌机爆炸、导弹命中等场景

### 2. 火花特效 (Spark)

```javascript
effectSystem.createSpark(x, y, target, {
    particleCount: 8,     // 粒子数量
    color: '#FFFF00',     // 颜色
    duration: 400         // 持续时间（毫秒）
});
```

**特点**：
- 有重力影响的粒子
- 适用于子弹命中、碰撞等场景

### 3. 光环特效 (Ring)

```javascript
effectSystem.createRing(x, y, target, {
    maxRadius: 40,        // 最大半径
    color: '#00FFFF',     // 颜色
    duration: 500         // 持续时间（毫秒）
});
```

**特点**：
- 圆环从中心向外扩散
- 可以跟随目标
- 适用于冲击波、护盾、范围提示等

### 4. 轨迹特效 (Trail)

```javascript
effectSystem.createTrail(x, y, target, {
    length: 10,           // 轨迹长度（记录点数量）
    color: '#FFFFFF',     // 颜色
    width: 2,             // 线宽
    duration: 9999999     // 持续时间（通常设置很长）
});
```

**特点**：
- 必须有目标对象
- 持续记录目标轨迹
- 目标消失后轨迹淡出
- 适用于追踪导弹、飞行器尾迹等

### 5. 文字特效 (Text)

```javascript
effectSystem.createText(x, y, '+10', {
    color: '#FFFFFF',     // 颜色
    fontSize: 20,         // 字体大小
    duration: 1000,       // 持续时间（毫秒）
    floatSpeed: -1        // 上浮速度（负值向上）
});
```

**特点**：
- 文字渐隐
- 可设置上浮速度
- 适用于得分提示、伤害数字等

## 使用示例

### 示例1：敌机爆炸

```javascript
// 敌机被击毁时
const explosionX = enemy.x + enemy.width / 2;
const explosionY = enemy.y + enemy.height / 2;

// 创建爆炸特效
effectSystem.createExplosion(explosionX, explosionY, null, {
    particleCount: 20,
    radius: 40,
    color: '#FF9600',
    duration: 600
});

// 添加外环特效
effectSystem.createRing(explosionX, explosionY, null, {
    maxRadius: 50,
    color: '#FF6600',
    duration: 400
});

// 添加得分文字
effectSystem.createText(explosionX, explosionY, '+10', {
    color: '#FFD700',
    fontSize: 24,
    duration: 800,
    floatSpeed: -1.5
});
```

### 示例2：子弹命中火花

```javascript
// 子弹命中敌机时
effectSystem.createSpark(
    enemy.x + enemy.width / 2,
    enemy.y + enemy.height / 2,
    null,
    { 
        color: bullet.color || '#FFFF00',
        particleCount: 5,
        duration: 300 
    }
);
```

### 示例3：追踪导弹轨迹

```javascript
// 创建追踪导弹子弹时
const bullet = {
    x: x,
    y: y,
    // ... 其他属性
};

// 为子弹创建轨迹特效
bullet.trailEffect = effectSystem.createTrail(x, y, bullet, {
    length: 15,
    color: weapon.color,
    width: weapon.bulletWidth,
    duration: 9999999  // 持续跟随直到子弹消失
});
```

## 自定义特效

可以通过提供自定义effectFunction来创建特殊特效：

```javascript
effectSystem.createEffect({
    type: 'custom',
    x: x,
    y: y,
    target: null,
    duration: 1000,
    data: {
        customProperty: 'value'
    },
    effectFunction: (effect, progress, deltaTime) => {
        // progress: 0-1，表示完成进度
        // deltaTime: 距上一帧的时间（毫秒）
        
        // 自定义更新逻辑
        effect.data.customProperty = progress;
        
        // 可以操作粒子
        if (effect.particles.length === 0) {
            // 初始化粒子
        }
        
        // 更新粒子状态
        effect.particles.forEach(particle => {
            // 更新粒子...
        });
    }
});
```

## 性能优化建议

1. **合理设置duration**：避免特效持续时间过长
2. **控制粒子数量**：大量粒子会影响性能
3. **利用对象池**：系统自动管理，无需手动操作
4. **及时清理**：场景切换时调用 `clearAllEffects()`

## API 参考

### EffectSystem 主要方法

- `createEffect(config)` - 创建通用特效
- `createExplosion(x, y, target, config)` - 创建爆炸
- `createSpark(x, y, target, config)` - 创建火花
- `createRing(x, y, target, config)` - 创建光环
- `createTrail(x, y, target, config)` - 创建轨迹
- `createText(x, y, text, config)` - 创建文字
- `update(deltaTime)` - 更新所有特效
- `draw(ctx)` - 绘制所有特效
- `clearAllEffects()` - 清除所有特效
- `reset()` - 重置系统
- `getActiveEffectCount()` - 获取活跃特效数量
- `getPoolStats()` - 获取对象池统计信息

## 集成到游戏

在游戏主循环中：

```javascript
// 更新
effectSystem.update(deltaTime);

// 绘制
effectSystem.draw(ctx);

// 重置游戏时
effectSystem.reset();
```

在需要的地方创建特效：

```javascript
// 敌机系统
checkCollisions(bullets, weaponSystem, effectSystem) {
    // 使用特效系统...
}

// 武器系统
constructor(canvas, player, effectSystem) {
    this.effectSystem = effectSystem;
    // 创建轨迹特效...
}
```
