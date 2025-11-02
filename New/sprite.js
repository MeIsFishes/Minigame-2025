// sprite.js - 精灵绘制系统：统一处理游戏内所有实体的绘制逻辑

class SpriteRenderer {
    constructor() {
        // 颜色工具方法缓存
        this.colorCache = new Map();
    }
    
    // ==================== 颜色工具方法 ====================
    
    // 颜色变暗
    darkenColor(color, factor) {
        const cacheKey = `${color}_dark_${factor}`;
        if (this.colorCache.has(cacheKey)) {
            return this.colorCache.get(cacheKey);
        }
        
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
        const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
        const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
        const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        this.colorCache.set(cacheKey, result);
        return result;
    }
    
    // 颜色变亮
    lightenColor(color, factor) {
        const cacheKey = `${color}_light_${factor}`;
        if (this.colorCache.has(cacheKey)) {
            return this.colorCache.get(cacheKey);
        }
        
        const hex = color.replace('#', '');
        const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
        const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
        const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
        const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        this.colorCache.set(cacheKey, result);
        return result;
    }
    
    // ==================== 敌机绘制方法 ====================
    
    /**
     * 绘制敌机
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {Object} config - 绘制配置
     * @param {number} config.x - X坐标
     * @param {number} config.y - Y坐标
     * @param {number} config.width - 宽度
     * @param {number} config.height - 高度
     * @param {number} config.direction - 方向 (1=向右, -1=向左)
     * @param {number} config.scale - 缩放比例 (默认1.0)
     * @param {string} config.model - 模型类型 ('basic', 'heavy', 'fast', 'boss')
     * @param {string} config.color - 主要颜色
     */
    drawEnemy(ctx, config) {
        const {
            x, y, width, height,
            direction = 1,
            scale = 1.0,
            model = 'basic',
            color = '#FF4444'
        } = config;
        
        ctx.save();
        
        // 应用方向翻转
        if (direction < 0) {
            ctx.translate(x + width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(x + width / 2), 0);
        }
        
        // 应用缩放
        if (scale !== 1.0) {
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
        }
        
        // 根据模型类型绘制
        switch (model) {
            case 'basic':
                this.drawBasicEnemy(ctx, x, y, width, height, color);
                break;
            case 'heavy':
                this.drawHeavyEnemy(ctx, x, y, width, height, color);
                break;
            case 'fast':
                this.drawFastEnemy(ctx, x, y, width, height, color);
                break;
            case 'boss':
                this.drawBossEnemy(ctx, x, y, width, height, color);
                break;
            case 'armored':
                this.drawArmoredEnemy(ctx, x, y, width, height, color);
                break;
            case 'heavy_armored':
                this.drawHeavyArmoredEnemy(ctx, x, y, width, height, color);
                break;
            default:
                this.drawBasicEnemy(ctx, x, y, width, height, color);
        }
        
        ctx.restore();
        
        // 血条绘制已移至 enemyHud.js 的 EnemyHudManager 管理
    }
    
    // 绘制基础战机（向右飞的样子）
    drawBasicEnemy(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        
        // 机身主体（流线型）
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h * 0.5); // 机头（尖端向右）
        ctx.lineTo(x + w * 0.2, y + h * 0.3); // 上部
        ctx.lineTo(x, y + h * 0.5); // 机尾上部
        ctx.lineTo(x + w * 0.2, y + h * 0.7); // 下部
        ctx.closePath();
        ctx.fill();
        
