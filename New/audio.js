// audio.js - 音效系统：管理游戏音效

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // 主音量
        this.enabled = true;
        
        // 尝试初始化音频上下文
        this.initAudioContext();
    }
    
    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        try {
            // 创建音频上下文（兼容性处理）
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 某些浏览器需要用户交互后才能启动音频
            if (this.audioContext.state === 'suspended') {
                const resumeAudio = () => {
                    this.audioContext.resume();
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }
    
    /**
     * 播放受伤音效
     */
    playHitSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 创建振荡器（生成音调）
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // 受伤音效：低音冲击
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now); // 起始频率
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1); // 快速下降
        
        // 音量包络
        gainNode.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // 播放
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }
    
    /**
     * 播放射击音效
     */
    playShootSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // 射击音效：高频短促
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }
    
    /**
     * 播放爆炸音效
     */
    playExplosionSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 使用噪声源创建爆炸效果
        const bufferSize = ctx.sampleRate * 0.3; // 0.3秒
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成白噪声
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        // 使用滤波器塑造爆炸音色
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }
    
    /**
     * 播放治疗音效
     */
    playHealSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // 治疗音效：上升音调
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
    
    /**
     * 播放按键音效
     */
    playButtonSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.08);
    }
    
    /**
     * 设置主音量
     * @param {number} volume - 音量值 (0-1)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 启用/禁用音效
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * 获取音效状态
     */
    isEnabled() {
        return this.enabled && this.audioContext !== null;
    }
}

// 创建全局音效系统实例
const audioSystem = new AudioSystem();
