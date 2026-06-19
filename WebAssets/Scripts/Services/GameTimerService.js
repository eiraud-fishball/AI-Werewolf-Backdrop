/* ========================================
   GameTimerService - 游戏计时器服务
   发言计时 / 阶段倒计时
   ======================================== */

const GameTimerService = {
    _timerId: null,
    _remaining: 0,
    _duration: 0,
    _running: false,
    _onTick: null,
    _onComplete: null,

    /** 预设时间选项（秒） */
    presets: [
        { label: '30秒', value: 30 },
        { label: '1分钟', value: 60 },
        { label: '2分钟', value: 120 },
        { label: '3分钟', value: 180 },
        { label: '5分钟', value: 300 }
    ],

    /** 启动计时器 */
    start(seconds, onTick, onComplete) {
        this.stop();
        this._duration = seconds;
        this._remaining = seconds;
        this._running = true;
        this._onTick = onTick;
        this._onComplete = onComplete;

        if (onTick) onTick(this._remaining);

        this._timerId = setInterval(() => {
            this._remaining--;
            if (this._onTick) this._onTick(this._remaining);

            if (this._remaining <= 0) {
                this.stop();
                if (this._onComplete) this._onComplete();
            }
        }, 1000);

        Logger.debug('GameTimerService', `计时开始: ${seconds}秒`);
    },

    /** 停止计时器 */
    stop() {
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = null;
        }
        this._running = false;
        Logger.debug('GameTimerService', '计时停止');
    },

    /** 暂停/继续 */
    togglePause() {
        if (this._running) {
            clearInterval(this._timerId);
            this._timerId = null;
            this._running = false;
        } else if (this._remaining > 0) {
            this._running = true;
            this._timerId = setInterval(() => {
                this._remaining--;
                if (this._onTick) this._onTick(this._remaining);
                if (this._remaining <= 0) {
                    this.stop();
                    if (this._onComplete) this._onComplete();
                }
            }, 1000);
        }
    },

    /** 重置计时器 */
    reset(seconds) {
        this.stop();
        this._remaining = seconds || this._duration;
        this._running = false;
        if (this._onTick) this._onTick(this._remaining);
    },

    /** 是否正在运行 */
    isRunning() { return this._running; },

    /** 获取剩余时间 */
    getRemaining() { return this._remaining; },

    /** 格式化时间 mm:ss */
    formatTime(seconds) {
        const m = Math.floor(Math.max(0, seconds) / 60);
        const s = Math.floor(Math.max(0, seconds) % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    /** 获取进度百分比 */
    getProgress() {
        if (this._duration === 0) return 0;
        return Math.max(0, Math.min(100, (this._remaining / this._duration) * 100));
    }
};
