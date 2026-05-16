/* ========================================
   主题切换器 - 管理界面风格切换
   ======================================== */

const ThemeSwitcher = {
    currentStyle: 'minimal',
    styles: ['minimal', 'game', 'tech', 'classic'],
    styleNames: {
        'minimal': '简约现代',
        'game': '游戏卡牌',
        'tech': '科技未来',
        'classic': '中国古典'
    },

    init() {
        this.loadStyle();
        this.bindThemeButtons();
    },

    loadStyle() {
        const savedStyle = localStorage.getItem('gameStyle');
        if (savedStyle && this.styles.includes(savedStyle)) {
            this.currentStyle = savedStyle;
        }
        this.applyStyle(this.currentStyle);
    },

    applyStyle(styleName) {
        const body = document.body;
        this.styles.forEach(s => {
            body.classList.remove(`style-${s}`);
        });
        body.classList.add(`style-${styleName}`);
        this.currentStyle = styleName;
        localStorage.setItem('gameStyle', styleName);
        this.updateButtons();
    },

    bindThemeButtons() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                this.applyStyle(style);
            });
        });
        this.updateButtons();
    },

    updateButtons() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            if (btn.dataset.style === this.currentStyle) {
                btn.style.background = '#f97316';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.background = 'transparent';
                btn.style.fontWeight = 'normal';
            }
        });
    }
};
