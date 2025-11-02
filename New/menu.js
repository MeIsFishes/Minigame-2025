// menu.js - 菜单系统：处理开始界面和游戏结束逻辑

class MenuSystem {
    constructor() {
        this.menuScreen = document.getElementById('menu');
        this.gameOverScreen = document.getElementById('game-over');
        this.gameScreen = document.getElementById('game-screen');
        this.finalScoreDisplay = document.getElementById('final-score');
        
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.onStartGame = null;
        this.onRestartGame = null;
        this.onReturnToMenu = null;
        
        this.initializeEventListeners();
    }
    
    // 初始化事件监听
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => {
            this.hideMenu();
            this.showGame();
            if (this.onStartGame) {
                this.onStartGame();
            }
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.hideGameOver();
            // 返回主界面（大厅）
            if (this.onRestartGame) {
                this.onRestartGame();
            }
        });
    }
    
    // 显示主菜单
    showMenu() {
        this.menuScreen.classList.add('active');
        this.gameScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
    }
    
    // 隐藏主菜单
    hideMenu() {
        this.menuScreen.classList.remove('active');
    }
    
    // 显示游戏画面
    showGame() {
        this.gameScreen.classList.add('active');
        this.menuScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
    }
    
    // 显示游戏结束画面
    showGameOver(finalScore, levelCompleted = false, rewards = null) {
        this.finalScoreDisplay.textContent = finalScore;
        
        // 获取或创建标题元素
        const titleElement = this.gameOverScreen.querySelector('h1');
        
        // 根据是否完成关卡显示不同的UI
        if (levelCompleted && rewards) {
            // 胜利UI
            titleElement.textContent = '🎉 关卡完成！';
            titleElement.style.color = '#4CAF50';
            this.gameOverScreen.style.background = 'linear-gradient(135deg, #1e5128 0%, #2a7a3f 100%)';
            
            // 显示奖励信息
            this.displayRewards(rewards);
        } else {
            // 失败UI
            titleElement.textContent = '💀 游戏结束';
            titleElement.style.color = '#FF5252';
            this.gameOverScreen.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
            
            // 隐藏奖励信息（如果有）
            this.hideRewards();
        }
        
        this.gameOverScreen.classList.add('active');
        this.gameScreen.classList.remove('active');
        this.menuScreen.classList.remove('active');
        
        // 添加动画效果
        this.gameOverScreen.style.animation = 'fadeIn 0.5s';
    }
    
    // 显示奖励信息
    displayRewards(rewards) {
        // 检查是否已存在奖励显示容器
        let rewardsContainer = document.getElementById('rewards-container');
        if (!rewardsContainer) {
            rewardsContainer = document.createElement('div');
            rewardsContainer.id = 'rewards-container';
            rewardsContainer.style.marginTop = '30px';
            rewardsContainer.style.padding = '20px';
            rewardsContainer.style.background = 'rgba(0, 0, 0, 0.3)';
            rewardsContainer.style.borderRadius = '15px';
            rewardsContainer.style.border = '2px solid rgba(76, 175, 80, 0.5)';
            
            // 插入到得分后面，按钮前面
            const restartBtn = document.getElementById('restart-btn');
            this.gameOverScreen.insertBefore(rewardsContainer, restartBtn);
        }
        
        // 清空并重新填充奖励内容
        rewardsContainer.innerHTML = '<h2 style="color: #FFD700; font-size: 24px; margin-bottom: 15px;">🎁 获得奖励</h2>';
        
        const resourceNames = { 
            iron: '铁', 
            copper: '铜', 
            cobalt: '钴', 
            nickel: '镍', 
            gold: '金' 
        };
        const resourceColors = { 
            iron: '#B0B0B0', 
            copper: '#CD7F32', 
            cobalt: '#0047AB', 
            nickel: '#C0C0C0', 
            gold: '#FFD700' 
        };
        
        const rewardsList = document.createElement('div');
        rewardsList.style.display = 'flex';
        rewardsList.style.flexDirection = 'column';
        rewardsList.style.gap = '10px';
        rewardsList.style.fontSize = '20px';
        
        let hasRewards = false;
        for (const [type, amount] of Object.entries(rewards)) {
            if (amount > 0) {
                hasRewards = true;
                const rewardItem = document.createElement('div');
                rewardItem.style.color = resourceColors[type];
                rewardItem.style.fontWeight = 'bold';
                rewardItem.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
                rewardItem.textContent = `${resourceNames[type]}: +${amount}`;
                rewardsList.appendChild(rewardItem);
            }
        }
        
        if (hasRewards) {
            rewardsContainer.appendChild(rewardsList);
            rewardsContainer.style.display = 'block';
        } else {
            rewardsContainer.style.display = 'none';
        }
    }
    
    // 隐藏奖励信息
    hideRewards() {
        const rewardsContainer = document.getElementById('rewards-container');
        if (rewardsContainer) {
            rewardsContainer.style.display = 'none';
        }
    }
    
    // 隐藏游戏结束画面
    hideGameOver() {
        this.gameOverScreen.classList.remove('active');
    }
    
    // 隐藏所有HTML界面（用于显示大厅）
    hideAll() {
        this.menuScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
    }
    
    // 设置回调函数
    setStartGameCallback(callback) {
        this.onStartGame = callback;
    }
    
    setRestartGameCallback(callback) {
        this.onRestartGame = callback;
    }
    
    setReturnToMenuCallback(callback) {
        this.onReturnToMenu = callback;
    }
}

// 添加淡入动画
const menuStyle = document.createElement('style');
menuStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(menuStyle);
