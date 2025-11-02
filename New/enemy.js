// enemy.js - 敌机系统：处理敌机生成、移动和碰撞检测

// 敌机数据结构定义
class EnemyData {
    constructor(config) {
        this.id = config.id || 'UNKNOWN'; // 唯一标识符
        this.name = config.name || '默认敌机';
        this.health = config.health || 1; // 血量
        this.model = config.model || 'basic'; // 模型类型
        this.spawnWeight = config.spawnWeight || 1; // 出现权重
        this.minSpeed = config.minSpeed || 60; // 最小速度（像素/秒）
        this.maxSpeed = config.maxSpeed || 120; // 最大速度（像素/秒）
        this.minSpawnHeight = config.minSpawnHeight || 0.0; // 最小生成高度（0-1）
        this.maxSpawnHeight = config.maxSpawnHeight || 0.1; // 最大生成高度（0-1）
        this.killHeal = config.killHeal || 0; // 击杀回血量
        this.damage = config.damage || 1; // 逃脱时对玩家造成的伤害
        this.width = config.width || 40; // 敌机宽度
        this.height = config.height || 30; // 敌机高度
        this.color = config.color || '#FF4444'; // 主要颜色
        this.score = config.score || 10; // 击杀得分
        
        // 护盾系统
        this.damageBlock = config.damageBlock || 0; // 伤害格挡（每次受到伤害时减少的伤害量）
        this.shield = config.shield || 0; // 护盾量
        this.shieldRegenDelay = config.shieldRegenDelay || 3000; // 护盾恢复延迟（毫秒）
        this.shieldRegenRate = config.shieldRegenRate || 0; // 护盾恢复速度（点/秒）
    }
}

