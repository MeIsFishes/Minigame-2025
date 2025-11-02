// weapon.js - 武器系统：处理子弹发射和冷却机制

// 武器数据结构定义
class WeaponData {
    constructor(config) {
        this.id = config.id || 'DEFAULT'; // 武器唯一标识符
        this.name = config.name || '默认武器';
        this.damage = config.damage || 1;
        this.cooldown = config.cooldown || 1000; // 毫秒
        this.fireDelay = config.fireDelay || 0; // 发射延迟（毫秒）
        this.bulletsPerShot = config.bulletsPerShot || 1; // 单次射击数量
        this.burstCount = config.burstCount || 1; // 射击次数
        this.burstInterval = config.burstInterval || 100; // 射击间隔（毫秒）
        this.shootSound = config.shootSound || 'default'; // 射击音效
        this.bulletWidth = config.bulletWidth || 4; // 像素
        this.bulletHeight = config.bulletHeight || 15; // 像素
        this.bulletSpeed = config.bulletSpeed || 300; // 像素/秒（初始速度）
        this.bulletAcceleration = config.bulletAcceleration || 0; // 像素/秒²
        this.bulletMinSpeed = config.bulletMinSpeed || 0; // 像素/秒（最小速度）
        this.bulletMaxSpeed = config.bulletMaxSpeed || 0; // 像素/秒（最大速度）
        this.enableSpeedLimit = config.enableSpeedLimit || false; // 是否启用速度限制
        this.bulletLifetime = config.bulletLifetime || 5000; // 毫秒
        this.fadeOut = config.fadeOut || false; // 是否在消失时渐隐
        this.bulletModel = config.bulletModel || 'standard'; // 子弹模型 ('standard'=长条, 'round'=圆形, 'missile'=导弹)
        this.centerSpreadAngle = config.centerSpreadAngle || 0; // 中心线散射角（度数）
        this.bulletSpreadAngle = config.bulletSpreadAngle || 0; // 子弹散射角（度数）
        this.trackingAngularSpeed = config.trackingAngularSpeed || 0; // 追踪角速度（度/秒）
        this.explosionRadius = config.explosionRadius || 0; // 爆炸范围（像素）
        this.penetration = config.penetration || 1; // 穿透次数
        this.color = config.color || '#FFD700'; // 武器颜色
        this.lockOnTarget = config.lockOnTarget || false; // 是否锁定目标
        this.lockOnRange = config.lockOnRange || 0; // 索敌范围（像素，0表示不索敌）
        this.targetEffect = config.targetEffect || null; // 目标特效类型
    }
}

