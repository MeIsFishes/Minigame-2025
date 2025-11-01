// ============================================
// 敌机类型配置
// ============================================
const EnemyTypes = {
    // 普通敌机 - 基础型
    normal: {
        id: 'normal',
        name: '普通敌机',
        hp: 10,                    // 血量
        model: 'enemy',            // 模型标识（对应CSS类名）
        width: 120,                 // 宽度
        height: 60,                // 高度
        spawnWeight: 60,           // 出现权重（越高越容易出现）
        minSpeed: 1,               // 最小速度
        maxSpeed: 4,               // 最大速度
        minHeight: 0,              // 最小高度（游戏区域百分比，0-1）
        maxHeight: 0.75,           // 最大高度（游戏区域百分比，0-1）
        killHeal: 0,               // 击杀回血（预留）
        killUpgrade: null          // 击杀掉落升级（预留）
    },

    // 快速敌机 - 速度快但血量低
    fast: {
        id: 'fast',
        name: '快速敌机',
        hp: 5,
        model: 'enemy-fast',
        width: 90,                 // 宽度
        height: 45,                // 高度
        spawnWeight: 20,
        minSpeed: 3,
        maxSpeed: 6,
        minHeight: 0.2,
        maxHeight: 0.6,
        killHeal: 0,
        killUpgrade: null
    },

    // 重型敌机 - 血量高但速度慢，倾向于出现在战场偏下
    heavy: {
        id: 'heavy',
        name: '重型敌机',
        hp: 40,
        model: 'enemy-heavy',
        width: 150,                 // 宽度
        height: 90,                // 高度
        spawnWeight: 20,
        minSpeed: 0.5,
        maxSpeed: 2,
        minHeight: 0.4,
        maxHeight: 0.8,
        killHeal: 0,
        killUpgrade: null
    },

    // 医疗敌机 - 击落可恢复生命值
    heal: {
        id: 'heal',
        name: '医疗敌机',
        hp: 10,
        model: 'enemy-heal',
        width: 105,                 // 宽度
        height: 50,                // 高度
        spawnWeight: 15,           // 中等出现频率
        minSpeed: 2,
        maxSpeed: 4,
        minHeight: 0.1,            // 只在屏幕偏上部分出现
        maxHeight: 0.4,
        killHeal: 3,               // 击杀恢复3点生命值
        killUpgrade: null
    }
};

