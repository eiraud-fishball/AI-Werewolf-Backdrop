/* ========================================
   主应用 - 游戏核心逻辑
   ======================================== */

const GameApp = {
    async init() {
        const background = await PlayerRenderer.init();
        this.setBackground(background);
        this.initDayNightToggle();
        this.initFullscreen();
        ThemeSwitcher.init();
    },

    setBackground(backgroundUrl) {
        const bgLayer = document.getElementById('bgLayer');
        if (bgLayer && backgroundUrl) {
            bgLayer.style.backgroundImage = `url('${backgroundUrl}')`;
        }
    },

    initDayNightToggle() {
        const toggleModeBtn = document.getElementById('toggleModeBtn');
        const modeIcon = document.getElementById('modeIcon');
        const modeText = document.getElementById('modeText');
        const overlayLayer = document.getElementById('overlayLayer');
        const bgLayer = document.getElementById('bgLayer');
        const roleCards = document.querySelectorAll('.role-card');
        let isNight = false;

        toggleModeBtn.addEventListener('click', () => {
            isNight = !isNight;
            if (isNight) {
                overlayLayer.classList.remove('day-overlay');
                overlayLayer.classList.add('night-overlay');
                bgLayer.classList.add('brightness-75');
                modeIcon.classList.remove('fa-moon-o');
                modeIcon.classList.add('fa-sun-o');
                modeText.textContent = '夜晚阶段';
                toggleModeBtn.textContent = '切换白昼';
                toggleModeBtn.classList.remove('bg-wolf-accent');
                toggleModeBtn.classList.add('bg-blue-700');
                roleCards.forEach(card => {
                    card.classList.remove('card-glow');
                    card.classList.add('night-card-glow');
                });
            } else {
                overlayLayer.classList.remove('night-overlay');
                overlayLayer.classList.add('day-overlay');
                bgLayer.classList.remove('brightness-75');
                modeIcon.classList.remove('fa-sun-o');
                modeIcon.classList.add('fa-moon-o');
                modeText.textContent = '白昼阶段';
                toggleModeBtn.textContent = '切换昼夜';
                toggleModeBtn.classList.remove('bg-blue-700');
                toggleModeBtn.classList.add('bg-wolf-accent');
                roleCards.forEach(card => {
                    card.classList.remove('night-card-glow');
                    card.classList.add('card-glow');
                });
            }
        });
    },

    initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log(`无法进入全屏模式: ${err.message}`);
                });
                fullscreenBtn.classList.remove('fa-expand');
                fullscreenBtn.classList.add('fa-compress');
            } else {
                document.exitFullscreen();
                fullscreenBtn.classList.remove('fa-compress');
                fullscreenBtn.classList.add('fa-expand');
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.classList.remove('fa-compress');
                fullscreenBtn.classList.add('fa-expand');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GameApp.init();
});