// 预设武器库
const WeaponPresets = {
    BASIC_GUN: new WeaponData({
        id: 'BASIC_GUN',
        name: '速射炮',
        damage: 10,
        cooldown: 2500,
        fireDelay: 0,
        bulletsPerShot: 1,
        burstCount: 1,
        burstInterval: 100,
        shootSound: 'default',
        bulletWidth: 14,
        bulletHeight: 30,
        bulletSpeed: 700,
        bulletAcceleration: 0,
        bulletMinSpeed: 0,
        bulletMaxSpeed: 0,
        enableSpeedLimit: false,
        bulletLifetime: 5000,
        fadeOut: false,
        bulletModel: 'standard',
        centerSpreadAngle: 0,
        bulletSpreadAngle: 0,
        trackingAngularSpeed: 0,
        explosionRadius: 0,
        penetration: 1,
        color: '#FFD700',
        lockOnTarget: false,
        lockOnRange: 0,
        targetEffect: null
    }),
    
    SHOTGUN: new WeaponData({
        id: 'SHOTGUN',
        name: '霰弹枪',
        damage: 2,
        cooldown: 1500,
        fireDelay: 0,
        bulletsPerShot: 10,
        burstCount: 1,
        burstInterval: 100,
        shootSound: 'shotgun',
        bulletWidth: 12,
        bulletHeight: 12,
        bulletSpeed: 2200,
        bulletAcceleration: -7000,
        bulletMinSpeed: 100,
        bulletMaxSpeed: 0,
        enableSpeedLimit: true,
        bulletLifetime: 400,
        fadeOut: true,
        bulletModel: 'round',
        centerSpreadAngle: 5,
        bulletSpreadAngle: 8,
        trackingAngularSpeed: 0,
        explosionRadius: 0,
        penetration: 1,
        color: '#FFA500',
        lockOnTarget: false,
        lockOnRange: 0,
        targetEffect: null
    }),
    
    SNIPER: new WeaponData({
        id: 'SNIPER',
        name: '狙击枪',
        damage: 20,
        cooldown: 15000,
        fireDelay: 1000,
        bulletsPerShot: 1,
        burstCount: 1,
        burstInterval: 100,
        shootSound: 'sniper',
        bulletWidth: 5,
        bulletHeight: 50,
        bulletSpeed: 6000,
        bulletAcceleration: 0,
        bulletMinSpeed: 0,
        bulletMaxSpeed: 0,
        enableSpeedLimit: false,
        bulletLifetime: 5000,
        fadeOut: false,
        bulletModel: 'standard',
        centerSpreadAngle: 0,
        bulletSpreadAngle: 0,
        trackingAngularSpeed: 0,
        explosionRadius: 0,
        penetration: 3,
        color: '#4169E1',
        lockOnTarget: true,
        lockOnRange: 400,
        targetEffect: 'lockon'
    }),
    
    MACHINE_GUN: new WeaponData({
        id: 'MACHINE_GUN',
        name: '机枪',
        damage: 3,
        cooldown: 4000,
        fireDelay: 0,
        bulletsPerShot: 1,
        burstCount: 6,
        burstInterval: 80,
        shootSound: 'machinegun',
        bulletWidth: 6,
        bulletHeight: 15,
        bulletSpeed: 500,
        bulletAcceleration: -50,
        bulletMinSpeed: 0,
        bulletMaxSpeed: 0,
        enableSpeedLimit: false,
        bulletLifetime: 5000,
        fadeOut: false,
        bulletModel: 'standard',
        centerSpreadAngle: 3,
        bulletSpreadAngle: 5,
        trackingAngularSpeed: 0,
        explosionRadius: 0,
        penetration: 1,
        color: '#FF6B6B',
        lockOnTarget: false,
        lockOnRange: 0,
        targetEffect: null
    }),
    
    MISSILE: new WeaponData({
        id: 'MISSILE',
        name: '导弹',
        damage: 30,
        cooldown: 70000,
        fireDelay: 0,
        bulletsPerShot: 1,
        burstCount: 1,
        burstInterval: 100,
        shootSound: 'missile',
        bulletWidth: 12,
        bulletHeight: 30,
        bulletSpeed: -200,
        bulletAcceleration: 300,
        bulletMinSpeed: 50,
        bulletMaxSpeed: 400,
        enableSpeedLimit: true,
        bulletLifetime: 3200,
        fadeOut: false,
        bulletModel: 'missile',
        centerSpreadAngle: 0,
        bulletSpreadAngle: 0,
        trackingAngularSpeed: 180,
        explosionRadius: 280,
        penetration: 1,
        color: '#FF4500',
        lockOnTarget: false,
        lockOnRange: 0,
        targetEffect: null
    }),
    
    PENETRATOR: new WeaponData({
        id: 'PENETRATOR',
        name: '穿透弹',
        damage: 18,
        cooldown: 1200,
        fireDelay: 0,
        bulletsPerShot: 1,
        burstCount: 1,
        burstInterval: 100,
        shootSound: 'penetrator',
        bulletWidth: 60,
        bulletHeight: 40,
        bulletSpeed: 500,
        bulletAcceleration: 0,
        bulletMinSpeed: 0,
        bulletMaxSpeed: 0,
        enableSpeedLimit: false,
        bulletLifetime: 5000,
        fadeOut: false,
        bulletModel: 'missile',
        centerSpreadAngle: 0,
        bulletSpreadAngle: 0,
        trackingAngularSpeed: 0,
        explosionRadius: 100,
        penetration: 140,
        color: '#00CED1',
        lockOnTarget: false,
        lockOnRange: 0,
        targetEffect: null
    })
};

class WeaponSystem {
    constructor(canvas, player = null, effectSystem = null) {
        this.canvas = canvas;
        this.bullets = [];
        this.cooldowns = {}; // 每个键的冷却时间
        this.player = player; // 玩家引用
        this.effectSystem = effectSystem; // 特效系统引用
        this.techSystem = null; // 科技系统引用（稍后设置）
        
        // 键盘布局 - QWERTY标准布局
        this.keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
        
        // 每个键位对应的武器（默认都是基础机枪）
        this.keyWeapons = {};
        this.initializeWeapons();
        
        // 初始化所有键的冷却状态
        this.initializeCooldowns();
    }
    
    // 设置玩家引用
    setPlayer(player) {
        this.player = player;
        // 重新初始化武器配置
        this.initializeWeapons();
    }
    
    // 设置科技系统引用
    setTechSystem(techSystem) {
        this.techSystem = techSystem;
        // 重新初始化武器配置以应用科技升级
        this.initializeWeapons();
    }
    
    // 初始化武器配置
    initializeWeapons() {
        this.keyboardLayout.forEach((row, rowIndex) => {
            row.forEach(key => {
                // 如果有玩家引用，使用玩家的武器配置
                if (this.player) {
                    let weaponPreset = this.player.getWeaponForKey(key) || WeaponPresets.BASIC_GUN;
                    
                    // 如果有科技系统，应用科技升级
                    if (this.techSystem) {
                        weaponPreset = this.techSystem.applyUpgradesToWeapon(weaponPreset);
                    }
                    
                    this.keyWeapons[key] = weaponPreset;
                } else {
                    // 默认所有键位使用基础机枪
                    this.keyWeapons[key] = WeaponPresets.BASIC_GUN;
                }
            });
        });
    }
    
    // 为指定键位设置武器
    setWeapon(key, weaponData) {
        key = key.toUpperCase();
        if (this.keyWeapons[key]) {
            this.keyWeapons[key] = weaponData;
        }
    }
    
    // 获取指定键位的武器
    getWeapon(key) {
        return this.keyWeapons[key.toUpperCase()];
    }
    
    initializeCooldowns() {
        this.keyboardLayout.forEach(row => {
            row.forEach(key => {
                this.cooldowns[key] = {
                    ready: true,
                    lastFired: 0,
                    remainingTime: 0
                };
            });
        });
    }
    
    // 获取键在屏幕上的位置
    getKeyPosition(key) {
        // 找到键在哪一排以及该排的哪个位置
        let rowIndex = -1;
        let keyIndexInRow = -1;
        
        for (let i = 0; i < this.keyboardLayout.length; i++) {
            const index = this.keyboardLayout[i].indexOf(key);
            if (index !== -1) {
                rowIndex = i;
                keyIndexInRow = index;
                break;
            }
        }
        
        if (rowIndex === -1) return this.canvas.width / 2; // 默认中间位置
        
        // 使用0.85倍的屏幕宽度来分布键位
        const distributionWidth = this.canvas.width * 0.85;
        const sideMargin = (this.canvas.width - distributionWidth) / 2;
        
        // 使用第一排（最长的一排）的键数来计算统一的键位间距
        const maxRowLength = this.keyboardLayout[0].length; // 10个键
        const keySpacing = distributionWidth / (maxRowLength - 1);
        
        // 计算基础X位置（从左边距开始）
        let baseX = sideMargin;
        
        // 为不同排添加偏移量，创建交错的键盘效果
        let rowOffset = 0;
        if (rowIndex === 1) {
            // 第二排（ASDFGHJKL）向右偏移半个键位
            rowOffset = keySpacing * 0.5;
        } else if (rowIndex === 2) {
            // 第三排（ZXCVBNM）向右偏移一个半键位
            rowOffset = keySpacing * 1.25;
        }
        
        // 计算该键的X位置
        const x = baseX + rowOffset + (keyIndexInRow * keySpacing);
        
        return x;
    }
    
    // 发射子弹
    shoot(key, currentTime, enemySystem) {
        key = key.toUpperCase();
        
        // 检查是否是有效的键
        const isValidKey = this.keyboardLayout.some(row => row.includes(key));
        if (!isValidKey) return false;
        
        // 检查冷却时间
        if (!this.cooldowns[key].ready) return false;
        
        // 获取该键位的武器配置
        const weapon = this.getWeapon(key);
        
        // 立即设置冷却（在发射延迟之前）
        this.cooldowns[key].ready = false;
        this.cooldowns[key].lastFired = currentTime;
        this.cooldowns[key].remainingTime = weapon.cooldown;
        
        // 【按键瞬间】立即进行索敌并播放特效
        const x = this.getKeyPosition(key);
        const y = this.canvas.height - 10;
        let lockedTarget = null;
        
        if (weapon.lockOnRange > 0) {
            lockedTarget = this.findTargetInRange(x, y, weapon.lockOnRange, enemySystem);
            
            // 如果锁定了目标，立即播放目标特效
            if (lockedTarget && this.effectSystem && weapon.targetEffect) {
                this.createTargetEffect(weapon.targetEffect, lockedTarget, weapon);
            }
        }
        
        // 如果有发射延迟，延迟执行射击
        if (weapon.fireDelay > 0) {
            setTimeout(() => {
                this.startBurstFire(key, weapon, currentTime, enemySystem, lockedTarget);
            }, weapon.fireDelay);
        } else {
            // 立即开始连发射击
            this.startBurstFire(key, weapon, currentTime, enemySystem, lockedTarget);
        }
        
        return true;
    }
    
    // 连发射击
    startBurstFire(key, weapon, startTime, enemySystem, lockedTarget = null) {
        const x = this.getKeyPosition(key);
        const y = this.canvas.height - 10;
        
        // lockedTarget 从 shoot 方法传入（已经在按键瞬间完成索敌）
        
        for (let burst = 0; burst < weapon.burstCount; burst++) {
            setTimeout(() => {
                // 如果有锁定目标，使用锁定目标的位置（即使目标已死亡）
                let initialAngle = 0;
                let targetForBullet = null;
                
                if (lockedTarget && weapon.lockOnTarget) {
                    // 计算到目标的角度
                    const targetX = lockedTarget.x + (lockedTarget.width || 0) / 2;
                    const targetY = lockedTarget.y + (lockedTarget.height || 0) / 2;
                    const dx = targetX - x;
                    const dy = targetY - y;
                    initialAngle = Math.atan2(dx, -dy) * 180 / Math.PI;
                    
                    // 如果目标还活着，设为追踪目标
                    if (lockedTarget.isAlive && lockedTarget.health > 0) {
                        targetForBullet = lockedTarget;
                    }
                } else {
                    // 没有锁定目标，使用散射角
                    initialAngle = this.randomInRange(
                        -weapon.centerSpreadAngle / 2,
                        weapon.centerSpreadAngle / 2
                    );
                    
                    // 寻找最近的目标（用于追踪）
                    targetForBullet = this.findNearestTarget(x, enemySystem);
                }
                
                // 发射多发子弹
                for (let i = 0; i < weapon.bulletsPerShot; i++) {
                    // 计算子弹散射角
                    const bulletAngle = initialAngle + this.randomInRange(
                        -weapon.bulletSpreadAngle / 2,
                        weapon.bulletSpreadAngle / 2
                    );
                    
                    // 创建子弹
                    const initialSpeed = weapon.bulletSpeed / 60;
                    const newBullet = {
                        x: x,
                        y: y,
                        prevX: x, // 上一帧X位置
                        prevY: y, // 上一帧Y位置
                        vx: Math.sin(bulletAngle * Math.PI / 180) * initialSpeed, // 转换为每帧速度
                        vy: -Math.cos(bulletAngle * Math.PI / 180) * initialSpeed,
                        width: weapon.bulletWidth,
                        height: weapon.bulletHeight,
                        internalSpeed: initialSpeed, // 后台速度（用于加速度计算，不受限制）
                        speed: initialSpeed, // 实际显示速度（受限制影响）
                        acceleration: weapon.bulletAcceleration / 3600, // 每帧加速度
                        minSpeed: weapon.bulletMinSpeed / 60, // 最小速度（每帧）
                        maxSpeed: weapon.bulletMaxSpeed / 60, // 最大速度（每帧）
                        enableSpeedLimit: weapon.enableSpeedLimit, // 是否启用速度限制
                        angle: bulletAngle,
                        color: weapon.color,
                        damage: weapon.damage,
                        penetration: weapon.penetration,
                        remainingPenetration: weapon.penetration,
                        hitEnemies: [], // 已命中的敌机列表（每个敌机只能被击中一次）
                        explosionRadius: weapon.explosionRadius,
                        trackingSpeed: weapon.trackingAngularSpeed / 60, // 度/帧
                        target: targetForBullet,
                        createdTime: Date.now(),
                        lifetime: weapon.bulletLifetime,
                        fadeOut: weapon.fadeOut, // 是否在消失时渐隐
                        opacity: 1.0, // 当前透明度
                        model: weapon.bulletModel, // 子弹模型
                        key: key,
                        weapon: weapon,
                        trailEffect: null, // 轨迹特效引用
                        lockedTarget: lockedTarget // 记录锁定的目标
                    };
                    
                    this.bullets.push(newBullet);
                }
            }, burst * weapon.burstInterval);
        }
    }
    
