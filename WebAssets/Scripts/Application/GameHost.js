/* ========================================
   GameHost - 游戏主程序编排器
   负责初始化所有模块的启动顺序
   ======================================== */

const GameHost = {
    async init() {
        Logger.info('GameHost', '===== 游戏系统启动 =====');

        // 1. 基础设施（无依赖）
        Logger.info('GameHost', '初始化基础设施层...');

        // 2. 数据层
        Logger.info('GameHost', '初始化数据层...');
        await FontService.init();      // 内部调用 ConfigStore.init()
        const background = await PlayerRenderService.init();
        GameLogStore.init();

        // 3. 服务层
        Logger.info('GameHost', '初始化服务层...');
        GameLogService.init();
        BackgroundService.set(background);
        ThemeService.init();
        EffectsService.init();

        // 4. 应用层控制器
        Logger.info('GameHost', '初始化应用层...');
        DayNightController.init();
        ConfigPanelController.init();
        StatsPanelController.init();
        KeyboardShortcutController.init();

        // 5. 计时器按钮
        const timerBtn = document.getElementById('timerToggleBtn');
        if (timerBtn) {
            timerBtn.addEventListener('click', () => {
                const display = document.getElementById('timerDisplay');
                if (display) {
                    display.classList.toggle('hidden');
                    if (!display.classList.contains('hidden')) {
                        GameTimerService.start(120,
                            t => {
                                document.getElementById('timerTime').textContent = GameTimerService.formatTime(t);
                                const prog = document.getElementById('timerProgress');
                                if (prog) prog.style.width = GameTimerService.getProgress() + '%';
                            },
                            () => {
                                document.getElementById('timerDisplay')?.classList.add('hidden');
                            }
                        );
                    } else {
                        GameTimerService.stop();
                    }
                }
            });
        }

        // 6. 全屏按钮
        const fsBtn = document.getElementById('fullscreenBtn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        this.initFullscreen();

        // 7. 全局 UI 更新
        AnimationHelper.playEntryAnimation();
        this.updateStatsDisplay();

        Logger.info('GameHost', '===== 系统启动完成 =====');
    },

    /** 更新存活/淘汰统计 */
    updateStatsDisplay() {
        const aliveCount = document.getElementById('aliveCount');
        const deadCount = document.getElementById('deadCount');
        if (aliveCount) aliveCount.textContent = ConfigStore.getAliveCount();
        if (deadCount) deadCount.textContent = ConfigStore.getDeadCount();
    },

    /** 全屏切换（由快捷键/按钮调用） */
    toggleFullscreen() {
        const btn = document.getElementById('fullscreenBtn');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                Logger.warn('GameHost', `全屏失败: ${err.message}`);
            });
            if (btn) { btn.classList.remove('fa-expand'); btn.classList.add('fa-compress'); }
        } else {
            document.exitFullscreen();
            if (btn) { btn.classList.remove('fa-compress'); btn.classList.add('fa-expand'); }
        }
    },

    /** 全屏状态监听 */
    initFullscreen() {
        document.addEventListener('fullscreenchange', () => {
            const btn = document.getElementById('fullscreenBtn');
            if (!document.fullscreenElement && btn) {
                btn.classList.remove('fa-compress');
                btn.classList.add('fa-expand');
            }
        });
    }
};

// DOMContentLoaded 启动
document.addEventListener('DOMContentLoaded', () => {
    GameHost.init();
});
