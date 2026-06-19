/* ========================================
   EventBus - 发布/订阅事件总线
   解耦跨模块通信，避免循环依赖
   ======================================== */

const EventBus = {
    _listeners: {},

    /**
     * 订阅事件
     * @param {string} event - 事件名
     * @param {Function} callback - 回调
     * @returns {Function} unsubscribe 函数
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    },

    /** 取消订阅 */
    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    /** 发射事件 */
    emit(event, payload) {
        const cbs = this._listeners[event];
        if (!cbs) return;
        cbs.forEach(cb => {
            try {
                cb(payload);
            } catch (err) {
                Logger?.error(`EventBus[${event}]`, err);
            }
        });
    },

    /** 一次性订阅 */
    once(event, callback) {
        const wrapper = (payload) => {
            this.off(event, wrapper);
            callback(payload);
        };
        this.on(event, wrapper);
    },

    /** 清除所有订阅 */
    clear(event) {
        if (event) {
            delete this._listeners[event];
        } else {
            this._listeners = {};
        }
    }
};