    // 创建目标特效
    createTargetEffect(effectType, target, weapon) {
        if (!this.effectSystem || !target) return;
        
        const targetX = target.x + (target.width || 0) / 2;
        const targetY = target.y + (target.height || 0) / 2;
        
        switch (effectType) {
            case 'lockon':
                // 锁定标记特效（红色，最后1/4时间渐隐）
                this.effectSystem.createLockOn(targetX, targetY, target, {
                    size: 35,
                    duration: 1200
                });
                break;
                
            case 'ring':
                // 光环特效
                this.effectSystem.createRing(targetX, targetY, target, {
                    maxRadius: 40,
                    color: weapon.color || '#FF0000',
                    duration: 800
                });
                break;
                
            case 'aimline':
                // 瞄准线特效
                const shootX = this.getKeyPosition(weapon.key || 'A');
                const shootY = this.canvas.height - 10;
                this.effectSystem.createAimLine(shootX, shootY, targetX, targetY, {
                    color: weapon.color || '#FF0000',
                    duration: 500
                });
                break;
                
            case 'spark':
                // 火花标记
                this.effectSystem.createSpark(targetX, targetY, null, {
                    color: weapon.color || '#FFFF00',
                    particleCount: 10,
                    duration: 600
                });
                break;
                
            default:
                // 默认使用锁定标记（红色，最后1/4时间渐隐）
                this.effectSystem.createLockOn(targetX, targetY, target, {
                    size: 35,
                    duration: 1000
                });
                break;
        }
    }
    
