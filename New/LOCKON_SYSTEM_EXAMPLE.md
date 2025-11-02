# 索敌锁定系统使用示例

## 功能概述

索敌锁定系统允许武器在发射前自动搜索并锁定范围内的敌机目标，并可以播放视觉特效来标记锁定的敌人。

## 新增字段说明

### 1. lockOnTarget (Boolean)
- 是否将子弹方向指向锁定的目标
- `true`: 子弹会朝向锁定目标的位置发射
- `false`: 使用常规散射系统

### 2. lockOnRange (Number, 像素)
- 索敌范围，以发射位置X轴为中心
- `0`: 不进行索敌
- `> 0`: 搜索X轴距离不超过该值的最近敌机

### 3. targetEffect (String)
- 锁定目标时播放的特效类型
- 可选值:
  - `'lockon'`: 旋转十字准星（默认）
  - `'ring'`: 扩散光环
  - `'aimline'`: 从发射点到目标的瞄准虚线
  - `'spark'`: 火花标记
  - `null`: 不播放特效

## 武器示例

### 示例 1: 导弹发射器
```javascript
const MISSILE_LAUNCHER = new WeaponData({
    name: '导弹发射器',
    damage: 25,
    cooldown: 3000,
    fireDelay: 500,           // 500ms锁定延迟
    bulletsPerShot: 1,
    burstCount: 1,
    bulletSpeed: 400,
    bulletLifetime: 5000,
    trackingAngularSpeed: 180, // 追踪速度
    penetration: 1,
    color: '#FF0000',
    lockOnTarget: true,        // 锁定目标发射
    lockOnRange: 300,          // 300像素索敌范围
    targetEffect: 'lockon'     // 十字准星特效
});
```

**特点**：
- 按键后会在300像素范围内搜索最近敌机
- 显示旋转十字准星标记目标
- 500ms后发射导弹，直指目标位置
- 导弹会持续追踪目标

### 示例 2: 激光狙击炮
```javascript
const LASER_SNIPER = new WeaponData({
    name: '激光狙击炮',
    damage: 50,
    cooldown: 5000,
    fireDelay: 300,            // 300ms瞄准时间
    bulletsPerShot: 1,
    burstCount: 1,
    bulletSpeed: 1000,
    bulletLifetime: 3000,
    penetration: 5,
    color: '#00FFFF',
    lockOnTarget: true,        // 精确瞄准
    lockOnRange: 500,          // 500像素远距离索敌
    targetEffect: 'aimline'    // 瞄准线特效
});
```

**特点**：
- 超远距离索敌（500像素）
- 显示瞄准线从发射点到目标
- 300ms瞄准延迟
- 超高穿透和伤害

### 示例 3: 散射追踪炮
```javascript
const SCATTER_TRACKER = new WeaponData({
    name: '散射追踪炮',
    damage: 8,
    cooldown: 2000,
    bulletsPerShot: 5,         // 5发子弹
    burstCount: 1,
    bulletSpeed: 350,
    bulletSpreadAngle: 20,     // 20度散射
    trackingAngularSpeed: 120,  // 中等追踪速度
    penetration: 1,
    color: '#FF00FF',
    lockOnTarget: false,       // 不锁定发射方向（使用散射）
    lockOnRange: 250,          // 250像素索敌
    targetEffect: 'ring'       // 光环特效
});
```

**特点**：
- 锁定目标但不改变发射方向
- 使用散射角发射多发子弹
- 所有子弹都会追踪同一个锁定目标
- 光环特效标记目标

### 示例 4: 智能霰弹枪
```javascript
const SMART_SHOTGUN = new WeaponData({
    name: '智能霰弹枪',
    damage: 3,
    cooldown: 1500,
    bulletsPerShot: 12,        // 12发霰弹
    bulletSpeed: 600,
    bulletAcceleration: -3000,  // 快速减速
    bulletLifetime: 500,
    centerSpreadAngle: 10,
    bulletSpreadAngle: 15,
    penetration: 1,
    color: '#FFA500',
    lockOnTarget: true,        // 霰弹集中到目标
    lockOnRange: 200,          // 近距离索敌
    targetEffect: 'spark'      // 火花标记
});
```

