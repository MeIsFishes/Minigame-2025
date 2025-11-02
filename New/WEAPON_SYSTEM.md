# 武器系统文档

## 武器数据结构

武器系统已完全重构，支持高度可定制的武器配置。

### WeaponData 类

每个武器由以下属性定义：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | String | '默认武器' | 武器名称 |
| `damage` | Number | 1 | 攻击力 |
| `cooldown` | Number | 1000 | 冷却时间（毫秒） |
| `fireDelay` | Number | 0 | 发射延迟（毫秒） |
| `bulletsPerShot` | Number | 1 | 单次射击的子弹数量 |
| `burstCount` | Number | 1 | 连发射击次数 |
| `burstInterval` | Number | 100 | 连发间隔（毫秒） |
| `shootSound` | String | 'default' | 射击音效类型 |
| `bulletWidth` | Number | 4 | 子弹宽度（像素） |
| `bulletHeight` | Number | 15 | 子弹高度（像素） |
| `bulletSpeed` | Number | 300 | 子弹速度（像素/秒） |
| `bulletAcceleration` | Number | 0 | 子弹加速度（像素/秒²） |
| `bulletLifetime` | Number | 5000 | 子弹存在时间（毫秒） |
| `centerSpreadAngle` | Number | 0 | 中心线散射角（度数） |
| `bulletSpreadAngle` | Number | 0 | 子弹散射角（度数） |
| `trackingAngularSpeed` | Number | 0 | 追踪角速度（度/秒） |
| `explosionRadius` | Number | 0 | 爆炸范围（像素，0表示无爆炸） |
| `penetration` | Number | 1 | 穿透次数 |
| `color` | String | '#FFD700' | 武器颜色（影响子弹和UI） |
| `lockOnTarget` | Boolean | false | 是否锁定目标发射 |
| `lockOnRange` | Number | 0 | 索敌范围（像素，0表示不索敌） |
| `targetEffect` | String | null | 目标特效类型（'lockon'/'ring'/'aimline'/'spark'） |

## 武器机制说明

### 1. 散射系统
- **中心线散射角**：每次发射时，在±角度范围内随机选择一个方向作为中心线
- **子弹散射角**：每发子弹在中心线的基础上，再在±角度范围内随机偏移

### 2. 追踪系统
- 子弹发射时会自动锁定X轴距离最近的敌人
- 以设定的角速度持续追踪目标
- 目标死亡后子弹继续直线飞行

### 3. 连发系统
- `burstCount`：设置连发次数
- `burstInterval`：设置每次射击之间的间隔

### 4. 多发系统
- `bulletsPerShot`：单次射击发射多发子弹
- 配合散射角可以实现霰弹枪效果

### 5. 加速度系统
- 子弹可以加速或减速
- 正值加速，负值减速

### 6. 穿透系统
- 设置子弹可以穿透的敌人数量
- 每次命中减少1点穿透值

### 7. 爆炸系统
- 设置爆炸范围（像素）
- 命中时对范围内所有敌人造成伤害

### 8. 发射延迟系统
- `fireDelay`：按键后延迟指定时间才发射子弹
- 冷却时间从按键时刻开始计算（而非实际发射时）
- 适用于蓄力武器、充能武器等需要延迟效果的场景
- 示例：狙击炮可设置200ms延迟模拟瞄准时间

### 9. 索敌与锁定系统
- `lockOnRange`：以发射位置X轴为中心的索敌范围（像素）
  - 为0时不进行索敌
  - 在范围内搜索X轴偏移不超过该值的最近敌机
- `lockOnTarget`：是否将子弹方向指向锁定目标
  - true：子弹射向锁定目标位置（即使目标已死亡）
  - false：使用常规散射角发射
- `targetEffect`：锁定目标时播放的特效类型
  - `'lockon'`：旋转十字准星（默认）
  - `'ring'`：扩散光环
  - `'aimline'`：瞄准虚线
  - `'spark'`：火花标记
  - `null`：不播放特效

**工作流程**：
1. 按下按键时，在索敌范围内搜索最近的敌机
2. 如果找到目标，播放目标特效（特效会跟随目标）
3. 发射延迟后（如果有），子弹生成
4. 如果启用了lockOnTarget，子弹朝向锁定目标的位置
5. 即使目标已死亡，子弹仍会朝向目标最后的位置发射

## 预设武器

### BASIC_GUN（基础机枪）
```javascript
{
    name: '基础机枪',
    damage: 1,
    cooldown: 1000,
    bulletsPerShot: 1,
    color: '#FFD700'
}
```

## 如何自定义武器

### 示例1：三连发步枪
```javascript
const TRIPLE_RIFLE = new WeaponData({
    name: '三连发步枪',
    damage: 2,
    cooldown: 1500,
    bulletsPerShot: 1,
    burstCount: 3,
    burstInterval: 150,
    bulletSpeed: 400,
    color: '#FF6B6B'
});
```

### 示例2：追踪导弹
```javascript
const HOMING_MISSILE = new WeaponData({
    name: '追踪导弹',
    damage: 3,
    cooldown: 2000,
    bulletsPerShot: 1,
    bulletSpeed: 200,
    bulletAcceleration: 50,
    trackingAngularSpeed: 180,
    explosionRadius: 30,
    color: '#FF4444'
});
```

### 示例3：霰弹枪
```javascript
const SHOTGUN = new WeaponData({
    name: '霰弹枪',
    damage: 1,
    cooldown: 800,
    bulletsPerShot: 8,
    bulletSpreadAngle: 30,
    bulletSpeed: 350,
    color: '#FFA500'
});
```

### 示例4：激光炮
```javascript
const LASER_CANNON = new WeaponData({
    name: '激光炮',
    damage: 5,
    cooldown: 3000,
    bulletsPerShot: 1,
    bulletSpeed: 800,
    bulletWidth: 8,
    bulletHeight: 40,
    penetration: 999,
    color: '#00FFFF'
});
```

## 如何为键位设置武器

```javascript
// 在game.js的startGame方法中
weaponSystem.setWeapon('Q', TRIPLE_RIFLE);
weaponSystem.setWeapon('W', HOMING_MISSILE);
weaponSystem.setWeapon('E', SHOTGUN);
weaponSystem.setWeapon('R', LASER_CANNON);
```

## 武器颜色

武器颜色会影响：
1. 子弹的颜色
2. 子弹的光晕效果
3. 键位UI的背景颜色（就绪状态）

颜色使用标准的十六进制格式，如：`#FFD700`、`#FF0000`等
