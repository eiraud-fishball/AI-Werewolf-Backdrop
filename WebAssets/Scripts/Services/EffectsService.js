/* ========================================
   EffectsService - 视觉效果服务
   粒子系统 / 动态背景效果管理
   ======================================== */

const EffectsService = {
    container: null,
    activeEffects: new Set(),
    effectIntervals: {},
    effectElements: {},

    effects: {
        snow: { name: '雪花飘落', icon: '❄️' },
        rain: { name: '雨滴效果', icon: '🌧️' },
        stars: { name: '星空闪烁', icon: '⭐' },
        fireflies: { name: '萤火虫', icon: '✨' },
        petals: { name: '花瓣飘落', icon: '🌸' },
        bubbles: { name: '气泡上升', icon: '🫧' },
        confetti: { name: '彩纸飘落', icon: '🎊' },
        matrix: { name: '矩阵代码', icon: '💻' },
        hearts: { name: '爱心飘浮', icon: '💕' },
        wave: { name: '多彩波浪', icon: '🌊' }
    },

    init() {
        this.container = document.getElementById('particleContainer');
        this.loadSettings();
    },

    loadSettings() {
        const config = ConfigStore.getConfig();
        const savedEffects = config?.visualEffects || [];
        savedEffects.forEach(effect => {
            if (this.effects[effect]) {
                this.enableEffect(effect);
            }
        });
    },

    saveSettings() {
        const effects = Array.from(this.activeEffects);
        ConfigStore.updateConfig({ visualEffects: effects });
    },

    toggleEffect(effectName) {
        if (this.activeEffects.has(effectName)) {
            this.disableEffect(effectName);
        } else {
            this.enableEffect(effectName);
        }
        this.saveSettings();
    },

    enableEffect(effectName) {
        if (this.activeEffects.has(effectName)) return;

        this.activeEffects.add(effectName);
        this.effectElements[effectName] = [];

        switch (effectName) {
            case 'snow': this.startSnow(); break;
            case 'rain': this.startRain(); break;
            case 'stars': this.startStars(); break;
            case 'fireflies': this.startFireflies(); break;
            case 'petals': this.startPetals(); break;
            case 'bubbles': this.startBubbles(); break;
            case 'confetti': this.startConfetti(); break;
            case 'matrix': this.startMatrix(); break;
            case 'hearts': this.startHearts(); break;
            case 'wave': this.startWave(); break;
        }
    },

    disableEffect(effectName) {
        if (!this.activeEffects.has(effectName)) return;

        this.activeEffects.delete(effectName);

        if (this.effectIntervals[effectName]) {
            clearInterval(this.effectIntervals[effectName]);
            clearTimeout(this.effectIntervals[effectName]);
            delete this.effectIntervals[effectName];
        }

        if (this.effectElements[effectName]) {
            this.effectElements[effectName].forEach(el => el.remove());
            delete this.effectElements[effectName];
        }
    },

    createElement(options, content = '') {
        const el = document.createElement('div');
        el.style.cssText = options.cssText;
        el.textContent = content;
        this.container.appendChild(el);
        this.effectElements[options.effect].push(el);

        if (options.lifetime && options.lifetime < 999999999) {
            setTimeout(() => {
                el.remove();
                const idx = this.effectElements[options.effect].indexOf(el);
                if (idx > -1) this.effectElements[options.effect].splice(idx, 1);
            }, options.lifetime);
        }

        return el;
    },

    isEffectEnabled(effectName) {
        return this.activeEffects.has(effectName);
    },

    getAllEffects() {
        return this.effects;
    },

    // ---------- 各效果实现 ----------

    startSnow() {
        const createSnowflake = () => {
            if (!this.activeEffects.has('snow')) return;

            const size = Math.random() * 12 + 6;
            const duration = Math.random() * 8 + 6;
            const startX = Math.random() * 100;
            const opacity = Math.random() * 0.5 + 0.3;
            const blur = Math.random() * 1;

            this.createElement({
                effect: 'snow',
                cssText: `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${startX}%;
                    top: -${size}px;
                    opacity: ${opacity};
                    animation: snowfall ${duration}s linear forwards;
                    background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 40%, rgba(200,220,255,0.3) 70%, transparent 100%);
                    border-radius: 50%;
                    filter: blur(${blur}px);
                    box-shadow: 0 0 ${size * 0.5}px rgba(255,255,255,0.5);
                `,
                lifetime: duration * 1000
            });
        };
        this.effectIntervals.snow = setInterval(createSnowflake, 60);
    },

    startRain() {
        const createRaindrop = () => {
            if (!this.activeEffects.has('rain')) return;

            const height = Math.random() * 30 + 25;
            const duration = Math.random() * 0.4 + 0.3;
            const startX = Math.random() * 100;
            const width = Math.random() * 2 + 1.5;

            this.createElement({
                effect: 'rain',
                cssText: `
                    position: absolute;
                    width: ${width}px;
                    height: ${height}px;
                    background: linear-gradient(to bottom, transparent, rgba(150, 200, 255, 0.9), rgba(100, 180, 255, 0.6));
                    left: ${startX}%;
                    top: -${height}px;
                    animation: rainfall ${duration}s linear forwards;
                    box-shadow: 0 0 3px rgba(100, 180, 255, 0.5);
                `,
                lifetime: duration * 1000
            });
        };
        this.effectIntervals.rain = setInterval(createRaindrop, 30);
    },

    startStars() {
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                if (!this.activeEffects.has('stars')) return;

                const size = Math.random() * 4 + 2;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const duration = Math.random() * 2 + 1.5;
                const delay = Math.random() * 3;

                this.createElement({
                    effect: 'stars',
                    cssText: `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        background: radial-gradient(circle, white 0%, rgba(255,255,200,0.8) 50%, transparent 100%);
                        border-radius: 50%;
                        left: ${x}%;
                        top: ${y}%;
                        animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite;
                        box-shadow: 0 0 ${size * 3}px white, 0 0 ${size * 6}px rgba(255,255,200,0.5);
                    `,
                    lifetime: 999999999
                });
            }, i * 30);
        }
    },

    startFireflies() {
        const createFirefly = () => {
            if (!this.activeEffects.has('fireflies')) return;

            const size = Math.random() * 10 + 8;
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const duration = Math.random() * 10 + 8;
            const hue = Math.random() * 60 + 40;

            this.createElement({
                effect: 'fireflies',
                cssText: `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: radial-gradient(circle, rgba(255,255,${hue},1) 0%, rgba(255,200,50,0.8) 30%, rgba(255,150,0,0.4) 60%, transparent 100%);
                    border-radius: 50%;
                    left: ${startX}%;
                    top: ${startY}%;
                    animation: fireflyFloat ${duration}s ease-in-out infinite;
                    filter: blur(0.5px);
                    box-shadow: 0 0 ${size * 2}px rgba(255,200,50,0.8), 0 0 ${size * 4}px rgba(255,150,0,0.5);
                `,
                lifetime: 999999999
            });
        };
        for (let i = 0; i < 50; i++) {
            setTimeout(createFirefly, i * 150);
        }
    },

    startPetals() {
        const colors = ['#ffb7c5', '#ffc0cb', '#ff69b4', '#ff1493', '#ff6b9d', '#ff85a2'];

        const createPetal = () => {
            if (!this.activeEffects.has('petals')) return;

            const size = Math.random() * 18 + 12;
            const duration = Math.random() * 5 + 6;
            const startX = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rotation = Math.random() * 360;

            this.createElement({
                effect: 'petals',
                cssText: `
                    position: absolute;
                    width: ${size}px;
                    height: ${size * 0.8}px;
                    background: linear-gradient(135deg, ${color}, ${color}dd);
                    border-radius: 50% 0 50% 50%;
                    left: ${startX}%;
                    top: -30px;
                    opacity: 0.9;
                    animation: petalFall ${duration}s ease-in-out forwards;
                    transform: rotate(${rotation}deg);
                    box-shadow: 0 2px 8px rgba(255,100,150,0.3);
                `,
                lifetime: duration * 1000
            });
        };
        this.effectIntervals.petals = setInterval(createPetal, 150);
    },

    startBubbles() {
        const createBubble = () => {
            if (!this.activeEffects.has('bubbles')) return;

            const size = Math.random() * 50 + 20;
            const duration = Math.random() * 5 + 4;
            const startX = Math.random() * 100;
            const hue = Math.random() * 60 + 180;

            this.createElement({
                effect: 'bubbles',
                cssText: `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(${hue},220,255,0.4) 50%, transparent 70%);
                    border: 2px solid rgba(255,255,255,0.4);
                    border-radius: 50%;
                    left: ${startX}%;
                    bottom: -${size}px;
                    animation: bubbleRise ${duration}s ease-out forwards;
                    box-shadow: 0 0 15px rgba(${hue},220,255,0.3), inset 0 0 20px rgba(255,255,255,0.2);
                `,
                lifetime: duration * 1000
            });
        };
        this.effectIntervals.bubbles = setInterval(createBubble, 250);
    },

    startConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4', '#7fff00', '#ff4500'];

        const createConfetti = () => {
            if (!this.activeEffects.has('confetti')) return;

            const size = Math.random() * 15 + 8;
            const duration = Math.random() * 3 + 2.5;
            const startX = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rotation = Math.random() * 720;
            const shape = Math.random() > 0.5 ? '50%' : '0';

            this.createElement({
                effect: 'confetti',
                cssText: `
                    position: absolute;
                    width: ${size}px;
                    height: ${size * 0.6}px;
                    background: ${color};
                    left: ${startX}%;
                    top: -20px;
                    animation: confettiFall ${duration}s ease-in-out forwards;
                    transform: rotate(${rotation}deg);
                    border-radius: ${shape};
                    box-shadow: 0 0 5px ${color};
                `,
                lifetime: duration * 1000
            });
        };
        this.effectIntervals.confetti = setInterval(createConfetti, 60);
    },

    startMatrix() {
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

        const createColumn = () => {
            if (!this.activeEffects.has('matrix')) return;

            const x = Math.random() * 100;
            const speed = Math.random() * 3 + 2;
            const fontSize = Math.random() * 6 + 16;

            const column = document.createElement('div');
            column.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: -100px;
                animation: matrixFall ${speed}s linear forwards;
            `;

            const charCount = Math.floor(Math.random() * 15) + 10;
            for (let i = 0; i < charCount; i++) {
                const charEl = document.createElement('div');
                const char = chars[Math.floor(Math.random() * chars.length)];
                const opacity = 1 - (i / charCount) * 0.8;
                charEl.style.cssText = `
                    font-family: 'Courier New', monospace;
                    font-size: ${fontSize}px;
                    font-weight: bold;
                    color: rgba(0, 255, 65, ${opacity});
                    text-shadow: 0 0 10px rgba(0, 255, 65, 0.9), 0 0 20px rgba(0, 255, 65, 0.5);
                    line-height: 1.2;
                `;
                charEl.textContent = char;
                column.appendChild(charEl);
            }

            this.container.appendChild(column);
            this.effectElements.matrix.push(column);

            setTimeout(() => {
                column.remove();
                const idx = this.effectElements.matrix.indexOf(column);
                if (idx > -1) this.effectElements.matrix.splice(idx, 1);
            }, speed * 1000);
        };
        this.effectIntervals.matrix = setInterval(createColumn, 200);
    },

    startHearts() {
        const createHeart = () => {
            if (!this.activeEffects.has('hearts')) return;

            const size = Math.random() * 25 + 18;
            const duration = Math.random() * 4 + 3;
            const startX = Math.random() * 100;
            const hue = Math.random() * 30;

            this.createElement({
                effect: 'hearts',
                cssText: `
                    position: absolute;
                    font-size: ${size}px;
                    left: ${startX}%;
                    bottom: -${size}px;
                    color: hsl(${hue}, 80%, 60%);
                    animation: heartFloat ${duration}s ease-out forwards;
                    filter: drop-shadow(0 0 8px hsl(${hue}, 80%, 50%));
                    line-height: 1;
                `,
                lifetime: duration * 1000
            }, '❤️');
        };
        this.effectIntervals.hearts = setInterval(createHeart, 250);
    },

    startWave() {
        const waveContainer = document.createElement('div');
        waveContainer.className = 'wave-container';

        const waveColors = [
            { color: 'rgba(0, 119, 190, 0.7)', duration: 7 },
            { color: 'rgba(0, 166, 231, 0.5)', duration: 9 },
            { color: 'rgba(147, 51, 234, 0.4)', duration: 11 },
            { color: 'rgba(236, 72, 153, 0.3)', duration: 13 }
        ];

        waveColors.forEach((waveData, index) => {
            const wave = document.createElement('div');
            wave.className = `wave wave${index + 1}`;
            wave.innerHTML = `
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="${waveData.color}" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            `;
            wave.style.animationDuration = `${waveData.duration}s`;
            waveContainer.appendChild(wave);
        });

        this.container.appendChild(waveContainer);
        this.effectElements.wave = [waveContainer];
    }
};
