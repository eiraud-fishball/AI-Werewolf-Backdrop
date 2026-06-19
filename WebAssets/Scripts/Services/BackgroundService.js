/* ========================================
   BackgroundService - 背景管理服务
   背景图设置 / 缓存 / 预加载
   ======================================== */

const BackgroundService = {
    _currentUrl: '',

    /** 设置背景图片 */
    set(url) {
        if (!url || url === this._currentUrl) return;

        const bgLayer = document.getElementById('bgLayer');
        if (!bgLayer) return;

        // 预加载图片
        const img = new Image();
        img.onload = () => {
            bgLayer.style.backgroundImage = `url('${url}')`;
            this._currentUrl = url;
            Logger.debug('BackgroundService', `背景已切换: ${url.slice(0, 50)}...`);
            EventBus.emit('background:changed', { url });
        };
        img.onerror = () => {
            Logger.warn('BackgroundService', `背景图片加载失败: ${url}`);
        };
        img.src = url;
    },

    /** 获取当前背景 URL */
    getCurrent() {
        return this._currentUrl;
    },

    /** 获取随机背景 */
    getRandom() {
        const id = Math.floor(Math.random() * 100) + 1;
        return `https://picsum.photos/id/${id}/1920/1080`;
    }
};
