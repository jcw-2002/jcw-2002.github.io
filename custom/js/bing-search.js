/* filepath: f:\program\hexo\anzhiyu\source\custom\js\bing-search.js */
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('bing-search-input');
  const searchBtn = document.getElementById('bing-search-btn');
  const translationInput = document.getElementById('translation-input');
  const translationOutput = document.getElementById('translation-output');
  const baiduTranslateBtn = document.getElementById('baidu-translate-btn');
  const googleTranslateBtn = document.getElementById('google-translate-btn');
  const translateDirection = document.getElementById('translate-direction');

  // 创建自定义下拉选择器
  function createCustomSelect() {
    const customSelectContainer = document.createElement('div');
    customSelectContainer.className = 'custom-select';
    
    const selectDisplay = document.createElement('div');
    selectDisplay.className = 'select-display';
    selectDisplay.textContent = '选择翻译方向';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'select-dropdown';
    
    const option1 = document.createElement('button');
    option1.className = 'select-option selected';
    option1.textContent = '中文 → 英文';
    option1.dataset.value = 'zh-en';
    
    const option2 = document.createElement('button');
    option2.className = 'select-option';
    option2.textContent = '英文 → 中文';
    option2.dataset.value = 'en-zh';
    
    dropdown.appendChild(option1);
    dropdown.appendChild(option2);
    customSelectContainer.appendChild(selectDisplay);
    customSelectContainer.appendChild(dropdown);
    
    // 插入到翻译选项区域
    const translationOptions = document.querySelector('.translation-options');
    if (translationOptions) {
      translationOptions.appendChild(customSelectContainer);
    }
    
    // 设置初始显示
    selectDisplay.textContent = option1.textContent;
    translateDirection.value = option1.dataset.value;
    
    // 添加事件监听
    selectDisplay.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });
    
    // 选项点击事件
    [option1, option2].forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 移除所有选中状态
        dropdown.querySelectorAll('.select-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // 设置当前选中
        this.classList.add('selected');
        selectDisplay.textContent = this.textContent;
        translateDirection.value = this.dataset.value;
        
        // 关闭下拉框
        dropdown.classList.remove('active');
      });
    });
    
    // 点击其他地方关闭下拉框
    document.addEventListener('click', function() {
      dropdown.classList.remove('active');
    });
  }

  // 初始化自定义选择器
  if (translateDirection) {
    createCustomSelect();
  }

  // 百度翻译API配置
  const BAIDU_APP_ID = '20250602002371662';
  const BAIDU_SECRET_KEY = 'BruJ4V0jN9nsaavA6EJG';

  // 执行搜索函数
  function performBingSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
      // 添加输入提示动画
      searchInput.style.borderColor = '#ff6b6b';
      searchInput.setAttribute('placeholder', '请输入搜索关键词');
      
      setTimeout(() => {
        searchInput.style.borderColor = '';
        searchInput.setAttribute('placeholder', '输入搜索关键词...');
      }, 2000);
      
      return;
    }

    // 构建 Bing 搜索 URL
    const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    
    // 在新标签页中打开搜索结果
    window.open(bingSearchUrl, '_blank');
    
    // 清空搜索框（可选）
    // searchInput.value = '';
  }

  // 点击搜索按钮
  searchBtn.addEventListener('click', performBingSearch);

  // 按下回车键搜索
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performBingSearch();
    }
  });

  // 搜索框获得焦点时的效果
  searchInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
  });

  // 搜索框失去焦点时的效果
  searchInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
  });

  // 引入MD5库（需要先加载）
  function loadMD5() {
    return new Promise((resolve) => {
      if (window.md5) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/js-md5@0.7.3/src/md5.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  // 百度翻译API函数（使用JSONP方式避免CORS）
  async function baiduTranslate(text, from, to) {
    await loadMD5();
    
    const salt = Date.now();
    const appid = BAIDU_APP_ID;
    const key = BAIDU_SECRET_KEY;
    
    // 构建签名字符串：appid+q+salt+密钥
    const signStr = appid + text + salt + key;
    const sign = md5(signStr);
    
    // 使用JSONP方式调用API
    return new Promise((resolve, reject) => {
      const callbackName = 'baiduTransCallback' + Date.now();
      
      // 创建JSONP回调函数
      window[callbackName] = function(data) {
        document.head.removeChild(script);
        delete window[callbackName];
        
        if (data.error_code) {
          reject(new Error(`翻译错误: ${data.error_msg || data.error_code}`));
        } else if (data.trans_result && data.trans_result.length > 0) {
          resolve(data.trans_result[0].dst);
        } else {
          reject(new Error('翻译结果为空'));
        }
      };
      
      // 创建script标签
      const script = document.createElement('script');
      const params = new URLSearchParams({
        q: text,
        from: from,
        to: to,
        appid: appid,
        salt: salt,
        sign: sign,
        callback: callbackName
      });
      
      script.src = `https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`;
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error('网络请求失败'));
      };
      
      // 设置超时
      setTimeout(() => {
        if (window[callbackName]) {
          document.head.removeChild(script);
          delete window[callbackName];
          reject(new Error('请求超时'));
        }
      }, 10000);
      
      document.head.appendChild(script);
    });
  }

  // 如果JSONP也不行，使用备用方案：直接跳转到百度翻译页面
  async function fallbackBaiduTranslate(text, from, to) {
    const direction = from === 'zh' ? 'zh-en' : 'en-zh';
    const url = `https://fanyi.baidu.com/#${from}/${to}/${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    return '已在新页面打开百度翻译';
  }

  // 翻译功能
  if (translationInput && baiduTranslateBtn && googleTranslateBtn && translateDirection) {
    // 百度翻译按钮事件
    baiduTranslateBtn.addEventListener('click', async function() {
      const text = translationInput.value.trim();
      
      if (!text) {
        translationInput.style.borderColor = '#ff6b6b';
        translationInput.setAttribute('placeholder', '请输入要翻译的文本');
        
        setTimeout(() => {
          translationInput.style.borderColor = '';
          translationInput.setAttribute('placeholder', '输入要翻译的文本...');
        }, 2000);
        
        return;
      }

      // 显示加载状态
      if (translationOutput) {
        translationOutput.value = '正在翻译...';
        baiduTranslateBtn.disabled = true;
        baiduTranslateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 翻译中...';
      }

      const direction = translateDirection.value;
      const [from, to] = direction.split('-');
      
      try {
        const result = await baiduTranslate(text, from, to);
        if (translationOutput) {
          translationOutput.value = result;
        }
      } catch (error) {
        console.error('百度翻译失败:', error);
        try {
          // 使用备用方案
          const fallbackResult = await fallbackBaiduTranslate(text, from, to);
          if (translationOutput) {
            translationOutput.value = fallbackResult;
          }
        } catch (fallbackError) {
          if (translationOutput) {
            translationOutput.value = '翻译失败，请稍后重试或手动访问百度翻译';
          }
        }
      } finally {
        baiduTranslateBtn.disabled = false;
        baiduTranslateBtn.innerHTML = '<i class="fas fa-language"></i> 百度翻译';
      }
    });

    // 谷歌翻译（跳转到网页版）
    googleTranslateBtn.addEventListener('click', function() {
      const text = translationInput.value.trim();
      
      if (!text) {
        translationInput.style.borderColor = '#ff6b6b';
        translationInput.setAttribute('placeholder', '请输入要翻译的文本');
        
        setTimeout(() => {
          translationInput.style.borderColor = '';
          translationInput.setAttribute('placeholder', '输入要翻译的文本...');
        }, 2000);
        
        return;
      }

      const direction = translateDirection.value;
      let translateUrl = '';

      if (direction === 'zh-en') {
        translateUrl = `https://translate.google.com/?sl=zh&tl=en&text=${encodeURIComponent(text)}`;
      } else {
        translateUrl = `https://translate.google.com/?sl=en&tl=zh&text=${encodeURIComponent(text)}`;
      }

      window.open(translateUrl, '_blank');
    });

    // 翻译输入框效果
    translationInput.addEventListener('focus', function() {
      this.style.transform = 'scale(1.01)';
    });

    translationInput.addEventListener('blur', function() {
      this.style.transform = 'scale(1)';
    });

    // 输出框效果
    if (translationOutput) {
      translationOutput.addEventListener('focus', function() {
        this.style.transform = 'scale(1.01)';
      });

      translationOutput.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
      });
    }
  }
});