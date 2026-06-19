/* ========================================
   EventAnnounceService - 事件公告服务
   在中央区域显示醒目的事件通知
   ======================================== */

const EventAnnounceService = {
    _hideTimer: null,

    /**
     * 显示一条公告
     * @param {string} icon - 图标
     * @param {string} title - 标题
     * @param {string} message - 详细消息
     * @param {number} duration - 显示时长(ms)，0=不自动消失
     */
    show(icon, title, message, duration = 5000) {
        const container = document.getElementById('eventAnnouncement');
        const defaultInfo = document.getElementById('defaultGameInfo');
        if (!container) return;

        container.innerHTML = `
            <div class="announce-content">
                <div class="announce-icon">${icon}</div>
                <div class="announce-title">${this._escapeHtml(title)}</div>
                ${message ? `<div class="announce-message">${this._escapeHtml(message)}</div>` : ''}
            </div>
        `;

        defaultInfo.classList.add('hidden');
        document.getElementById('speechBoard')?.classList.add('hidden');
        document.getElementById('votingBoard')?.classList.add('hidden');
        container.classList.remove('hidden');

        if (this._hideTimer) clearTimeout(this._hideTimer);

        if (duration > 0) {
            this._hideTimer = setTimeout(() => this.hide(), duration);
        }
    },

    /** 隐藏公告 */
    hide() {
        const container = document.getElementById('eventAnnouncement');
        const defaultInfo = document.getElementById('defaultGameInfo');
        if (!container) return;

        container.classList.add('hidden');
        defaultInfo.classList.remove('hidden');
        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
    },

    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