    // 寻找最近的目标
    findNearestTarget(x, enemySystem) {
        if (!enemySystem) return null;
        
        const enemies = enemySystem.getEnemies();
        if (enemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = Math.abs(enemy.x - x);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    // 在指定范围内寻找最近的目标
    findTargetInRange(x, y, range, enemySystem) {
        if (!enemySystem || range <= 0) return null;
        
        const enemies = enemySystem.getEnemies();
        if (enemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        enemies.forEach(enemy => {
            // 只检测存活的敌机
            if (!enemy.isAlive || enemy.health <= 0) return;
            
            // 检查是否在X轴索敌范围内
            const xDistance = Math.abs(enemy.x + enemy.width / 2 - x);
            if (xDistance > range) return;
            
            // 计算实际距离（勾股定理）
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const distance = Math.sqrt(
                Math.pow(enemyCenterX - x, 2) + 
                Math.pow(enemyCenterY - y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    // 生成随机数
    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    // 更新所有子弹和冷却时间
    update(deltaTime, currentTime) {
        // 更新子弹位置
        this.bullets = this.bullets.filter(bullet => {
            // 检查子弹生存时间
            const age = currentTime - bullet.createdTime;
            if (age > bullet.lifetime) {
                // 子弹超时消失，如果有爆炸范围则在原地爆炸
                if (bullet.explosionRadius > 0 && this.effectSystem && window.game && window.game.enemySystem) {
                    const explosionX = bullet.x;
                    const explosionY = bullet.y;
                    
                    // 创建爆炸特效
                    window.game.enemySystem.createBulletExplosionEffect(bullet, explosionX, explosionY, this.effectSystem);
                    
                    // 触发爆炸伤害
                    window.game.enemySystem.handleBulletExplosion(bullet, explosionX, explosionY);
                }
                return false;
            }
            
            // 更新渐隐效果
            if (bullet.fadeOut) {
                // 在生命周期最后30%开始渐隐
                const fadeStartTime = bullet.lifetime * 0.7;
                if (age > fadeStartTime) {
                    const fadeProgress = (age - fadeStartTime) / (bullet.lifetime - fadeStartTime);
                    bullet.opacity = Math.max(0, 1 - fadeProgress);
                } else {
                    bullet.opacity = 1.0;
                }
            } else {
                bullet.opacity = 1.0;
            }
            
            // 追踪逻辑
            if (bullet.trackingSpeed > 0 && bullet.target && bullet.target.health > 0) {
                // 计算目标方向
                const dx = bullet.target.x + bullet.target.width / 2 - bullet.x;
                const dy = bullet.target.y + bullet.target.height / 2 - bullet.y;
                const targetAngle = Math.atan2(dx, -dy) * 180 / Math.PI;
                
                // 计算角度差
                let angleDiff = targetAngle - bullet.angle;
                while (angleDiff > 180) angleDiff -= 360;
                while (angleDiff < -180) angleDiff += 360;
                
                // 限制转向速度
                const turnAmount = Math.min(Math.abs(angleDiff), bullet.trackingSpeed);
                bullet.angle += Math.sign(angleDiff) * turnAmount;
            }
            
            // 应用加速度到后台速度
            if (bullet.acceleration !== 0) {
                bullet.internalSpeed += bullet.acceleration;
            }
            
            // 计算实际显示速度（应用限制）
            if (bullet.enableSpeedLimit) {
                if (bullet.minSpeed > 0 && bullet.internalSpeed < bullet.minSpeed) {
                    bullet.speed = bullet.minSpeed;
                } else if (bullet.maxSpeed > 0 && bullet.internalSpeed > bullet.maxSpeed) {
                    bullet.speed = bullet.maxSpeed;
                } else {
                    bullet.speed = bullet.internalSpeed;
                }
            } else {
                bullet.speed = bullet.internalSpeed;
            }
            
            // 更新速度方向（使用实际显示速度）
            bullet.vx = Math.sin(bullet.angle * Math.PI / 180) * bullet.speed;
            bullet.vy = -Math.cos(bullet.angle * Math.PI / 180) * bullet.speed;
            
            // 保存上一帧位置
            bullet.prevX = bullet.x;
            bullet.prevY = bullet.y;
            
            // 更新位置
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // 移除超出屏幕的子弹
            return bullet.y > -bullet.height && 
                   bullet.x > -50 && 
                   bullet.x < this.canvas.width + 50;
        });
        
        // 更新冷却时间
        Object.keys(this.cooldowns).forEach(key => {
            if (!this.cooldowns[key].ready) {
                const weapon = this.getWeapon(key);
                const elapsed = currentTime - this.cooldowns[key].lastFired;
                this.cooldowns[key].remainingTime = Math.max(0, weapon.cooldown - elapsed);
                
                if (elapsed >= weapon.cooldown) {
                    this.cooldowns[key].ready = true;
                    this.cooldowns[key].remainingTime = 0;
                }
            }
        });
    }
    
    // 绘制所有子弹
    draw(ctx) {
        // 使用精灵渲染器批量绘制
        spriteRenderer.drawBatch(ctx, this.bullets, 'bullet');
    }
    
    // 获取所有子弹（用于碰撞检测）
    getBullets() {
        return this.bullets;
    }
    
    // 移除子弹
    removeBullet(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index > -1) {
            this.bullets.splice(index, 1);
        }
    }
    
    // 射线与矩形碰撞检测（用于高速子弹）
    raycastRectangle(x1, y1, x2, y2, rect) {
        // 使用线段与矩形碰撞检测
        // 射线从 (x1, y1) 到 (x2, y2)
        // 矩形: rect.x, rect.y, rect.width, rect.height
        
        // 先做快速AABB检测
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        
        if (maxX < rect.x || minX > rect.x + rect.width ||
            maxY < rect.y || minY > rect.y + rect.height) {
            return false;
        }
        
        // 详细的线段与矩形碰撞检测
        // 检查线段是否与矩形的四条边相交
        const rectLeft = rect.x;
        const rectRight = rect.x + rect.width;
        const rectTop = rect.y;
        const rectBottom = rect.y + rect.height;
        
        // 检查起点或终点是否在矩形内
        if (this.pointInRect(x1, y1, rect) || this.pointInRect(x2, y2, rect)) {
            return true;
        }
        
        // 检查线段与矩形四条边的相交
        if (this.lineIntersectsLine(x1, y1, x2, y2, rectLeft, rectTop, rectRight, rectTop) ||
            this.lineIntersectsLine(x1, y1, x2, y2, rectRight, rectTop, rectRight, rectBottom) ||
            this.lineIntersectsLine(x1, y1, x2, y2, rectRight, rectBottom, rectLeft, rectBottom) ||
            this.lineIntersectsLine(x1, y1, x2, y2, rectLeft, rectBottom, rectLeft, rectTop)) {
            return true;
        }
        
        return false;
    }
    
    // 点是否在矩形内
    pointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    // 线段相交检测
    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        // 使用叉积判断线段相交
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        
        if (denom === 0) {
            return false; // 平行
        }
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        
        return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
    }
    
    // 获取冷却信息
    getCooldownInfo(key) {
        return this.cooldowns[key.toUpperCase()];
    }
    
    // 获取键盘布局
    getKeyboardLayout() {
        return this.keyboardLayout;
    }
    
    // 重置武器系统
    reset() {
        this.bullets = [];
        this.initializeCooldowns();
    }
}
