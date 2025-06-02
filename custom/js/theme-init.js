/* 主题初始化脚本 - 统一管理 Swiper 库加载和主题设置 */

(function() {
  'use strict';
  
  // 防止重复执行
  if (window.themeInitialized) {
    console.log('主题已经初始化过了');
    return;
  }
  
  console.log('主题初始化脚本开始执行');
  
  // 强制设置黑色主题
  function setDarkTheme() {
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      localStorage.removeItem('autoChangeMode');
      console.log('强制设置为黑色主题');
    } catch (e) {
      console.warn('设置主题时出错:', e);
    }
  }
  
  // 修复音乐相关的JSON错误
  function fixMusicStorage() {
    try {
      // 清理可能损坏的音乐数据
      const musicKeys = ['music-data', 'aplayer-settings', 'meting-config'];
      musicKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data && data.includes('"dark"') && !data.startsWith('{')) {
          console.warn('清理损坏的音乐数据:', key);
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('修复音乐存储时出错:', e);
    }
  }
  
  // 防止 APlayer 错误
  function preventAPlayerErrors() {
    try {
      // 清理可能导致冲突的空元素
      const emptyAPlayers = document.querySelectorAll('.aplayer:empty, [data-aplayer]:empty');
      emptyAPlayers.forEach(el => {
        console.warn('移除空的 APlayer 元素:', el);
        el.remove();
      });
      
      // 监听 APlayer 相关错误
      window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('classList')) {
          console.warn('忽略 APlayer classList 错误:', e.message);
          e.preventDefault();
          return false;
        }
      });
    } catch (e) {
      console.warn('防止 APlayer 错误时出错:', e);
    }
  }
  
  // 动态加载 Swiper CSS
  function loadSwiperCSS() {
    return new Promise((resolve) => {
      if (document.querySelector('link[href*="swiper.min.css"]')) {
        console.log('Swiper CSS 已存在');
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://npm.elemecdn.com/anzhiyu-theme-static@1.0.0/swiper/swiper.min.css';
      link.onload = () => {
        console.log('Swiper CSS 加载完成');
        resolve();
      };
      link.onerror = () => {
        console.warn('Swiper CSS 加载失败');
        resolve();
      };
      document.head.appendChild(link);
    });
  }
  
  // 动态加载 Swiper JS
  function loadSwiperJS() {
    return new Promise((resolve) => {
      if (typeof Swiper !== 'undefined' || document.querySelector('script[src*="swiper.min.js"]')) {
        console.log('Swiper JS 已存在');
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://npm.elemecdn.com/anzhiyu-theme-static@1.0.0/swiper/swiper.min.js';
      script.onload = () => {
        console.log('Swiper JS 加载完成');
        resolve();
      };
      script.onerror = () => {
        console.warn('Swiper JS 加载失败');
        resolve();
      };
      document.head.appendChild(script);
    });
  }
  
  // 主初始化函数
  async function initTheme() {
    console.log('开始初始化主题...');
    
    // 立即设置黑色主题
    setDarkTheme();
    
    // 修复音乐存储问题
    fixMusicStorage();
    
    // 防止 APlayer 错误
    preventAPlayerErrors();
    
    try {
      // 并行加载 CSS 和 JS
      await Promise.all([
        loadSwiperCSS(),
        loadSwiperJS()
      ]);
      
      console.log('主题初始化完成');
      
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
    console.log('Pjax 事件触发，重置主题状态');
    
    // 重置初始化标记
    window.themeInitialized = false;
    
    // 重新设置主题
    setDarkTheme();
    fixMusicStorage();
    preventAPlayerErrors();
    
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
  
  // 页面完全加载后确保主题设置
  window.addEventListener('load', function() {
    setDarkTheme();
    fixMusicStorage();
    preventAPlayerErrors();
  });
  
  // Pjax 事件处理
  if (typeof window !== 'undefined') {
    document.addEventListener('pjax:complete', resetOnPjax);
    document.addEventListener('pjax:end', resetOnPjax);
  }
  
})();
