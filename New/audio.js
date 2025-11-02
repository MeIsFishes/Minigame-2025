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
     * 播放子弹爆炸音效
     * @param {number} explosionRadius - 爆炸范围（像素）
     * @param {number} damage - 子弹伤害值
     */
    playBulletExplosionSound(explosionRadius = 100, damage = 10) {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 根据爆炸范围和伤害计算音量（归一化）
        // 爆炸范围通常在 50-300 之间，伤害通常在 5-50 之间
        const radiusFactor = Math.min(explosionRadius / 200, 1.5); // 爆炸范围影响因子
        const damageFactor = Math.min(damage / 30, 1.5); // 伤害影响因子
        const volumeMultiplier = (radiusFactor + damageFactor) / 2; // 综合影响因子
        
        // 计算持续时间（爆炸范围越大，持续时间越长）
        const baseDuration = 0.25;
        const duration = baseDuration + (explosionRadius / 400) * 0.15; // 0.25-0.4秒
        
        // 低频爆炸声（主体）
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'sawtooth';
        const startFreq = 120 + (damage / 50) * 80; // 伤害越高频率越高
        osc1.frequency.setValueAtTime(startFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(30, now + duration * 0.7);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.35 * volumeMultiplier, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 白噪声（爆炸冲击波）
        const noiseBufferSize = ctx.sampleRate * duration;
        const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < noiseBufferSize; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.8;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        const filterFreq = 800 + (explosionRadius / 300) * 400; // 爆炸范围越大频率越高
        noiseFilter.frequency.setValueAtTime(filterFreq, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + duration * 0.6);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(this.masterVolume * 0.3 * volumeMultiplier, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        // 中频冲击（增强爆炸感）
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(250, now);
        osc2.frequency.exponentialRampToValueAtTime(60, now + duration * 0.5);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.25 * volumeMultiplier, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.5);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        // 启动所有音效
        osc1.start(now);
        osc1.stop(now + duration);
        
        osc2.start(now);
        osc2.stop(now + duration * 0.5);
        
        noise.start(now);
        noise.stop(now + duration);
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
     * 播放装甲格挡音效（金属碰撞声）
     */
    playArmorBlockSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 创建金属碰撞音效（使用多个振荡器叠加）
        // 主音调：金属撞击的核心音
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 次音调：金属共鸣
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(2400, now);
        osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.06);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.15, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        // 低频冲击：装甲厚重感
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        
        osc3.type = 'sawtooth';
        osc3.frequency.setValueAtTime(300, now);
        osc3.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        
        gain3.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        
        // 添加轻微的白噪声（金属摩擦感）
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(this.masterVolume * 0.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        // 播放所有音效
        osc1.start(now);
        osc1.stop(now + 0.08);
        
        osc2.start(now);
        osc2.stop(now + 0.06);
        
        osc3.start(now);
        osc3.stop(now + 0.1);
        
        noise.start(now);
        noise.stop(now + 0.05);
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
     * 播放速射炮音效 (BASIC_GUN)
     */
    playBasicGunSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // 速射炮：清脆的能量发射声
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(900, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.18, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.06);
    }
    
    /**
     * 播放霰弹枪音效 (SHOTGUN)
     */
    playShotgunSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 主爆炸音：更低频、更强劲
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(140, now); // 从180降至140Hz，更低沉
        osc1.frequency.exponentialRampToValueAtTime(40, now + 0.18); // 从60降至40Hz，持续时间加长
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.45, now); // 从0.3提升至0.45，更响亮
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 次爆炸音：增加中低频冲击力
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(280, now);
        osc2.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        // 白噪声（霰弹散射感）：更强的噪声
        const bufferSize = ctx.sampleRate * 0.15; // 延长至0.15秒
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.7; // 从0.5提升至0.7
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(600, now); // 从800降至600Hz，更沉闷
        noiseFilter.Q.value = 0.8; // 从1降至0.8，更宽的频带
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(this.masterVolume * 0.38, now); // 从0.25提升至0.38
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        // 低频震动（增强冲击感）
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(60, now);
        osc3.frequency.exponentialRampToValueAtTime(20, now + 0.2);
        
        gain3.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        
        // 启动所有音效
        osc1.start(now);
        osc1.stop(now + 0.18);
        
        osc2.start(now);
        osc2.stop(now + 0.12);
        
        osc3.start(now);
        osc3.stop(now + 0.2);
        
        noise.start(now);
        noise.stop(now + 0.15);
    }
    
    /**
     * 播放狙击枪音效 (SNIPER)
     */
    playSniperSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 狙击枪：尖锐的高频爆发 + 低频后座力
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(2400, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 低频冲击（后座力）
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(120, now);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.08);
        
        osc2.start(now);
        osc2.stop(now + 0.12);
    }
    
    /**
     * 播放机枪音效 (MACHINE_GUN)
     */
    playMachineGunSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // 机枪：快速的中频爆发
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.04);
    }
    
    /**
     * 播放导弹发射音效 (MISSILE)
     */
    playMissileSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 导弹：启动音 + 引擎推进音
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(100, now);
        osc1.frequency.linearRampToValueAtTime(300, now + 0.3);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.25, now);
        gain1.gain.linearRampToValueAtTime(this.masterVolume * 0.15, now + 0.15);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 高频喷射音
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(800, now);
        osc2.frequency.linearRampToValueAtTime(1200, now + 0.25);
        
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(this.masterVolume * 0.12, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.3);
        
        osc2.start(now);
        osc2.stop(now + 0.25);
    }
    
    /**
     * 播放穿透弹音效 (PENETRATOR)
     */
    playPenetratorSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 穿透弹：持续的能量波动
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc1.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 调制效果（穿透能量）
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1600, now);
        osc2.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.15, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        osc2.start(now);
        osc2.stop(now + 0.12);
    }
    
    /**
     * 播放散射机炮音效 (SCATTER_CANNON)
     * 更加响亮和强劲的音效，体现重型武器的威力
     */
    playScatterCannonSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // 主爆炸音：超低频重炮冲击
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(100, now);
        osc1.frequency.exponentialRampToValueAtTime(30, now + 0.25);
        
        gain1.gain.setValueAtTime(this.masterVolume * 0.6, now); // 更高的音量
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // 次爆炸音：中低频冲击波
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(250, now);
        osc2.frequency.exponentialRampToValueAtTime(70, now + 0.18);
        
        gain2.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        // 高频爆裂音：弹药散射感
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(1800, now);
        osc3.frequency.exponentialRampToValueAtTime(400, now + 0.12);
        
        gain3.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        
        // 强烈的白噪声：散射弹幕音效
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.9; // 更强的噪声
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(500, now);
        noiseFilter.Q.value = 0.7;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(this.masterVolume * 0.5, now); // 更高的噪声音量
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        // 超低频震动：地动山摇的感觉
        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        
        osc4.type = 'sine';
        osc4.frequency.setValueAtTime(45, now);
        osc4.frequency.exponentialRampToValueAtTime(15, now + 0.3);
        
        gain4.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain4.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc4.connect(gain4);
        gain4.connect(ctx.destination);
        
        // 金属回响：机械装填音
        const osc5 = ctx.createOscillator();
        const gain5 = ctx.createGain();
        
        osc5.type = 'square';
        osc5.frequency.setValueAtTime(1200, now + 0.05);
        osc5.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        
        gain5.gain.setValueAtTime(0, now + 0.05);
        gain5.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + 0.06);
        gain5.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc5.connect(gain5);
        gain5.connect(ctx.destination);
        
        // 启动所有音效
        osc1.start(now);
        osc1.stop(now + 0.25);
        
        osc2.start(now);
        osc2.stop(now + 0.18);
        
        osc3.start(now);
        osc3.stop(now + 0.12);
        
        osc4.start(now);
        osc4.stop(now + 0.3);
        
        osc5.start(now + 0.05);
        osc5.stop(now + 0.15);
        
        noise.start(now);
        noise.stop(now + 0.2);
    }
    
    /**
     * 播放武器音效（根据武器类型）
     * @param {string} weaponType - 武器类型标识符
     */
    playWeaponSound(weaponType) {
        switch (weaponType) {
            case 'default':
            case 'BASIC_GUN':
                this.playBasicGunSound();
                break;
            case 'shotgun':
            case 'SHOTGUN':
                this.playShotgunSound();
                break;
            case 'sniper':
            case 'SNIPER':
                this.playSniperSound();
                break;
            case 'machinegun':
            case 'MACHINE_GUN':
                this.playMachineGunSound();
                break;
            case 'missile':
            case 'MISSILE':
                this.playMissileSound();
                break;
            case 'penetrator':
            case 'PENETRATOR':
                this.playPenetratorSound();
                break;
            case 'scattercannon':
            case 'SCATTER_CANNON':
                this.playScatterCannonSound();
                break;
            default:
                this.playBasicGunSound(); // 默认音效
                break;
        }
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

// 暴露到window对象供其他模块使用
if (typeof window !== 'undefined') {
    window.audioSystem = audioSystem;
}
