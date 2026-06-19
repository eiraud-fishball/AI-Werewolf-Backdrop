/* ========================================
   TextAutoScaler - 文字自动缩放工具
   根据容器尺寸自动调整字体大小避免溢出
   ======================================== */

const TextAutoScaler = {
    /**
     * 根据容器尺寸自动缩放文字大小
     * @param {HTMLElement} el - 目标元素
     * @param {number} minSize - 最小字号(rem)，默认 0.85rem ≈ 13.6px
     * @param {number} maxSize - 最大字号(rem)，不传则使用当前字号
     */
    autoResizeText(el, minSize = 0.85, maxSize = null) {
        if (!el) return;

        const originalSize = maxSize || parseFloat(getComputedStyle(el).fontSize) / 16;
        el.style.fontSize = originalSize + 'rem';

        if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return;

        let low = minSize;
        let high = originalSize;
        let mid = high;

        for (let i = 0; i < 20; i++) {
            mid = (low + high) / 2;
            el.style.fontSize = mid + 'rem';
            if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) {
                low = mid;
            } else {
                high = mid;
            }
        }
        el.style.fontSize = low + 'rem';
    },

    /**
     * 重置字号并自动缩放（适合在内容变更后调用）
     * @param {HTMLElement} el - 目标元素
     * @param {number} minSize - 最小字号(rem)
     * @param {number} maxSize - 最大字号(rem)
     */
    apply(el, minSize, maxSize) {
        if (!el) return;
        el.style.fontSize = '';
        requestAnimationFrame(() => this.autoResizeText(el, minSize, maxSize));
    }
};
