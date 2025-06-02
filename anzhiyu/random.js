var posts=["2025/05/31/hello-world/","2025/05/22/git_update/","2025/01/01/introduce/","2026/06/01/mlink/","2025/06/03/lunbotu/","2025/06/01/hexo-bottom-quote-widget/","2025/06/02/swiper_fix/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };