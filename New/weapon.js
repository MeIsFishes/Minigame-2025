// ============================================
// 武器系统
// ============================================
const WeaponSystem = {
    // 武器配置数据
    WEAPONS: {
        // 第一排键位：速射炮 (Q~P)
        rapid_fire: {
            name: "速射炮",
            damage: 10,            // 攻击力
            cooldown: 2500,       // 冷却时间（毫秒）- 较短
            bulletCount: 1,       // 单次射击数量
            shotCount: 1,         // 射击次数（连发）
            shotInterval: 150,    // 射击间隔（毫秒）
            sound: "rapid_fire",  // 射击音效
            bulletWidth: 8,        // 子弹宽度（像素）
            bulletHeight: 40,     // 子弹高度（像素）
            bulletSpeed: 720,     // 子弹速度（像素/秒）
            bulletAcceleration: 0, // 子弹加速度（像素/秒²，可为负数，允许后退）
            lifetime: 3000,       // 子弹存在时间（毫秒）
            centerLineOffset: 0,   // 中心线散射角（度数）
            bulletSpreadAngle: 0, // 子弹散射角（度数）
            trackingSpeed: 0,     // 追踪角速度（度/秒）
            color: "#ffff00"       // 武器颜色（影响子弹和键位）
        },

        // 第二排键位：机枪 (A~L)
        machine_gun: {
            name: "机枪",
            damage: 4,            // 攻击力 - 较低
            cooldown: 8000,       // 冷却时间（毫秒）- 较长
            bulletCount: 1,       // 单次射击数量
            shotCount: 8,         // 射击次数（5轮）
            shotInterval: 60,    // 射击间隔（毫秒）
            sound: "machine_gun", // 射击音效
            bulletWidth: 4,      // 子弹宽度（像素）
            bulletHeight: 20,   // 子弹高度（像素）
            bulletSpeed: 600,     // 子弹速度（像素/秒）
            bulletAcceleration: -100, // 子弹加速度（像素/秒²，可为负数）
            lifetime: 2500,       // 子弹存在时间（毫秒）
            centerLineOffset: 0,   // 中心线散射角（度数）
            bulletSpreadAngle: 18, // 子弹散射角（度数）
            trackingSpeed: 0,     // 追踪角速度（度/秒）
            color: "#ffaa00"       // 武器颜色（影响子弹和键位）
        },

        // 第三排键位：霰弹 (Z~M)
        shotgun: {
            name: "霰弹",
            damage: 3,            // 攻击力 - 较低但多发
            cooldown: 12000,      // 冷却时间（毫秒）- 极长
            bulletCount: 12,       // 单次射击数量 - 5发
            shotCount: 1,         // 射击次数
            shotInterval: 0,      // 射击间隔
            sound: "shotgun",     // 射击音效
            bulletWidth: 3,       // 子弹宽度（像素）
            bulletHeight: 20,     // 子弹高度（像素）
            bulletSpeed: 900,      // 子弹速度（像素/秒）- 较慢
            bulletAcceleration: -900,  // 子弹加速度（像素/秒²，可为负数）
            lifetime: 400,       // 子弹存在时间（毫秒）- 较短
            centerLineOffset: 5,   // 中心线散射角（度数）
            bulletSpreadAngle: 5, // 子弹散射角（度数）
            trackingSpeed: 0,     // 追踪角速度（度/秒）
            color: "#ff6600"       // 武器颜色（影响子弹和键位）
        },

        // 穿透炮 - 可以穿透多个敌人
        pierce_cannon: {
            name: "穿透炮",
            damage: 6,            // 攻击力 - 中等
            cooldown: 6000,       // 冷却时间（毫秒）- 中等
            bulletCount: 1,       // 单次射击数量
            shotCount: 1,         // 射击次数
            shotInterval: 0,      // 射击间隔
            sound: "pierce_cannon", // 射击音效
            bulletWidth: 6,       // 子弹宽度（像素）- 较宽
            bulletHeight: 35,     // 子弹高度（像素）
            bulletSpeed: 800,     // 子弹速度（像素/秒）
            bulletAcceleration: 0, // 子弹加速度（像素/秒²）
            lifetime: 3500,       // 子弹存在时间（毫秒）
            centerLineOffset: 0,   // 中心线散射角（度数）
            bulletSpreadAngle: 0, // 子弹散射角（度数）
            trackingSpeed: 0,     // 追踪角速度（度/秒）
            pierceCount: 100,       // 穿透次数（可以击中3个敌人）
            color: "#00ffff"       // 武器颜色（青色）
        },

        // 导弹 - 追踪型武器
        missile: {
            name: "导弹",
            damage: 15,           // 攻击力 - 高
            cooldown: 8000,       // 冷却时间（毫秒）- 较长
            bulletCount: 1,       // 单次射击数量
            shotCount: 1,         // 射击次数
            shotInterval: 0,      // 射击间隔
            sound: "missile",     // 射击音效
            bulletWidth: 8,       // 子弹宽度（像素）- 较大
            bulletHeight: 25,     // 子弹高度（像素）
            bulletSpeed: 500,     // 子弹速度（像素/秒）- 较慢
            bulletAcceleration: 200, // 子弹加速度（像素/秒²）- 逐渐加速
            lifetime: 6000,       // 子弹存在时间（毫秒）- 较长
            centerLineOffset: 0,   // 中心线散射角（度数）
            bulletSpreadAngle: 0, // 子弹散射角（度数）
            trackingSpeed: 180,   // 追踪角速度（度/秒）- 快速追踪
            pierceCount: 1,       // 穿透次数（导弹只能击中一个目标）
            color: "#ff00ff"       // 武器颜色（品红）
        }
    },

    // 键位到武器的映射
    KEY_WEAPONS: {
        // 第一排：速射炮
        'q': null, 'w': null, 'e': null, 'r': null,
        't': null, 'y': null, 'u': null, 'i': null,
        'o': null, 'p': null,

        // 第二排：机枪
        'a': null, 's': null, 'd': null, 'f': null,
        'g': null, 'h': null, 'j': null, 'k': null,
        'l': null,

        // 第三排：霰弹
        'z': null, 'x': null, 'c': null, 'v': null,
        'b': null, 'n': null, 'm': null
    },

    // 初始化键位映射（使用默认配置）
    init() {
        this.setWeaponRow(0, 'rapid_fire');   // 第一排：速射炮
        this.setWeaponRow(1, 'machine_gun');  // 第二排：机枪
        this.setWeaponRow(2, 'shotgun');      // 第三排：霰弹
    },

    // 设置某一排的武器
    setWeaponRow(rowIndex, weaponId) {
        const weapon = this.getWeaponById(weaponId);
        if (!weapon) return;

        let keys = [];
        switch (rowIndex) {
            case 0: // 第一排 Q-P
                keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
                break;
            case 1: // 第二排 A-L
                keys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
                break;
            case 2: // 第三排 Z-M
                keys = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
                break;
        }

        keys.forEach(key => {
            this.KEY_WEAPONS[key] = weapon;
        });
    },

    // 设置自定义武器配置
    setCustomWeaponConfig(rowConfigs) {
        // rowConfigs 应该是 [{row: 0, weaponId: 'rapid_fire'}, {row: 1, weaponId: 'machine_gun'}, ...]
        rowConfigs.forEach(config => {
            this.setWeaponRow(config.row, config.weaponId);
        });
    },

    // 获取武器配置
    getWeapon(key) {
        return this.KEY_WEAPONS[key] || null;
    },

    // 获取所有可用武器列表
    getAllWeapons() {
        return Object.keys(this.WEAPONS).map(key => ({
            id: key,
            ...this.WEAPONS[key]
        }));
    },

    // 根据ID获取武器配置
    getWeaponById(id) {
        return this.WEAPONS[id] || null;
    },

    // 发射武器
    fireWeapon(key, weapon) {
        let shotFired = 0;

        // 射击函数
        const fireShot = () => {
            if (shotFired >= weapon.shotCount) return;

            // 计算这一轮的基础角度（向上发射加上中心线偏移）
            const baseAngle = -Math.PI / 2 + ((Math.random() - 0.5) * weapon.centerLineOffset * Math.PI / 180);

            // 创建指定数量的子弹
            for (let i = 0; i < weapon.bulletCount; i++) {
                BulletSystem.createBullet(key, weapon, baseAngle);
            }

            shotFired++;

            // 如果还有射击次数，设置下一个射击的定时器
            if (shotFired < weapon.shotCount) {
                setTimeout(fireShot, weapon.shotInterval);
            }
        };

        // 开始第一发射击
        fireShot();

        // 播放音效
        this.playSound(weapon.sound);
    },

    // 播放音效（预留接口）
    playSound(soundName) {
        // 这里可以添加音效播放逻辑
        // 例如: new Audio(`sounds/${soundName}.mp3`).play();
        console.log(`播放音效: ${soundName}`);
    }
};

// ============================================
// 子弹系统
// ============================================
const BulletSystem = {
    bullets: [],

    // 按键位置映射（网格中的行列位置）- 精细交错布局
    keyPositions: {
        'q': { row: 0, col: 0 }, 'w': { row: 0, col: 1 }, 'e': { row: 0, col: 2 }, 'r': { row: 0, col: 3 },
        't': { row: 0, col: 4 }, 'y': { row: 0, col: 5 }, 'u': { row: 0, col: 6 }, 'i': { row: 0, col: 7 },
        'o': { row: 0, col: 8 }, 'p': { row: 0, col: 9 },
        'a': { row: 1, col: 0 }, 's': { row: 1, col: 1 }, 'd': { row: 1, col: 2 }, 'f': { row: 1, col: 3 },
        'g': { row: 1, col: 4 }, 'h': { row: 1, col: 5 }, 'j': { row: 1, col: 6 }, 'k': { row: 1, col: 7 },
        'l': { row: 1, col: 8 },
        'z': { row: 2, col: 0 }, 'x': { row: 2, col: 1 }, 'c': { row: 2, col: 2 }, 'v': { row: 2, col: 3 },
        'b': { row: 2, col: 4 }, 'n': { row: 2, col: 5 }, 'm': { row: 2, col: 6 }
    },

    // 计算按键发射位置
    getBulletSpawnPosition(key) {
        const position = this.keyPositions[key];
        if (!position) return { x: GAME_WIDTH / 2, y: GAME_HEIGHT * 0.7 };

        // 计算网格单元的大小（键盘占四分之一）
        const gridCols = 10;
        const cellWidth = GAME_WIDTH / gridCols;

        // 根据行计算交错偏移
        let colOffset = 0;
        if (position.row === 1) {
            // 第二行向右偏移0.5个键位位置
            colOffset = 0.5;
        } else if (position.row === 2) {
            // 第三行向右偏移1.2个键位位置
            colOffset = 1.2;
        }

        // 子弹发射位置：X轴跟随按键位置，Y轴固定在键盘UI上方
        const x = (position.col + colOffset + 0.5) * cellWidth - BULLET_WIDTH / 2;
        const y = GAME_HEIGHT * 0.7; // 固定在键盘UI上方发射

        return { x, y };
    },

    // 创建子弹（从对应按键位置发射）
    createBullet(key, weapon, baseAngle) {
        // 从对应按键位置发射
        const spawnPos = this.getBulletSpawnPosition(key);

        // 计算子弹散射角度（围绕调整后的中心线）
        const spreadRad = (weapon.bulletSpreadAngle * Math.PI / 180); // 转换为弧度
        const randomSpread = (Math.random() - 0.5) * spreadRad * 2; // 在散射范围内随机
        const finalAngle = baseAngle + randomSpread;

        // 使用武器配置的绝对大小
        const bulletWidth = weapon.bulletWidth;
        const bulletHeight = weapon.bulletHeight;

        const bullet = {
            x: spawnPos.x - bulletWidth / 2, // 居中调整
            y: spawnPos.y - bulletHeight / 2,
            vx: Math.cos(finalAngle) * (weapon.bulletSpeed / 60), // X轴速度（转换为像素/帧）
            vy: Math.sin(finalAngle) * (weapon.bulletSpeed / 60), // Y轴速度（转换为像素/帧）
            angle: finalAngle,       // 当前角度
            damage: weapon.damage,   // 子弹伤害
            width: bulletWidth,      // 子弹宽度
            height: bulletHeight,    // 子弹高度
            speed: weapon.bulletSpeed / 60, // 实际速度（转换为像素/帧）
            acceleration: weapon.bulletAcceleration / 3600, // 加速度（转换为像素/帧²）
            lifetime: weapon.lifetime, // 子弹存在时间
            createdAt: Date.now(),   // 创建时间戳
            opacity: 1.0,           // 子弹透明度（用于渐隐效果）
            trackingSpeed: weapon.trackingSpeed, // 追踪角速度
            targetEnemy: null,       // 追踪的目标敌机
            pierceCount: weapon.pierceCount || 1, // 穿透次数（默认1次）
            element: null
        };

        // 创建DOM元素
        bullet.element = document.createElement('div');
        bullet.element.className = 'bullet';

        // 设置子弹大小
        bullet.element.style.width = bulletWidth + 'px';
        bullet.element.style.height = bulletHeight + 'px';

        // 根据武器配置设置不同的视觉效果
        this.setBulletStyle(bullet.element, weapon);

        bullet.element.style.left = bullet.x + 'px';
        bullet.element.style.top = bullet.y + 'px';
        bullet.element.style.opacity = bullet.opacity; // 设置初始透明度
        gameArea.appendChild(bullet.element);

        this.bullets.push(bullet);
    },

    // 设置子弹样式
    setBulletStyle(element, weapon) {
        // 使用武器配置的颜色
        const baseColor = weapon.color;
        const darkerColor = this.adjustColorBrightness(baseColor, -0.3);

        element.style.background = `linear-gradient(45deg, ${baseColor}, ${darkerColor})`;
        element.style.boxShadow = `0 0 6px ${baseColor}`;
    },

    // 调整颜色亮度（辅助函数）
    adjustColorBrightness(hex, percent) {
        // 将hex转换为rgb
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // 调整亮度
        const newR = Math.max(0, Math.min(255, Math.round(r * (1 + percent))));
        const newG = Math.max(0, Math.min(255, Math.round(g * (1 + percent))));
        const newB = Math.max(0, Math.min(255, Math.round(b * (1 + percent))));

        // 转换回hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    },

    // 更新子弹位置
    update() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // 检查子弹是否超过存在时间
            const currentTime = Date.now();
            const elapsedTime = currentTime - bullet.createdAt;

            if (elapsedTime > bullet.lifetime) {
                gameArea.removeChild(bullet.element);
                this.bullets.splice(i, 1);
                continue;
            }

            // 计算渐隐效果（最后500毫秒内开始渐隐）
            const fadeStartTime = bullet.lifetime - 500; // 500ms渐隐时间
            if (elapsedTime > fadeStartTime) {
                const fadeProgress = (elapsedTime - fadeStartTime) / 500;
                bullet.opacity = Math.max(0, 1 - fadeProgress);
                bullet.element.style.opacity = bullet.opacity;
            }

            // 处理追踪逻辑（只有霰弹有追踪能力）
            if (bullet.trackingSpeed > 0) {
                this.updateTracking(bullet);
            }

            // 应用加速度（更新速度）
            bullet.speed += bullet.acceleration;

            // 根据新速度更新速度向量（允许负速度，后退）
            bullet.vx = Math.cos(bullet.angle) * bullet.speed;
            bullet.vy = Math.sin(bullet.angle) * bullet.speed;

            // 更新位置
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // 检查是否超出屏幕边界
            if (bullet.x < -bullet.width || bullet.x > GAME_WIDTH ||
                bullet.y < -bullet.height || bullet.y > GAME_HEIGHT) {
                gameArea.removeChild(bullet.element);
                this.bullets.splice(i, 1);
            } else {
                bullet.element.style.left = bullet.x + 'px';
                bullet.element.style.top = bullet.y + 'px';
            }
        }
    },

    // 更新子弹追踪逻辑
    updateTracking(bullet) {
        // 寻找最近的敌机
        let nearestEnemy = null;
        let minDistance = Infinity;

        for (const enemy of EnemySystem.enemies) {
            const dx = enemy.x + ENEMY_WIDTH/2 - bullet.x - BULLET_WIDTH/2;
            const dy = enemy.y + ENEMY_HEIGHT/2 - bullet.y - BULLET_HEIGHT/2;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy) {
            // 计算目标角度
            const dx = nearestEnemy.x + ENEMY_WIDTH/2 - bullet.x - BULLET_WIDTH/2;
            const dy = nearestEnemy.y + ENEMY_HEIGHT/2 - bullet.y - BULLET_HEIGHT/2;
            const targetAngle = Math.atan2(dy, dx);

            // 计算角度差
            let angleDiff = targetAngle - bullet.angle;

            // 归一化角度差到 [-π, π]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            // 限制转向速度（从度/秒转换为度/帧）
            const maxTurn = (bullet.trackingSpeed / 60) * Math.PI / 180; // 转换为弧度
            angleDiff = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

            // 更新角度
            bullet.angle += angleDiff;

            // 更新速度向量（追踪逻辑中也使用当前速度）
            bullet.vx = Math.cos(bullet.angle) * bullet.speed;
            bullet.vy = Math.sin(bullet.angle) * bullet.speed;
        }
    },

    // 移除子弹
    remove(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            if (bullet.element && bullet.element.parentNode) {
                gameArea.removeChild(bullet.element);
            }
            this.bullets.splice(index, 1);
        }
    }
};

