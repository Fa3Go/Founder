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
        async function submitQuery() {
            const query = document.getElementById('query').value;
            const chatMessages = document.querySelector('.chat-messages');
            const loadingDiv = document.getElementById('loading');
            const chatBtn = document.querySelector('.chat-btn');

            if (!query.trim()) {
                alert('請輸入問題');
                return;
            }

            // 添加使用者訊息到聊天框
            const userMessage = document.createElement('div');
            userMessage.className = 'chat-message user';
            userMessage.innerHTML = `<p>${query}</p>`;
            chatMessages.appendChild(userMessage);

            // 清空輸入框
            document.getElementById('query').value = '';

            // 顯示載入動畫
            loadingDiv.style.display = 'block';
            chatBtn.disabled = true;

            try {
                // 初始化 Gemini API
                const genAI = new GoogleGenerativeAI('AIzaSyBUtF_r9ep-w4nwD0wvsOgI3utZDyMH36A');
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                // 設定系統提示詞
                const systemPrompt = `
                你是五七藝品的智能客服助理。請以下列方式回應：
                
                1. 身分設定：
                - 你是「五七藝品」的專業客服人員
                - 說話風格親切、專業且有禮貌
                - 使用繁體中文回答
                
                2. 關於五七藝品：
                - 創辦人是鄒秋蘭（暱稱：鄒姐姐）
                - 主要經營文創藝術品
                - 結合藝術、慈善與在地文化
                - 重視社會企業責任
                - 與在地小農合作
                - 提供長者就業機會
                
                3. 回答原則：
                - 回答要簡潔有力
                - 態度要親切有禮
                - 不確定的資訊要誠實說明
                - 適時表達關心
                
                4. 特殊情況：
                - 如果遇到投訴，表達歉意並承諾會反映給相關部門
                - 如果問到價格，建議顧客直接聯繫或參考官網
                - 如果問到個人隱私，婉轉拒絕回答
                
                請根據以上設定來回答用戶的問題：${query}
                `;

                // 發送請求到 Gemini
                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                const text = response.text();

                // 添加 AI 回應到聊天框
                const aiMessage = document.createElement('div');
                aiMessage.className = 'chat-message assistant';
                aiMessage.innerHTML = `<p>${text}</p>`;
                chatMessages.appendChild(aiMessage);

                // 自動滾動到最新訊息
                chatMessages.scrollTop = chatMessages.scrollHeight;

            } catch (error) {
                console.error('Error:', error);
                const errorMessage = document.createElement('div');
                errorMessage.className = 'chat-message error';
                errorMessage.innerHTML = `<p>抱歉，發生錯誤。請稍後再試。</p>`;
                chatMessages.appendChild(errorMessage);
            } finally {
                // 隱藏載入動畫
                loadingDiv.style.display = 'none';
                chatBtn.disabled = false;
            }
        }

        // 將 submitQuery 函數添加到全局作用域
        window.submitQuery = submitQuery;

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
