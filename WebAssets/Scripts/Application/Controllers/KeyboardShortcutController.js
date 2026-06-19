/* ========================================
   KeyboardShortcutController - 键盘快捷键
   统一管理热键绑定
   ======================================== */

const KeyboardShortcutController = {
    /** 快捷键映射表 */
    _bindings: [],

    init() {
        document.addEventListener('keydown', (e) => this._handleKey(e));
        this._registerDefaults();
        Logger.info('KeyboardShortcutController', '快捷键初始化完成');
    },

    _handleKey(e) {
        // 输入框中不触发快捷键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        for (const binding of this._bindings) {
            if (this._matchKey(e, binding)) {
                e.preventDefault();
                binding.handler(e);
                return;
            }
        }
    },

    _matchKey(e, binding) {
        if (e.key !== binding.key) return false;
        if (binding.ctrl && !e.ctrlKey) return false;
        if (binding.shift && !e.shiftKey) return false;
        if (binding.alt && !e.altKey) return false;
        return true;
    },

    /** 注册快捷键 */
    register(key, handler, options = {}) {
        this._bindings.push({
            key: key,
            handler: handler,
            ctrl: !!options.ctrl,
            shift: !!options.shift,
            alt: !!options.alt,
            description: options.description || ''
        });
    },

    _registerDefaults() {
        // Space = 昼夜切换
        this.register(' ', () => DayNightController.toggle(), { description: '昼夜切换' });

        // F = 全屏
        this.register('f', () => document.getElementById('fullscreenBtn')?.click(), { description: '全屏' });
        this.register('F', () => document.getElementById('fullscreenBtn')?.click(), { description: '全屏' });

        // S = 设置
        this.register('s', () => ConfigPanelController.open(), { description: '设置面板' });
        this.register('S', () => ConfigPanelController.open(), { description: '设置面板' });

        // R = 重置投票
        this.register('r', () => PlayerRenderService.resetVotes(), { description: '重置投票' });
        this.register('R', () => PlayerRenderService.resetVotes(), { description: '重置投票' });

        // Escape = 关闭所有面板
        this.register('Escape', () => {
            ConfigPanelController.close();
            StatsPanelController.close();
            SpeechService.hideSpeechBoard();
            SpeechService.hideVotingBoard();
            EventAnnounceService.hide();
        }, { description: '关闭所有面板' });
    },

    /** 获取所有已注册的快捷键 */
    getBindings() {
        return this._bindings.map(b => ({
            key: b.key,
            ctrl: b.ctrl,
            shift: b.shift,
            alt: b.alt,
            description: b.description
        }));
    }
};
