/* ========================================
   Logger - 结构化日志工具
   统一日志等级 / 可开关 / 带时间戳
   ======================================== */

const Logger = {
    enabled: true,
    levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
    currentLevel: 1, // 默认 INFO

    /** 设置日志级别 */
    setLevel(level) {
        const num = this.levels[level];
        if (num !== undefined) this.currentLevel = num;
    },

    /** 开关日志 */
    toggle(flag) { this.enabled = flag; },

    _log(level, tag, ...args) {
        if (!this.enabled) return;
        if (this.levels[level] < this.currentLevel) return;

        const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const prefix = `[${ts}][${level}][${tag}]`;
        const fn = level === 'ERROR' ? console.error
                 : level === 'WARN'  ? console.warn
                 :                    console.log;

        if (args.length === 1 && typeof args[0] === 'string') {
            fn(`${prefix} ${args[0]}`);
        } else {
            fn(prefix, ...args);
        }
    },

    debug(tag, ...args) { this._log('DEBUG', tag, ...args); },
    info(tag, ...args)  { this._log('INFO', tag, ...args); },
    warn(tag, ...args)  { this._log('WARN', tag, ...args); },
    error(tag, ...args) { this._log('ERROR', tag, ...args); }
};
