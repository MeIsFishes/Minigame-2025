// lobby.js - 游戏大厅/开始界面

class LobbySystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.isActive = true; // 大厅是否激活
        this.selectedButton = null; // 当前选中的按钮
        
        // 按钮定义
        this.buttons = {
            start: {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: '开始游戏',
                color: '#4CAF50',
                hoverColor: '#45a049',
                isHovered: false
            },
            weaponConfig: {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: '武器配置',
                color: '#9C27B0',
                hoverColor: '#7B1FA2',
                isHovered: false
            },
            techUpgrade: {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: '科技升级',
                color: '#FF5722',
                hoverColor: '#E64A19',
                isHovered: false
            },
            help: {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: '游戏说明',
                color: '#2196F3',
                hoverColor: '#1976D2',
                isHovered: false
            },
            settings: {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: '设置',
                color: '#FF9800',
                hoverColor: '#F57C00',
                isHovered: false
            }
        };
        
        // 标题动画
        this.titleAnimation = {
            offset: 0,
            direction: 1,
            speed: 0.5
        };
        
        // 粒子背景
        this.particles = [];
        this.initParticles();
        
        // 帮助界面状态
        this.showingHelp = false;
        
        // 武器配置界面状态
        this.showingWeaponConfig = false;
        this.weaponConfigData = {
            scrollOffset: 0, // 整个面板的垂直滚动偏移
            errorMessage: null,
            errorTime: null
        };
        
        // 科技升级界面状态
        this.showingTechUpgrade = false;
        this.techUpgradeData = {
            scrollOffset: 0,
            selectedWeapon: null, // 当前选中的武器
            hoveredTech: null, // 鼠标悬停的科技
            message: null,
            messageTime: null,
            messageType: 'success' // 'success' or 'error'
        };
        
        // 计算按钮位置
        this.updateButtonPositions();
        
        // 绑定鼠标事件
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseClick = this.handleMouseClick.bind(this);
        this.boundMouseWheel = this.handleMouseWheel.bind(this);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('click', this.boundMouseClick);
        this.canvas.addEventListener('wheel', this.boundMouseWheel);
    }
    
    // 初始化背景粒子
    initParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    // 更新按钮位置（响应画布大小变化）
    updateButtonPositions() {
        const centerX = this.canvas.width / 2;
        const startY = this.canvas.height * 0.5;
        const buttonSpacing = 80;
        
        this.buttons.start.x = centerX - this.buttons.start.width / 2;
        this.buttons.start.y = startY;
        
        this.buttons.weaponConfig.x = centerX - this.buttons.weaponConfig.width / 2;
        this.buttons.weaponConfig.y = startY + buttonSpacing;
        
        this.buttons.techUpgrade.x = centerX - this.buttons.techUpgrade.width / 2;
        this.buttons.techUpgrade.y = startY + buttonSpacing * 2;
        
        this.buttons.help.x = centerX - this.buttons.help.width / 2;
        this.buttons.help.y = startY + buttonSpacing * 3;
        
        this.buttons.settings.x = centerX - this.buttons.settings.width / 2;
        this.buttons.settings.y = startY + buttonSpacing * 4;
    }
    
    // 处理鼠标移动
    handleMouseMove(event) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // 如果在特殊界面，显示指针
        if (this.showingWeaponConfig || this.showingHelp || this.showingTechUpgrade) {
            this.canvas.style.cursor = 'pointer';
            
            // 如果在科技升级界面，处理悬停
            if (this.showingTechUpgrade) {
                this.handleTechUpgradeHover(mouseX, mouseY);
            }
            return;
        }
        
        // 检查每个按钮
        Object.values(this.buttons).forEach(button => {
            button.isHovered = this.isPointInButton(mouseX, mouseY, button);
        });
        
        // 更新鼠标样式
        const anyHovered = Object.values(this.buttons).some(b => b.isHovered);
        this.canvas.style.cursor = anyHovered ? 'pointer' : 'default';
    }
    
    // 处理鼠标点击
    handleMouseClick(event) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // 如果正在显示帮助界面，点击任意位置关闭
        if (this.showingHelp) {
            this.showingHelp = false;
            return;
        }
        
        // 如果正在显示武器配置界面
        if (this.showingWeaponConfig) {
            this.handleWeaponConfigClick(mouseX, mouseY);
            return;
        }
        
        // 如果正在显示科技升级界面
        if (this.showingTechUpgrade) {
            this.handleTechUpgradeClick(mouseX, mouseY);
            return;
        }
        
        // 检查点击了哪个按钮
        if (this.isPointInButton(mouseX, mouseY, this.buttons.start)) {
            this.onStartGame();
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.weaponConfig)) {
            this.showingWeaponConfig = true;
            this.weaponConfigData.selectedRow = null;
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.techUpgrade)) {
            this.showingTechUpgrade = true;
            this.techUpgradeData.selectedWeapon = null;
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.help)) {
            this.showingHelp = true;
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.settings)) {
            this.onSettings();
        }
    }
    
    // 处理鼠标滚轮事件
    handleMouseWheel(event) {
        // 在武器配置或科技升级界面处理滚轮
        if (!this.showingWeaponConfig && !this.showingTechUpgrade) return;
        
        event.preventDefault();
        
        // 科技升级界面的滚轮处理
        if (this.showingTechUpgrade) {
            this.handleTechUpgradeScroll(event);
            return;
        }
        
        const panelWidth = Math.min(700, this.canvas.width * 0.9);
        const panelHeight = Math.min(600, this.canvas.height * 0.9);
        const scrollAreaHeight = panelHeight - 80;
        
        // 计算总内容高度
        const weapons = Object.keys(WeaponPresets);
        const weaponItemHeight = 100;
        const weaponSpacing = 10;
        const sectionTitleHeight = 50;
        const weaponsPerRow = 2;
        const numRows = Math.ceil(weapons.length / weaponsPerRow);
        const totalContentHeight = 3 * (sectionTitleHeight + numRows * (weaponItemHeight + weaponSpacing) + 20);
        const maxScrollOffset = Math.max(0, totalContentHeight - scrollAreaHeight);
        
        // 滚动速度
        const scrollSpeed = 30;
        this.weaponConfigData.scrollOffset += event.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        
        // 限制滚动范围
        this.weaponConfigData.scrollOffset = Math.max(0, Math.min(maxScrollOffset, this.weaponConfigData.scrollOffset));
    }
    
    // 检查点是否在按钮内
    isPointInButton(x, y, button) {
        return x >= button.x && 
               x <= button.x + button.width && 
               y >= button.y && 
               y <= button.y + button.height;
    }
    
    // 开始游戏回调（由外部设置）
    onStartGame() {
        console.log('开始游戏');
        // 这个方法会被外部覆盖
    }
    
    // 设置回调（由外部设置）
    onSettings() {
        console.log('打开设置');
        // 这个方法会被外部覆盖
    }
    
    // 更新动画
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新标题动画
        this.titleAnimation.offset += this.titleAnimation.speed * this.titleAnimation.direction;
        if (Math.abs(this.titleAnimation.offset) > 10) {
            this.titleAnimation.direction *= -1;
        }
        
        // 更新粒子
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界检查
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }
        });
    }
    
    // 绘制大厅界面
    draw(ctx) {
        if (!this.isActive) return;
        
        // 绘制背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制粒子背景
        this.drawParticles(ctx);
        
        // 如果显示帮助界面
        if (this.showingHelp) {
            this.drawHelpScreen(ctx);
            return;
        }
        
        // 如果显示武器配置界面
        if (this.showingWeaponConfig) {
            this.drawWeaponConfigScreen(ctx);
            return;
        }
        
        // 如果显示科技升级界面
        if (this.showingTechUpgrade) {
            this.drawTechUpgradeScreen(ctx);
            return;
        }
        
        // 绘制标题
        this.drawTitle(ctx);
        
        // 绘制副标题
        this.drawSubtitle(ctx);
        
        // 绘制按钮
        this.drawButtons(ctx);
        
        // 绘制版本信息
        this.drawVersion(ctx);
    }
    
    // 绘制粒子背景
    drawParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // 绘制标题
    drawTitle(ctx) {
        const centerX = this.canvas.width / 2;
        const titleY = this.canvas.height * 0.25;
        
        // 标题文字
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 标题阴影
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('Press Any Key', centerX, titleY + this.titleAnimation.offset);
        
        // 标题光晕
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Press Any Key', centerX, titleY + this.titleAnimation.offset);
        
        ctx.shadowBlur = 0;
    }
    
    // 绘制副标题
    drawSubtitle(ctx) {
        const centerX = this.canvas.width / 2;
        const subtitleY = this.canvas.height * 0.35;
        
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('Press any key to shoot and defeat all enemies!', centerX, subtitleY);
    }
    
    // 绘制按钮
    drawButtons(ctx) {
        Object.values(this.buttons).forEach(button => {
            this.drawButton(ctx, button);
        });
    }
    
    // 绘制单个按钮
    drawButton(ctx, button) {
        // 按钮背景
        ctx.fillStyle = button.isHovered ? button.hoverColor : button.color;
        ctx.shadowColor = button.isHovered ? button.color : 'transparent';
        ctx.shadowBlur = button.isHovered ? 20 : 0;
        
        // 绘制圆角矩形
        this.roundRect(ctx, button.x, button.y, button.width, button.height, 10);
        ctx.fill();
        
        // 按钮边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.roundRect(ctx, button.x, button.y, button.width, button.height, 10);
        ctx.stroke();
        
        // 按钮文字
        ctx.shadowBlur = 0;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
    
    // 绘制圆角矩形
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }
    
    // 绘制版本信息
    drawVersion(ctx) {
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#666666';
        ctx.fillText('v1.0.0', this.canvas.width - 20, this.canvas.height - 20);
    }
    
    // 绘制帮助界面
    drawHelpScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 帮助面板
        const panelWidth = Math.min(600, this.canvas.width * 0.8);
        const panelHeight = Math.min(500, this.canvas.height * 0.8);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = '#1a1a3e';
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 标题
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('游戏说明', this.canvas.width / 2, panelY + 50);
        
        // 说明内容
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        
        const instructions = [
            '游戏规则：',
            '• 使用键盘上的 Q-P、A-L、Z-M 键发射武器',
            '• 每个按键对应一个武器位置',
            '• 击败敌机获得分数',
            '• 部分敌机被击败后会回复生命值',
            '',
            '敌机类型：',
            '• 基础战机：1血，10分',
            '• 快速战机：1血，15分，移动快速',
            '• 重型战机：3血，30分，回血+1',
            '• BOSS战机：10血，100分，回血+5',
            '',
            '武器类型：',
            '• 速射炮：基础武器，快速射击',
            '• 霰弹枪：散射多发子弹',
            '• 狙击枪：高伤害，穿透3个敌机，自动索敌',
            '',
            '点击任意位置返回'
        ];
        
        let textY = panelY + 100;
        instructions.forEach(line => {
            const fontSize = line.startsWith('•') ? 18 : 20;
            const isBold = !line.startsWith('•');
            ctx.font = isBold ? 'bold 20px Arial' : '18px Arial';
            ctx.fillText(line, panelX + 40, textY);
            textY += fontSize === 20 ? 28 : 24;
        });
    }
    
    // 处理武器配置界面点击
    handleWeaponConfigClick(mouseX, mouseY) {
        const panelWidth = Math.min(700, this.canvas.width * 0.9);
        const panelHeight = Math.min(600, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 关闭按钮区域
        const closeButtonX = panelX + panelWidth - 50;
        const closeButtonY = panelY + 10;
        const closeButtonSize = 35;
        if (mouseX >= closeButtonX && mouseX <= closeButtonX + closeButtonSize &&
            mouseY >= closeButtonY && mouseY <= closeButtonY + closeButtonSize) {
            // 验证武器配置：检查是否有重复武器
            const player = window.game ? window.game.player : null;
            if (player) {
                const row1 = player.weaponLoadout.row1 ? player.weaponLoadout.row1.name : null;
                const row2 = player.weaponLoadout.row2 ? player.weaponLoadout.row2.name : null;
                const row3 = player.weaponLoadout.row3 ? player.weaponLoadout.row3.name : null;
                
                // 检查是否有任意两排使用相同武器
                if ((row1 && row2 && row1 === row2) || 
                    (row1 && row3 && row1 === row3) || 
                    (row2 && row3 && row2 === row3)) {
                    // 显示错误提示
                    this.weaponConfigData.errorMessage = '错误：不允许两排键位使用相同武器！';
                    this.weaponConfigData.errorTime = Date.now();
                    
                    // 播放音效
                    if (typeof audioSystem !== 'undefined') {
                        audioSystem.playButtonSound();
                    }
                    return; // 不允许关闭
                }
            }
            
            this.showingWeaponConfig = false;
            return;
        }
        
        // 获取玩家对象
        const player = window.game ? window.game.player : null;
        if (!player) return;
        
        // 检查滚动区域内的点击
        const contentStartY = panelY + 70;
        const scrollAreaHeight = panelHeight - 80;
        
        if (mouseX < panelX + 20 || mouseX > panelX + panelWidth - 20 ||
            mouseY < contentStartY || mouseY > contentStartY + scrollAreaHeight) {
            return; // 点击在内容区域外
        }
        
        // 键位排配置
        const rowNames = ['第一排 (Q-P)', '第二排 (A-L)', '第三排 (Z-M)'];
        const rowKeys = ['row1', 'row2', 'row3'];
        const weapons = Object.keys(WeaponPresets);
        const weaponItemWidth = (panelWidth - 70) / 2; // 每行2个武器
        const weaponItemHeight = 100;
        const weaponSpacing = 10;
        const sectionTitleHeight = 50;
        const weaponsPerRow = 2;
        
        let currentY = -this.weaponConfigData.scrollOffset;
        
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            // 跳过标题区域
            currentY += sectionTitleHeight;
            
            // 检查每个武器卡片（2列布局）
            for (let i = 0; i < weapons.length; i++) {
                const weaponKey = weapons[i];
                const col = i % weaponsPerRow;
                const row = Math.floor(i / weaponsPerRow);
                
                const itemX = panelX + 30 + col * (weaponItemWidth + weaponSpacing);
                const itemY = contentStartY + currentY + row * (weaponItemHeight + weaponSpacing);
                
                // 检查点击
                const relativeMouseY = mouseY - contentStartY;
                const relativeItemY = currentY + row * (weaponItemHeight + weaponSpacing);
                
                if (mouseX >= itemX && mouseX <= itemX + weaponItemWidth &&
                    relativeMouseY >= relativeItemY && relativeMouseY <= relativeItemY + weaponItemHeight) {
                    // 设置武器
                    const rowKey = rowKeys[rowIndex];
                    player.weaponLoadout[rowKey] = WeaponPresets[weaponKey];
                    player.saveLoadout();
                    
                    // 播放音效
                    if (typeof audioSystem !== 'undefined') {
                        audioSystem.playButtonSound();
                    }
                    
                    // 刷新UI颜色
                    if (window.game && window.game.ui) {
                        window.game.ui.refreshWeaponColors();
                    }
                }
            }
            
            // 计算该区域占用的行数
            const numRows = Math.ceil(weapons.length / weaponsPerRow);
            currentY += numRows * (weaponItemHeight + weaponSpacing);
            
            // 每个区域之间的间距
            currentY += 20;
        }
    }
    
    // 绘制武器配置界面
    drawWeaponConfigScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 配置面板
        const panelWidth = Math.min(700, this.canvas.width * 0.9);
        const panelHeight = Math.min(600, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = '#1a1a3e';
        ctx.strokeStyle = '#9C27B0';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 标题
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9C27B0';
        ctx.fillText('武器配置', this.canvas.width / 2, panelY + 35);
        
        // 关闭按钮
        ctx.fillStyle = '#FF5252';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        const closeButtonX = panelX + panelWidth - 50;
        const closeButtonY = panelY + 10;
        const closeButtonSize = 35;
        this.roundRect(ctx, closeButtonX, closeButtonY, closeButtonSize, closeButtonSize, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('×', closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2);
        
        // 获取玩家对象
        const player = window.game ? window.game.player : null;
        if (!player) {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#FF5252';
            ctx.textAlign = 'center';
            ctx.fillText('玩家数据未加载', this.canvas.width / 2, panelY + 150);
            return;
        }
        
        // 绘制滚动内容区域
        const contentStartY = panelY + 70;
        const scrollAreaHeight = panelHeight - 80;
        
        // 设置裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX + 20, contentStartY, panelWidth - 40, scrollAreaHeight);
        ctx.clip();
        
        // 键位排配置
        const rowNames = ['第一排 (Q-P)', '第二排 (A-L)', '第三排 (Z-M)'];
        const rowKeys = ['row1', 'row2', 'row3'];
        const weapons = Object.keys(WeaponPresets);
        const weaponItemWidth = (panelWidth - 70) / 2; // 每行2个武器
        const weaponItemHeight = 100;
        const weaponSpacing = 10;
        const sectionTitleHeight = 50;
        const weaponsPerRow = 2;
        
        let currentY = -this.weaponConfigData.scrollOffset;
        
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            const currentWeapon = player.weaponLoadout[rowKeys[rowIndex]];
            
            // 区域标题
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(rowNames[rowIndex], panelX + 30, contentStartY + currentY + 30);
            
            // 当前装备的武器指示
            if (currentWeapon) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#AAAAAA';
                ctx.fillText('当前：', panelX + 250, contentStartY + currentY + 30);
                
                ctx.fillStyle = currentWeapon.color;
                ctx.beginPath();
                ctx.arc(panelX + 300, contentStartY + currentY + 25, 6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(currentWeapon.name, panelX + 315, contentStartY + currentY + 30);
            }
            
            currentY += sectionTitleHeight;
            
            // 绘制该排的所有武器（每行2个）
            for (let i = 0; i < weapons.length; i++) {
                const weaponKey = weapons[i];
                const weapon = WeaponPresets[weaponKey];
                const col = i % weaponsPerRow;
                const row = Math.floor(i / weaponsPerRow);
                
                const itemX = panelX + 30 + col * (weaponItemWidth + weaponSpacing);
                const itemY = contentStartY + currentY + row * (weaponItemHeight + weaponSpacing);
                
                // 检查是否是当前装备的武器
                const isEquipped = currentWeapon && currentWeapon.name === weapon.name;
                
                // 武器卡片背景
                ctx.fillStyle = isEquipped ? '#3a3a6e' : '#2a2a4e';
                ctx.strokeStyle = isEquipped ? '#9C27B0' : '#444466';
                ctx.lineWidth = isEquipped ? 3 : 2;
                this.roundRect(ctx, itemX, itemY, weaponItemWidth, weaponItemHeight, 8);
                ctx.fill();
                ctx.stroke();
                
                // 武器颜色条
                ctx.fillStyle = weapon.color;
                ctx.fillRect(itemX, itemY, weaponItemWidth, 6);
                
                // 武器名称
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(weapon.name, itemX + 10, itemY + 12);
                
                // 装备标记
                if (isEquipped) {
                    ctx.fillStyle = '#9C27B0';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText('✓ 已装备', itemX + weaponItemWidth - 10, itemY + 12);
                }
                
                // 武器数据（紧凑布局）
                ctx.font = '13px Arial';
                ctx.fillStyle = '#CCCCCC';
                ctx.textAlign = 'left';
                
                const damage = `伤害: ${weapon.damage}`;
                const cooldown = `CD: ${(weapon.cooldown/1000).toFixed(1)}s`;
                const penetration = weapon.penetration > 1 ? `穿透: ${weapon.penetration}` : '';
                const bullets = `子弹: ${weapon.bulletsPerShot}`;
                const burst = `连发: ${weapon.burstCount}`;
                const explosion = weapon.explosionRadius > 0 ? `爆炸: ${weapon.explosionRadius}` : '';
                
                ctx.fillText(damage, itemX + 10, itemY + 38);
                ctx.fillText(cooldown, itemX + 10, itemY + 56);
                if (penetration) {
                    ctx.fillText(penetration, itemX + 10, itemY + 74);
                }
                
                ctx.textAlign = 'right';
                ctx.fillText(bullets, itemX + weaponItemWidth - 10, itemY + 38);
                ctx.fillText(burst, itemX + weaponItemWidth - 10, itemY + 56);
                if (explosion) {
                    ctx.fillStyle = '#FF6B6B';
                    ctx.fillText(explosion, itemX + weaponItemWidth - 10, itemY + 74);
                }
                
                // 特殊属性图标
                if (weapon.trackingAngularSpeed > 0) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('🎯', itemX + weaponItemWidth / 2, itemY + 88);
                }
            }
            
            // 计算该区域占用的行数
            const numRows = Math.ceil(weapons.length / weaponsPerRow);
            currentY += numRows * (weaponItemHeight + weaponSpacing);
            
            // 每个区域之间的间距
            currentY += 20;
        }
        
        ctx.restore();
        
        // 计算总内容高度
        const numRows = Math.ceil(weapons.length / weaponsPerRow);
        const totalContentHeight = rowNames.length * (sectionTitleHeight + numRows * (weaponItemHeight + weaponSpacing) + 20);
        const maxScrollOffset = Math.max(0, totalContentHeight - scrollAreaHeight);
        
        // 绘制滚动条（如果需要）
        if (maxScrollOffset > 0) {
            const scrollbarWidth = 8;
            const scrollbarX = panelX + panelWidth - 25;
            const scrollbarHeight = Math.max(30, (scrollAreaHeight / totalContentHeight) * scrollAreaHeight);
            const scrollbarY = contentStartY + (this.weaponConfigData.scrollOffset / maxScrollOffset) * (scrollAreaHeight - scrollbarHeight);
            
            // 滚动条轨道
            ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            this.roundRect(ctx, scrollbarX, contentStartY, scrollbarWidth, scrollAreaHeight, 4);
            ctx.fill();
            
            // 滚动条滑块
            ctx.fillStyle = 'rgba(156, 39, 176, 0.8)';
            this.roundRect(ctx, scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 4);
            ctx.fill();
        }
        
        // 显示错误提示（如果有）
        if (this.weaponConfigData.errorMessage && this.weaponConfigData.errorTime) {
            const elapsed = Date.now() - this.weaponConfigData.errorTime;
            if (elapsed < 3000) { // 显示3秒
                ctx.save();
                ctx.textAlign = 'center';
                ctx.font = 'bold 20px Arial';
                
                // 背景框
                const errorBoxWidth = 450;
                const errorBoxHeight = 60;
                const errorBoxX = (this.canvas.width - errorBoxWidth) / 2;
                const errorBoxY = panelY + panelHeight - 80;
                
                ctx.fillStyle = 'rgba(244, 67, 54, 0.95)';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                this.roundRect(ctx, errorBoxX, errorBoxY, errorBoxWidth, errorBoxHeight, 8);
                ctx.fill();
                ctx.stroke();
                
                // 错误文字
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(this.weaponConfigData.errorMessage, this.canvas.width / 2, errorBoxY + 37);
                
                ctx.restore();
            } else {
                // 清除过期的错误提示
                this.weaponConfigData.errorMessage = null;
                this.weaponConfigData.errorTime = null;
            }
        }
    }
    
    // ===== 科技升级界面相关方法 =====
    
    // 处理科技升级界面滚轮
    handleTechUpgradeScroll(event) {
        const scrollSpeed = 30;
        this.techUpgradeData.scrollOffset += event.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        
        // 计算最大滚动偏移
        const maxScroll = this.calculateTechUpgradeMaxScroll();
        this.techUpgradeData.scrollOffset = Math.max(0, Math.min(maxScroll, this.techUpgradeData.scrollOffset));
    }
    
    // 计算科技升级界面的最大滚动偏移
    calculateTechUpgradeMaxScroll() {
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const scrollAreaHeight = panelHeight - 200;
        
        if (!this.techUpgradeData.selectedWeapon) {
            // 武器选择界面
            const weaponCardHeight = 100;
            const weaponSpacing = 15;
            const weaponsPerRow = 3;
            const weapons = Object.keys(WeaponPresets);
            const numRows = Math.ceil(weapons.length / weaponsPerRow);
            const totalHeight = numRows * (weaponCardHeight + weaponSpacing);
            return Math.max(0, totalHeight - scrollAreaHeight + 50);
        } else {
            // 科技列表界面
            const techSystem = window.game ? window.game.techSystem : null;
            if (!techSystem) return 0;
            
            const techCardHeight = 140;
            const techSpacing = 15;
            const techs = techSystem.getWeaponTechs(this.techUpgradeData.selectedWeapon);
            const totalHeight = techs.length * (techCardHeight + techSpacing);
            return Math.max(0, totalHeight - scrollAreaHeight + 50);
        }
    }
    
    // 处理科技升级界面鼠标悬停
    handleTechUpgradeHover(mouseX, mouseY) {
        // 实现悬停逻辑（用于显示详细信息）
        this.techUpgradeData.hoveredTech = null;
    }
    
    // 处理科技升级界面点击
    handleTechUpgradeClick(mouseX, mouseY) {
        const panelWidth = Math.min(900, this.canvas.width * 0.9);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 关闭按钮
        const closeButtonX = panelX + panelWidth - 50;
        const closeButtonY = panelY + 10;
        const closeButtonSize = 35;
        if (mouseX >= closeButtonX && mouseX <= closeButtonX + closeButtonSize &&
            mouseY >= closeButtonY && mouseY <= closeButtonY + closeButtonSize) {
            this.showingTechUpgrade = false;
            this.techUpgradeData.selectedWeapon = null;
            return;
        }
        
        // 返回按钮（在选中武器后显示）
        if (this.techUpgradeData.selectedWeapon) {
            const backButtonX = panelX + 20;
            const backButtonY = panelY + 10;
            const backButtonWidth = 80;
            const backButtonHeight = 35;
            if (mouseX >= backButtonX && mouseX <= backButtonX + backButtonWidth &&
                mouseY >= backButtonY && mouseY <= backButtonY + backButtonHeight) {
                this.techUpgradeData.selectedWeapon = null;
                this.techUpgradeData.scrollOffset = 0;
                return;
            }
        }
        
        const player = window.game ? window.game.player : null;
        const techSystem = window.game ? window.game.techSystem : null;
        if (!player || !techSystem) return;
        
        const contentStartY = panelY + 150;
        const scrollAreaHeight = panelHeight - 200;
        
        if (mouseX < panelX + 20 || mouseX > panelX + panelWidth - 20 ||
            mouseY < contentStartY || mouseY > contentStartY + scrollAreaHeight) {
            return;
        }
        
        if (!this.techUpgradeData.selectedWeapon) {
            // 武器选择阶段
            this.handleWeaponSelection(mouseX, mouseY, panelX, panelWidth, contentStartY);
        } else {
            // 科技升级阶段
            this.handleTechUpgradeAction(mouseX, mouseY, panelX, panelWidth, contentStartY, player, techSystem);
        }
    }
    
    // 处理武器选择
    handleWeaponSelection(mouseX, mouseY, panelX, panelWidth, contentStartY) {
        const weapons = Object.keys(WeaponPresets);
        const weaponCardWidth = (panelWidth - 100) / 3;
        const weaponCardHeight = 100;
        const weaponSpacing = 15;
        const weaponsPerRow = 3;
        
        const relativeMouseY = mouseY - contentStartY;
        
        for (let i = 0; i < weapons.length; i++) {
            const col = i % weaponsPerRow;
            const row = Math.floor(i / weaponsPerRow);
            
            const cardX = panelX + 40 + col * (weaponCardWidth + weaponSpacing);
            const cardY = -this.techUpgradeData.scrollOffset + row * (weaponCardHeight + weaponSpacing);
            
            if (mouseX >= cardX && mouseX <= cardX + weaponCardWidth &&
                relativeMouseY >= cardY && relativeMouseY <= cardY + weaponCardHeight) {
                this.techUpgradeData.selectedWeapon = weapons[i];
                this.techUpgradeData.scrollOffset = 0;
                
                if (typeof audioSystem !== 'undefined') {
                    audioSystem.playButtonSound();
                }
                break;
            }
        }
    }
    
    // 处理科技升级操作
    handleTechUpgradeAction(mouseX, mouseY, panelX, panelWidth, contentStartY, player, techSystem) {
        const techs = techSystem.getWeaponTechs(this.techUpgradeData.selectedWeapon);
        const techCardHeight = 140;
        const techSpacing = 15;
        const techCardWidth = panelWidth - 80;
        
        const relativeMouseY = mouseY - contentStartY;
        
        for (let i = 0; i < techs.length; i++) {
            const cardY = -this.techUpgradeData.scrollOffset + i * (techCardHeight + techSpacing);
            const cardX = panelX + 40;
            
            if (mouseX >= cardX && mouseX <= cardX + techCardWidth &&
                relativeMouseY >= cardY && relativeMouseY <= cardY + techCardHeight) {
                
                const techInfo = techs[i];
                const result = techSystem.canUpgrade(techInfo.id);
                
                if (!result.success) {
                    this.showTechMessage(result.reason, 'error');
                    if (typeof audioSystem !== 'undefined') {
                        audioSystem.playButtonSound();
                    }
                    return;
                }
                
                // 执行升级
                const upgradeResult = techSystem.upgrade(techInfo.id);
                if (upgradeResult.success) {
                    this.showTechMessage(`升级成功！当前等级: ${upgradeResult.newLevel}`, 'success');
                    
                    // 重新初始化武器以应用升级
                    if (window.game && window.game.weaponSystem) {
                        window.game.weaponSystem.initializeWeapons();
                    }
                    
                    if (typeof audioSystem !== 'undefined') {
                        audioSystem.playButtonSound();
                    }
                } else {
                    this.showTechMessage(upgradeResult.reason || '升级失败', 'error');
                }
                break;
            }
        }
    }
    
    // 显示科技升级消息
    showTechMessage(message, type) {
        this.techUpgradeData.message = message;
        this.techUpgradeData.messageTime = Date.now();
        this.techUpgradeData.messageType = type;
    }
    
    // 绘制科技升级界面
    drawTechUpgradeScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const panelWidth = Math.min(900, this.canvas.width * 0.9);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = '#1a1a3e';
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 标题
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF5722';
        const titleText = this.techUpgradeData.selectedWeapon ? 
            `${WeaponPresets[this.techUpgradeData.selectedWeapon].name} - 科技升级` : 
            '科技升级 - 选择武器';
        ctx.fillText(titleText, this.canvas.width / 2, panelY + 40);
        
        // 关闭按钮
        ctx.fillStyle = '#FF5252';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        const closeButtonX = panelX + panelWidth - 50;
        const closeButtonY = panelY + 10;
        const closeButtonSize = 35;
        this.roundRect(ctx, closeButtonX, closeButtonY, closeButtonSize, closeButtonSize, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('×', closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2 + 2);
        
        // 返回按钮（在选中武器后显示）
        if (this.techUpgradeData.selectedWeapon) {
            const backButtonX = panelX + 20;
            const backButtonY = panelY + 10;
            const backButtonWidth = 80;
            const backButtonHeight = 35;
            
            ctx.fillStyle = '#607D8B';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            this.roundRect(ctx, backButtonX, backButtonY, backButtonWidth, backButtonHeight, 5);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('← 返回', backButtonX + backButtonWidth / 2, backButtonY + backButtonHeight / 2 + 2);
        }
        
        const player = window.game ? window.game.player : null;
        const techSystem = window.game ? window.game.techSystem : null;
        
        if (!player || !techSystem) {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#FF5252';
            ctx.textAlign = 'center';
            ctx.fillText('游戏系统未加载', this.canvas.width / 2, panelY + 200);
            return;
        }
        
        // 绘制资源信息
        this.drawResourceInfo(ctx, panelX, panelY, panelWidth, player);
        
        // 绘制滚动内容
        const contentStartY = panelY + 150;
        const scrollAreaHeight = panelHeight - 200;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX + 20, contentStartY, panelWidth - 40, scrollAreaHeight);
        ctx.clip();
        
        if (!this.techUpgradeData.selectedWeapon) {
            this.drawWeaponSelection(ctx, panelX, panelWidth, contentStartY, techSystem);
        } else {
            this.drawTechList(ctx, panelX, panelWidth, contentStartY, player, techSystem);
        }
        
        ctx.restore();
        
        // 绘制滚动条
        this.drawTechUpgradeScrollbar(ctx, panelX, panelWidth, contentStartY, scrollAreaHeight);
        
        // 显示消息提示
        this.drawTechMessage(ctx, panelX, panelY, panelWidth, panelHeight);
    }
    
    // 绘制资源信息
    drawResourceInfo(ctx, panelX, panelY, panelWidth, player) {
        const resources = player.getAllResources();
        const resourceNames = { iron: '铁', copper: '铜', cobalt: '钴', nickel: '镍', gold: '金' };
        const resourceColors = { iron: '#B0B0B0', copper: '#CD7F32', cobalt: '#0047AB', nickel: '#C0C0C0', gold: '#FFD700' };
        
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        
        let x = panelX + 40;
        const y = panelY + 90;
        
        for (const [type, name] of Object.entries(resourceNames)) {
            ctx.fillStyle = resourceColors[type];
            ctx.fillText(`${name}: ${resources[type]}`, x, y);
            x += 120;
        }
    }
    
    // 绘制武器选择
    drawWeaponSelection(ctx, panelX, panelWidth, contentStartY, techSystem) {
        const weapons = Object.keys(WeaponPresets);
        const weaponCardWidth = (panelWidth - 100) / 3;
        const weaponCardHeight = 100;
        const weaponSpacing = 15;
        const weaponsPerRow = 3;
        
        for (let i = 0; i < weapons.length; i++) {
            const weaponKey = weapons[i];
            const weapon = WeaponPresets[weaponKey];
            const col = i % weaponsPerRow;
            const row = Math.floor(i / weaponsPerRow);
            
            const cardX = panelX + 40 + col * (weaponCardWidth + weaponSpacing);
            const cardY = contentStartY - this.techUpgradeData.scrollOffset + row * (weaponCardHeight + weaponSpacing);
            
            // 武器卡片背景
            ctx.fillStyle = '#2a2a4e';
            ctx.strokeStyle = weapon.color;
            ctx.lineWidth = 2;
            this.roundRect(ctx, cardX, cardY, weaponCardWidth, weaponCardHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // 武器颜色条
            ctx.fillStyle = weapon.color;
            ctx.fillRect(cardX, cardY, weaponCardWidth, 6);
            
            // 武器名称
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(weapon.name, cardX + weaponCardWidth / 2, cardY + 35);
            
            // 科技数量
            const techs = techSystem.getWeaponTechs(weaponKey);
            const upgradedCount = techs.filter(t => t.currentLevel > 0).length;
            ctx.font = '14px Arial';
            ctx.fillStyle = '#AAAAAA';
            ctx.fillText(`${upgradedCount}/${techs.length} 已升级`, cardX + weaponCardWidth / 2, cardY + 60);
            
            // 最大等级进度
            let totalLevel = 0;
            let maxTotalLevel = 0;
            techs.forEach(t => {
                totalLevel += t.currentLevel;
                maxTotalLevel += t.tech.maxLevel;
            });
            ctx.fillStyle = upgradedCount > 0 ? '#4CAF50' : '#666666';
            ctx.fillText(`等级: ${totalLevel}/${maxTotalLevel}`, cardX + weaponCardWidth / 2, cardY + 82);
        }
    }
    
    // 绘制科技列表
    drawTechList(ctx, panelX, panelWidth, contentStartY, player, techSystem) {
        const techs = techSystem.getWeaponTechs(this.techUpgradeData.selectedWeapon);
        const techCardHeight = 140;
        const techSpacing = 15;
        const techCardWidth = panelWidth - 80;
        
        for (let i = 0; i < techs.length; i++) {
            const techInfo = techs[i];
            const tech = techInfo.tech;
            const currentLevel = techInfo.currentLevel;
            
            const cardY = contentStartY - this.techUpgradeData.scrollOffset + i * (techCardHeight + techSpacing);
            const cardX = panelX + 40;
            
            // 科技卡片背景
            const isMaxLevel = currentLevel >= tech.maxLevel;
            ctx.fillStyle = isMaxLevel ? '#1a4d1a' : '#2a2a4e';
            ctx.strokeStyle = isMaxLevel ? '#4CAF50' : '#666666';
            ctx.lineWidth = 2;
            this.roundRect(ctx, cardX, cardY, techCardWidth, techCardHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // 科技名称
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(tech.name, cardX + 15, cardY + 25);
            
            // 等级显示
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = isMaxLevel ? '#4CAF50' : '#FFD700';
            ctx.fillText(`Lv ${currentLevel}/${tech.maxLevel}`, cardX + techCardWidth - 15, cardY + 25);
            
            // 描述
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#CCCCCC';
            ctx.fillText(tech.description, cardX + 15, cardY + 50);
            
            // 当前属性值（如果已升级）
            if (currentLevel > 0) {
                const currentValues = tech.getUpgradeValues(currentLevel);
                if (currentValues) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillText(`当前: ${this.formatUpgradeValues(currentValues)}`, cardX + 15, cardY + 75);
                }
            }
            
            // 下一级属性值和消耗
            if (!isMaxLevel) {
                const nextLevel = currentLevel + 1;
                const nextValues = tech.getUpgradeValues(nextLevel);
                const cost = tech.getCost(nextLevel);
                
                if (nextValues) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText(`下一级: ${this.formatUpgradeValues(nextValues)}`, cardX + 15, cardY + 95);
                }
                
                if (cost) {
                    const canAfford = this.canAffordUpgrade(player, cost);
                    ctx.fillStyle = canAfford ? '#FFFFFF' : '#FF5252';
                    ctx.fillText(`消耗: ${this.formatCost(cost)}`, cardX + 15, cardY + 115);
                    
                    // 升级按钮（悬停效果在点击时处理）
                    const buttonWidth = 100;
                    const buttonHeight = 35;
                    const buttonX = cardX + techCardWidth - buttonWidth - 15;
                    const buttonY = cardY + 95;
                    
                    ctx.fillStyle = canAfford ? '#FF5722' : '#666666';
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 5);
                    ctx.fill();
                    ctx.stroke();
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(canAfford ? '升级' : '资源不足', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 2);
                }
            } else {
                ctx.fillStyle = '#4CAF50';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('✓ 已满级', cardX + techCardWidth / 2, cardY + 105);
            }
        }
    }
    
    // 格式化升级数值
    formatUpgradeValues(values) {
        const parts = [];
        for (const [key, value] of Object.entries(values)) {
            const name = this.getAttributeName(key);
            const formatted = this.formatAttributeValue(key, value);
            parts.push(`${name} ${formatted}`);
        }
        return parts.join(', ');
    }
    
    // 获取属性名称
    getAttributeName(key) {
        const names = {
            damage: '伤害',
            cooldown: '冷却',
            bulletSpeed: '速度',
            bulletsPerShot: '子弹数',
            burstCount: '连发',
            centerSpreadAngle: '中心散射',
            bulletSpreadAngle: '散射角',
            penetration: '穿透',
            explosionRadius: '爆炸范围',
            trackingAngularSpeed: '追踪速度'
        };
        return names[key] || key;
    }
    
    // 格式化属性值
    formatAttributeValue(key, value) {
        if (key === 'cooldown') {
            return `${(value / 1000).toFixed(1)}s`;
        } else if (key.includes('Angle')) {
            return `${value.toFixed(1)}°`;
        } else if (key === 'trackingAngularSpeed') {
            return `${value}°/s`;
        }
        return value.toString();
    }
    
    // 格式化消耗
    formatCost(cost) {
        const parts = [];
        const names = { iron: '铁', copper: '铜', cobalt: '钴', nickel: '镍', gold: '金' };
        for (const [type, amount] of Object.entries(cost)) {
            parts.push(`${names[type] || type}:${amount}`);
        }
        return parts.join(', ');
    }
    
    // 检查是否能支付升级费用
    canAffordUpgrade(player, cost) {
        for (const [type, amount] of Object.entries(cost)) {
            if (!player.hasResource(type, amount)) {
                return false;
            }
        }
        return true;
    }
    
    // 绘制滚动条
    drawTechUpgradeScrollbar(ctx, panelX, panelWidth, contentStartY, scrollAreaHeight) {
        const maxScroll = this.calculateTechUpgradeMaxScroll();
        if (maxScroll <= 0) return;
        
        const scrollbarWidth = 8;
        const scrollbarX = panelX + panelWidth - 25;
        const totalContentHeight = scrollAreaHeight + maxScroll;
        const scrollbarHeight = Math.max(30, (scrollAreaHeight / totalContentHeight) * scrollAreaHeight);
        const scrollbarY = contentStartY + (this.techUpgradeData.scrollOffset / maxScroll) * (scrollAreaHeight - scrollbarHeight);
        
        // 滚动条轨道
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.roundRect(ctx, scrollbarX, contentStartY, scrollbarWidth, scrollAreaHeight, 4);
        ctx.fill();
        
        // 滚动条滑块
        ctx.fillStyle = 'rgba(255, 87, 34, 0.8)';
        this.roundRect(ctx, scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 4);
        ctx.fill();
    }
    
    // 绘制消息提示
    drawTechMessage(ctx, panelX, panelY, panelWidth, panelHeight) {
        if (!this.techUpgradeData.message || !this.techUpgradeData.messageTime) return;
        
        const elapsed = Date.now() - this.techUpgradeData.messageTime;
        if (elapsed >= 3000) {
            this.techUpgradeData.message = null;
            this.techUpgradeData.messageTime = null;
            return;
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Arial';
        
        const messageBoxWidth = 400;
        const messageBoxHeight = 50;
        const messageBoxX = (this.canvas.width - messageBoxWidth) / 2;
        const messageBoxY = panelY + panelHeight - 70;
        
        const bgColor = this.techUpgradeData.messageType === 'success' ? 
            'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)';
        
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.roundRect(ctx, messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.techUpgradeData.message, this.canvas.width / 2, messageBoxY + 30);
        
        ctx.restore();
    }
    
    // 激活大厅
    activate() {
        this.isActive = true;
        this.showingHelp = false;
        this.showingWeaponConfig = false;
        this.showingTechUpgrade = false;
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('click', this.boundMouseClick);
        this.canvas.addEventListener('wheel', this.boundMouseWheel);
    }
    
    // 停用大厅
    deactivate() {
        this.isActive = false;
        this.canvas.style.cursor = 'default';
        this.canvas.removeEventListener('mousemove', this.boundMouseMove);
        this.canvas.removeEventListener('click', this.boundMouseClick);
        this.canvas.removeEventListener('wheel', this.boundMouseWheel);
    }
    
    // 清理资源
    destroy() {
        this.deactivate();
    }
}
