const works = {
  "03": {
    title: "黃花之間",
    scene: "FIELD / DAYLIGHT",
    image: "assets/photo-01.jpg",
    alt: "狗站在一條穿過黃花田的小路上",
    story: "沒有特別要求牠擺姿勢。只是有一條路、一片花田，以及一隻突然決定停下來看向遠方的狗。那一刻，平常的日子突然有了一點時裝雜誌的味道。",
    note: "光線沒有被安排，姿勢也沒有。留下來的，是牠選擇停下的那一秒。"
  },
  "02": {
    title: "那個眼神",
    scene: "PORTRAIT / CLOSE-UP",
    image: "assets/photo-02.jpg",
    alt: "坐在沙發上的狗的近距離肖像",
    story: "同一張每天都會看到的臉，只要換一個觀看方式，就會變成一張真正的肖像。",
    note: "Portrait 不一定需要距離。熟悉，反而讓我們更靠近牠真正的表情。"
  },
  "01": {
    title: "紅色習作",
    scene: "INTERIOR / RED STUDY",
    image: "assets/photo-03.jpg",
    alt: "狗倚著紅色靠墊休息",
    story: "紅色靠墊、黑色毛髮，還有那個介於清醒與休息之間的表情。最好的畫面，有時候就在下一個動作發生之前。",
    note: "色彩先進入畫面，情緒隨後抵達。這是一張關於等待的習作。"
  }
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id") || "03";
const work = works[id] || works["03"];
const detail = document.querySelector("#work-detail");

document.title = `${work.title} — MUSCOVADO SHOOT⁸³`;
detail.innerHTML = `
  <header class="detail-heading">
    <p>THE CURRENT COLLECTION / NO.${id}</p>
    <h1>${work.title}</h1>
    <span>${work.scene}</span>
  </header>
  <figure class="detail-figure">
    <img src="${work.image}" alt="${work.alt}" fetchpriority="high" decoding="async">
    <span class="watermark">MS<sup>83</sup></span>
  </figure>
  <article class="detail-story">
    <p class="detail-number">${id}<small>/ 83</small></p>
    <div><p>${work.story}</p><p>${work.note}</p></div>
  </article>
  <nav class="detail-nav" aria-label="作品切換">
    <a href="work.html?id=${id === "01" ? "03" : String(Number(id) - 1).padStart(2, "0")}">PREVIOUS STORY ←</a>
    <a href="gallery.html">ALL WORKS</a>
    <a href="work.html?id=${id === "03" ? "01" : String(Number(id) + 1).padStart(2, "0")}">NEXT STORY →</a>
  </nav>`;
