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
            armory: {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: '军械库',
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
        
        // 关卡选择界面状态
        this.showingLevelSelection = false;
        this.levelSelectionData = {
            scrollOffset: 0,
            hoveredLevel: null
        };
        
        // 军械库界面状态
        this.showingArmory = false;
        this.armoryData = {
            scrollOffset: 0,
            message: null,
            messageTime: null,
            messageType: 'success' // 'success' or 'error'
        };
        
        // 装配强化界面状态
        this.showingEquipment = false;
        this.equipmentData = {
            selectedSlot: null, // 当前选中的槽位键位
            message: null,
            messageTime: null,
            messageType: 'success', // 'success' or 'error'
            scrollOffset: 0, // 因子列表滚动偏移量
            maxScroll: 0 // 最大滚动距离
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
        
        this.buttons.armory.x = centerX - this.buttons.armory.width / 2;
        this.buttons.armory.y = startY + buttonSpacing * 3;
    }
    
    // 处理鼠标移动
    handleMouseMove(event) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // 如果在特殊界面，显示指针
        if (this.showingWeaponConfig || this.showingTechUpgrade) {
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
        
        // 如果正在显示关卡选择界面
        if (this.showingLevelSelection) {
            this.handleLevelSelectionClick(mouseX, mouseY);
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
        
        // 如果正在显示军械库界面
        if (this.showingArmory) {
            this.handleArmoryClick(mouseX, mouseY);
            return;
        }
        
        // 如果正在显示装配强化界面
        if (this.showingEquipment) {
            this.handleEquipmentClick(mouseX, mouseY);
            return;
        }
        
        // 检查点击了哪个按钮
        if (this.isPointInButton(mouseX, mouseY, this.buttons.start)) {
            // 显示关卡选择界面
            this.showingLevelSelection = true;
            this.levelSelectionData.scrollOffset = 0;
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.weaponConfig)) {
            this.showingWeaponConfig = true;
            this.weaponConfigData.selectedRow = null;
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.techUpgrade)) {
            this.showingTechUpgrade = true;
            this.techUpgradeData.selectedWeapon = null;
        } else if (this.isPointInButton(mouseX, mouseY, this.buttons.armory)) {
            this.showingArmory = true;
            this.armoryData.scrollOffset = 0;
        }
    }
    
    // 处理鼠标滚轮事件
    handleMouseWheel(event) {
        // 在武器配置、科技升级、关卡选择、军械库或装备界面处理滚轮
        if (!this.showingWeaponConfig && !this.showingTechUpgrade && !this.showingLevelSelection && !this.showingArmory && !this.showingEquipment) return;
        
        event.preventDefault();
        
        // 关卡选择界面的滚轮处理
        if (this.showingLevelSelection) {
            this.handleLevelSelectionScroll(event);
            return;
        }
        
        // 科技升级界面的滚轮处理
        if (this.showingTechUpgrade) {
            this.handleTechUpgradeScroll(event);
            return;
        }
        
        // 军械库界面的滚轮处理
        if (this.showingArmory) {
            this.handleArmoryScroll(event);
            return;
        }
        
        // 装备界面的滚轮处理
        if (this.showingEquipment) {
            this.handleEquipmentScroll(event);
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
        
        // 如果显示关卡选择界面
        if (this.showingLevelSelection) {
            this.drawLevelSelectionScreen(ctx);
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
        
        // 如果显示军械库界面
        if (this.showingArmory) {
            this.drawArmoryScreen(ctx);
            return;
        }
        
        // 如果显示装配强化界面
        if (this.showingEquipment) {
            this.drawEquipmentScreen(ctx);
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
                    
                    // 检查武器是否已解锁
                    if (!player.isWeaponUnlocked(weaponKey)) {
                        // 武器未解锁，显示错误提示
                        this.weaponConfigData.errorMessage = '武器未解锁，请前往科技升级界面解锁';
                        this.weaponConfigData.errorTime = Date.now();
                        
                        // 播放错误音效
                        if (typeof audioSystem !== 'undefined') {
                            audioSystem.playButtonSound();
                        }
                        return;
                    }
                    
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
                
                // 检查武器是否已解锁
                const isUnlocked = player.isWeaponUnlocked(weaponKey);
                
                // 检查是否是当前装备的武器
                const isEquipped = currentWeapon && currentWeapon.name === weapon.name;
                
                // 武器卡片背景（未解锁时变暗）
                if (!isUnlocked) {
                    ctx.fillStyle = '#1a1a2e';
                    ctx.strokeStyle = '#666666';
                } else {
                    ctx.fillStyle = isEquipped ? '#3a3a6e' : '#2a2a4e';
                    ctx.strokeStyle = isEquipped ? '#9C27B0' : '#444466';
                }
                ctx.lineWidth = isEquipped ? 3 : 2;
                this.roundRect(ctx, itemX, itemY, weaponItemWidth, weaponItemHeight, 8);
                ctx.fill();
                ctx.stroke();
                
                // 武器颜色条
                ctx.fillStyle = isUnlocked ? weapon.color : '#555555';
                ctx.fillRect(itemX, itemY, weaponItemWidth, 6);
                
                // 未解锁时添加锁定图标和遮罩
                if (!isUnlocked) {
                    // 半透明遮罩
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    this.roundRect(ctx, itemX, itemY + 6, weaponItemWidth, weaponItemHeight - 6, 8);
                    ctx.fill();
                    
                    // 锁定图标
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔒', itemX + weaponItemWidth / 2, itemY + weaponItemHeight / 2);
                }
                
                // 武器名称
                ctx.fillStyle = isUnlocked ? '#FFFFFF' : '#888888';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(weapon.name, itemX + 10, itemY + 12);
                
                // 装备标记
                if (isEquipped && isUnlocked) {
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
            const weaponCardHeight = 140; // 更新为新的高度
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
        const player = window.game ? window.game.player : null;
        if (!player) return;
        
        const weapons = Object.keys(WeaponPresets);
        const weaponCardWidth = (panelWidth - 100) / 3;
        const weaponCardHeight = 140; // 与绘制时保持一致
        const weaponSpacing = 15;
        const weaponsPerRow = 3;
        
        const relativeMouseY = mouseY - contentStartY;
        
        for (let i = 0; i < weapons.length; i++) {
            const weaponKey = weapons[i];
            const weapon = WeaponPresets[weaponKey];
            const col = i % weaponsPerRow;
            const row = Math.floor(i / weaponsPerRow);
            
            const cardX = panelX + 40 + col * (weaponCardWidth + weaponSpacing);
            const cardY = -this.techUpgradeData.scrollOffset + row * (weaponCardHeight + weaponSpacing);
            
            if (mouseX >= cardX && mouseX <= cardX + weaponCardWidth &&
                relativeMouseY >= cardY && relativeMouseY <= cardY + weaponCardHeight) {
                
                const isUnlocked = player.isWeaponUnlocked(weaponKey);
                
                if (!isUnlocked) {
                    // 点击了未解锁的武器，检查是否点击解锁按钮
                    const buttonWidth = weaponCardWidth - 40;
                    const buttonHeight = 30;
                    const buttonX = cardX + 20;
                    const buttonY = cardY + weaponCardHeight - 40;
                    
                    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                        relativeMouseY >= buttonY && relativeMouseY <= buttonY + buttonHeight) {
                        // 点击了解锁按钮
                        const unlockCost = weapon.unlockCost || {};
                        const result = player.unlockWeapon(weaponKey, unlockCost);
                        
                        if (result.success) {
                            this.showTechMessage(`成功解锁 ${weapon.name}！`, 'success');
                            
                            if (typeof audioSystem !== 'undefined') {
                                audioSystem.playButtonSound();
                            }
                        } else {
                            this.showTechMessage(result.message, 'error');
                            
                            if (typeof audioSystem !== 'undefined') {
                                audioSystem.playButtonSound();
                            }
                        }
                    } else {
                        // 点击了卡片其他区域
                        this.showTechMessage('请先解锁该武器', 'error');
                    }
                } else {
                    // 已解锁，选择该武器查看科技
                    this.techUpgradeData.selectedWeapon = weaponKey;
                    this.techUpgradeData.scrollOffset = 0;
                    
                    if (typeof audioSystem !== 'undefined') {
                        audioSystem.playButtonSound();
                    }
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
        const player = window.game ? window.game.player : null;
        if (!player) return;
        
        const weapons = Object.keys(WeaponPresets);
        const weaponCardWidth = (panelWidth - 100) / 3;
        const weaponCardHeight = 140; // 增加高度以容纳解锁按钮
        const weaponSpacing = 15;
        const weaponsPerRow = 3;
        
        for (let i = 0; i < weapons.length; i++) {
            const weaponKey = weapons[i];
            const weapon = WeaponPresets[weaponKey];
            const col = i % weaponsPerRow;
            const row = Math.floor(i / weaponsPerRow);
            
            const cardX = panelX + 40 + col * (weaponCardWidth + weaponSpacing);
            const cardY = contentStartY - this.techUpgradeData.scrollOffset + row * (weaponCardHeight + weaponSpacing);
            
            const isUnlocked = player.isWeaponUnlocked(weaponKey);
            
            // 武器卡片背景
            ctx.fillStyle = isUnlocked ? '#2a2a4e' : '#1a1a2e';
            ctx.strokeStyle = isUnlocked ? weapon.color : '#666666';
            ctx.lineWidth = 2;
            this.roundRect(ctx, cardX, cardY, weaponCardWidth, weaponCardHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // 武器颜色条
            ctx.fillStyle = isUnlocked ? weapon.color : '#555555';
            ctx.fillRect(cardX, cardY, weaponCardWidth, 6);
            
            // 武器名称
            ctx.fillStyle = isUnlocked ? '#FFFFFF' : '#888888';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(weapon.name, cardX + weaponCardWidth / 2, cardY + 30);
            
            if (!isUnlocked) {
                // 未解锁状态
                const unlockCost = weapon.unlockCost || {};
                const hasCost = Object.keys(unlockCost).length > 0;
                
                if (hasCost) {
                    // 显示解锁消耗
                    ctx.font = '12px Arial';
                    ctx.fillStyle = '#AAAAAA';
                    ctx.fillText('解锁消耗：', cardX + weaponCardWidth / 2, cardY + 55);
                    
                    const resourceNames = { iron: '铁', copper: '铜', cobalt: '钴', nickel: '镍', gold: '金' };
                    let costText = [];
                    for (const [type, amount] of Object.entries(unlockCost)) {
                        if (amount > 0) {
                            const hasEnough = player.resources[type] >= amount;
                            costText.push(`${resourceNames[type]}:${amount}`);
                        }
                    }
                    
                    ctx.font = '13px Arial';
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText(costText.join(' '), cardX + weaponCardWidth / 2, cardY + 75);
                    
                    // 绘制解锁按钮
                    const buttonWidth = weaponCardWidth - 40;
                    const buttonHeight = 30;
                    const buttonX = cardX + 20;
                    const buttonY = cardY + weaponCardHeight - 40;
                    
                    // 检查是否能解锁
                    let canUnlock = true;
                    for (const [type, amount] of Object.entries(unlockCost)) {
                        if (player.resources[type] < amount) {
                            canUnlock = false;
                            break;
                        }
                    }
                    
                    ctx.fillStyle = canUnlock ? '#4CAF50' : '#666666';
                    this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 5);
                    ctx.fill();
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 14px Arial';
                    ctx.fillText(canUnlock ? '🔓 解锁武器' : '资源不足', cardX + weaponCardWidth / 2, buttonY + 19);
                } else {
                    // 免费武器，不应该出现这种情况
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#FF6B6B';
                    ctx.fillText('错误：免费武器未解锁', cardX + weaponCardWidth / 2, cardY + 65);
                }
            } else {
                // 已解锁，显示科技信息
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
                
                // 点击查看科技按钮
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#FF5722';
                ctx.fillText('点击查看科技 >', cardX + weaponCardWidth / 2, cardY + 110);
            }
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
                const currentValues = tech.getTotalUpgrade(currentLevel);
                if (currentValues) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillText(`当前加成: ${this.formatUpgradeValues(currentValues)}`, cardX + 15, cardY + 75);
                }
            }
            
            // 下一级属性值和消耗
            if (!isMaxLevel) {
                const nextLevel = currentLevel + 1;
                const nextValues = tech.getTotalUpgrade(nextLevel);
                const cost = tech.getCost(nextLevel);
                
                if (nextValues) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText(`下一级加成: ${this.formatUpgradeValues(nextValues)}`, cardX + 15, cardY + 95);
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
    
    // ===== 关卡选择界面相关方法 =====
    
    // 处理关卡选择滚轮
    handleLevelSelectionScroll(event) {
        const scrollSpeed = 30;
        this.levelSelectionData.scrollOffset += event.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        
        // 计算最大滚动偏移
        const maxScroll = this.calculateLevelSelectionMaxScroll();
        this.levelSelectionData.scrollOffset = Math.max(0, Math.min(maxScroll, this.levelSelectionData.scrollOffset));
    }
    
    // 计算关卡选择界面的最大滚动偏移
    calculateLevelSelectionMaxScroll() {
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const scrollAreaHeight = panelHeight - 120;
        
        const levelSystem = window.game && window.game.levelSystem ? window.game.levelSystem : null;
        if (!levelSystem) return 0;
        
        const levels = levelSystem.getAllLevels();
        const levelCardHeight = 200;
        const levelSpacing = 20;
        const totalHeight = levels.length * (levelCardHeight + levelSpacing);
        
        return Math.max(0, totalHeight - scrollAreaHeight + 50);
    }
    
    // 处理关卡选择点击
    handleLevelSelectionClick(mouseX, mouseY) {
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
            this.showingLevelSelection = false;
            return;
        }
        
        const levelSystem = window.game && window.game.levelSystem ? window.game.levelSystem : null;
        if (!levelSystem) return;
        
        const contentStartY = panelY + 100;
        const scrollAreaHeight = panelHeight - 120;
        
        if (mouseX < panelX + 20 || mouseX > panelX + panelWidth - 20 ||
            mouseY < contentStartY || mouseY > contentStartY + scrollAreaHeight) {
            return;
        }
        
        const levels = levelSystem.getAllLevels();
        const levelCardHeight = 200;
        const levelSpacing = 20;
        const levelCardWidth = panelWidth - 80;
        
        const relativeMouseY = mouseY - contentStartY;
        
        for (let i = 0; i < levels.length; i++) {
            const cardY = -this.levelSelectionData.scrollOffset + i * (levelCardHeight + levelSpacing);
            const cardX = panelX + 40;
            
            // 计算"进入"按钮的位置
            const buttonWidth = 120;
            const buttonHeight = 40;
            const buttonX = cardX + levelCardWidth - buttonWidth - 20;
            const buttonY = cardY + levelCardHeight - buttonHeight - 15;
            
            // 检查鼠标是否点击了按钮（使用相对坐标）
            if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                relativeMouseY >= buttonY && relativeMouseY <= buttonY + buttonHeight) {
                
                // 选中关卡，开始游戏
                this.showingLevelSelection = false;
                if (this.onStartGame) {
                    // 传递关卡ID给游戏系统
                    this.selectedLevelId = levels[i].id;
                    this.onStartGame(levels[i].id);
                }
                
                if (typeof audioSystem !== 'undefined') {
                    audioSystem.playButtonSound();
                }
                break;
            }
        }
    }
    
    // 绘制关卡选择界面
    drawLevelSelectionScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const panelWidth = Math.min(900, this.canvas.width * 0.9);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = '#1a1a3e';
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 标题
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('选择关卡', this.canvas.width / 2, panelY + 40);
        
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
        
        const levelSystem = window.game && window.game.levelSystem ? window.game.levelSystem : null;
        
        if (!levelSystem) {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#FF5252';
            ctx.textAlign = 'center';
            ctx.fillText('关卡系统未加载', this.canvas.width / 2, panelY + 200);
            return;
        }
        
        // 绘制滚动内容
        const contentStartY = panelY + 100;
        const scrollAreaHeight = panelHeight - 120;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX + 20, contentStartY, panelWidth - 40, scrollAreaHeight);
        ctx.clip();
        
        this.drawLevelCards(ctx, panelX, panelWidth, contentStartY, levelSystem);
        
        ctx.restore();
        
        // 绘制滚动条
        this.drawLevelSelectionScrollbar(ctx, panelX, panelWidth, contentStartY, scrollAreaHeight);
    }
    
    // 绘制关卡卡片
    drawLevelCards(ctx, panelX, panelWidth, contentStartY, levelSystem) {
        const levels = levelSystem.getAllLevels();
        const levelCardHeight = 200;
        const levelSpacing = 20;
        const levelCardWidth = panelWidth - 80;
        
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const cardY = contentStartY - this.levelSelectionData.scrollOffset + i * (levelCardHeight + levelSpacing);
            const cardX = panelX + 40;
            
            // 关卡卡片背景
            ctx.fillStyle = '#2a2a4e';
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            this.roundRect(ctx, cardX, cardY, levelCardWidth, levelCardHeight, 10);
            ctx.fill();
            ctx.stroke();
            
            // 顶部装饰条
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cardX, cardY, levelCardWidth, 8);
            
            // 关卡名称（字号大一点）
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 26px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(level.name, cardX + 20, cardY + 40);
            
            // 难度星级（在名称右侧）
            const stars = '⭐'.repeat(level.difficulty);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(stars, cardX + levelCardWidth - 20, cardY + 40);
            
            // 关卡描述
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(level.description, cardX + 20, cardY + 70);
            
            // 关卡持续时间
            const duration = (level.duration / 1000).toFixed(0);
            ctx.fillStyle = '#AAAAAA';
            ctx.font = '15px Arial';
            ctx.fillText(`⏱️ 持续时间: ${duration}秒`, cardX + 20, cardY + 100);
            
            // 敌机类型
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('🛸 敌机类型:', cardX + 20, cardY + 125);
            
            // 获取关卡数据以读取enemyTypes
            const levelData = LevelPresets[level.id];
            if (levelData && levelData.enemyTypes) {
                let enemyX = cardX + 130;
                const enemyY = cardY + 125;
                
                levelData.enemyTypes.forEach(enemyId => {
                    const enemyData = EnemyPresets[enemyId];
                    if (enemyData) {
                        // 敌机标签背景
                        ctx.fillStyle = enemyData.color;
                        const tagText = enemyData.name;
                        ctx.font = 'bold 13px Arial';
                        const tagWidth = ctx.measureText(tagText).width + 14;
                        const tagHeight = 22;
                        this.roundRect(ctx, enemyX, enemyY - 14, tagWidth, tagHeight, 4);
                        ctx.fill();
                        
                        // 敌机标签文字
                        ctx.fillStyle = '#FFFFFF';
                        ctx.textAlign = 'left';
                        ctx.fillText(tagText, enemyX + 7, enemyY);
                        
                        enemyX += tagWidth + 6;
                    }
                });
            }
            
            // 掉落资源
            const resourceInfo = this.formatLevelResources(level);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('💎 掉落资源:', cardX + 20, cardY + 155);
            
            // 绘制资源标签
            let resourceX = cardX + 140;
            const resourceY = cardY + 155;
            const resourceNames = { iron: '铁', copper: '铜', cobalt: '钴', nickel: '镍', gold: '金' };
            const resourceColors = { iron: '#B0B0B0', copper: '#CD7F32', cobalt: '#0047AB', nickel: '#C0C0C0', gold: '#FFD700' };
            
            resourceInfo.forEach(resource => {
                const name = resourceNames[resource.type] || resource.type;
                
                // 构建显示文本：名称 + 数量范围
                let displayText;
                if (resource.minAmount === resource.maxAmount) {
                    // 固定数量
                    displayText = `${name}:${resource.maxAmount}`;
                } else {
                    // 范围数量
                    displayText = `${name}:${resource.minAmount}-${resource.maxAmount}`;
                }
                
                // 资源标签背景
                ctx.fillStyle = resourceColors[resource.type];
                ctx.font = 'bold 14px Arial';
                const tagWidth = ctx.measureText(displayText).width + 16;
                const tagHeight = 24;
                this.roundRect(ctx, resourceX, resourceY - 16, tagWidth, tagHeight, 4);
                ctx.fill();
                
                // 资源标签文字
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.fillText(displayText, resourceX + 8, resourceY);
                
                resourceX += tagWidth + 8;
            });
            
            // "进入"按钮
            const buttonWidth = 120;
            const buttonHeight = 40;
            const buttonX = cardX + levelCardWidth - buttonWidth - 20;
            const buttonY = cardY + levelCardHeight - buttonHeight - 15;
            
            ctx.fillStyle = '#4CAF50';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('进入 ▶', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        }
    }
    
    // 格式化关卡资源信息
    formatLevelResources(level) {
        const resources = [];
        const fixedTypes = new Set();
        
        // 收集固定掉落的资源类型（带数量）
        for (const [type, amount] of Object.entries(level.fixedRewards)) {
            if (amount > 0) {
                fixedTypes.add(type);
                resources.push({ 
                    type, 
                    isProbabilistic: false,
                    minAmount: amount,
                    maxAmount: amount
                });
            }
        }
        
        // 收集概率掉落的资源类型（不在固定掉落中）
        const levelData = LevelPresets[level.id];
        if (levelData && levelData.dropTable) {
            levelData.dropTable.forEach(drop => {
                if (!fixedTypes.has(drop.resourceType)) {
                    // 检查是否已存在该类型（合并多个概率掉落）
                    const existing = resources.find(r => r.type === drop.resourceType);
                    if (existing) {
                        // 合并范围
                        existing.minAmount = Math.min(existing.minAmount, drop.minAmount || 0);
                        existing.maxAmount = Math.max(existing.maxAmount, drop.maxAmount || 0);
                    } else {
                        resources.push({ 
                            type: drop.resourceType, 
                            isProbabilistic: true,
                            minAmount: 0, // 概率掉落最小值为0
                            maxAmount: drop.maxAmount || 0
                        });
                    }
                } else {
                    // 固定掉落中已有该类型，添加概率掉落的额外范围
                    const existing = resources.find(r => r.type === drop.resourceType);
                    if (existing) {
                        existing.isProbabilistic = true; // 标记为有概率部分
                        existing.minAmount = existing.minAmount; // 固定部分
                        existing.maxAmount = existing.maxAmount + (drop.maxAmount || 0); // 固定 + 概率最大值
                    }
                }
            });
        }
        
        return resources;
    }
    
    // 绘制滚动条
    drawLevelSelectionScrollbar(ctx, panelX, panelWidth, contentStartY, scrollAreaHeight) {
        const maxScroll = this.calculateLevelSelectionMaxScroll();
        if (maxScroll <= 0) return;
        
        const scrollbarWidth = 8;
        const scrollbarX = panelX + panelWidth - 25;
        const totalContentHeight = scrollAreaHeight + maxScroll;
        const scrollbarHeight = Math.max(30, (scrollAreaHeight / totalContentHeight) * scrollAreaHeight);
        const scrollbarY = contentStartY + (this.levelSelectionData.scrollOffset / maxScroll) * (scrollAreaHeight - scrollbarHeight);
        
        // 滚动条轨道
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.roundRect(ctx, scrollbarX, contentStartY, scrollbarWidth, scrollAreaHeight, 4);
        ctx.fill();
        
        // 滚动条滑块
        ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
        this.roundRect(ctx, scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 4);
        ctx.fill();
    }
    
    // ===== 军械库界面相关方法 =====
    
    // 处理军械库滚轮
    handleArmoryScroll(event) {
        const scrollSpeed = 30;
        this.armoryData.scrollOffset += event.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        
        // 计算最大滚动偏移
        const maxScroll = this.calculateArmoryMaxScroll();
        this.armoryData.scrollOffset = Math.max(0, Math.min(maxScroll, this.armoryData.scrollOffset));
    }
    
    // 计算军械库界面的最大滚动偏移
    calculateArmoryMaxScroll() {
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const scrollAreaHeight = panelHeight - 200;
        
        // 安全检查：确保 EnhancementFactors 已加载
        if (typeof EnhancementFactors === 'undefined') {
            return 0;
        }
        
        // 获取所有强化因子
        const factors = Object.values(EnhancementFactors);
        const cardHeight = 160;
        const cardSpacing = 15;
        const cardsPerRow = 2;
        const numRows = Math.ceil(factors.length / cardsPerRow);
        const totalHeight = numRows * (cardHeight + cardSpacing);
        
        return Math.max(0, totalHeight - scrollAreaHeight + 50);
    }
    
    // 处理装备界面滚轮滚动
    handleEquipmentScroll(event) {
        // 只在选中了槽位且有内容可以滚动时处理
        if (!this.equipmentData.selectedSlot || this.equipmentData.maxScroll <= 0) return;
        
        const scrollSpeed = 30;
        this.equipmentData.scrollOffset += event.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        
        // 限制滚动范围
        this.equipmentData.scrollOffset = Math.max(0, Math.min(this.equipmentData.maxScroll, this.equipmentData.scrollOffset));
    }
    
    // 处理军械库点击
    handleArmoryClick(mouseX, mouseY) {
        const panelWidth = Math.min(900, this.canvas.width * 0.9);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 装配强化按钮
        const equipButtonWidth = 140;
        const equipButtonHeight = 40;
        const equipButtonX = panelX + 20;
        const equipButtonY = panelY + 20;
        if (mouseX >= equipButtonX && mouseX <= equipButtonX + equipButtonWidth &&
            mouseY >= equipButtonY && mouseY <= equipButtonY + equipButtonHeight) {
            this.showingArmory = false;
            this.showingEquipment = true;
            this.equipmentData.selectedSlot = null;
            return;
        }
        
        // 关闭按钮
        const closeButtonX = panelX + panelWidth - 50;
        const closeButtonY = panelY + 10;
        const closeButtonSize = 35;
        if (mouseX >= closeButtonX && mouseX <= closeButtonX + closeButtonSize &&
            mouseY >= closeButtonY && mouseY <= closeButtonY + closeButtonSize) {
            this.showingArmory = false;
            return;
        }
        
        const player = window.game ? window.game.player : null;
        if (!player) return;
        
        const contentStartY = panelY + 150;
        const scrollAreaHeight = panelHeight - 200;
        
        if (mouseX < panelX + 20 || mouseX > panelX + panelWidth - 20 ||
            mouseY < contentStartY || mouseY > contentStartY + scrollAreaHeight) {
            return;
        }
        
        // 处理锻造按钮点击
        this.handleForgeAction(mouseX, mouseY, panelX, panelWidth, contentStartY, player);
    }
    
    // 处理锻造操作
    handleForgeAction(mouseX, mouseY, panelX, panelWidth, contentStartY, player) {
        // 安全检查：确保 EnhancementFactors 已加载
        if (typeof EnhancementFactors === 'undefined') {
            return;
        }
        
        const factors = Object.entries(EnhancementFactors);
        const cardWidth = (panelWidth - 100) / 2;
        const cardHeight = 160;
        const cardSpacing = 15;
        const cardsPerRow = 2;
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const scrollAreaHeight = panelHeight - 200;
        
        const relativeMouseY = mouseY - contentStartY;
        
        for (let i = 0; i < factors.length; i++) {
            const [factorId, factor] = factors[i];
            const row = Math.floor(i / cardsPerRow);
            const col = i % cardsPerRow;
            
            const cardX = panelX + 40 + col * (cardWidth + cardSpacing);
            const cardY = row * (cardHeight + cardSpacing) - this.armoryData.scrollOffset;
            
            // 检查卡片是否在可见区域内
            if (cardY + cardHeight < 0 || cardY > scrollAreaHeight) continue;
            
            const cardAbsoluteY = contentStartY + cardY;
            
            // 检查是否点击了锻造按钮
            const forgeButtonX = cardX + 10;
            const forgeButtonY = cardAbsoluteY + cardHeight - 45;
            const forgeButtonWidth = cardWidth - 20;
            const forgeButtonHeight = 35;
            
            if (mouseX >= forgeButtonX && mouseX <= forgeButtonX + forgeButtonWidth &&
                mouseY >= forgeButtonY && mouseY <= forgeButtonY + forgeButtonHeight) {
                
                // 检查是否已拥有
                if (player.hasEnhancement(factorId)) {
                    this.showArmoryMessage('已拥有该强化因子', 'error');
                    return;
                }
                
                // 尝试锻造
                const result = player.forgeEnhancement(factorId, factor.purchaseCost);
                
                if (result.success) {
                    this.showArmoryMessage('锻造成功！', 'success');
                    // 播放音效
                    if (window.audioSystem) {
                        window.audioSystem.playButtonSound();
                    }
                } else {
                    this.showArmoryMessage(result.message, 'error');
                }
                
                return;
            }
        }
    }
    
    // 显示军械库消息
    showArmoryMessage(message, type) {
        this.armoryData.message = message;
        this.armoryData.messageTime = Date.now();
        this.armoryData.messageType = type;
    }
    
    // 绘制军械库界面
    drawArmoryScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const panelWidth = Math.min(900, this.canvas.width * 0.9);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = '#1a1a3e';
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 标题
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF9800';
        ctx.fillText('军械库 - 锻造强化因子', this.canvas.width / 2, panelY + 40);
        
        // 装配强化按钮
        const equipButtonWidth = 140;
        const equipButtonHeight = 40;
        const equipButtonX = panelX + 20;
        const equipButtonY = panelY + 20;
        ctx.fillStyle = '#4CAF50';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.roundRect(ctx, equipButtonX, equipButtonY, equipButtonWidth, equipButtonHeight, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('装配强化', equipButtonX + equipButtonWidth / 2, equipButtonY + equipButtonHeight / 2 + 5);
        
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
        
        const player = window.game ? window.game.player : null;
        
        if (!player) {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('玩家数据未加载', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }
        
        // 安全检查：确保 EnhancementFactors 已加载
        if (typeof EnhancementFactors === 'undefined') {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FF5252';
            ctx.fillText('错误：强化因子数据未加载', this.canvas.width / 2, this.canvas.height / 2);
            ctx.font = '18px Arial';
            ctx.fillText('请确保 slot.js 已正确加载', this.canvas.width / 2, this.canvas.height / 2 + 30);
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
        
        this.drawEnhancementFactors(ctx, panelX, panelWidth, contentStartY, player);
        
        ctx.restore();
        
        // 绘制滚动条
        this.drawArmoryScrollbar(ctx, panelX, panelWidth, contentStartY, scrollAreaHeight);
        
        // 显示消息提示
        this.drawArmoryMessage(ctx, panelX, panelY, panelWidth, panelHeight);
    }
    
    // 绘制强化因子列表
    drawEnhancementFactors(ctx, panelX, panelWidth, contentStartY, player) {
        // 安全检查：确保 EnhancementFactors 已加载
        if (typeof EnhancementFactors === 'undefined') {
            return;
        }
        
        const factors = Object.entries(EnhancementFactors);
        const cardWidth = (panelWidth - 100) / 2;
        const cardHeight = 160;
        const cardSpacing = 15;
        const cardsPerRow = 2;
        
        for (let i = 0; i < factors.length; i++) {
            const [factorId, factor] = factors[i];
            const row = Math.floor(i / cardsPerRow);
            const col = i % cardsPerRow;
            
            const cardX = panelX + 40 + col * (cardWidth + cardSpacing);
            const cardY = contentStartY + row * (cardHeight + cardSpacing) - this.armoryData.scrollOffset;
            
            // 检查卡片是否在可见区域内
            if (cardY + cardHeight < contentStartY || cardY > contentStartY + (this.canvas.height * 0.9 - 350)) continue;
            
            const isOwned = player.hasEnhancement(factorId);
            
            // 卡片背景
            ctx.fillStyle = isOwned ? 'rgba(76, 175, 80, 0.2)' : 'rgba(50, 50, 80, 0.6)';
            ctx.strokeStyle = isOwned ? '#4CAF50' : '#FF9800';
            ctx.lineWidth = 2;
            this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 10);
            ctx.fill();
            ctx.stroke();
            
            // 因子名称
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(factor.name, cardX + 10, cardY + 25);
            
            // 已拥有标记
            if (isOwned) {
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#4CAF50';
                ctx.fillText('✓ 已拥有', cardX + cardWidth - 10, cardY + 25);
            }
            
            // 因子描述
            ctx.font = '14px Arial';
            ctx.textAlign = 'left'; // 确保文本左对齐
            ctx.fillStyle = '#CCCCCC';
            this.wrapText(ctx, factor.description, cardX + 10, cardY + 50, cardWidth - 20, 18);
            
            // 消耗资源
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#FFD700';
            const costText = this.formatCost(factor.purchaseCost);
            ctx.fillText('消耗: ' + costText, cardX + 10, cardY + 95);
            
            // 锻造按钮
            if (!isOwned) {
                const canAfford = this.canAffordUpgrade(player, factor.purchaseCost);
                ctx.fillStyle = canAfford ? '#FF9800' : '#666666';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                this.roundRect(ctx, cardX + 10, cardY + cardHeight - 45, cardWidth - 20, 35, 8);
                ctx.fill();
                ctx.stroke();
                
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('锻造', cardX + cardWidth / 2, cardY + cardHeight - 20);
            }
        }
    }
    
    // 自动换行文本
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i];
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    // 绘制滚动条
    drawArmoryScrollbar(ctx, panelX, panelWidth, contentStartY, scrollAreaHeight) {
        const maxScroll = this.calculateArmoryMaxScroll();
        if (maxScroll <= 0) return;
        
        const scrollbarWidth = 8;
        const scrollbarX = panelX + panelWidth - 25;
        const totalContentHeight = scrollAreaHeight + maxScroll;
        const scrollbarHeight = Math.max(30, (scrollAreaHeight / totalContentHeight) * scrollAreaHeight);
        const scrollbarY = contentStartY + (this.armoryData.scrollOffset / maxScroll) * (scrollAreaHeight - scrollbarHeight);
        
        // 滚动条轨道
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.roundRect(ctx, scrollbarX, contentStartY, scrollbarWidth, scrollAreaHeight, 4);
        ctx.fill();
        
        // 滚动条滑块
        ctx.fillStyle = 'rgba(255, 152, 0, 0.8)';
        this.roundRect(ctx, scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 4);
        ctx.fill();
    }
    
    // 绘制消息提示
    drawArmoryMessage(ctx, panelX, panelY, panelWidth, panelHeight) {
        if (!this.armoryData.message || !this.armoryData.messageTime) return;
        
        const elapsed = Date.now() - this.armoryData.messageTime;
        if (elapsed >= 3000) {
            this.armoryData.message = null;
            this.armoryData.messageTime = null;
            return;
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Arial';
        
        const messageBoxWidth = 400;
        const messageBoxHeight = 50;
        const messageBoxX = (this.canvas.width - messageBoxWidth) / 2;
        const messageBoxY = panelY + panelHeight - 70;
        
        const bgColor = this.armoryData.messageType === 'success' ? 
            'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)';
        
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.roundRect(ctx, messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.armoryData.message, this.canvas.width / 2, messageBoxY + 30);
        
        ctx.restore();
    }
    
    // ===== 装配强化界面相关方法 =====
    
    // 处理装配强化界面点击
    handleEquipmentClick(mouseX, mouseY) {
        const panelWidth = Math.min(1000, this.canvas.width * 0.95);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 关闭按钮
        const closeButtonX = panelX + panelWidth - 50;
        const closeButtonY = panelY + 10;
        const closeButtonSize = 35;
        if (mouseX >= closeButtonX && mouseX <= closeButtonX + closeButtonSize &&
            mouseY >= closeButtonY && mouseY <= closeButtonY + closeButtonSize) {
            this.showingEquipment = false;
            this.equipmentData.selectedSlot = null;
            return;
        }
        
        const player = window.game ? window.game.player : null;
        if (!player) return;
        
        // 左侧键盘槽位区域
        const slotAreaWidth = panelWidth * 0.55;
        const slotAreaX = panelX + 20;
        const slotAreaY = panelY + 80;
        const slotAreaHeight = panelHeight - 100;
        
        // 检查点击键位
        const keys = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
        const keySize = 40;
        const keySpacing = 8;
        const rowOffsets = [0, 25, 50]; // 每排的偏移
        
        for (let row = 0; row < keys.length; row++) {
            const rowKeys = keys[row];
            const rowWidth = rowKeys.length * (keySize + keySpacing);
            const startX = slotAreaX + (slotAreaWidth - rowWidth) / 2 + rowOffsets[row];
            const keyY = slotAreaY + 100 + row * (keySize + keySpacing + 20);
            
            for (let i = 0; i < rowKeys.length; i++) {
                const keyX = startX + i * (keySize + keySpacing);
                if (mouseX >= keyX && mouseX <= keyX + keySize &&
                    mouseY >= keyY && mouseY <= keyY + keySize) {
                    const key = rowKeys[i];
                    
                    // 检查是否已达到5个槽位限制
                    const equippedCount = player.getEquippedSlotCount();
                    const currentlyEquipped = player.getSlotEnhancement(key) !== null;
                    
                    if (!currentlyEquipped && equippedCount >= 5) {
                        this.showEquipmentMessage('最多只能装配5个槽位', 'error');
                        return;
                    }
                    
                    this.equipmentData.selectedSlot = key;
                    this.equipmentData.scrollOffset = 0; // 切换槽位时重置滚动
                    return;
                }
            }
        }
        
        // 右侧强化因子列表区域
        if (this.equipmentData.selectedSlot) {
            const factorAreaX = slotAreaX + slotAreaWidth + 20;
            const factorAreaWidth = panelWidth - slotAreaWidth - 60;
            const factorAreaY = slotAreaY + 60;
            
            // 卸载按钮
            const unequipButtonWidth = factorAreaWidth - 20;
            const unequipButtonHeight = 40;
            const unequipButtonX = factorAreaX + 10;
            const unequipButtonY = factorAreaY;
            
            if (mouseX >= unequipButtonX && mouseX <= unequipButtonX + unequipButtonWidth &&
                mouseY >= unequipButtonY && mouseY <= unequipButtonY + unequipButtonHeight) {
                const result = player.unequipSlotEnhancement(this.equipmentData.selectedSlot);
                this.showEquipmentMessage(result.message, result.success ? 'success' : 'error');
                
                // 卸载成功后重新初始化武器系统以应用变化
                if (result.success && window.game && window.game.weaponSystem) {
                    window.game.weaponSystem.initializeWeapons();
                }
                return;
            }
            
            // 强化因子列表
            const factorStartY = factorAreaY + 60;
            const factorHeight = 80;
            const factorSpacing = 10;
            const ownedFactors = player.getOwnedEnhancements();
            const listAreaHeight = panelHeight - slotAreaY - 120; // 可视区域高度
            
            for (let i = 0; i < ownedFactors.length; i++) {
                const factorId = ownedFactors[i];
                const factorY = factorStartY + i * (factorHeight + factorSpacing) - this.equipmentData.scrollOffset;
                
                // 检查是否在可视区域内
                if (factorY + factorHeight < factorStartY || factorY > factorStartY + listAreaHeight) {
                    continue; // 跳过不可见的项
                }
                
                if (mouseX >= factorAreaX + 10 && mouseX <= factorAreaX + factorAreaWidth - 10 &&
                    mouseY >= factorY && mouseY <= factorY + factorHeight) {
                    const result = player.equipSlotEnhancement(this.equipmentData.selectedSlot, factorId);
                    this.showEquipmentMessage(result.message, result.success ? 'success' : 'error');
                    
                    // 装配成功后重新初始化武器系统以应用变化
                    if (result.success && window.game && window.game.weaponSystem) {
                        window.game.weaponSystem.initializeWeapons();
                    }
                    return;
                }
            }
        }
    }
    
    // 显示装配强化消息
    showEquipmentMessage(message, type) {
        this.equipmentData.message = message;
        this.equipmentData.messageTime = Date.now();
        this.equipmentData.messageType = type;
    }
    
    // 绘制装配强化界面
    drawEquipmentScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const panelWidth = Math.min(1000, this.canvas.width * 0.95);
        const panelHeight = Math.min(700, this.canvas.height * 0.9);
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = '#1a1a3e';
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15);
        ctx.fill();
        ctx.stroke();
        
        // 标题
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('装配强化因子', this.canvas.width / 2, panelY + 40);
        
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
        
        const player = window.game ? window.game.player : null;
        
        if (!player) {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('玩家数据未加载', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }
        
        // 安全检查：确保 EnhancementFactors 已加载
        if (typeof EnhancementFactors === 'undefined') {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FF5252';
            ctx.fillText('错误：强化因子数据未加载', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }
        
        // 显示装配数量信息
        const equippedCount = player.getEquippedSlotCount();
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = equippedCount >= 5 ? '#FF5252' : '#4CAF50';
        ctx.fillText(`已装配: ${equippedCount}/5`, this.canvas.width / 2, panelY + 70);
        
        // 左侧：键盘槽位显示
        const slotAreaWidth = panelWidth * 0.55;
        const slotAreaX = panelX + 20;
        const slotAreaY = panelY + 80;
        const slotAreaHeight = panelHeight - 100;
        
        // 槽位区域背景
        ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
        this.roundRect(ctx, slotAreaX, slotAreaY, slotAreaWidth, slotAreaHeight, 10);
        ctx.fill();
        
        // 绘制键盘槽位
        this.drawKeyboardSlots(ctx, slotAreaX, slotAreaY, slotAreaWidth, player);
        
        // 右侧：强化因子列表
        const factorAreaX = slotAreaX + slotAreaWidth + 20;
        const factorAreaWidth = panelWidth - slotAreaWidth - 60;
        const factorAreaY = slotAreaY;
        
        // 因子区域背景
        ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
        this.roundRect(ctx, factorAreaX, factorAreaY, factorAreaWidth, slotAreaHeight, 10);
        ctx.fill();
        
        // 绘制强化因子列表
        this.drawFactorList(ctx, factorAreaX, factorAreaY, factorAreaWidth, slotAreaHeight, player);
        
        // 显示消息提示
        this.drawEquipmentMessage(ctx, panelX, panelY, panelWidth, panelHeight);
    }
    
    // 绘制键盘槽位
    drawKeyboardSlots(ctx, areaX, areaY, areaWidth, player) {
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('键位槽位', areaX + areaWidth / 2, areaY + 30);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('点击键位查看或更改强化因子', areaX + areaWidth / 2, areaY + 55);
        
        const keys = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
        const keySize = 40;
        const keySpacing = 8;
        const rowOffsets = [0, 25, 50]; // 每排的偏移，模拟键盘布局
        
        for (let row = 0; row < keys.length; row++) {
            const rowKeys = keys[row];
            const rowWidth = rowKeys.length * (keySize + keySpacing);
            const startX = areaX + (areaWidth - rowWidth) / 2 + rowOffsets[row];
            const keyY = areaY + 100 + row * (keySize + keySpacing + 20);
            
            for (let i = 0; i < rowKeys.length; i++) {
                const key = rowKeys[i];
                const keyX = startX + i * (keySize + keySpacing);
                const equippedFactor = player.getSlotEnhancement(key);
                const isSelected = this.equipmentData.selectedSlot === key;
                
                // 键位背景
                if (equippedFactor) {
                    ctx.fillStyle = isSelected ? '#2E7D32' : '#4CAF50';
                } else {
                    ctx.fillStyle = isSelected ? '#3a3a6e' : '#2a2a4e';
                }
                
                ctx.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
                ctx.lineWidth = isSelected ? 3 : 2;
                this.roundRect(ctx, keyX, keyY, keySize, keySize, 5);
                ctx.fill();
                ctx.stroke();
                
                // 键位字母
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(key, keyX + keySize / 2, keyY + keySize / 2);
                
                // 已装配标记
                if (equippedFactor) {
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText('✓', keyX + keySize - 8, keyY + 8);
                }
            }
        }
        
        // 选中槽位的详细信息
        if (this.equipmentData.selectedSlot) {
            const selectedKey = this.equipmentData.selectedSlot;
            const equippedFactorId = player.getSlotEnhancement(selectedKey);
            
            const infoY = areaY + 100 + 3 * (keySize + keySpacing + 20) + 20;
            
            ctx.fillStyle = 'rgba(50, 50, 80, 0.8)';
            this.roundRect(ctx, areaX + 20, infoY, areaWidth - 40, 80, 8);
            ctx.fill();
            
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`选中槽位: ${selectedKey}`, areaX + 30, infoY + 25);
            
            ctx.font = '14px Arial';
            ctx.fillStyle = '#FFFFFF';
            if (equippedFactorId) {
                const factor = EnhancementFactors[equippedFactorId];
                ctx.fillText(`当前强化: ${factor ? factor.name : '未知'}`, areaX + 30, infoY + 50);
            } else {
                ctx.fillStyle = '#AAAAAA';
                ctx.fillText('当前强化: 未装配', areaX + 30, infoY + 50);
            }
        }
    }
    
    // 绘制强化因子列表
    drawFactorList(ctx, areaX, areaY, areaWidth, areaHeight, player) {
        if (!this.equipmentData.selectedSlot) {
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#AAAAAA';
            ctx.fillText('← 请先选择一个键位', areaX + areaWidth / 2, areaY + areaHeight / 2);
            return;
        }
        
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('可用强化因子', areaX + areaWidth / 2, areaY + 30);
        
        // 卸载按钮
        const unequipButtonWidth = areaWidth - 20;
        const unequipButtonHeight = 40;
        const unequipButtonX = areaX + 10;
        const unequipButtonY = areaY + 50;
        
        const currentFactor = player.getSlotEnhancement(this.equipmentData.selectedSlot);
        const canUnequip = currentFactor !== null;
        
        ctx.fillStyle = canUnequip ? '#FF5252' : '#555555';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.roundRect(ctx, unequipButtonX, unequipButtonY, unequipButtonWidth, unequipButtonHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('卸载当前强化', unequipButtonX + unequipButtonWidth / 2, unequipButtonY + unequipButtonHeight / 2 + 5);
        
        // 强化因子列表
        const factorStartY = areaY + 110;
        const factorHeight = 80;
        const factorSpacing = 10;
        const ownedFactors = player.getOwnedEnhancements();
        
        if (ownedFactors.length === 0) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#AAAAAA';
            ctx.fillText('暂无已锻造的强化因子', areaX + areaWidth / 2, factorStartY + 50);
            ctx.fillText('请先在军械库锻造', areaX + areaWidth / 2, factorStartY + 75);
            return;
        }
        
        // 计算可视区域和总内容高度
        const listAreaHeight = areaHeight - 120; // 可视区域高度
        const totalContentHeight = ownedFactors.length * (factorHeight + factorSpacing);
        this.equipmentData.maxScroll = Math.max(0, totalContentHeight - listAreaHeight);
        
        // 限制滚动范围
        this.equipmentData.scrollOffset = Math.max(0, Math.min(this.equipmentData.scrollOffset, this.equipmentData.maxScroll));
        
        // 保存当前绘图状态并设置裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(areaX, factorStartY, areaWidth, listAreaHeight);
        ctx.clip();
        
        for (let i = 0; i < ownedFactors.length; i++) {
            const factorId = ownedFactors[i];
            const factor = EnhancementFactors[factorId];
            if (!factor) continue;
            
            const factorY = factorStartY + i * (factorHeight + factorSpacing) - this.equipmentData.scrollOffset;
            
            // 检查是否已装配到其他槽位
            let equippedTo = null;
            for (const [key, slotData] of Object.entries(player.slotEnhancements)) {
                if (slotData && slotData.factorId === factorId) {
                    equippedTo = key;
                    break;
                }
            }
            
            const isEquippedHere = equippedTo === this.equipmentData.selectedSlot;
            const isEquippedElsewhere = equippedTo && !isEquippedHere;
            
            // 因子卡片背景
            if (isEquippedHere) {
                ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
                ctx.strokeStyle = '#4CAF50';
            } else if (isEquippedElsewhere) {
                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                ctx.strokeStyle = '#666666';
            } else {
                ctx.fillStyle = 'rgba(50, 50, 80, 0.8)';
                ctx.strokeStyle = '#9C27B0';
            }
            
            ctx.lineWidth = 2;
            this.roundRect(ctx, areaX + 10, factorY, areaWidth - 20, factorHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // 因子名称
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = isEquippedElsewhere ? '#888888' : '#FFFFFF';
            ctx.fillText(factor.name, areaX + 20, factorY + 22);
            
            // 装配状态
            if (isEquippedHere) {
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#4CAF50';
                ctx.fillText('✓ 已装配于此', areaX + areaWidth - 20, factorY + 22);
            } else if (isEquippedElsewhere) {
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#FF9800';
                ctx.fillText(`已装配于 ${equippedTo}`, areaX + areaWidth - 20, factorY + 22);
            }
            
            // 因子描述
            ctx.font = '13px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = isEquippedElsewhere ? '#666666' : '#CCCCCC';
            ctx.fillText(factor.description, areaX + 20, factorY + 45);
            
            // 强化效果
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = isEquippedElsewhere ? '#888888' : '#FFD700';
            const effectText = factor.getEffectDescription();
            ctx.fillText(effectText, areaX + 20, factorY + 65);
        }
        
        // 恢复绘图状态
        ctx.restore();
        
        // 绘制滚动条（如果需要）
        if (this.equipmentData.maxScroll > 0) {
            const scrollBarWidth = 8;
            const scrollBarX = areaX + areaWidth - scrollBarWidth - 5;
            const scrollBarAreaY = factorStartY;
            const scrollBarAreaHeight = listAreaHeight;
            
            // 滚动条背景
            ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            ctx.fillRect(scrollBarX, scrollBarAreaY, scrollBarWidth, scrollBarAreaHeight);
            
            // 滚动条滑块
            const scrollBarHeight = Math.max(30, scrollBarAreaHeight * (listAreaHeight / totalContentHeight));
            const scrollBarY = scrollBarAreaY + (this.equipmentData.scrollOffset / this.equipmentData.maxScroll) * (scrollBarAreaHeight - scrollBarHeight);
            
            ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
            ctx.fillRect(scrollBarX, scrollBarY, scrollBarWidth, scrollBarHeight);
        }
    }
    
    // 绘制消息提示
    drawEquipmentMessage(ctx, panelX, panelY, panelWidth, panelHeight) {
        if (!this.equipmentData.message || !this.equipmentData.messageTime) return;
        
        const elapsed = Date.now() - this.equipmentData.messageTime;
        if (elapsed >= 3000) {
            this.equipmentData.message = null;
            this.equipmentData.messageTime = null;
            return;
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Arial';
        
        const messageBoxWidth = 400;
        const messageBoxHeight = 50;
        const messageBoxX = (this.canvas.width - messageBoxWidth) / 2;
        const messageBoxY = panelY + panelHeight - 70;
        
        const bgColor = this.equipmentData.messageType === 'success' ? 
            'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)';
        
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.roundRect(ctx, messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.equipmentData.message, this.canvas.width / 2, messageBoxY + 30);
        
        ctx.restore();
    }
    
    // 激活大厅
    activate() {
        this.isActive = true;
        this.showingWeaponConfig = false;
        this.showingTechUpgrade = false;
        this.showingLevelSelection = false;
        this.showingArmory = false;
        this.showingEquipment = false;
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
