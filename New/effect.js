// effect.js - 特效系统：处理游戏中的视觉特效

// 特效数据结构
class Effect {
    constructor(config) {
        this.id = config.id || 0; // 特效唯一ID
        this.type = config.type || 'generic'; // 特效类型
        this.target = config.target || null; // 目标对象（如果有）
        this.x = config.x || 0; // 位置X
        this.y = config.y || 0; // 位置Y
        this.effectFunction = config.effectFunction || null; // 特效函数
        this.duration = config.duration || 1000; // 持续时间（毫秒）
        this.createdTime = Date.now(); // 创建时间
        this.isActive = true; // 是否活跃
        this.data = config.data || {}; // 特效特定数据
        
        // 内部状态
        this.elapsed = 0; // 已经过时间
        this.particles = []; // 粒子列表（如果需要）
        this.followTarget = config.followTarget !== false; // 是否跟随目标
    }
    
    // 更新位置（如果有目标）
    updatePosition() {
        if (this.followTarget && this.target && this.isTargetAlive()) {
            // 跟随目标对象
            this.x = this.target.x + (this.target.width || 0) / 2;
            this.y = this.target.y + (this.target.height || 0) / 2;
        }
        // 如果目标不存在或已死亡，保持在最后位置
    }
    
    // 检查目标是否存活
    isTargetAlive() {
        if (!this.target) return false;
        
        // 检查各种可能的存活标记
        if (this.target.isAlive !== undefined) {
            return this.target.isAlive;
        }
        if (this.target.health !== undefined) {
            return this.target.health > 0;
        }
        
        return true; // 默认认为存活
    }
    
    // 更新特效
    update(deltaTime) {
        this.elapsed += deltaTime;
        
        // 更新位置
        this.updatePosition();
        
        // 执行特效函数
        if (this.effectFunction) {
            const progress = Math.min(1, this.elapsed / this.duration);
            this.effectFunction(this, progress, deltaTime);
        }
        
        // 检查是否完成
        if (this.elapsed >= this.duration) {
            this.isActive = false;
        }
    }
    
    // 绘制特效
    draw(ctx) {
        // 子类或特效函数负责实现具体绘制
    }
    
    // 重置特效（用于对象池）
    reset(config) {
        this.id = config.id || 0;
        this.type = config.type || 'generic';
        this.target = config.target || null;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.effectFunction = config.effectFunction || null;
        this.duration = config.duration || 1000;
        this.createdTime = Date.now();
        this.isActive = true;
        this.data = config.data || {};
        this.elapsed = 0;
        this.particles = [];
        this.followTarget = config.followTarget !== false;
    }
}

