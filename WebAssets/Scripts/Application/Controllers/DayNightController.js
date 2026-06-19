/* ========================================
   DayNightController - 昼夜切换控制器
   管理昼夜阶段切换 / 视觉过渡 / 粒子效果
   ======================================== */

const DayNightController = {
    isNight: false,
    currentPhase: 'day',
    phaseDay: 1,
    _particleContainer: null,
    _particles: [],

    init() {
        this._particleContainer = document.getElementById('particleContainer');
        this._initToggle();
        this._syncUI();

        Logger.info('DayNightController', `初始阶段: 第${this.phaseDay}天`);
    },

    // ---- 绑定 UI ----

    _initToggle() {
        const toggleModeBtn = document.getElementById('toggleModeBtn');
        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', () => this.toggle());
        }
    },

    // ---- 核心切换 ----

    toggle() {
        this.isNight = !this.isNight;

        // 更新存储阶段
        const phaseInfo = ConfigStore.nextPhase();
        this.currentPhase = phaseInfo.phase;
        this.phaseDay = phaseInfo.day;
        this._syncUI();
        this._applyVisuals();

        // 发射事件
        EventBus.emit('phase:change', {
            isNight: this.isNight,
            phase: this.currentPhase,
            day: this.phaseDay
        });

        // 记录日志
        GameLogStore.add('phase', `☀️🌙 进入${this.isNight ? '🌙夜晚' : '☀️白昼'}阶段（第 ${this.phaseDay} ${this.isNight ? '夜' : '天'}）`);

        // 显示公告
        EventAnnounceService.show(
            this.isNight ? '🌙' : '☀️',
            this.isNight ? '🌙 夜晚降临' : '☀️ 天亮了',
            this.isNight
                ? `第 ${this.phaseDay} 夜 — 狼人请行动`
                : `第 ${this.phaseDay} 天 — 请各位玩家发言`,
            3000
        );
    },

    // ---- UI 同步 ----

    _syncUI() {
        const phaseHistory = document.getElementById('phaseHistory');
        if (phaseHistory) {
            phaseHistory.textContent = `第 ${this.phaseDay} ${this.isNight ? '夜' : '天'}`;
        }
    },

    _applyVisuals() {
        const modeIcon = document.getElementById('modeIcon');
        const modeText = document.getElementById('modeText');
        const overlayLayer = document.getElementById('overlayLayer');
        const bgLayer = document.getElementById('bgLayer');
        const toggleModeBtn = document.getElementById('toggleModeBtn');
        const roleCards = document.querySelectorAll('.role-card');

        if (this.isNight) {
            overlayLayer?.classList.remove('day-overlay');
            overlayLayer?.classList.add('night-overlay');
            bgLayer?.classList.add('brightness-75');
            modeIcon?.classList.remove('fa-moon-o');
            modeIcon?.classList.add('fa-sun-o');
            if (modeText) modeText.textContent = '夜晚阶段';
            if (toggleModeBtn) {
                toggleModeBtn.textContent = '切换白昼';
                toggleModeBtn.classList.remove('bg-wolf-accent');
                toggleModeBtn.classList.add('bg-blue-700');
            }
            roleCards.forEach(card => {
                card.classList.remove('card-glow');
                card.classList.add('night-card-glow');
            });
            this._startNightParticles();
        } else {
            overlayLayer?.classList.remove('night-overlay');
            overlayLayer?.classList.add('day-overlay');
            bgLayer?.classList.remove('brightness-75');
            modeIcon?.classList.remove('fa-sun-o');
            modeIcon?.classList.add('fa-moon-o');
            if (modeText) modeText.textContent = '白昼阶段';
            if (toggleModeBtn) {
                toggleModeBtn.textContent = '切换昼夜';
                toggleModeBtn.classList.remove('bg-blue-700');
                toggleModeBtn.classList.add('bg-wolf-accent');
            }
            roleCards.forEach(card => {
                card.classList.remove('night-card-glow');
                card.classList.add('card-glow');
            });
            this._stopNightParticles();
        }
    },

    // ---- 夜晚粒子（修复：正确清除所有粒子） ----

    _startNightParticles() {
        this._stopNightParticles();

        if (!this._particleContainer) return;

        const createParticle = () => {
            if (!this.isNight) return;

            const particle = document.createElement('div');
            particle.className = 'night-particle';
            const size = Math.random() * 3 + 1;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: -5px;
                animation: twinkle ${Math.random() * 2 + 1}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            this._particleContainer.appendChild(particle);
            this._particles.push(particle);

            // 5秒后自动移除
            setTimeout(() => {
                particle.remove();
                const idx = this._particles.indexOf(particle);
                if (idx > -1) this._particles.splice(idx, 1);
            }, 5000);
        };

        for (let i = 0; i < 30; i++) {
            setTimeout(createParticle, i * 150);
        }
    },

    _stopNightParticles() {
        // 清除所有粒子 DOM 元素
        this._particles.forEach(p => p.remove());
        this._particles = [];
    }
};
