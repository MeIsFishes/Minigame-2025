// ============================================
// 大厅系统 - 游戏开始页面
// ============================================
const LobbySystem = {
    // DOM元素
    lobbyContainer: null,
    startButton: null,
    title: null,
    instructions: null,

    // 初始化大厅
    init() {
        this.createLobbyUI();
        this.bindEvents();
        this.showLobby();
        this.initMainMenuWeaponInfo(); // 初始化主菜单武器信息
    },

    // 创建大厅UI
    createLobbyUI() {
        // 创建主容器
        this.lobbyContainer = document.createElement('div');
        this.lobbyContainer.id = 'lobby-container';
        this.lobbyContainer.innerHTML = `
            <div class="lobby-content">
                <h1 class="game-title">打飞机游戏</h1>
                <div class="game-description">
                    <p>一款经典的空战射击游戏</p>
                    <p>使用键盘发射子弹，消灭敌机，生存更久！</p>
                </div>

                <div class="menu-buttons">
                    <button id="start-game-btn" class="start-button">开始游戏</button>
                    <button id="customize-weapons-btn" class="customize-button">自定义武器</button>
                </div>

                <div class="weapon-info">
                    <h3>武器介绍</h3>
                    <div class="weapon-list" id="main-menu-weapon-list">
                        <!-- 武器信息将动态生成 -->
                    </div>
                </div>

                <div class="game-tips">
                    <h4>游戏提示</h4>
                    <ul>
                        <li>绿色敌机可恢复生命值</li>
                        <li>不同颜色的敌机有不同的特性</li>
                        <li>注意子弹的运动轨迹</li>
                        <li>合理利用各种武器</li>
                    </ul>
                </div>
            </div>

            <!-- 武器选择页面 -->
            <div class="weapon-selection-page" id="weapon-selection-page">
                <div class="weapon-selection-content">
                    <h2>自定义武器配置</h2>
                    <p>为每一排键位选择你喜欢的武器</p>

                    <div class="weapon-selection-scrollable">
                        <div class="weapon-rows">
                            <div class="weapon-row" data-row="0">
                                <h3>Q-P 行 (第一排)</h3>
                                <div class="weapon-options" id="row-0-options">
                                    <!-- 武器选项将在这里动态生成 -->
                                </div>
                            </div>

                            <div class="weapon-row" data-row="1">
                                <h3>A-L 行 (第二排)</h3>
                                <div class="weapon-options" id="row-1-options">
                                    <!-- 武器选项将在这里动态生成 -->
                                </div>
                            </div>

                            <div class="weapon-row" data-row="2">
                                <h3>Z-M 行 (第三排)</h3>
                                <div class="weapon-options" id="row-2-options">
                                    <!-- 武器选项将在这里动态生成 -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="selection-buttons">
                        <button id="back-to-main-btn" class="back-button">返回主菜单</button>
                        <button id="confirm-selection-btn" class="confirm-button">确认选择</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.lobbyContainer);

        // 获取DOM引用
        this.startButton = document.getElementById('start-game-btn');
        this.title = this.lobbyContainer.querySelector('.game-title');
    },

    // 绑定事件
    bindEvents() {
        // 开始游戏按钮
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        // 自定义武器按钮
        const customizeButton = document.getElementById('customize-weapons-btn');
        if (customizeButton) {
            customizeButton.addEventListener('click', () => {
                this.showWeaponSelection();
            });
        }

        // 返回主菜单按钮
        const backButton = document.getElementById('back-to-main-btn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showMainMenu();
            });
        }

        // 确认选择按钮
        const confirmButton = document.getElementById('confirm-selection-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.confirmWeaponSelection();
            });
        }

        // 支持回车键开始游戏（仅在主菜单时）
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !this.lobbyContainer.classList.contains('hidden')) {
                const weaponSelectionPage = document.getElementById('weapon-selection-page');
                if (weaponSelectionPage && weaponSelectionPage.classList.contains('active')) {
                    // 在武器选择页面时，回车键确认选择
                    this.confirmWeaponSelection();
                } else {
                    // 在主菜单时，回车键开始游戏
                    this.startGame();
                }
            }
        });
    },

    // 初始化主菜单武器信息
    initMainMenuWeaponInfo() {
        const weaponListContainer = document.getElementById('main-menu-weapon-list');
        if (!weaponListContainer) return;

        weaponListContainer.innerHTML = '';
        const weapons = WeaponSystem.getAllWeapons();
        const defaultWeaponIds = ['rapid_fire', 'machine_gun', 'shotgun']; // 默认显示的武器

        defaultWeaponIds.forEach((weaponId, index) => {
            const weapon = WeaponSystem.getWeaponById(weaponId);
            if (weapon) {
                const weaponItem = document.createElement('div');
                weaponItem.className = 'weapon-item';
                let keys = '';
                if (index === 0) keys = 'Q-P 行';
                else if (index === 1) keys = 'A-L 行';
                else if (index === 2) keys = 'Z-M 行';

                weaponItem.innerHTML = `
                    <span class="weapon-keys">${keys}</span>
                    <span class="weapon-name">${weapon.name}</span>
                    <span class="weapon-desc">伤害: ${weapon.damage} | 冷却: ${weapon.cooldown/1000}s</span>
                `;
                weaponListContainer.appendChild(weaponItem);
            }
        });
    },

    // 显示大厅
    showLobby() {
        if (this.lobbyContainer) {
            this.lobbyContainer.classList.remove('hidden');
            this.lobbyContainer.classList.add('visible');
        }
    },

    // 隐藏大厅
    hideLobby() {
        if (this.lobbyContainer) {
            this.lobbyContainer.classList.remove('visible');
            this.lobbyContainer.classList.add('hidden');

            // 延迟移除元素
            setTimeout(() => {
                if (this.lobbyContainer && this.lobbyContainer.parentNode) {
                    this.lobbyContainer.parentNode.removeChild(this.lobbyContainer);
                }
            }, 500);
        }
    },

    // 显示武器选择页面
    showWeaponSelection() {
        const mainContent = this.lobbyContainer.querySelector('.lobby-content');
        const weaponSelectionPage = document.getElementById('weapon-selection-page');

        if (mainContent && weaponSelectionPage) {
            mainContent.style.display = 'none';
            weaponSelectionPage.classList.add('active');

            // 初始化武器选择界面
            this.initWeaponSelection();
        }
    },

    // 显示主菜单
    showMainMenu() {
        const mainContent = this.lobbyContainer.querySelector('.lobby-content');
        const weaponSelectionPage = document.getElementById('weapon-selection-page');

        if (mainContent && weaponSelectionPage) {
            weaponSelectionPage.classList.remove('active');
            mainContent.style.display = 'block';
        }
    },

    // 初始化武器选择界面
    initWeaponSelection() {
        const weapons = WeaponSystem.getAllWeapons();

        // 为每一排生成武器选项
        for (let row = 0; row < 3; row++) {
            const optionsContainer = document.getElementById(`row-${row}-options`);
            if (!optionsContainer) continue;

            optionsContainer.innerHTML = '';

            weapons.forEach(weapon => {
                const option = document.createElement('div');
                option.className = 'weapon-option';
                option.dataset.weaponId = weapon.id;
                option.dataset.row = row;

                // 检查是否为当前选中武器
                const isSelected = this.isWeaponSelectedForRow(row, weapon.id);
                if (isSelected) {
                    option.classList.add('selected');
                }

                option.innerHTML = `
                    <div class="weapon-color" style="background-color: ${weapon.color}"></div>
                    <div class="weapon-info">
                        <div class="weapon-name">${weapon.name}</div>
                        <div class="weapon-stats">
                            伤害: ${weapon.damage} | 冷却: ${weapon.cooldown/1000}s
                        </div>
                    </div>
                `;

                option.addEventListener('click', () => {
                    this.selectWeaponForRow(row, weapon.id);
                });

                optionsContainer.appendChild(option);
            });
        }
    },

    // 检查武器是否为某排的选中武器
    isWeaponSelectedForRow(row, weaponId) {
        // 这里可以从保存的配置中检查，暂时使用默认配置
        const defaultWeapons = ['rapid_fire', 'machine_gun', 'shotgun'];
        return defaultWeapons[row] === weaponId;
    },

    // 为某排选择武器
    selectWeaponForRow(row, weaponId) {
        // 取消当前行的所有选中状态
        const optionsContainer = document.getElementById(`row-${row}-options`);
        if (optionsContainer) {
            optionsContainer.querySelectorAll('.weapon-option').forEach(option => {
                option.classList.remove('selected');
            });
        }

        // 设置新选中状态
        const selectedOption = optionsContainer.querySelector(`[data-weapon-id="${weaponId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // 保存选择
        if (!this.weaponSelections) {
            this.weaponSelections = {};
        }
        this.weaponSelections[row] = weaponId;
    },

    // 确认武器选择
    confirmWeaponSelection() {
        if (!this.weaponSelections || Object.keys(this.weaponSelections).length === 0) {
            this.showError('请至少选择一种武器配置');
            return;
        }

        // 检查是否有重复的武器选择
        const selectedWeapons = Object.values(this.weaponSelections);
        const uniqueWeapons = new Set(selectedWeapons);

        if (selectedWeapons.length !== uniqueWeapons.size) {
            this.showError('不能为不同键位行选择同一种武器！');
            return;
        }

        // 应用武器配置
        const rowConfigs = Object.keys(this.weaponSelections).map(row => ({
            row: parseInt(row),
            weaponId: this.weaponSelections[row]
        }));

        WeaponSystem.setCustomWeaponConfig(rowConfigs);

        // 清除错误信息
        this.hideError();

        // 返回主菜单
        this.showMainMenu();
    },

    // 显示错误信息
    showError(message) {
        // 移除现有的错误信息
        this.hideError();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const selectionContent = document.querySelector('.weapon-selection-content');
        if (selectionContent) {
            // 插入到标题下方
            const title = selectionContent.querySelector('h2');
            if (title) {
                title.insertAdjacentElement('afterend', errorDiv);
            }
        }
    },

    // 隐藏错误信息
    hideError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    },

    // 开始游戏
    startGame() {
        // 播放按钮点击音效（预留）
        console.log('开始游戏！');

        // 隐藏大厅
        this.hideLobby();

        // 延迟启动游戏，给过渡动画时间
        setTimeout(() => {
            // 初始化游戏系统（武器系统已经在前面配置好了）
            EnemySystem.init();
            UISystem.init();

            // 启动游戏
            Game.init();
        }, 300);

        // 初始化UI系统
        UISystem.init();

        // 开始生成敌机
        Game.StartEnemySpawning();
    }
};
