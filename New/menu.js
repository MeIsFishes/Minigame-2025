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
    showGameOver(finalScore) {
        this.finalScoreDisplay.textContent = finalScore;
        this.gameOverScreen.classList.add('active');
        this.gameScreen.classList.remove('active');
        this.menuScreen.classList.remove('active');
        
        // 添加动画效果
        this.gameOverScreen.style.animation = 'fadeIn 0.5s';
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
