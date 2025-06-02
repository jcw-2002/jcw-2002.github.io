document.addEventListener('DOMContentLoaded', function() {
    // 预定义语句数组（作为fallback）
    const fallbackQuotes = [
        "生活不是等待暴风雨过去，而是要学会在雨中跳舞。",
        "每一个不曾起舞的日子，都是对生命的辜负。",
        "世界上最遥远的距离，不是生与死，而是我站在你面前，你却不知道我爱你。",
        "人生如逆旅，我亦是行人。",
        "山有木兮木有枝，心悦君兮君不知。",
        "落红不是无情物，化作春泥更护花。",
        "海内存知己，天涯若比邻。",
        "路漫漫其修远兮，吾将上下而求索。",
        "不是每一次努力都会有收获，但是每一次收获都必须努力。",
        "愿你走出半生，归来仍是少年。"
    ];

    let quotes = fallbackQuotes; // 默认使用fallback语句
    let autoRefreshInterval = null; // 存储自动刷新定时器
    let currentQuoteText = ''; // 存储当前语句的原始文本（不含「」）

    // 从JSON文件加载语句
    async function loadQuotesFromFile() {
        try {
            const response = await fetch('/sentence/quotes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.quotes && Array.isArray(data.quotes) && data.quotes.length > 0) {
                quotes = data.quotes;
                console.log(`成功加载 ${quotes.length} 条语句`);
            } else {
                console.warn('JSON文件格式不正确或无有效语句，使用默认语句');
            }
        } catch (error) {
            console.warn('加载语句文件失败，使用默认语句:', error);
        }
    }

    function getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        currentQuoteText = quotes[randomIndex]; // 保存原始文本
        return `「 ${currentQuoteText} 」`;
    }

    function updateQuote(quoteElement) {
        quoteElement.style.opacity = '0.6';
        setTimeout(() => {
            quoteElement.textContent = getRandomQuote();
            quoteElement.style.opacity = '1';
        }, 150);
    }

    // 复制到剪贴板
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }

    // 显示复制反馈
    function showCopyFeedback(element) {
        const originalTitle = element.title;
        element.title = '已复制到剪贴板！';
        element.style.color = 'var(--anzhiyu-green, #4CAF50)';
        
        setTimeout(() => {
            element.title = originalTitle;
            element.style.color = '';
        }, 1500);
    }

    function startAutoRefresh(quoteElement) {
        // 清除之前的定时器
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        
        // 每10秒自动刷新
        autoRefreshInterval = setInterval(() => {
            updateQuote(quoteElement);
        }, 10000);
    }

    function createQuoteContainer() {
        // 检查是否已存在容器
        if (document.getElementById('fixed-quote-container')) {
            return;
        }

        // 创建固定底部语句容器
        const container = document.createElement('div');
        container.id = 'fixed-quote-container';
        
        const quoteText = document.createElement('div');
        quoteText.id = 'random-quote';
        quoteText.className = 'random-quote-text';
        quoteText.textContent = getRandomQuote();
        quoteText.title = '左键复制语句 | 右键刷新语句 | 每10秒自动刷新';
        
        container.appendChild(quoteText);
        document.body.appendChild(container);

        // 添加点击事件
        quoteText.addEventListener('click', async function() {
            // 复制原始文本（不含「」）到剪贴板
            const success = await copyToClipboard(currentQuoteText);
            if (success) {
                showCopyFeedback(this);
            }
        });

        // 使用mousedown事件替代contextmenu事件，更好地控制右键行为
        quoteText.addEventListener('mousedown', function(e) {
            if (e.button === 2) { // 右键
                e.preventDefault();
                e.stopPropagation();
                updateQuote(this);
                // 重置自动刷新定时器
                startAutoRefresh(this);
                return false;
            }
        });

        // 额外添加contextmenu事件作为双重保险
        quoteText.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });

        // 添加CSS样式防止文本选择（可选）
        quoteText.style.userSelect = 'none';
        quoteText.style.webkitUserSelect = 'none';
        quoteText.style.mozUserSelect = 'none';
        quoteText.style.msUserSelect = 'none';

        // 开始自动刷新
        startAutoRefresh(quoteText);
    }

    // 先加载语句，然后创建容器
    loadQuotesFromFile().then(() => {
        createQuoteContainer();
    });

    // 如果使用了pjax，需要在页面切换时重新创建
    if (typeof pjax !== 'undefined') {
        document.addEventListener('pjax:complete', () => {
            // 清除之前的定时器
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
            }
            
            loadQuotesFromFile().then(() => {
                createQuoteContainer();
            });
        });
    }

    // 页面卸载时清除定时器
    window.addEventListener('beforeunload', () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    });
});
