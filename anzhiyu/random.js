var posts=["2025/05/22/git_update/","2025/05/31/hello-world/","2025/01/15/hexo_vercel_deploy/","2025/06/01/hexo-bottom-quote-widget/","2025/01/01/introduce/","2025/06/02/swiper_fix/","2026/06/01/mlink/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };