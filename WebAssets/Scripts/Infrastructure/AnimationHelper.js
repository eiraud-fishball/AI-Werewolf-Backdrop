/* ========================================
   AnimationHelper - 动画工具集
   管理入场动画与通用动效
   ======================================== */

const AnimationHelper = {
    /**
     * 玩家卡片入场动画（错落淡入上移）
     */
    playEntryAnimation() {
        const cards = document.querySelectorAll('.player-card-animate');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
};