// 预设敌机库
const EnemyPresets = {
    BASIC: new EnemyData({
        id: 'BASIC',
        name: '基础战机',
        health: 15,
        model: 'basic',
        spawnWeight: 20,
        minSpeed: 80,
        maxSpeed: 120,
        minSpawnHeight: 0.0,
        maxSpawnHeight: 1.0,
        killHeal: 0,
        damage: 1,
        width: 100,
        height: 75,
        color: '#FF4444',
        score: 10
    }),
    
    HEAVY: new EnemyData({
        id: 'HEAVY',
        name: '重型战机',
        health: 70,
        model: 'heavy',
        spawnWeight: 8,
        minSpeed: 40,
        maxSpeed: 60,
        minSpawnHeight: 0.1,
        maxSpawnHeight: 0.5,
        killHeal: 0,
        damage: 2,
        width: 160,
        height: 120,
        color: '#CC0000',
        score: 30,
    }),
    
    FAST: new EnemyData({
        id: 'FAST',
        name: '快速战机',
        health: 10,
        model: 'fast',
        spawnWeight: 10,
        minSpeed: 140,
        maxSpeed: 200,
        minSpawnHeight: 0.7,
        maxSpawnHeight: 0.2,
        killHeal: 0,
        damage: 1,
        width: 60,
        height: 50,
        color: '#FF8800',
        score: 15
    }),
    
    BOSS: new EnemyData({
        id: 'BOSS',
        name: 'BOSS战机',
        health: 140,
        model: 'boss',
        spawnWeight: 2,
        minSpeed: 30,
        maxSpeed: 40,
        minSpawnHeight: 0.4,
        maxSpawnHeight: 0.7,
        killHeal: 0,
        damage: 3,
        width: 300,
        height: 225,
        color: '#8800FF',
        score: 100,
    }),
    
    LIGHT_MEDIC: new EnemyData({
        id: 'LIGHT_MEDIC',
        name: '轻型医疗机',
        health: 20,
        model: 'basic',
        spawnWeight: 5,
        minSpeed: 100,
        maxSpeed: 140,
        minSpawnHeight: 0.3,
        maxSpawnHeight: 0.7,
        killHeal: 1,
        damage: 1,
        width: 90,
        height: 70,
        color: '#00FF88',
        score: 15
    }),
    
    HEAVY_MEDIC: new EnemyData({
        id: 'HEAVY_MEDIC',
        name: '重型医疗机',
        health: 50,
        model: 'heavy',
        spawnWeight: 2,
        minSpeed: 60,
        maxSpeed: 80,
        minSpawnHeight: 0.3,
        maxSpawnHeight: 0.6,
        killHeal: 3,
        damage: 1,
        width: 140,
        height: 110,
        color: '#00DD66',
        score: 40
    }),
    
    ARMORED: new EnemyData({
        id: 'ARMORED',
        name: '铁甲舰',
        health: 30,
        model: 'armored',
        spawnWeight: 20,
        minSpeed: 70,
        maxSpeed: 100,
        minSpawnHeight: 0.2,
        maxSpawnHeight: 1.0,
        killHeal: 0,
        damage: 1,
        width: 120,
        height: 90,
        color: '#C0C0C0', // 银色
        score: 25,
        damageBlock: 5, // 铁甲提供5点伤害格挡
        shield: 0,
        shieldRegenDelay: 0,
        shieldRegenRate: 0
    }),
    
    HEAVY_ARMORED: new EnemyData({
        id: 'HEAVY_ARMORED',
        name: '重型铁甲舰',
        health: 80,
        model: 'heavy_armored',
        spawnWeight: 5,
        minSpeed: 40,
        maxSpeed: 60,
        minSpawnHeight: 0.1,
        maxSpawnHeight: 0.6,
        killHeal: 0,
        damage: 2,
        width: 180,
        height: 135,
        color: '#A0A0B0', // 深银色
        score: 50,
        damageBlock: 10, // 重型铁甲提供10点伤害格挡
        shield: 0,
        shieldRegenDelay: 0,
        shieldRegenRate: 0
    }),
    
    SHIELD: new EnemyData({
        id: 'SHIELD',
        name: '能量护盾飞机',
        health: 5,
        model: 'shield',
        spawnWeight: 12,
        minSpeed: 90,
        maxSpeed: 130,
        minSpawnHeight: 0.3,
        maxSpawnHeight: 0.8,
        killHeal: 0,
        damage: 1,
        width: 110,
        height: 85,
        color: '#4080FF', // 蓝色
        score: 30,
        damageBlock: 0,
        shield: 50, // 50点护盾
        shieldRegenDelay: 2000, // 2秒后开始恢复
        shieldRegenRate: 15 // 每秒恢复15点护盾
    }),
    
    MOTHERSHIP: new EnemyData({
        id: 'MOTHERSHIP',
        name: '母舰',
        health: 120,
        model: 'mothership',
        spawnWeight: 3,
        minSpeed: 25,
        maxSpeed: 40,
        minSpawnHeight: 0.2,
        maxSpawnHeight: 0.5,
        killHeal: 0,
        damage: 3,
        width: 250,
        height: 190,
        color: '#2060D0', // 深蓝色
        score: 80,
        damageBlock: 8, // 8点减伤
        shield: 100, // 100点护盾
        shieldRegenDelay: 1200, // 1.2秒后开始恢复
        shieldRegenRate: 50 // 每秒恢复50点护盾（极快）
    })
};

class EnemySystem {
    constructor(canvas, player = null) {
        this.canvas = canvas;
        this.enemies = []; // 敌机列表
        this.player = player; // 玩家引用（用于回血）
        this.levelSystem = null; // 关卡系统引用
        this.SPAWN_INTERVAL = 2000; // 2秒生成一个敌机（默认值）
        this.lastSpawn = 0;
        this.score = 0;
        this.nextEnemyId = 0; // 用于生成唯一ID
        
        // 可用的敌机类型池（用于权重抽取）
        this.enemyTypes = [
            EnemyPresets.BASIC,
            EnemyPresets.HEAVY,
            EnemyPresets.FAST,
            EnemyPresets.BOSS,
            EnemyPresets.LIGHT_MEDIC,
            EnemyPresets.HEAVY_MEDIC,
            EnemyPresets.ARMORED,
            EnemyPresets.HEAVY_ARMORED,
            EnemyPresets.SHIELD,
            EnemyPresets.MOTHERSHIP
        ];
        
        // 计算总权重
        this.totalWeight = this.enemyTypes.reduce((sum, type) => sum + type.spawnWeight, 0);
    }
    