**特点**：
- 近距离索敌（200像素）
- 霰弹集中朝向锁定目标
- 保留一定散射角度
- 火花特效快速闪烁

### 示例 5: 自由发射炮（无索敌）
```javascript
const FREE_CANNON = new WeaponData({
    name: '自由炮',
    damage: 15,
    cooldown: 2000,
    bulletsPerShot: 1,
    bulletSpeed: 400,
    penetration: 2,
    color: '#00FF00',
    lockOnTarget: false,
    lockOnRange: 0,            // 不索敌
    targetEffect: null         // 无特效
});
```

**特点**：
- 传统直线发射
- 不进行目标搜索
- 无锁定特效

## 工作流程详解

### 1. 按键时刻
```
用户按下键 → 检查冷却 → 立即设置冷却 → 开始索敌流程
```

### 2. 索敌流程
```javascript
if (weapon.lockOnRange > 0) {
    // 1. 在范围内搜索敌机
    lockedTarget = findTargetInRange(x, y, range, enemySystem);
    
    // 2. 如果找到目标，播放特效
    if (lockedTarget && weapon.targetEffect) {
        createTargetEffect(weapon.targetEffect, lockedTarget, weapon);
    }
}
```

### 3. 延迟后发射
```javascript
setTimeout(() => {
    if (lockedTarget && weapon.lockOnTarget) {
        // 计算到目标位置的角度
        angle = atan2(targetX - shootX, targetY - shootY);
        
        // 即使目标死亡，也使用最后位置
    }
    
    // 创建子弹，朝向计算的角度
}, weapon.fireDelay);
```

### 4. 特效跟随
- 特效系统会自动跟随目标移动
- 目标死亡后，特效停留在最后位置继续播放
- 达到duration后自动消失

## 视觉效果对比

| 特效类型 | 视觉表现 | 适用场景 |
|---------|---------|---------|
| `lockon` | 旋转十字准星 | 导弹、追踪武器 |
| `ring` | 扩散光环 | 范围指示、能量武器 |
| `aimline` | 瞄准虚线 | 狙击、精确打击 |
| `spark` | 火花闪烁 | 快速索敌、霰弹枪 |
| `null` | 无特效 | 隐蔽武器、快速射击 |

## 高级组合技巧

### 1. 延迟狙击
```javascript
{
    fireDelay: 500,
    lockOnTarget: true,
    lockOnRange: 600,
    targetEffect: 'aimline',
    damage: 100,
    penetration: 10
}
```
效果：瞄准线显示目标 → 0.5秒后精确打击

### 2. 快速追踪
```javascript
{
    fireDelay: 0,
    lockOnTarget: true,
    lockOnRange: 300,
    targetEffect: 'lockon',
    trackingAngularSpeed: 240,
    burstCount: 3,
    burstInterval: 100
}
```
效果：立即锁定 → 连发3枚追踪弹

### 3. 范围霰弹
```javascript
{
    fireDelay: 0,
    lockOnTarget: true,
    lockOnRange: 200,
    targetEffect: 'ring',
    bulletsPerShot: 15,
    bulletSpreadAngle: 25
}
```
效果：光环标记 → 大量子弹向目标散射

### 4. 智能追踪炮塔
```javascript
{
    fireDelay: 100,
    lockOnTarget: false,  // 不改变发射角
    lockOnRange: 400,
    targetEffect: 'spark',
    trackingAngularSpeed: 300,  // 子弹会自己追踪
}
```
效果：标记目标 → 正常发射 → 子弹自动追踪锁定目标

## 调试技巧

1. **查看锁定范围**：可以在游戏中绘制索敌范围圈
2. **测试目标死亡**：验证目标死亡后子弹是否仍朝向最后位置
3. **特效时长调整**：根据fireDelay调整targetEffect的duration
4. **范围调优**：根据游戏节奏调整lockOnRange的大小

## 性能考虑

- 索敌范围越大，计算量越大
- 建议 lockOnRange 不超过 800 像素
- 特效duration建议与fireDelay + burstInterval相匹配
- 对象池会自动管理特效对象，无需担心内存泄漏
