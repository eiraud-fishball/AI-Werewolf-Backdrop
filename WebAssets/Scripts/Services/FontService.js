/* ========================================
   FontService - 字体管理服务
   预设字体 / 动态加载 / 应用切换
   ======================================== */

const FontService = {
    presetFonts: [
        {
            name: '系统字体',
            family: 'sans-serif',
            cdn: ''
        },
        {
            name: '思源黑体 (推荐)',
            family: 'Source Han Sans VF',
            cdn: 'https://hanzi.itedev.cn/fonts/Source+Han+Sans+VF/result.css'
        },
        {
            name: '思源宋体',
            family: 'Source Han Serif VF',
            cdn: 'https://hanzi.itedev.cn/fonts/Source+Han+Serif+VF/result.css'
        },
        {
            name: 'MiSans',
            family: 'MiSans',
            cdn: 'https://hanzi.itedev.cn/fonts/MiSans/result.css'
        },
        {
            name: 'JetBrains Maple Mono',
            family: 'JetBrains Maple Mono',
            cdn: 'https://hanzi.itedev.cn/fonts/JetBrains+Maple+Mono/result.css'
        },
        {
            name: '霞鹜文楷',
            family: 'LXGW WenKai',
            cdn: 'https://hanzi.itedev.cn/fonts/LXGW+WenKai/result.css'
        },
        {
            name: '霞鹜文楷Mono',
            family: 'LXGW WenKai Mono',
            cdn: 'https://hanzi.itedev.cn/fonts/LXGW+WenKai+Mono/result.css'
        },
        {
            name: '更纱黑体',
            family: 'Sarasa Gothic SC',
            cdn: 'https://cdn.jsdelivr.net/npm/@fontsource/sarasa-gothic-sc@4.5.8/index.css'
        },
        {
            name: '站酷快乐体',
            family: 'ZCOOL KuaiLe',
            cdn: 'https://fonts.loli.net/css2?family=ZCOOL+KuaiLe&display=swap'
        },
        {
            name: '站酷高端黑',
            family: 'ZCOOL QingKe HuangYou',
            cdn: 'https://fonts.loli.net/css2?family=ZCOOL+QingKe+HuangYou&display=swap'
        },
        {
            name: '站酷小薇体',
            family: 'ZCOOL XiaoWei',
            cdn: 'https://fonts.loli.net/css2?family=ZCOOL+XiaoWei&display=swap'
        },
        {
            name: '马善政毛笔楷体',
            family: 'Ma Shan Zheng',
            cdn: 'https://fonts.loli.net/css2?family=Ma+Shan+Zheng&display=swap'
        },
        {
            name: '朱雀仿宋',
            family: 'ZCOOL XiaoWei',
            cdn: 'https://fonts.loli.net/css2?family=ZCOOL+XiaoWei&display=swap'
        },
        {
            name: '悠哉字体',
            family: 'Yozai',
            cdn: 'https://cdn.jsdelivr.net/npm/yozai-font@1.1.0/lib/Yozai-Regular.woff2'
        },
        {
            name: '小赖字体',
            family: 'Xiaolai SC',
            cdn: 'https://cdn.jsdelivr.net/npm/xiaolai-font@1.0.0/Xiaolai-Regular.ttf'
        }
    ],

    currentFont: null,
    loadedFonts: new Set(),

    async init() {
        const config = await ConfigStore.init();
        const fontConfig = config.font || this.presetFonts[0];
        await this.loadFont(fontConfig);
        return fontConfig;
    },

    async loadFont(fontConfig) {
        if (!fontConfig || !fontConfig.family) {
            console.warn('字体配置无效，使用默认字体');
            fontConfig = this.presetFonts[0];
        }

        if (this.loadedFonts.has(fontConfig.family)) {
            this.applyFont(fontConfig.family);
            this.currentFont = fontConfig;
            return;
        }

        if (!fontConfig.cdn || fontConfig.cdn === '') {
            this.loadedFonts.add(fontConfig.family);
            this.applyFont(fontConfig.family);
            this.currentFont = fontConfig;
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontConfig.cdn;

            link.onload = () => {
                this.loadedFonts.add(fontConfig.family);
                this.applyFont(fontConfig.family);
                this.currentFont = fontConfig;
                resolve();
            };

            link.onerror = () => {
                console.error(`加载字体失败: ${fontConfig.family}`);
                this.applyFont(this.presetFonts[0].family);
                this.currentFont = this.presetFonts[0];
                resolve();
            };

            document.head.appendChild(link);
        });
    },

    applyFont(fontFamily) {
        document.body.style.fontFamily = `'${fontFamily}', sans-serif`;
    },

    getPresetFonts() {
        return this.presetFonts;
    },

    getCurrentFont() {
        return this.currentFont || this.presetFonts[0];
    },

    setFont(fontConfig) {
        ConfigStore.updateFont(fontConfig);
        this.loadFont(fontConfig);
    },

    setCustomFont(family, cdn) {
        if (!family || !cdn) {
            console.warn('自定义字体配置不完整');
            return;
        }

        const fontConfig = {
            name: `自定义: ${family}`,
            family: family,
            cdn: cdn
        };

        this.setFont(fontConfig);
    }
};
