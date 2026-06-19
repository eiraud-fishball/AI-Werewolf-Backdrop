/* ========================================
   ThemeService - 主题管理服务
   界面风格切换 / 持久化
   ======================================== */

const ThemeService = {
    currentStyle: 'minimal',
    styles: ['minimal', 'game', 'tech', 'classic', 'neon', 'gothic', 'forest', 'ocean', 'cosmic', 'pixel'],
    styleNames: {
        'minimal': '简约现代',
        'game': '游戏卡牌',
        'tech': '科技未来',
        'classic': '中国古典',
        'neon': '霓虹赛博',
        'gothic': '暗黑哥特',
        'forest': '森林自然',
        'ocean': '海洋深邃',
        'cosmic': '星空宇宙',
        'pixel': '复古像素'
    },

    init() {
        const config = ConfigStore.getConfig();
        const savedStyle = config?.currentStyle || localStorage.getItem('gameStyle') || 'minimal';
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
    },

    setStyle(styleName) {
        if (this.styles.includes(styleName)) {
            this.applyStyle(styleName);
        }
    },

    getCurrentStyle() {
        return this.currentStyle;
    }
};
