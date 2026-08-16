const DATA_URL = "data/works.json";

async function loadWorks() {
  const response = await fetch(DATA_URL, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Collection unavailable (${response.status})`);
  return response.json();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderGallery(works) {
  const grid = document.querySelector("#gallery-grid");
  grid.replaceChildren();
  const count = String(Math.min(works.length, 83)).padStart(2, "0");
  document.querySelector("#collection-current").textContent = count;
  document.querySelector("#collection-total").textContent = count;

  works.slice(0, 83).forEach((work, index) => {
    const layout = ["03", "02", "01"][index % 3];
    const article = el("article", `work work-${layout}`);
    const link = el("a");
    link.href = `work.html?id=${encodeURIComponent(work.id)}`;
    link.setAttribute("aria-label", `閱讀 NO.${work.id} ${work.title}完整故事`);

    const figure = el("figure", "image-frame work-image");
    const image = el("img");
    image.src = work.image;
    image.alt = work.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.style.objectPosition = work.position || "center";
    figure.append(image, el("span", "placeholder-label", `IMAGE / ${work.id}`));
    const mark = el("span", "watermark");
    mark.innerHTML = "MS<sup>83</sup>";
    figure.append(mark);

    const meta = el("div", "work-meta");
    meta.append(el("span", "", `NO.${work.id}`), el("span", "", work.scene));
    link.append(figure, meta, el("h2", "", work.title), el("p", "", work.excerpt), el("span", "read-story", "READ THE STORY ↗"));
    article.append(link);
    grid.append(article);
  });
}

function renderDetail(works) {
  const detail = document.querySelector("#work-detail");
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const index = Math.max(0, works.findIndex((item) => item.id === requestedId));
  const work = works[index] || works[0];
  const previous = works[(index - 1 + works.length) % works.length];
  const next = works[(index + 1) % works.length];
  document.title = `${work.title} — MUSCOVADO SHOOT⁸³`;

  const heading = el("header", "detail-heading");
  heading.append(el("p", "", `THE CURRENT COLLECTION / NO.${work.id}`), el("h1", "", work.title), el("span", "", work.scene));
  const figure = el("figure", "detail-figure");
  const image = el("img");
  image.src = work.image;
  image.alt = work.alt;
  image.fetchPriority = "high";
  image.decoding = "async";
  const mark = el("span", "watermark");
  mark.innerHTML = "MS<sup>83</sup>";
  figure.append(image, mark);

  const story = el("article", "detail-story");
  const number = el("p", "detail-number", work.id);
  number.append(el("small", "", "/ 83"));
  const copy = el("div");
  copy.append(el("p", "", work.story), el("p", "", work.note));
  story.append(number, copy);

  const nav = el("nav", "detail-nav");
  nav.setAttribute("aria-label", "作品切換");
  const previousLink = el("a", "", "PREVIOUS STORY ←");
  previousLink.href = `work.html?id=${encodeURIComponent(previous.id)}`;
  const all = el("a", "", "ALL WORKS");
  all.href = "gallery.html";
  const nextLink = el("a", "", "NEXT STORY →");
  nextLink.href = `work.html?id=${encodeURIComponent(next.id)}`;
  nav.append(previousLink, all, nextLink);
  detail.replaceChildren(heading, figure, story, nav);
}

loadWorks()
  .then((works) => {
    if (!Array.isArray(works) || works.length === 0) throw new Error("The collection is empty");
    if (document.querySelector("#gallery-grid")) renderGallery(works);
    if (document.querySelector("#work-detail")) renderDetail(works);
  })
  .catch((error) => {
    const target = document.querySelector("#gallery-grid, #work-detail");
    if (target) target.replaceChildren(el("p", "collection-error", "收藏暫時無法載入，請稍後再試。"));
    console.error(error);
  });
