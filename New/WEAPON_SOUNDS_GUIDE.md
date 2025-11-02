# 武器音效系统说明文档

## 概述

为 Press Any Key 游戏添加了完整的武器音效系统，每种武器都有独特的发射音效。

## 实现的武器音效

### 1. 速射炮 (BASIC_GUN)
- **音效特点**：清脆的能量发射声
- **技术参数**：
  - 波形：方波 (square)
  - 起始频率：900 Hz
  - 结束频率：200 Hz
  - 持续时间：60ms
  - 音量：18% 主音量

### 2. 霰弹枪 (SHOTGUN)
- **音效特点**：低频爆炸音 + 白噪声散射感
- **技术参数**：
  - 主音调：锯齿波 (sawtooth)，180 Hz → 60 Hz
  - 噪声：带通滤波器，中心频率 800 Hz
  - 持续时间：150ms (主音) + 120ms (噪声)
  - 音量：30% + 25% 主音量

### 3. 狙击枪 (SNIPER)
- **音效特点**：尖锐的高频爆发 + 低频后座力
- **技术参数**：
  - 高频音：三角波 (triangle)，2400 Hz → 800 Hz
  - 低频冲击：正弦波 (sine)，120 Hz → 40 Hz
  - 持续时间：80ms (高频) + 120ms (低频)
  - 音量：25% + 20% 主音量

### 4. 机枪 (MACHINE_GUN)
- **音效特点**：快速的中频爆发
- **技术参数**：
  - 波形：方波 (square)
  - 频率：600 Hz → 150 Hz
  - 持续时间：40ms
  - 音量：15% 主音量
  - 特点：短促，适合连发

### 5. 导弹 (MISSILE)
- **音效特点**：启动音 + 引擎推进音
- **技术参数**：
  - 低频引擎：锯齿波，100 Hz → 300 Hz
  - 高频喷射：方波，800 Hz → 1200 Hz
  - 持续时间：300ms (低频) + 250ms (高频)
  - 音量：25% + 12% 主音量
  - 特点：渐强效果，模拟导弹加速

### 6. 穿透弹 (PENETRATOR)
- **音效特点**：持续的能量波动
- **技术参数**：
  - 主音：三角波，400 Hz → 800 Hz → 200 Hz
  - 调制音：正弦波，1600 Hz → 600 Hz
  - 持续时间：150ms (主音) + 120ms (调制)
  - 音量：22% + 15% 主音量
  - 特点：波动效果，模拟能量穿透

## 使用方法

### 在游戏中自动播放

武器系统会在发射子弹时自动调用音效：

```javascript
// 在 weapon.js 的 startBurstFire 方法中
if (window.audioSystem) {
    window.audioSystem.playWeaponSound(weapon.shootSound);
}
```

### 手动播放特定武器音效

```javascript
// 播放速射炮音效
audioSystem.playBasicGunSound();

// 播放霰弹枪音效
audioSystem.playShotgunSound();

// 或使用统一接口
audioSystem.playWeaponSound('BASIC_GUN');
audioSystem.playWeaponSound('SHOTGUN');
```

### 武器配置

在 `weapon.js` 的 `WeaponData` 中，通过 `shootSound` 属性指定音效类型：

```javascript
BASIC_GUN: new WeaponData({
    id: 'BASIC_GUN',
    name: '速射炮',
    shootSound: 'default', // 或 'BASIC_GUN'
    // ... 其他配置
})
```

## 音效映射表

| 武器ID | shootSound 值 | 音效方法 |
|--------|---------------|----------|
| BASIC_GUN | 'default' 或 'BASIC_GUN' | playBasicGunSound() |
| SHOTGUN | 'shotgun' 或 'SHOTGUN' | playShotgunSound() |
| SNIPER | 'sniper' 或 'SNIPER' | playSniperSound() |
| MACHINE_GUN | 'machinegun' 或 'MACHINE_GUN' | playMachineGunSound() |
| MISSILE | 'missile' 或 'MISSILE' | playMissileSound() |
| PENETRATOR | 'penetrator' 或 'PENETRATOR' | playPenetratorSound() |

## 测试工具

使用 `test_weapon_sounds.html` 来测试所有武器音效：

1. 在浏览器中打开 `test_weapon_sounds.html`
2. 点击各个武器卡片上的"播放音效"按钮
3. 试听每种武器的音效效果

## 技术实现

### Web Audio API

所有音效使用 Web Audio API 的 `OscillatorNode` 和 `GainNode` 实时生成：

- **优点**：
  - 不需要加载音频文件
  - 文件体积小
  - 实时生成，延迟低
  - 可精确控制音效参数

- **音效合成技术**：
  - 频率调制：通过改变频率创造音调变化
  - 包络控制：通过增益节点控制音量变化
  - 波形选择：不同波形产生不同音色
  - 噪声合成：用于爆炸、散射等效果
  - 滤波器：塑造音色特征

### 音量控制

- 主音量：`audioSystem.masterVolume` (默认 0.3)
- 每个武器音效都是主音量的百分比
- 可通过 `audioSystem.setVolume(0.5)` 调整

### 浏览器兼容性

- 自动处理音频上下文的浏览器限制
- 需要用户交互后才能播放音效（浏览器安全策略）
- 支持 Chrome、Firefox、Safari、Edge 等现代浏览器

## 音效设计理念

1. **速射炮**：快速、清脆，强调连续射击的流畅感
2. **霰弹枪**：厚重、爆裂，体现大范围散射的威力
3. **狙击枪**：尖锐、有力，表现精准打击的冲击力
4. **机枪**：短促、密集，适合快速连发
5. **导弹**：渐强、持续，模拟导弹发射和加速过程
6. **穿透弹**：波动、穿透感，体现能量穿透的特性

## 未来扩展

可以添加的音效：

1. **子弹击中音效**：不同材质的碰撞声
2. **武器充能音效**：狙击枪蓄力音效
3. **弹药装填音效**：冷却完成提示音
4. **环境音效**：背景音乐、氛围音效
5. **UI音效**：菜单切换、按钮点击

## 性能优化

- 音效持续时间都很短（40ms-300ms）
- 自动清理已完成的音频节点
- 不会占用大量内存
- CPU 占用极低

## 调试

查看音效系统状态：

```javascript
// 检查是否启用
console.log(audioSystem.isEnabled());

// 检查音频上下文状态
console.log(audioSystem.audioContext.state);

// 调整音量
audioSystem.setVolume(0.5); // 50% 音量

// 禁用/启用音效
audioSystem.setEnabled(false);
audioSystem.setEnabled(true);
```

## 注意事项

1. **用户交互要求**：现代浏览器要求用户交互后才能播放音效
2. **音量平衡**：各武器音效音量已经过平衡，但可能需要根据实际体验微调
3. **连发音效**：机枪等连发武器会在短时间内播放多次音效，这是正常的
4. **音频上下文限制**：某些浏览器对同时播放的音频数量有限制

---

**版本**：1.0  
**最后更新**：2025-11-02  
**作者**：Press Any Key 开发团队
