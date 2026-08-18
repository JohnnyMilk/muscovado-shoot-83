const DATA_URL = "data/works.json";
const BATCH_SIZE = 12;

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

function thumbnailFor(work) {
  if (work.category === "ORIGIN") return work.image;
  return work.image.replace(/(\.[a-z0-9]+)$/i, "-thumb$1");
}

function splitCollection(works) {
  return {
    photographs: works.filter((work) => work.category !== "ORIGIN"),
    origins: works.filter((work) => work.category === "ORIGIN")
  };
}

function orderedCollection(works) {
  const { photographs, origins } = splitCollection(works);
  return [...photographs.slice(0, 83), ...origins];
}

function addImageFallback(image, container, work, fallbackSource = "") {
  let triedFallback = false;
  const handleError = () => {
    if (fallbackSource && !triedFallback && image.src !== new URL(fallbackSource, document.baseURI).href) {
      triedFallback = true;
      image.src = fallbackSource;
      return;
    }
    image.removeEventListener("error", handleError);
    image.remove();
    container.classList.add("image-missing");
    const art = el("span", "missing-art");
    art.append(el("strong", "", `NO.${work.id}`), el("small", "", "IMAGE PENDING"));
    container.prepend(art);
  };
  image.addEventListener("error", handleError);
}

function createWorkCard(work, index) {
  const layout = ["03", "02", "01"][index % 3];
  const article = el("article", `work work-${layout}`);
  const link = el("a");
  link.href = `work.html?id=${encodeURIComponent(work.id)}`;
  link.setAttribute("aria-label", `閱讀 NO.${work.id} ${work.title}完整故事`);

  const figure = el("figure", "image-frame work-image");
  const image = el("img");
  image.src = thumbnailFor(work);
  image.alt = work.alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.style.objectPosition = work.position || "center";
  addImageFallback(image, figure, work, work.image);
  figure.append(image, el("span", "placeholder-label", work.scene));
  const mark = el("span", "watermark");
  mark.innerHTML = "MS<sup>83</sup>";
  figure.append(mark);

  const meta = el("div", "work-meta");
  meta.append(el("span", "", `NO.${work.id}`), el("span", "", `${work.category} · ${work.year}`));
  link.append(figure, meta, el("h2", "", work.title), el("p", "", work.excerpt), el("span", "read-story", "READ THE STORY ↗"));
  article.append(link);
  return article;
}

function renderGallery(works) {
  const grid = document.querySelector("#gallery-grid");
  grid.replaceChildren();
  const { photographs } = splitCollection(works);
  const collection = orderedCollection(works);
  const count = String(Math.min(photographs.length, 83)).padStart(2, "0");
  document.querySelector("#collection-current").textContent = count;
  document.querySelector("#collection-total").textContent = count;
  let visible = 0;

  const renderBatch = () => {
    const end = Math.min(visible + BATCH_SIZE, collection.length);
    const fragment = document.createDocumentFragment();
    for (let index = visible; index < end; index += 1) fragment.append(createWorkCard(collection[index], index));
    grid.append(fragment);
    visible = end;

    document.querySelector("#load-more-wrap")?.remove();
    if (visible < collection.length) {
      const wrap = el("div", "load-more-wrap");
      wrap.id = "load-more-wrap";
      const button = el("button", "load-more", `LOAD THE NEXT EDIT · ${String(collection.length - visible).padStart(2, "0")} REMAIN`);
      button.type = "button";
      button.addEventListener("click", renderBatch, { once: true });
      wrap.append(button);
      grid.append(wrap);
    }
  };

  renderBatch();
}

function updateDetailMeta(work) {
  const description = work.excerpt || work.alt;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${work.title} — MUSCOVADO SHOOT⁸³`);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", new URL(work.image, document.baseURI).href);
  const detailUrl = new URL(`work.html?id=${encodeURIComponent(work.id)}`, document.baseURI).href;
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", detailUrl);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", detailUrl);
}

function renderMissingDetail(detail) {
  document.title = "作品已離開收藏 — MUSCOVADO SHOOT⁸³";
  const empty = el("section", "detail-empty");
  empty.append(
    el("p", "", "THE STORY HAS LEFT THE COLLECTION"),
    el("h1", "", "這張作品，\n已離開目前收藏。")
  );
  const link = el("a", "", "BACK TO THE CURRENT COLLECTION ↗");
  link.href = "gallery.html";
  empty.append(link);
  detail.replaceChildren(empty);
}

function renderDetail(works) {
  const detail = document.querySelector("#work-detail");
  const collection = orderedCollection(works);
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const index = collection.findIndex((item) => item.id === requestedId);
  if (index < 0) {
    renderMissingDetail(detail);
    return;
  }

  const work = collection[index];
  const previous = collection[index - 1];
  const next = collection[index + 1];
  document.title = `${work.title} — MUSCOVADO SHOOT⁸³`;
  updateDetailMeta(work);

  const heading = el("header", "detail-heading");
  const issueLabel = work.category === "ORIGIN" ? "ISSUE ZERO / PERMANENT ORIGIN" : `THE CURRENT COLLECTION / NO.${work.id}`;
  heading.append(el("p", "", issueLabel), el("h1", "", work.title), el("span", "", `${work.category} · ${work.year} · ${work.scene}`));
  const figure = el("figure", `detail-figure detail-${work.orientation}`);
  const image = el("img");
  image.src = work.image;
  image.alt = work.alt;
  image.fetchPriority = "high";
  image.decoding = "async";
  addImageFallback(image, figure, work);
  const mark = el("span", "watermark");
  mark.innerHTML = "MS<sup>83</sup>";
  figure.append(image, mark);

  const story = el("article", "detail-story");
  const number = el("p", "detail-number", work.id);
  number.append(el("small", "", work.category === "ORIGIN" ? "/ ORIGIN" : "/ 83"));
  const copy = el("div");
  copy.append(el("p", "", work.story), el("p", "", work.note));
  story.append(number, copy);

  const nav = el("nav", "detail-nav");
  nav.setAttribute("aria-label", "作品切換");
  const previousLink = previous ? el("a", "", "PREVIOUS STORY ←") : el("span", "is-boundary", "START OF THE EDIT");
  if (previous) previousLink.href = `work.html?id=${encodeURIComponent(previous.id)}`;
  const all = el("a", "", "ALL WORKS");
  all.href = "gallery.html";
  const nextLink = next ? el("a", "", "NEXT STORY →") : el("span", "is-boundary", "END OF THE EDIT");
  if (next) nextLink.href = `work.html?id=${encodeURIComponent(next.id)}`;
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