    // 设置玩家引用
    setPlayer(player) {
        this.player = player;
    }
    
    // 设置关卡系统引用
    setLevelSystem(levelSystem) {
        this.levelSystem = levelSystem;
    }
    
    // 根据权重随机选择敌机类型
    selectEnemyType() {
        // 如果有关卡系统，过滤出允许的敌机类型
        let availableTypes = this.enemyTypes;
        if (this.levelSystem && this.levelSystem.currentLevel) {
            availableTypes = this.enemyTypes.filter(type => 
                this.levelSystem.isEnemyTypeAllowed(type.id)
            );
        }
        
        // 如果没有可用类型，返回基础战机
        if (availableTypes.length === 0) {
            return EnemyPresets.BASIC;
        }
        
        // 计算可用类型的总权重
        const totalWeight = availableTypes.reduce((sum, type) => sum + type.spawnWeight, 0);
        
        const rand = Math.random() * totalWeight;
        let weightSum = 0;
        
        for (const type of availableTypes) {
            weightSum += type.spawnWeight;
            if (rand <= weightSum) {
                return type;
            }
        }
        
        // 默认返回第一个可用类型
        return availableTypes[0];
    }
    
    // 生成敌机
    spawnEnemy(currentTime) {
        // 使用关卡系统的生成间隔（如果有）
        const spawnInterval = this.levelSystem ? 
            this.levelSystem.getCurrentSpawnInterval() : 
            this.SPAWN_INTERVAL;
        
        if (currentTime - this.lastSpawn >= spawnInterval) {
            // 选择敌机类型
            const enemyType = this.selectEnemyType();
            
            // 记录生成到关卡系统
            if (this.levelSystem) {
                this.levelSystem.recordSpawn();
            }
            
            // 计算战斗区域高度（canvas高度的75%）
            const battleAreaHeight = this.canvas.height * 0.75;
            
            // 根据敌机类型的生成高度范围计算Y坐标
            // 注意：0是战斗区域底端，1是顶端，需要反转
            const spawnHeightRatio = enemyType.minSpawnHeight + 
                Math.random() * (enemyType.maxSpawnHeight - enemyType.minSpawnHeight);
            const y = battleAreaHeight * (1 - spawnHeightRatio);
            
            // 随机从左侧或右侧刷出
            const spawnFromLeft = Math.random() > 0.5;
            const direction = spawnFromLeft ? 1 : -1; // 1=向右, -1=向左
            
            // X坐标：从左侧刷出时在屏幕外左侧，从右侧刷出时在屏幕外右侧
            const x = spawnFromLeft ? -enemyType.width : this.canvas.width;
            
            // 根据类型的速度范围随机速度（像素/秒转换为像素/帧，假设60fps）
            const speedPixelsPerSecond = enemyType.minSpeed + 
                Math.random() * (enemyType.maxSpeed - enemyType.minSpeed);
            const speedPixelsPerFrame = speedPixelsPerSecond / 60;
            
            // 创建新敌机对象
            const enemy = {
                id: this.nextEnemyId++, // 唯一ID
                type: enemyType, // 敌机类型数据
                x: x,
                y: y,
                width: enemyType.width,
                height: enemyType.height,
                speed: 0, // 不再向下移动
                horizontalSpeed: speedPixelsPerFrame, // 横向移动速度
                direction: direction,
                maxHealth: enemyType.health,
                health: enemyType.health,
                isAlive: true, // 存活状态
                createdTime: currentTime, // 创建时间
                model: enemyType.model, // 模型类型
                escapesPenalty: false, // 是否已经扣除过逃脱惩罚
                healthBarDirty: false, // 血条是否需要更新
                cachedHealthRatio: 1.0, // 缓存的血量比例
                cachedHealthColor: '#00FF00', // 缓存的血条颜色
                
                // 护盾系统
                maxShield: enemyType.shield,
                shield: enemyType.shield,
                lastDamageTime: 0, // 上次受到伤害的时间
                shieldRegenDelay: enemyType.shieldRegenDelay,
                shieldRegenRate: enemyType.shieldRegenRate,
                damageBlock: enemyType.damageBlock,
                
                // 敌机受伤方法
                takeDamage: function(damage, callback, currentTime = Date.now()) {
                    // 记录受伤时间（用于护盾恢复延迟）
                    this.lastDamageTime = currentTime;
                    
                    // 应用伤害格挡，但至少造成1点伤害
                    let actualDamage = Math.max(1, damage - this.damageBlock);
                    
                    // 播放音效：如果有伤害格挡，播放装甲格挡音效
                    if (this.damageBlock > 0 && typeof audioSystem !== 'undefined') {
                        audioSystem.playArmorBlockSound();
                    }
                    
                    // 护盾存在时，完全吸收伤害（不会掉血）
                    if (this.shield > 0) {
                        // 护盾减少伤害值（可能超过护盾当前值，导致护盾清零）
                        this.shield -= actualDamage;
                        // 护盾不能为负数
                        if (this.shield < 0) {
                            this.shield = 0;
                        }
                        // 护盾存在时，生命值不受损
                        actualDamage = 0;
                    } else {
                        // 没有护盾，直接扣血
                        this.health -= actualDamage;
                    }
                    
                    this.healthBarDirty = true;
                    
                    // 更新缓存的血条数据
                    this.cachedHealthRatio = Math.max(0, this.health / this.maxHealth);
                    this.cachedHealthColor = this.cachedHealthRatio > 0.5 ? '#00FF00' : 
                                           (this.cachedHealthRatio > 0.25 ? '#FFFF00' : '#FF0000');
                    
                    // 调用回调
                    if (callback) {
                        callback(this, damage);
                    }
                    
                    return this.health <= 0;
                },
                
                // 敌机治疗方法
                heal: function(amount, callback) {
                    if (!this.isAlive || this.health <= 0) {
                        return 0; // 已死亡无法治疗
                    }
                    
                    const oldHealth = this.health;
                    this.health = Math.min(this.maxHealth, this.health + amount);
                    const actualHeal = this.health - oldHealth;
                    
                    if (actualHeal > 0) {
                        this.healthBarDirty = true;
                        
                        // 更新缓存的血条数据
                        this.cachedHealthRatio = this.health / this.maxHealth;
                        this.cachedHealthColor = this.cachedHealthRatio > 0.5 ? '#00FF00' : 
                                               (this.cachedHealthRatio > 0.25 ? '#FFFF00' : '#FF0000');
                        
                        // 调用回调
                        if (callback) {
                            callback(this, actualHeal);
                        }
                    }
                    
                    return actualHeal; // 返回实际治疗量
                }
            };
            
            // 添加到敌机列表
            this.enemies.push(enemy);
            
            // 为敌机创建血条（使用全局HUD管理器）
            if (typeof enemyHudManager !== 'undefined') {
                enemyHudManager.createHealthBar(enemy);
            }
            
            this.lastSpawn = currentTime;
            
            return enemy; // 返回创建的敌机
        }
        return null;
    }
    