        // 上翅膀
        ctx.fillStyle = this.darkenColor(color, 0.7);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.3);
        ctx.lineTo(x + w * 0.5, y);
        ctx.lineTo(x + w * 0.6, y + h * 0.2);
        ctx.lineTo(x + w * 0.4, y + h * 0.35);
        ctx.closePath();
        ctx.fill();
        
        // 下翅膀
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.7);
        ctx.lineTo(x + w * 0.5, y + h);
        ctx.lineTo(x + w * 0.6, y + h * 0.8);
        ctx.lineTo(x + w * 0.4, y + h * 0.65);
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = '#4DD0E1';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00BCD4';
        ctx.beginPath();
        ctx.arc(x + w * 0.45, y + h * 0.5, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // 引擎光效
        ctx.fillStyle = '#FF6B00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF9800';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.05, y + h * 0.5, w * 0.08, h * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制重型战机（坦克风格，方正厚重）
    drawHeavyEnemy(ctx, x, y, w, h, color) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        
        // 主装甲机身（方正）
        ctx.fillStyle = color;
        ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.55, h * 0.5);
        
        // 前装甲板（倾斜）
        ctx.fillStyle = this.lightenColor(color, 1.2);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h * 0.3);
        ctx.lineTo(x + w * 0.9, y + h * 0.5);
        ctx.lineTo(x + w * 0.7, y + h * 0.7);
        ctx.lineTo(x + w * 0.7, y + h * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 上下装甲护板
        ctx.fillStyle = this.darkenColor(color, 0.7);
        ctx.fillRect(x + w * 0.2, y + h * 0.15, w * 0.45, h * 0.1);
        ctx.fillRect(x + w * 0.2, y + h * 0.75, w * 0.45, h * 0.1);
        
        // 厚重侧翼装甲（上）
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, y + h * 0.15);
        ctx.lineTo(x + w * 0.55, y + h * 0.05);
        ctx.lineTo(x + w * 0.65, y + h * 0.15);
        ctx.lineTo(x + w * 0.45, y + h * 0.25);
        ctx.closePath();
        ctx.fill();
        
        // 厚重侧翼装甲（下）
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, y + h * 0.85);
        ctx.lineTo(x + w * 0.55, y + h * 0.95);
        ctx.lineTo(x + w * 0.65, y + h * 0.85);
        ctx.lineTo(x + w * 0.45, y + h * 0.75);
        ctx.closePath();
        ctx.fill();
        
        // 装甲镶边高光
        ctx.strokeStyle = this.lightenColor(color, 1.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(x + w * 0.17, y + h * 0.27, w * 0.5, h * 0.46);
        
        // 驾驶舱（小窗口）
        ctx.fillStyle = '#4DD0E1';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00BCD4';
        ctx.fillRect(x + w * 0.55, y + h * 0.42, w * 0.12, h * 0.16);
        
        // 四个大型推进器
        ctx.fillStyle = '#263238';
        ctx.shadowBlur = 5;
        const thrusterSize = h * 0.08;
        ctx.fillRect(x, y + h * 0.28, w * 0.18, thrusterSize);
        ctx.fillRect(x, y + h * 0.44, w * 0.18, thrusterSize);
        ctx.fillRect(x, y + h * 0.52, w * 0.18, thrusterSize);
        ctx.fillRect(x, y + h * 0.68, w * 0.18, thrusterSize);
        
        // 推进器火焰
        ctx.fillStyle = '#FFA726';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF6F00';
        ctx.fillRect(x - w * 0.08, y + h * 0.3, w * 0.1, thrusterSize * 0.7);
        ctx.fillRect(x - w * 0.08, y + h * 0.46, w * 0.1, thrusterSize * 0.7);
        ctx.fillRect(x - w * 0.08, y + h * 0.54, w * 0.1, thrusterSize * 0.7);
        ctx.fillRect(x - w * 0.08, y + h * 0.7, w * 0.1, thrusterSize * 0.7);
    }
    
    // 绘制快速战机（三角翼超音速战斗机）
    drawFastEnemy(ctx, x, y, w, h, color) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        
        // 超细长针状机身
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.95, y + h * 0.5); // 尖锐机头
        ctx.lineTo(x + w * 0.3, y + h * 0.4); // 上侧
        ctx.lineTo(x + w * 0.05, y + h * 0.48); // 机尾上
        ctx.lineTo(x, y + h * 0.5); // 机尾尖端
        ctx.lineTo(x + w * 0.05, y + h * 0.52); // 机尾下
        ctx.lineTo(x + w * 0.3, y + h * 0.6); // 下侧
        ctx.closePath();
        ctx.fill();
        
        // 大型三角主翼（上）
        ctx.fillStyle = this.lightenColor(color, 1.3);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.45, y + h * 0.4);
        ctx.lineTo(x + w * 0.7, y + h * 0.05);
        ctx.lineTo(x + w * 0.8, y + h * 0.35);
        ctx.lineTo(x + w * 0.55, y + h * 0.45);
        ctx.closePath();
        ctx.fill();
        
        // 大型三角主翼（下）
        ctx.beginPath();
        ctx.moveTo(x + w * 0.45, y + h * 0.6);
        ctx.lineTo(x + w * 0.7, y + h * 0.95);
        ctx.lineTo(x + w * 0.8, y + h * 0.65);
        ctx.lineTo(x + w * 0.55, y + h * 0.55);
        ctx.closePath();
        ctx.fill();
        
        // 机翼边缘高光
        ctx.strokeStyle = this.lightenColor(color, 1.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h * 0.05);
        ctx.lineTo(x + w * 0.8, y + h * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h * 0.95);
        ctx.lineTo(x + w * 0.8, y + h * 0.65);
        ctx.stroke();
        
        // 小型垂直尾翼
        ctx.fillStyle = this.darkenColor(color, 0.7);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.15, y + h * 0.48);
        ctx.lineTo(x + w * 0.12, y + h * 0.3);
        ctx.lineTo(x + w * 0.25, y + h * 0.45);
        ctx.closePath();
        ctx.fill();
        
        // 超音速等离子尾焰
        const gradient = ctx.createRadialGradient(x, y + h * 0.5, 0, x - w * 0.1, y + h * 0.5, w * 0.25);
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(0.3, '#00E5FF');
        gradient.addColorStop(0.6, '#FFEB3B');
        gradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00FFFF';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.05, y + h * 0.5, w * 0.18, h * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 发光驾驶舱
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00E5FF';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.65, y + h * 0.5, w * 0.06, h * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制BOSS战机（巨型母舰风格）
    drawBossEnemy(ctx, x, y, w, h, color) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;
        
        // 主舰体（五边形宽体）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.85, y + h * 0.5); // 前端
        ctx.lineTo(x + w * 0.65, y + h * 0.2); // 上角
        ctx.lineTo(x + w * 0.15, y + h * 0.25); // 上后
        ctx.lineTo(x, y + h * 0.5); // 后端
        ctx.lineTo(x + w * 0.15, y + h * 0.75); // 下后
        ctx.lineTo(x + w * 0.65, y + h * 0.8); // 下角
        ctx.closePath();
        ctx.fill();
        
        // 多层装甲平台
        ctx.fillStyle = this.lightenColor(color, 1.2);
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.08);
        ctx.fillRect(x + w * 0.25, y + h * 0.45, w * 0.5, h * 0.1);
        ctx.fillRect(x + w * 0.3, y + h * 0.62, w * 0.4, h * 0.08);
        
        // 指挥塔
        ctx.fillStyle = this.lightenColor(color, 1.4);
        ctx.fillRect(x + w * 0.55, y + h * 0.38, w * 0.15, h * 0.24);
        ctx.fillRect(x + w * 0.6, y + h * 0.42, w * 0.08, h * 0.16);
        
        // 大型武器炮塔（上）
        ctx.fillStyle = this.darkenColor(color, 0.6);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.2);
        ctx.lineTo(x + w * 0.7, y + h * 0.05);
        ctx.lineTo(x + w * 0.8, y + h * 0.15);
        ctx.lineTo(x + w * 0.65, y + h * 0.25);
        ctx.closePath();
        ctx.fill();
        
        // 炮管（上）
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + w * 0.75, y + h * 0.1, w * 0.2, h * 0.04);
        
        // 大型武器炮塔（下）
        ctx.fillStyle = this.darkenColor(color, 0.6);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.8);
        ctx.lineTo(x + w * 0.7, y + h * 0.95);
        ctx.lineTo(x + w * 0.8, y + h * 0.85);
        ctx.lineTo(x + w * 0.65, y + h * 0.75);
        ctx.closePath();
        ctx.fill();
        
        // 炮管（下）
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + w * 0.75, y + h * 0.86, w * 0.2, h * 0.04);
        
        // 多个副炮塔
        ctx.fillStyle = '#455A64';
        const turrets = [
            { x: x + w * 0.35, y: y + h * 0.35 },
            { x: x + w * 0.4, y: y + h * 0.5 },
            { x: x + w * 0.35, y: y + h * 0.65 }
        ];
        turrets.forEach(t => {
            ctx.fillRect(t.x, t.y, w * 0.08, h * 0.06);
        });
        
        // 六个主引擎喷口（两列三行）
        const engines = [
            { x: x + w * 0.08, y: y + h * 0.32 },
            { x: x + w * 0.08, y: y + h * 0.5 },
            { x: x + w * 0.08, y: y + h * 0.68 },
            { x: x + w * 0.02, y: y + h * 0.38 },
            { x: x + w * 0.02, y: y + h * 0.5 },
            { x: x + w * 0.02, y: y + h * 0.62 }
        ];
        
        engines.forEach(eng => {
            // 引擎外壳
            ctx.fillStyle = '#1A237E';
            ctx.beginPath();
            ctx.arc(eng.x, eng.y, w * 0.055, 0, Math.PI * 2);
            ctx.fill();
            
            // 引擎光效
            const gradient = ctx.createRadialGradient(eng.x, eng.y, 0, eng.x, eng.y, w * 0.08);
            gradient.addColorStop(0, '#FFEB3B');
            gradient.addColorStop(0.4, '#FF6F00');
            gradient.addColorStop(0.7, '#D32F2F');
            gradient.addColorStop(1, 'rgba(211, 47, 47, 0)');
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF6F00';
            ctx.beginPath();
            ctx.ellipse(eng.x - w * 0.02, eng.y, w * 0.08, h * 0.09, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 指挥舱窗口（发光）
        ctx.fillStyle = '#00E5FF';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00BCD4';
        ctx.fillRect(x + w * 0.62, y + h * 0.46, w * 0.06, h * 0.08);
        
        // 护盾能量场效果
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00E5FF';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h * 0.5, w * 0.45, h * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 血条绘制已移至 enemyHud.js 的 EnemyHudManager 管理
    
    // ==================== 子弹绘制方法 ====================
    
    /**
     * 绘制子弹
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {Object} config - 绘制配置
     * @param {number} config.x - X坐标
     * @param {number} config.y - Y坐标
     * @param {number} config.width - 宽度
     * @param {number} config.height - 高度
     * @param {number} config.angle - 旋转角度（度数）
     * @param {string} config.color - 主要颜色
     * @param {number} config.scale - 缩放比例 (默认1.0)
     * @param {string} config.model - 子弹模型 ('standard'=长条, 'round'=圆形, 'missile'=导弹) (默认'standard')
     * @param {number} config.opacity - 透明度 (0.0-1.0, 默认1.0)
     */
    drawBullet(ctx, config) {
        const {
            x, y, width, height,
            angle = 0,
            color = '#FFD700',
            scale = 1.0,
            model = 'standard',
            opacity = 1.0
        } = config;
        
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = opacity;
        
        // 设置颜色和光晕
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        
        // 移动到子弹位置并旋转
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        
        // 应用缩放
        if (scale !== 1.0) {
            ctx.scale(scale, scale);
        }
        
        // 根据模型绘制
        switch (model) {
            case 'round':
                this.drawRoundBullet(ctx, width, height, color);
                break;
            case 'missile':
                this.drawMissileBullet(ctx, width, height, color);
                break;
            case 'standard':
            default:
                this.drawStandardBullet(ctx, width, height, color);
                break;
        }
        
        ctx.restore();
    }
    
    // 绘制标准子弹（长条形，尖头）
    drawStandardBullet(ctx, width, height, color) {
        const tipHeight = Math.min(width * 1.5, height * 0.25); // 尖头高度
        
        // 绘制尖头
        ctx.fillStyle = this.lightenColor(color, 1.2);
        ctx.beginPath();
        ctx.moveTo(-width / 2, tipHeight);
        ctx.lineTo(width / 2, tipHeight);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        // 子弹主体（矩形）
        ctx.fillStyle = color;
        ctx.fillRect(-width / 2, tipHeight, width, height - tipHeight);
        
        // 子弹主体上的白色高光线
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-width / 4, tipHeight, width / 2, Math.min(2, height * 0.1));
    }
    
    // 绘制圆形子弹
    drawRoundBullet(ctx, width, height, color) {
        const radius = Math.max(width, height) / 2;
        
        // 外层光晕
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, radius, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 内层高光
        const gradient = ctx.createRadialGradient(0, radius, 0, 0, radius, radius);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.7));
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, radius, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制导弹
    drawMissileBullet(ctx, width, height, color) {
        // 导弹主体（带渐变）
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, this.lightenColor(color, 1.3));
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.7));
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 12;
        ctx.fillRect(-width / 2, 0, width, height);
        
        // 导弹头部（尖锐）
        ctx.fillStyle = this.lightenColor(color, 1.5);
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(width / 2, 0);
        ctx.lineTo(0, -height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 导弹尾部火焰效果
        const flameGradient = ctx.createLinearGradient(0, height, 0, height * 1.3);
        flameGradient.addColorStop(0, '#FF6600');
        flameGradient.addColorStop(0.5, '#FF9900');
        flameGradient.addColorStop(1, 'rgba(255, 153, 0, 0)');
        
        ctx.fillStyle = flameGradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(-width / 3, height);
        ctx.lineTo(width / 3, height);
        ctx.lineTo(0, height * 1.3);
        ctx.closePath();
        ctx.fill();
        
        // 导弹侧翼
        ctx.fillStyle = this.darkenColor(color, 0.6);
        ctx.shadowBlur = 5;
        // 左翼
        ctx.beginPath();
        ctx.moveTo(-width / 2, height * 0.3);
        ctx.lineTo(-width * 0.8, height * 0.5);
        ctx.lineTo(-width / 2, height * 0.6);
        ctx.closePath();
        ctx.fill();
        // 右翼
        ctx.beginPath();
        ctx.moveTo(width / 2, height * 0.3);
        ctx.lineTo(width * 0.8, height * 0.5);
        ctx.lineTo(width / 2, height * 0.6);
        ctx.closePath();
        ctx.fill();
    }
    
    // ==================== 通用绘制方法 ====================
    
    /**
     * 批量绘制实体（优化性能）
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {Array} entities - 实体数组
     * @param {string} type - 实体类型 ('enemy' 或 'bullet')
     */
    drawBatch(ctx, entities, type) {
        if (!entities || entities.length === 0) return;
        
        entities.forEach(entity => {
            if (type === 'enemy') {
                this.drawEnemy(ctx, {
                    x: entity.x,
                    y: entity.y,
                    width: entity.width,
                    height: entity.height,
                    direction: entity.direction || 1,
                    scale: entity.scale || 1.0,
                    model: entity.model || 'basic',
                    color: entity.type?.color || entity.color || '#FF4444'
                });
            } else if (type === 'bullet') {
                this.drawBullet(ctx, {
                    x: entity.x,
                    y: entity.y,
                    width: entity.width,
                    height: entity.height,
                    angle: entity.angle || 0,
                    color: entity.color || '#FFD700',
                    scale: entity.scale || 1.0,
                    model: entity.model || 'standard',
                    opacity: entity.opacity !== undefined ? entity.opacity : 1.0
                });
            }
        });
        
        // 清除阴影
        ctx.shadowBlur = 0;
    }
    
    // 绘制铁甲舰（装甲厚重，银色调）
    drawArmoredEnemy(ctx, x, y, w, h, color) {
        ctx.shadowColor = '#E0E0E0';
        ctx.shadowBlur = 15;
        
        // 主装甲机身（银色金属质感）
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#E8E8E8');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#A0A0A0');
        ctx.fillStyle = gradient;
        ctx.fillRect(x + w * 0.2, y + h * 0.3, w * 0.5, h * 0.4);
        
        // 前方装甲尖端（倾斜装甲）
        ctx.fillStyle = this.lightenColor(color, 1.3);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h * 0.35);
        ctx.lineTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.7, y + h * 0.65);
        ctx.lineTo(x + w * 0.7, y + h * 0.35);
        ctx.closePath();
        ctx.fill();
        
        // 装甲板纹理线条（增加金属质感）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const offsetX = x + w * (0.25 + i * 0.12);
            ctx.beginPath();
            ctx.moveTo(offsetX, y + h * 0.3);
            ctx.lineTo(offsetX, y + h * 0.7);
            ctx.stroke();
        }
        
        // 上装甲护板（厚重感）
        ctx.fillStyle = this.darkenColor(color, 0.8);
        ctx.fillRect(x + w * 0.25, y + h * 0.2, w * 0.4, h * 0.1);
        
        // 下装甲护板
        ctx.fillRect(x + w * 0.25, y + h * 0.7, w * 0.4, h * 0.1);
        
        // 铆钉细节（装甲板连接点）
        ctx.fillStyle = '#707070';
        for (let i = 0; i < 5; i++) {
            const rivetX = x + w * (0.28 + i * 0.1);
            ctx.beginPath();
            ctx.arc(rivetX, y + h * 0.25, w * 0.015, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rivetX, y + h * 0.75, w * 0.015, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 观察窗（小型蓝色玻璃）
        ctx.fillStyle = '#4A90E2';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#2E5C8A';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + h * 0.5, w * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // 引擎光效（橙色）
        ctx.fillStyle = '#FF8C00';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.1, y + h * 0.5, w * 0.06, h * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 装甲边缘高光
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h * 0.35);
        ctx.lineTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.7, y + h * 0.65);
        ctx.stroke();
    }
    
    // 绘制重型铁甲舰（超厚装甲，深银色调）
    drawHeavyArmoredEnemy(ctx, x, y, w, h, color) {
        ctx.shadowColor = '#C0C0C0';
        ctx.shadowBlur = 20;
        
        // 超厚主装甲机身
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#D0D0D0');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#808090');
        ctx.fillStyle = gradient;
        ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.6, h * 0.5);
        
        // 前方超厚装甲
        ctx.fillStyle = this.lightenColor(color, 1.2);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.75, y + h * 0.3);
        ctx.lineTo(x + w * 0.92, y + h * 0.5);
        ctx.lineTo(x + w * 0.75, y + h * 0.7);
        ctx.lineTo(x + w * 0.75, y + h * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 多层装甲板（显示厚度）
        ctx.fillStyle = this.darkenColor(color, 0.7);
        ctx.fillRect(x + w * 0.2, y + h * 0.15, w * 0.5, h * 0.1);
        ctx.fillRect(x + w * 0.2, y + h * 0.75, w * 0.5, h * 0.1);
        
        // 额外装甲层
        ctx.fillStyle = this.darkenColor(color, 0.6);
        ctx.fillRect(x + w * 0.22, y + h * 0.1, w * 0.46, h * 0.05);
        ctx.fillRect(x + w * 0.22, y + h * 0.85, w * 0.46, h * 0.05);
        
        // 装甲纹理线条（更密集）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const offsetX = x + w * (0.2 + i * 0.1);
            ctx.beginPath();
            ctx.moveTo(offsetX, y + h * 0.25);
            ctx.lineTo(offsetX, y + h * 0.75);
            ctx.stroke();
        }
        
        // 大型铆钉（更明显的装甲连接）
        ctx.fillStyle = '#606060';
        for (let row = 0; row < 2; row++) {
            for (let i = 0; i < 6; i++) {
                const rivetX = x + w * (0.25 + i * 0.09);
                const rivetY = y + h * (0.35 + row * 0.3);
                ctx.beginPath();
                ctx.arc(rivetX, rivetY, w * 0.02, 0, Math.PI * 2);
                ctx.fill();
                // 铆钉高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(rivetX - w * 0.005, rivetY - w * 0.005, w * 0.01, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#606060';
            }
        }
        
        // 观察窗（加固型）
        ctx.fillStyle = '#3A7BC8';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#1E3C72';
        ctx.beginPath();
        ctx.arc(x + w * 0.55, y + h * 0.5, w * 0.09, 0, Math.PI * 2);
        ctx.fill();
        
        // 观察窗框架
        ctx.strokeStyle = '#505050';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w * 0.55, y + h * 0.5, w * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        
        // 双引擎光效
        ctx.fillStyle = '#FF6B00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.08, y + h * 0.38, w * 0.07, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.08, y + h * 0.62, w * 0.07, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 装甲边缘强化高光
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.75, y + h * 0.3);
        ctx.lineTo(x + w * 0.92, y + h * 0.5);
        ctx.lineTo(x + w * 0.75, y + h * 0.7);
        ctx.stroke();
        
        // 侧面装甲板
        ctx.fillStyle = this.darkenColor(color, 0.75);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.15);
        ctx.lineTo(x + w * 0.5, y + h * 0.05);
        ctx.lineTo(x + w * 0.65, y + h * 0.15);
        ctx.lineTo(x + w * 0.45, y + h * 0.25);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.85);
        ctx.lineTo(x + w * 0.5, y + h * 0.95);
        ctx.lineTo(x + w * 0.65, y + h * 0.85);
        ctx.lineTo(x + w * 0.45, y + h * 0.75);
        ctx.closePath();
        ctx.fill();
    }
}

// 创建全局单例
const spriteRenderer = new SpriteRenderer();
