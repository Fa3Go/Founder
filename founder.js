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

    // 在文件開頭添加 prompt 設定
    const SYSTEM_PROMPT = `你是五七藝品的智能客服助理。請遵循以下準則回答：

1. 身份：你是「五七藝品」的專業客服代表，請用親切專業的口吻回答。

2. 關於五七藝品：
- 創辦人是鄒秋蘭（暱稱：鄒姐姐）
- 是一家結合藝術、慈善與在地文化的社會企業
- 主要業務包括藝術品展售和社會公益項目
- 特別重視與在地小農合作，並為長者創造就業機會

3. 回答風格：
- 使用溫暖友善的語氣
- 回答要簡潔明瞭
- 適時使用表情符號增加親和力
- 使用繁體中文回答

4. 如果遇到：
- 產品詢問：提供概括性介紹，並邀請客戶實地參觀
- 價格相關：請客戶直接聯繫門市
- 合作提案：表達歡迎，並請對方留下聯絡方式
- 不確定的問題：誠實表明需要進一步確認

5. 結尾：
- 適時提供門市地址：臺中市西屯區潮洋里青海南街205號4樓之5
- 營業時間：週一至週五 10:00-19:00，週六至週日 11:00-18:00`;

    // 修改 submitQuery 函數
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
            const apiKey = 'AIzaSyBUtF_r9ep-w4nwD0wvsOgI3utZDyMH36A';
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: SYSTEM_PROMPT + '\n\n使用者問題：' + query
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format');
            }

            const text = data.candidates[0].content.parts[0].text;

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

    // 其他現有的程式碼保持不變...

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
