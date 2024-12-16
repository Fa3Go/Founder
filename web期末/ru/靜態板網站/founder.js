document.addEventListener('DOMContentLoaded', function () {
    // 添加淡入動畫效果
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
    });

    // 當頁面載入時，逐個顯示各個區塊
    let delay = 0;
    sections.forEach(section => {
        setTimeout(() => {
            section.style.transition = 'opacity 0.8s, transform 0.8s';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, delay);
        delay += 200;
    });

    // 聯繫按鈕點擊事件
    const contactBtn = document.getElementById('contactBtn');
    contactBtn.addEventListener('click', function () {
        alert('感謝您的關注！歡迎到五七藝品找鄒姐姐聊聊。');
    });

    // 切換對話框顯示
    window.toggleChat = function () {
        const chatPanel = document.getElementById('chatPanel');
        chatPanel.classList.toggle('active');
    }

    // 點擊懸浮按鈕時打開對話框
    document.getElementById('chatToggle').addEventListener('click', toggleChat);

    // AI 問答系統功能
    async function submitQuery() {
        const query = document.getElementById('query').value;
        const responseDiv = document.getElementById('response');
        const errorDiv = document.getElementById('error');
        const loadingDiv = document.getElementById('loading');
        const chatBtn = document.querySelector('.chat-btn');

        if (!query.trim()) {
            alert('請輸入問題');
            return;
        }

        // 重置顯示狀態
        responseDiv.style.display = 'none';
        errorDiv.style.display = 'none';

        // 顯示載入動畫
        loadingDiv.style.display = 'block';
        chatBtn.disabled = true;

        try {
            const response = await fetch('/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    similarity_top_k: 5
                })
            });

            const data = await response.json();

            // 隱藏載入動畫
            loadingDiv.style.display = 'none';
            chatBtn.disabled = false;

            if (response.ok) {
                responseDiv.textContent = data.response;
                responseDiv.style.display = 'block';
                // 自動滾動到最新消息
                responseDiv.scrollIntoView({ behavior: 'smooth' });
            } else {
                errorDiv.textContent = data.error;
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            loadingDiv.style.display = 'none';
            chatBtn.disabled = false;
            errorDiv.textContent = '系統錯誤，請稍後再試';
            errorDiv.style.display = 'block';
        }
    }

    // 將 submitQuery 函數添加到全局作用域
    window.submitQuery = submitQuery;

    // 支援按下 Enter 鍵提交
    document.getElementById('query').addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitQuery();
        }
    });

    // 返回頂部按鈕功能
    const backToTopButton = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}); 