// ============================================
// 敌机系统
// ============================================
const EnemySystem = {
    enemies: [],
    nextEnemyId: 1, // 下一个敌人ID

    // 根据权重随机选择敌机类型
    selectEnemyType() {
        // 计算总权重
        let totalWeight = 0;
        const types = Object.values(EnemyTypes);
        for (const type of types) {
            totalWeight += type.spawnWeight;
        }

        // 随机选择一个类型
        let random = Math.random() * totalWeight;
        let currentWeight = 0;

        for (const type of types) {
            currentWeight += type.spawnWeight;
            if (random <= currentWeight) {
                return type;
            }
        }

        // 默认返回普通敌机
        return EnemyTypes.normal;
    },

    // 创建敌机
    createEnemy() {
        // 根据权重选择敌机类型
        const enemyType = this.selectEnemyType();

        // 随机决定飞行方向：1=向右，-1=向左
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        // 根据方向决定生成位置
        // 向右飞的飞机从左侧（屏幕外）生成
        // 向左飞的飞机从右侧（屏幕外）生成
        let x;
        if (direction === 1) {
            // 向右飞，从左侧屏幕外生成
            x = -enemyType.width;
        } else {
            // 向左飞，从右侧屏幕外生成
            x = GAME_WIDTH;
        }
        
        // 根据类型配置生成速度
        const speed = enemyType.minSpeed + Math.random() * (enemyType.maxSpeed - enemyType.minSpeed);
        
        // 根据类型配置生成高度
        // 预留顶部空间给玩家血量UI（约60px）
        const topOffset = 60;
        const gameAreaHeight = GAME_HEIGHT * 0.75;
        const minY = topOffset + gameAreaHeight * enemyType.minHeight;
        const maxY = topOffset + gameAreaHeight * enemyType.maxHeight;
        const y = minY + Math.random() * (maxY - minY - enemyType.height);
        const clampedY = Math.max(topOffset, Math.min(topOffset + gameAreaHeight - enemyType.height, y));

        // 创建敌机对象
        const enemy = {
            id: this.nextEnemyId++,        // 唯一ID
            x: x,
            y: clampedY,
            direction: direction,
            speed: speed,
            type: enemyType.id,            // 敌机类型ID
            hp: enemyType.hp,              // 当前血量
            maxHp: enemyType.hp,           // 最大血量
            width: enemyType.width,        // 宽度
            height: enemyType.height,      // 高度
            element: null
        };

        // 创建DOM元素
        enemy.element = document.createElement('div');
        enemy.element.className = 'enemy';
        
        // 添加模型类名（为不同样式做准备）
        enemy.element.classList.add(enemyType.model);
        
        // 根据方向设置朝向
        // direction为1表示向右移动，应该面朝右
        // direction为-1表示向左移动，应该面朝左
        if (direction === 1) {
            enemy.element.classList.add('facing-right');
        } else {
            enemy.element.classList.add('facing-left');
        }
        
        // 添加尾翼元素
        const wing = document.createElement('div');
        wing.className = 'wing';
        enemy.element.appendChild(wing);
        
        // 添加上下机翼装饰
        const wingTop = document.createElement('div');
        wingTop.className = 'wing-top';
        enemy.element.appendChild(wingTop);
        
        const wingBottom = document.createElement('div');
        wingBottom.className = 'wing-bottom';
        enemy.element.appendChild(wingBottom);
        
        // 创建血条容器
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'enemy-health-bar-container';
        enemy.element.appendChild(healthBarContainer);
        
        // 创建血条背景
        const healthBarBg = document.createElement('div');
        healthBarBg.className = 'enemy-health-bar-bg';
        healthBarContainer.appendChild(healthBarBg);
        
        // 创建血条填充
        const healthBarFill = document.createElement('div');
        healthBarFill.className = 'enemy-health-bar-fill';
        healthBarBg.appendChild(healthBarFill);
        
        // 保存血条元素的引用
        enemy.healthBarFill = healthBarFill;
        
        // 初始化血条显示
        this.updateHealthBar(enemy);
        
        enemy.element.style.left = enemy.x + 'px';
        enemy.element.style.top = enemy.y + 'px';
        gameArea.appendChild(enemy.element);

        this.enemies.push(enemy);
    },

    // 更新敌机位置
    update() {
        const gameAreaHeight = GAME_HEIGHT / 2;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.x += enemy.direction * enemy.speed;

            // 检查敌机是否飞出屏幕边界
            // 向右飞的飞机（direction = 1）：飞出右边界时移除
            // 向左飞的飞机（direction = -1）：飞出左边界时移除
            if ((enemy.direction === 1 && enemy.x > GAME_WIDTH) ||
                (enemy.direction === -1 && enemy.x < -enemy.width)) {
                // 飞机飞出屏幕，玩家损失1点血量
                PlayerSystem.takeDamage(1);
                
                gameArea.removeChild(enemy.element);
                this.enemies.splice(i, 1);
                continue;
            }

            // 如果敌机超出游戏区域顶部，从数组中移除
            if (enemy.y < -enemy.height) {
                gameArea.removeChild(enemy.element);
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.element.style.left = enemy.x + 'px';
        }
    },

    // 更新血条显示
    updateHealthBar(enemy) {
        if (!enemy.healthBarFill) return;
        
        const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
        enemy.healthBarFill.style.width = hpPercent + '%';
        
        // 根据血量百分比改变颜色
        if (hpPercent > 60) {
            enemy.healthBarFill.style.background = '#00ff00'; // 绿色
        } else if (hpPercent > 30) {
            enemy.healthBarFill.style.background = '#ffaa00'; // 橙色
        } else {
            enemy.healthBarFill.style.background = '#ff0000'; // 红色
        }
    },

    // 对敌机造成伤害
    takeDamage(enemy, damage) {
        enemy.hp -= damage;
        
        // 更新血条显示
        this.updateHealthBar(enemy);
        
        // 如果血量小于等于0，返回true表示被击杀
        if (enemy.hp <= 0) {
            return true;
        }
        
        // 可以在这里添加受伤特效
        // 例如：闪烁效果等
        
        return false;
    },

    // 获取敌机类型配置
    getEnemyType(typeId) {
        return EnemyTypes[typeId] || EnemyTypes.normal;
    },

    // 移除敌机
    remove(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            if (enemy.element && enemy.element.parentNode) {
                gameArea.removeChild(enemy.element);
            }
            this.enemies.splice(index, 1);
        }
    }
};