    // 更新所有敌机
    update(deltaTime) {
        const currentTime = Date.now();
        
        // 使用filter清理死亡或超出屏幕的敌机
        this.enemies = this.enemies.filter(enemy => {
            // 检查敌机是否存活
            if (!enemy.isAlive || enemy.health <= 0) {
                return false; // 移除死亡的敌机
            }
            
            // 横向移动
            enemy.x += enemy.horizontalSpeed * enemy.direction;
            
            // 护盾恢复逻辑
            if (enemy.maxShield > 0 && enemy.shield < enemy.maxShield && enemy.shieldRegenRate > 0) {
                // 检查是否超过恢复延迟
                const timeSinceLastDamage = currentTime - enemy.lastDamageTime;
                if (timeSinceLastDamage >= enemy.shieldRegenDelay) {
                    // 恢复护盾（按帧率计算，假设60fps）
                    const regenAmount = (enemy.shieldRegenRate / 60) * (deltaTime / 16.67);
                    enemy.shield = Math.min(enemy.maxShield, enemy.shield + regenAmount);
                }
            }
            
            // 检查敌机是否飞出屏幕
            const hasEscaped = (enemy.direction > 0 && enemy.x > this.canvas.width) || 
                              (enemy.direction < 0 && enemy.x + enemy.width < 0);
            
            if (hasEscaped) {
                // 敌机逃脱，玩家扣血（只扣除一次）
                if (!enemy.escapesPenalty && this.player) {
                    this.player.takeDamage(enemy.type.damage);
                    enemy.escapesPenalty = true;
                }
                return false; // 移除逃脱的敌机
            }
            
            // 保留在屏幕内且存活的敌机
            return true;
        });
        
        // 清理死亡或移除的敌机的血条
        if (typeof enemyHudManager !== 'undefined') {
            enemyHudManager.cleanupDeadEnemies(this.enemies);
        }
    }
    