// 特效系统
class EffectSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.effects = []; // 活跃特效列表
        this.effectPool = []; // 特效对象池
        this.nextEffectId = 0;
        this.maxPoolSize = 100; // 对象池最大容量
    }
    
    // 从对象池获取特效对象
    getEffectFromPool() {
        if (this.effectPool.length > 0) {
            return this.effectPool.pop();
        }
        return new Effect({ id: this.nextEffectId++ });
    }
    
    // 将特效对象返回对象池
    returnEffectToPool(effect) {
        if (this.effectPool.length < this.maxPoolSize) {
            effect.particles = []; // 清空粒子
            this.effectPool.push(effect);
        }
    }
    
    // 创建特效
    createEffect(config) {
        const effect = this.getEffectFromPool();
        effect.reset({
            ...config,
            id: this.nextEffectId++
        });
        
        this.effects.push(effect);
        return effect;
    }
    
    // 创建爆炸特效
    createExplosion(x, y, target = null, config = {}) {
        const particleCount = config.particleCount || 15;
        const radius = config.radius || 30;
        const color = config.color || '#FF9600';
        const duration = config.duration || 600;
        
        return this.createEffect({
            type: 'explosion',
            x: x,
            y: y,
            target: target,
            duration: duration,
            followTarget: false, // 爆炸不跟随目标
            data: {
                particleCount: particleCount,
                radius: radius,
                color: color
            },
            effectFunction: (effect, progress, deltaTime) => {
                // 初始化烟雾粒子
                if (effect.particles.length === 0) {
                    for (let i = 0; i < particleCount; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * radius * 0.5;
                        const speed = 0.3 + Math.random() * 0.5;
                        
                        effect.particles.push({
                            x: effect.x + Math.cos(angle) * distance,
                            y: effect.y + Math.sin(angle) * distance,
                            vx: (Math.random() - 0.5) * speed,
                            vy: (Math.random() - 0.5) * speed - 0.5, // 轻微向上飘
                            size: radius * 0.2 + Math.random() * radius * 0.3,
                            initialSize: radius * 0.2,
                            alpha: 0.8,
                            rotation: Math.random() * Math.PI * 2,
                            rotationSpeed: (Math.random() - 0.5) * 0.1
                        });
                    }
                }
                
                // 更新烟雾粒子
                effect.particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.rotation += particle.rotationSpeed;
                    
                    // 烟雾逐渐扩散和消散
                    particle.size = particle.initialSize + (particle.initialSize * 2 * progress);
                    particle.alpha = 0.8 * (1 - progress);
                });
            }
        });
    }
    
    // 创建火花特效
    createSpark(x, y, target = null, config = {}) {
        const particleCount = config.particleCount || 8;
        const color = config.color || '#FFFF00';
        const duration = config.duration || 400;
        
        return this.createEffect({
            type: 'spark',
            x: x,
            y: y,
            target: target,
            duration: duration,
            data: {
                particleCount: particleCount,
                color: color
            },
            effectFunction: (effect, progress, deltaTime) => {
                if (effect.particles.length === 0) {
                    for (let i = 0; i < particleCount; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 3 + Math.random() * 2;
                        
                        effect.particles.push({
                            x: effect.x,
                            y: effect.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed - 2,
                            size: 2 + Math.random() * 2,
                            alpha: 1
                        });
                    }
                }
                
                effect.particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.2; // 重力
                    particle.alpha = 1 - progress;
                });
            }
        });
    }
    
    // 创建光环特效
    createRing(x, y, target = null, config = {}) {
        const maxRadius = config.maxRadius || 40;
        const color = config.color || '#00FFFF';
        const duration = config.duration || 500;
        
        return this.createEffect({
            type: 'ring',
            x: x,
            y: y,
            target: target,
            duration: duration,
            followTarget: true,
            data: {
                maxRadius: maxRadius,
                color: color,
                currentRadius: 0
            },
            effectFunction: (effect, progress, deltaTime) => {
                effect.data.currentRadius = maxRadius * progress;
            }
        });
    }
    
    // 创建轨迹特效
    createTrail(x, y, target, config = {}) {
        const length = config.length || 10;
        const color = config.color || '#FFFFFF';
        const width = config.width || 2;
        const duration = config.duration || 9999999; // 持续跟随
        
        return this.createEffect({
            type: 'trail',
            x: x,
            y: y,
            target: target,
            duration: duration,
            followTarget: true,
            data: {
                length: length,
                color: color,
                width: width,
                positions: []
            },
            effectFunction: (effect, progress, deltaTime) => {
                // 记录轨迹位置
                effect.data.positions.push({ x: effect.x, y: effect.y });
                
                // 限制轨迹长度
                if (effect.data.positions.length > length) {
                    effect.data.positions.shift();
                }
                
                // 如果目标消失，开始淡出
                if (!effect.isTargetAlive()) {
                    effect.duration = effect.elapsed + 500; // 再持续500ms后消失
                }
            }
        });
    }
    
    // 创建文字特效
    createText(x, y, text, config = {}) {
        const color = config.color || '#FFFFFF';
        const fontSize = config.fontSize || 20;
        const duration = config.duration || 1000;
        const floatSpeed = config.floatSpeed || -1;
        
        return this.createEffect({
            type: 'text',
            x: x,
            y: y,
            duration: duration,
            data: {
                text: text,
                color: color,
                fontSize: fontSize,
                floatSpeed: floatSpeed,
                offsetY: 0
            },
            effectFunction: (effect, progress, deltaTime) => {
                effect.data.offsetY += floatSpeed;
            }
        });
    }
    
    // 创建锁定标记特效
    createLockOn(x, y, target, config = {}) {
        const size = config.size || 30;
        const duration = config.duration || 1000;
        
        return this.createEffect({
            type: 'lockon',
            x: x,
            y: y,
            target: target,
            duration: duration,
            followTarget: true,
            data: {
                color: '#FF0000', // 固定红色
                size: size,
                rotation: 0,
                alpha: 1.0 // 初始透明度
            },
            effectFunction: (effect, progress, deltaTime) => {
                // 旋转动画
                effect.data.rotation += deltaTime * 0.3; // 旋转速度
                
                // 最后四分之一时间渐隐
                if (progress >= 0.75) {
                    // 从1.0渐变到0，progress从0.75到1.0映射到alpha从1.0到0
                    const fadeProgress = (progress - 0.75) / 0.25; // 0到1
                    effect.data.alpha = 1.0 - fadeProgress;
                } else {
                    effect.data.alpha = 1.0;
                }
            }
        });
    }
    
    // 创建瞄准线特效
    createAimLine(x1, y1, x2, y2, config = {}) {
        const color = config.color || '#FF0000';
        const duration = config.duration || 500;
        
        return this.createEffect({
            type: 'aimline',
            x: x1,
            y: y1,
            duration: duration,
            data: {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                color: color
            },
            effectFunction: (effect, progress, deltaTime) => {
                // 瞄准线淡出
            }
        });
    }
    
    // 更新所有特效
    update(deltaTime) {
        // 更新所有特效
        this.effects.forEach(effect => {
            effect.update(deltaTime);
        });
        
        // 清理已完成的特效
        this.effects = this.effects.filter(effect => {
            if (!effect.isActive) {
                this.returnEffectToPool(effect);
                return false;
            }
            return true;
        });
    }
    
    // 绘制所有特效
    draw(ctx) {
        this.effects.forEach(effect => {
            this.drawEffect(ctx, effect);
        });
    }
    
    // 绘制单个特效
    drawEffect(ctx, effect) {
        ctx.save();
        
        switch (effect.type) {
            case 'explosion':
                this.drawExplosion(ctx, effect);
                break;
            case 'spark':
                this.drawSpark(ctx, effect);
                break;
            case 'ring':
                this.drawRing(ctx, effect);
                break;
            case 'trail':
                this.drawTrail(ctx, effect);
                break;
            case 'text':
                this.drawText(ctx, effect);
                break;
            case 'lockon':
                this.drawLockOn(ctx, effect);
                break;
            case 'aimline':
                this.drawAimLine(ctx, effect);
                break;
            default:
                // 自定义绘制
                if (effect.draw) {
                    effect.draw(ctx);
                }
        }
        
        ctx.restore();
    }
    
    // 绘制爆炸
    drawExplosion(ctx, effect) {
        const color = effect.data.color;
        
        effect.particles.forEach(particle => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            
            // 创建径向渐变模拟烟雾（中心浅，外围浓）
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            gradient.addColorStop(0, this.addAlpha(color, particle.alpha * 0.2));
            gradient.addColorStop(0.3, this.addAlpha(color, particle.alpha * 0.5));
            gradient.addColorStop(0.7, this.addAlpha(color, particle.alpha * 0.6));
            gradient.addColorStop(0.9, this.addAlpha(color, particle.alpha * 0.4));
            gradient.addColorStop(1, this.addAlpha(color, 0));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加清晰的外轮廓
            ctx.strokeStyle = this.addAlpha(color, particle.alpha * 0.7);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size * 0.95, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    // 辅助方法：给颜色添加透明度
    addAlpha(color, alpha) {
        // 解析颜色并添加透明度
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color; // 如果已经是rgba格式，直接返回
    }
    
    // 绘制火花
    drawSpark(ctx, effect) {
        const color = effect.data.color;
        
        effect.particles.forEach(particle => {
            ctx.fillStyle = color;
            ctx.globalAlpha = particle.alpha;
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
    
    // 绘制光环
    drawRing(ctx, effect) {
        const color = effect.data.color;
        const radius = effect.data.currentRadius;
        const progress = effect.elapsed / effect.duration;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1 - progress;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
    
    // 绘制轨迹
    drawTrail(ctx, effect) {
        const positions = effect.data.positions;
        if (positions.length < 2) return;
        
        const color = effect.data.color;
        const width = effect.data.width;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(positions[0].x, positions[0].y);
        
        for (let i = 1; i < positions.length; i++) {
            const alpha = i / positions.length;
            ctx.globalAlpha = alpha * 0.5;
            ctx.lineTo(positions[i].x, positions[i].y);
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // 绘制文字
    drawText(ctx, effect) {
        const progress = effect.elapsed / effect.duration;
        const y = effect.y + effect.data.offsetY;
        
        ctx.font = `bold ${effect.data.fontSize}px Arial`;
        ctx.fillStyle = effect.data.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 1 - progress;
        
        // 描边
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(effect.data.text, effect.x, y);
        
        // 填充
        ctx.fillText(effect.data.text, effect.x, y);
        
        ctx.globalAlpha = 1;
    }
    
    // 绘制锁定标记
    drawLockOn(ctx, effect) {
        const size = effect.data.size;
        const color = effect.data.color;
        const rotation = effect.data.rotation;
        const alpha = effect.data.alpha; // 使用特效自己的alpha值
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;
        
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(rotation * Math.PI / 180);
        
        // 绘制十字准星
        ctx.beginPath();
        // 上
        ctx.moveTo(0, -size);
        ctx.lineTo(0, -size / 2);
        // 下
        ctx.moveTo(0, size);
        ctx.lineTo(0, size / 2);
        // 左
        ctx.moveTo(-size, 0);
        ctx.lineTo(-size / 2, 0);
        // 右
        ctx.moveTo(size, 0);
        ctx.lineTo(size / 2, 0);
        ctx.stroke();
        
        // 绘制四个角
        const cornerSize = size / 3;
        ctx.beginPath();
        // 左上角
        ctx.moveTo(-size, -size + cornerSize);
        ctx.lineTo(-size, -size);
        ctx.lineTo(-size + cornerSize, -size);
        // 右上角
        ctx.moveTo(size - cornerSize, -size);
        ctx.lineTo(size, -size);
        ctx.lineTo(size, -size + cornerSize);
        // 右下角
        ctx.moveTo(size, size - cornerSize);
        ctx.lineTo(size, size);
        ctx.lineTo(size - cornerSize, size);
        // 左下角
        ctx.moveTo(-size + cornerSize, size);
        ctx.lineTo(-size, size);
        ctx.lineTo(-size, size - cornerSize);
        ctx.stroke();
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    // 绘制瞄准线
    drawAimLine(ctx, effect) {
        const progress = effect.elapsed / effect.duration;
        const color = effect.data.color;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(effect.data.x1, effect.data.y1);
        ctx.lineTo(effect.data.x2, effect.data.y2);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }
    
    // 创建全屏闪光特效（用于玩家受伤等）
    createScreenFlash(config = {}) {
        const color = config.color || 'rgba(255, 0, 0, 0.5)'; // 默认红色
        const duration = config.duration || 200; // 默认200ms
        const fadeOut = config.fadeOut !== false; // 是否淡出
        
        return this.createEffect({
            type: 'screenFlash',
            x: 0,
            y: 0,
            duration: duration,
            followTarget: false,
            data: {
                color: color,
                fadeOut: fadeOut
            },
            effectFunction: (effect, progress, deltaTime, ctx) => {
                if (!ctx) return;
                
                ctx.save();
                
                // 计算透明度（如果启用淡出）
                let alpha = 1.0;
                if (fadeOut) {
                    alpha = 1.0 - progress; // 从1到0淡出
                }
                
                // 解析颜色并应用透明度
                let finalColor = color;
                if (color.startsWith('rgba')) {
                    // 如果是rgba格式，修改alpha值
                    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
                    if (rgbaMatch) {
                        const r = rgbaMatch[1];
                        const g = rgbaMatch[2];
                        const b = rgbaMatch[3];
                        const baseAlpha = parseFloat(rgbaMatch[4] || 1);
                        finalColor = `rgba(${r}, ${g}, ${b}, ${baseAlpha * alpha})`;
                    }
                } else if (color.startsWith('rgb')) {
                    // rgb格式，添加alpha
                    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (rgbMatch) {
                        finalColor = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
                    }
                } else if (color.startsWith('#')) {
                    // 十六进制格式，转换为rgba
                    const hex = color.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    finalColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }
                
                // 绘制全屏矩形
                ctx.fillStyle = finalColor;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                ctx.restore();
            }
        });
    }
    
    // 移除指定特效
    removeEffect(effect) {
        const index = this.effects.indexOf(effect);
        if (index > -1) {
            this.returnEffectToPool(effect);
            this.effects.splice(index, 1);
        }
    }
    
    // 清除所有特效
    clearAllEffects() {
        this.effects.forEach(effect => {
            this.returnEffectToPool(effect);
        });
        this.effects = [];
    }
    
    // 重置系统
    reset() {
        this.clearAllEffects();
        this.nextEffectId = 0;
    }
    
    // 获取活跃特效数量
    getActiveEffectCount() {
        return this.effects.length;
    }
    
    // 获取对象池使用情况
    getPoolStats() {
        return {
            poolSize: this.effectPool.length,
            maxPoolSize: this.maxPoolSize,
            activeEffects: this.effects.length
        };
    }
}
