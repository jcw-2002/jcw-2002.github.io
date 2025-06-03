/* 主题初始化脚本 - 统一管理 Swiper 库加载和主题设置 */

(function() {
  'use strict';
  
  // 防止重复执行
  if (window.themeInitialized) {
    return;
  }
  
  // 强制设置黑色主题
  function setDarkTheme() {
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      localStorage.removeItem('autoChangeMode');
    } catch (e) {
      console.warn('设置主题时出错:', e);
    }
  }
  
  // 动态加载 Swiper CSS
  function loadSwiperCSS() {
    return new Promise((resolve) => {
      if (document.querySelector('link[href*="swiper.min.css"]')) {
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://npm.elemecdn.com/anzhiyu-theme-static@1.0.0/swiper/swiper.min.css';
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }
  
  // 动态加载 Swiper JS
  function loadSwiperJS() {
    return new Promise((resolve) => {
      if (typeof Swiper !== 'undefined' || document.querySelector('script[src*="swiper.min.js"]')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://npm.elemecdn.com/anzhiyu-theme-static@1.0.0/swiper/swiper.min.js';
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }
  
  // 主初始化函数
  async function initTheme() {
    // 立即设置黑色主题
    setDarkTheme();
    
    try {
      // 并行加载 CSS 和 JS
      await Promise.all([
        loadSwiperCSS(),
        loadSwiperJS()
      ]);
      
      // 标记已初始化
      window.themeInitialized = true;
      
      // 触发自定义事件
      const event = new CustomEvent('swiperReady', {
        detail: { message: 'Swiper library is loaded and ready' }
      });
      document.dispatchEvent(event);
      
    } catch (error) {
      console.error('主题初始化过程中出现错误:', error);
    }
  }
  
  // Pjax 重置函数
  function resetOnPjax() {
    // 重置初始化标记
    window.themeInitialized = false;
    
    // 重新设置主题
    setDarkTheme();
    
    // 重新初始化
    setTimeout(() => {
      if (!window.themeInitialized) {
        initTheme();
      }
    }, 100);
  }
  
  // 开始执行
  setDarkTheme();
  
  // DOM 加载完成时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
  
  // Pjax 事件处理
  if (typeof window !== 'undefined') {
    document.addEventListener('pjax:complete', resetOnPjax);
    document.addEventListener('pjax:end', resetOnPjax);
  }
  
})();