    // 绘制所有敌机
    draw(ctx) {
        // 使用精灵渲染器批量绘制敌机
        spriteRenderer.drawBatch(ctx, this.enemies, 'enemy');
        
        // 使用HUD管理器绘制所有血条
        if (typeof enemyHudManager !== 'undefined') {
            enemyHudManager.drawAll(ctx);
        }
    }
    

    
    // 检测与子弹的碰撞
    checkCollisions(bullets, weaponSystem, effectSystem = null) {
        const currentTime = Date.now();
        
        bullets.forEach(bullet => {
            // 如果子弹已经用完穿透次数，跳过
            if (bullet.remainingPenetration <= 0) {
                return;
            }
            
            // 标记子弹是否需要被移除
            let shouldRemoveBullet = false;
            
            for (let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];
                
                // 只检测存活的敌机
                if (!enemy.isAlive || enemy.health <= 0) {
                    continue;
                }
                
                // 检查该敌机是否已经被这发子弹击中过
                if (bullet.hitEnemies && bullet.hitEnemies.includes(enemy)) {
                    continue;
                }
                
                // 如果子弹已经需要移除，停止检测
                if (shouldRemoveBullet) {
                    break;
                }
                
                // 使用射线检测：检测子弹从上一帧到当前帧的路径
                let isHit = false;
                if (bullet.prevX !== undefined && bullet.prevY !== undefined) {
                    // 射线碰撞检测（用于高速子弹）
                    isHit = weaponSystem.raycastRectangle(
                        bullet.prevX, bullet.prevY,
                        bullet.x, bullet.y,
                        enemy
                    );
                } else {
                    // 降级到传统碰撞检测（第一帧）
                    isHit = this.isColliding(bullet, enemy);
                }
                
                if (isHit) {
                    // 将该敌机加入已击中列表
                    if (!bullet.hitEnemies) {
                        bullet.hitEnemies = [];
                    }
                    bullet.hitEnemies.push(enemy);
                    
                    // 对敌机造成伤害
                    const damage = bullet.damage || 1;
                    const isDead = enemy.takeDamage(damage, (enemy, dmg) => {
                        // 受伤回调：创建命中火花特效
                        if (effectSystem) {
                            effectSystem.createSpark(
                                enemy.x + enemy.width / 2,
                                enemy.y + enemy.height / 2,
                                null,
                                { color: bullet.color || '#FFFF00', particleCount: 5, duration: 300 }
                            );
                        }
                    }, currentTime);
                    
                    // 检查是否有爆炸范围
                    if (bullet.explosionRadius > 0 && effectSystem) {
                        // 在子弹位置创建爆炸
                        const explosionX = bullet.x;
                        const explosionY = bullet.y;
                        
                        // 创建爆炸特效
                        this.createBulletExplosionEffect(bullet, explosionX, explosionY, effectSystem);
                        
                        // 对爆炸范围内的其他敌机造成伤害（排除直接命中的敌机）
                        this.enemies.forEach(otherEnemy => {
                            if (otherEnemy === enemy || !otherEnemy.isAlive || otherEnemy.health <= 0) {
                                return;
                            }
                            
                            // 计算距离
                            const dx = (otherEnemy.x + otherEnemy.width / 2) - explosionX;
                            const dy = (otherEnemy.y + otherEnemy.height / 2) - explosionY;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // 在爆炸范围内
                            if (distance <= bullet.explosionRadius) {
                                const explosionDead = otherEnemy.takeDamage(bullet.damage, null, currentTime);
                                
                                // 如果爆炸导致敌机死亡
                                if (explosionDead) {
                                    otherEnemy.isAlive = false;
                                    const scoreGain = otherEnemy.type.score || 10;
                                    this.score += scoreGain;
                                    
                                    const enemyExplosionX = otherEnemy.x + otherEnemy.width / 2;
                                    const enemyExplosionY = otherEnemy.y + otherEnemy.height / 2;
                                    
                                    // 击杀回血
                                    if (this.player && otherEnemy.type.killHeal > 0) {
                                        this.player.heal(otherEnemy.type.killHeal);
                                    }
                                    
                                    // 创建敌机爆炸特效
                                    const hasHeal = otherEnemy.type.killHeal > 0;
                                    const explosionColor = hasHeal ? '#00FF88' : '#FF9600';
                                    const ringColor = hasHeal ? '#00FF00' : '#FF6600';
                                    
                                    effectSystem.createExplosion(enemyExplosionX, enemyExplosionY, null, {
                                        particleCount: hasHeal ? 30 : 20,
                                        radius: hasHeal ? 50 : 40,
                                        color: explosionColor,
                                        duration: hasHeal ? 800 : 600
                                    });
                                    
                                    effectSystem.createRing(enemyExplosionX, enemyExplosionY, null, {
                                        maxRadius: hasHeal ? 60 : 50,
                                        color: ringColor,
                                        duration: hasHeal ? 600 : 400
                                    });
                                    
                                    if (hasHeal) {
                                        effectSystem.createSpark(enemyExplosionX, enemyExplosionY, null, {
                                            color: '#00FF88',
                                            particleCount: 8,
                                            duration: 800
                                        });
                                        
                                        effectSystem.createText(enemyExplosionX, enemyExplosionY - 30, `+${otherEnemy.type.killHeal} ❤️`, {
                                            color: '#00FF00',
                                            fontSize: 32,
                                            duration: 1200,
                                            floatSpeed: -2.5
                                        });
                                    }
                                    
                                    effectSystem.createText(enemyExplosionX, enemyExplosionY, `+${scoreGain}`, {
                                        color: '#FFD700',
                                        fontSize: 24,
                                        duration: 800,
                                        floatSpeed: -1.5
                                    });
                                }
                            }
                        });
                    }
                    
                    // 减少子弹穿透次数
                    bullet.remainingPenetration--;
                    
                    // 检查敌机是否死亡
                    if (isDead) {
                        enemy.isAlive = false;
                        
                        // 增加分数（使用敌机类型的得分）
                        const scoreGain = enemy.type.score || 10;
                        this.score += scoreGain;
                        
                        // 获取敌机中心位置
                        const explosionX = enemy.x + enemy.width / 2;
                        const explosionY = enemy.y + enemy.height / 2;
                        
                        // 击杀回血
                        if (this.player && enemy.type.killHeal > 0) {
                            this.player.heal(enemy.type.killHeal);
                        }
                        
                        // 使用新的特效系统创建爆炸
                        if (effectSystem) {
                            // 根据是否有回血使用不同颜色的爆炸效果
                            const hasHeal = enemy.type.killHeal > 0;
                            const explosionColor = hasHeal ? '#00FF88' : '#FF9600';
                            const ringColor = hasHeal ? '#00FF00' : '#FF6600';
                            
                            effectSystem.createExplosion(explosionX, explosionY, null, {
                                particleCount: hasHeal ? 30 : 20,
                                radius: hasHeal ? 50 : 40,
                                color: explosionColor,
                                duration: hasHeal ? 800 : 600
                            });
                            
                            // 添加外环特效
                            effectSystem.createRing(explosionX, explosionY, null, {
                                maxRadius: hasHeal ? 60 : 50,
                                color: ringColor,
                                duration: hasHeal ? 600 : 400
                            });
                            
                            // 如果有回血，额外添加治疗十字特效
                            if (hasHeal) {
                                // 创建治疗十字光束效果
                                effectSystem.createSpark(explosionX, explosionY, null, {
                                    color: '#00FF88',
                                    particleCount: 8,
                                    duration: 800
                                });
                                
                                // 显示大号回血文字
                                effectSystem.createText(explosionX, explosionY - 30, `+${enemy.type.killHeal} ❤️`, {
                                    color: '#00FF00',
                                    fontSize: 32,
                                    duration: 1200,
                                    floatSpeed: -2.5
                                });
                            }
                            
                            // 添加得分文字特效
                            effectSystem.createText(explosionX, explosionY, `+${scoreGain}`, {
                                color: '#FFD700',
                                fontSize: 24,
                                duration: 800,
                                floatSpeed: -1.5
                            });
                        } else {
                            // 降级到旧的爆炸系统
                            this.createExplosion(explosionX, explosionY);
                        }
                    }
                    
                    // 如果子弹穿透次数用完，标记为需要移除
                    if (bullet.remainingPenetration <= 0) {
                        shouldRemoveBullet = true;
                    }
                }
            }
            
            // 在检测完所有敌机后，如果需要移除子弹则移除
            if (shouldRemoveBullet) {
                weaponSystem.removeBullet(bullet);
            }
        });
    }
    
    // 碰撞检测
    isColliding(bullet, enemy) {
        return bullet.x + bullet.width / 2 > enemy.x &&
               bullet.x - bullet.width / 2 < enemy.x + enemy.width &&
               bullet.y < enemy.y + enemy.height &&
               bullet.y + bullet.height > enemy.y;
    }
    
    // 处理子弹超时爆炸
    handleBulletExplosion(bullet, explosionX, explosionY) {
        if (!bullet.explosionRadius || bullet.explosionRadius <= 0) return;
        
        const currentTime = Date.now();
        const effectSystem = window.game ? window.game.effectSystem : null;
        
        // 对爆炸范围内的所有敌机造成伤害
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive || enemy.health <= 0) {
                return;
            }
            
            // 计算距离
            const dx = (enemy.x + enemy.width / 2) - explosionX;
            const dy = (enemy.y + enemy.height / 2) - explosionY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 在爆炸范围内
            if (distance <= bullet.explosionRadius) {
                const explosionDead = enemy.takeDamage(bullet.damage, null, currentTime);
                
                // 如果爆炸导致敌机死亡
                if (explosionDead) {
                    enemy.isAlive = false;
                    const scoreGain = enemy.type.score || 10;
                    this.score += scoreGain;
                    
                    const enemyExplosionX = enemy.x + enemy.width / 2;
                    const enemyExplosionY = enemy.y + enemy.height / 2;
                    
                    // 击杀回血
                    if (this.player && enemy.type.killHeal > 0) {
                        this.player.heal(enemy.type.killHeal);
                    }
                    
                    if (effectSystem) {
                        // 创建敌机爆炸特效
                        const hasHeal = enemy.type.killHeal > 0;
                        const explosionColor = hasHeal ? '#00FF88' : '#FF9600';
                        const ringColor = hasHeal ? '#00FF00' : '#FF6600';
                        
                        effectSystem.createExplosion(enemyExplosionX, enemyExplosionY, null, {
                            particleCount: hasHeal ? 30 : 20,
                            radius: hasHeal ? 50 : 40,
                            color: explosionColor,
                            duration: hasHeal ? 800 : 600
                        });
                        
                        effectSystem.createRing(enemyExplosionX, enemyExplosionY, null, {
                            maxRadius: hasHeal ? 60 : 50,
                            color: ringColor,
                            duration: hasHeal ? 600 : 400
                        });
                        
                        if (hasHeal) {
                            effectSystem.createSpark(enemyExplosionX, enemyExplosionY, null, {
                                color: '#00FF88',
                                particleCount: 8,
                                duration: 800
                            });
                            
                            effectSystem.createText(enemyExplosionX, enemyExplosionY - 30, `+${enemy.type.killHeal} ❤️`, {
                                color: '#00FF00',
                                fontSize: 32,
                                duration: 1200,
                                floatSpeed: -2.5
                            });
                        }
                        
                        effectSystem.createText(enemyExplosionX, enemyExplosionY, `+${scoreGain}`, {
                            color: '#FFD700',
                            fontSize: 24,
                            duration: 800,
                            floatSpeed: -1.5
                        });
                    }
                }
            }
        });
    }
    
    // 创建子弹爆炸特效
    createBulletExplosionEffect(bullet, explosionX, explosionY, effectSystem) {
        if (!bullet.explosionRadius || bullet.explosionRadius <= 0 || !effectSystem) return;
        
        // 创建烟雾爆炸特效
        effectSystem.createExplosion(explosionX, explosionY, null, {
            particleCount: 50,
            radius: bullet.explosionRadius,
            color: bullet.color || '#FF9600',
            duration: 900
        });
    }
    
    // 移除敌机（根据ID）
    removeEnemyById(enemyId) {
        const index = this.enemies.findIndex(e => e.id === enemyId);
        if (index > -1) {
            this.enemies.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // 移除敌机（根据引用）
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // 杀死敌机（标记为死亡，将在下次update中移除）
    killEnemy(enemy) {
        if (enemy && enemy.isAlive) {
            enemy.isAlive = false;
            enemy.health = 0;
            return true;
        }
        return false;
    }
    
    // 根据ID查找敌机
    getEnemyById(enemyId) {
        return this.enemies.find(e => e.id === enemyId);
    }
    
    // 获取存活的敌机数量
    getAliveEnemyCount() {
        return this.enemies.filter(e => e.isAlive && e.health > 0).length;
    }
    
    // 创建爆炸效果
    createExplosion(x, y) {
        // 简单的爆炸粒子效果
        if (!this.explosions) {
            this.explosions = [];
        }
        
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            
            this.explosions.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                maxLife: 30,
                size: 3 + Math.random() * 3
            });
        }
    }
    
    // 更新和绘制爆炸效果
    updateExplosions() {
        if (!this.explosions) return;
        
        this.explosions = this.explosions.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    drawExplosions(ctx) {
        if (!this.explosions) return;
        
        this.explosions.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = `rgba(255, 150, 0, ${alpha})`;
            ctx.shadowColor = '#FF6600';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
    }
    
    // 获取当前分数
    getScore() {
        return this.score;
    }
    
    // 获取所有敌机（用于游戏结束检测等）
    getEnemies() {
        return this.enemies;
    }
    
    // 检查是否有敌机到达底部
    checkGameOver() {
        return this.enemies.some(enemy => enemy.y + enemy.height >= this.canvas.height);
    }
    
    // 清除所有敌机
    clearAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.isAlive = false;
        });
        this.enemies = [];
        
        // 清理所有血条
        if (typeof enemyHudManager !== 'undefined') {
            enemyHudManager.clear();
        }
    }
    
    // 重置敌机系统
    reset() {
        this.clearAllEnemies();
        this.explosions = [];
        this.score = 0;
        this.lastSpawn = 0;
        this.nextEnemyId = 0;
        
        // 清理敌机血条HUD
        if (typeof enemyHudManager !== 'undefined') {
            enemyHudManager.clear();
        }
    }
    
    // 获取敌机列表信息（用于调试）
    getEnemyListInfo() {
        return {
            total: this.enemies.length,
            alive: this.getAliveEnemyCount(),
            dead: this.enemies.filter(e => !e.isAlive || e.health <= 0).length,
            enemies: this.enemies.map(e => ({
                id: e.id,
                health: e.health,
                isAlive: e.isAlive,
                position: { x: e.x, y: e.y }
            }))
        };
    }
}
