const fields = ["id", "scene", "category", "year", "orientation", "image", "title", "alt", "excerpt", "story", "note", "position"];
const categories = ["COMPANION", "PORTRAIT", "LANDSCAPE", "CITY", "STILL LIFE", "ORIGIN"];
const orientations = ["portrait", "landscape", "square"];
const status = document.querySelector("#cms-status");
const workspace = document.querySelector("#editor-workspace");
const list = document.querySelector("#record-list");
const form = document.querySelector("#record-form");
let works = [];
let selectedIndex = -1;
let dirty = false;

const promptText = `你是一位時裝雜誌與攝影師 portfolio 的圖片編輯。請仔細觀察我上傳的作品照片，為 MUSCOVADO SHOOT⁸³ 產生一筆 JSON property 初稿。

MUSCOVADO SHOOT⁸³ 從寵物攝影開始，但收藏不限於寵物，也包含人物、風景、城市、靜物與日常片刻。請先依照片本身判斷主題，不要預設畫面中一定有寵物，也不要為沒有生命的景物套用寵物敘事。

你不是在替照片寫圖說，而是在替一個瞬間找到故事。品牌語氣簡約、克制、有畫面感，像攝影師 portfolio 與 fashion editorial；不使用浮誇、過度可愛、雞湯或推銷式語言。使用繁體中文，攝影術語與 scene 保留英文。

寫作方法：
1. 先找出照片中最有張力的一個細節，例如視線、距離、光線、動作、空氣或即將改變的狀態；不要逐項盤點畫面裡有什麼。
2. excerpt 要像雜誌目錄裡的一句引子，留下懸念，不要濃縮 alt。
3. story 要是一篇短小的 editorial micro-story：從一個具體瞬間進場，中段讓觀看角度或情緒產生轉折，結尾留下餘韻。可連結人人熟悉的等待、靠近、離開、休息或偶遇，但不要套用固定模板。
4. 可以使用比喻、節奏與「像是／彷彿」等克制的想像，讓文字超越畫面描述；不可把想像寫成已知事實，也不可杜撰人物身分、動物背景、地點、關係或事件。
5. 長短句交錯，每筆作品應有自己的語氣。避免「在這張照片中」、「畫面呈現」、「捕捉了」、「彷彿在訴說」等制式 AI 開場。
6. alt 是唯一需要保持完全客觀的欄位；note 則從攝影編輯角度談觀看方法，不要重複 story。

請只輸出一個 JSON object，不要 Markdown code fence，也不要補充說明。格式如下：
{
  "id": "兩位數作品編號；如果不知道請填 00",
  "title": "2 至 6 字中文標題；具體但不把畫面直接命名",
  "scene": "大寫英文場景，例如 FIELD / DAYLIGHT",
  "category": "依主題選擇 COMPANION、PORTRAIT、LANDSCAPE、CITY、STILL LIFE 或 ORIGIN",
  "year": "四位數拍攝或發表年份，例如 2026",
  "orientation": "依照片比例填 portrait、landscape 或 square",
  "image": "assets/photo-編號.jpg",
  "alt": "客觀、簡潔的繁體中文圖片描述，供無障礙使用",
  "excerpt": "30 至 55 字的故事引子；製造情緒或懸念，不重複 alt",
  "story": "110 至 180 字、具有進場／轉折／餘韻的 editorial micro-story；容許克制想像，但不把未知資訊寫成事實",
  "note": "25 至 60 字的 editorial note；談光線、色彩、構圖、姿態或觀看方式，不重複 story",
  "position": "建議的 CSS object-position，例如 center 45%"
}`;

document.querySelector("#ai-prompt").value = promptText;

function setStatus(message, type = "") {
  status.textContent = message;
  status.dataset.type = type;
}

function setDirty(value) {
  dirty = value;
  const indicator = document.querySelector("#dirty-state");
  indicator.textContent = dirty ? "UNEXPORTED CHANGES" : "ALL CHANGES EXPORTED";
  indicator.dataset.dirty = String(dirty);
}

function normalise(record = {}) {
  const output = Object.fromEntries(fields.map((field) => [field, String(record[field] ?? "").trim()]));
  output.category ||= "COMPANION";
  output.year ||= String(new Date().getFullYear());
  output.orientation ||= "portrait";
  if (output.image && !output.image.startsWith("assets/")) output.image = `assets/${output.image.replace(/^\/+/, "")}`;
  return output;
}

function validateCollection(value) {
  if (!Array.isArray(value)) throw new Error("JSON 最外層必須是一個 array。");
  if (value.length > 83) throw new Error("收藏不可超過 83 筆；請先刪除不保留的作品。");
  const records = value.map(normalise);
  const incomplete = records.find((record) => fields.some((field) => !record[field]));
  if (incomplete) throw new Error(`NO.${incomplete.id || "—"} 尚有未完成的 properties。`);
  const ids = records.map((record) => record.id);
  if (ids.some((id) => !/^\d{2}$/.test(id))) throw new Error("每筆作品都必須有兩位數字 id。");
  if (new Set(ids).size !== ids.length) throw new Error("作品 id 不可重複。");
  if (records.some((record) => !categories.includes(record.category))) throw new Error("category 必須使用 CMS 提供的選項。");
  if (records.some((record) => !/^\d{4}$/.test(record.year))) throw new Error("year 必須是四位數年份。");
  if (records.some((record) => !orientations.includes(record.orientation))) throw new Error("orientation 必須是 portrait、landscape 或 square。");
  return records;
}

function updateCount() {
  document.querySelector("#record-count").textContent = `${String(works.length).padStart(2, "0")} / 83`;
  document.querySelector("#download-json").disabled = works.length === 0;
}

function renderList() {
  list.replaceChildren();
  works.forEach((work, index) => {
    const item = document.createElement("li");
    const row = document.createElement("div");
    row.className = index === selectedIndex ? "is-selected" : "";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "record-select";
    const number = document.createElement("span");
    number.textContent = `NO.${work.id || "—"}`;
    const title = document.createElement("strong");
    title.textContent = work.title || "未命名作品";
    button.append(number, title);
    button.addEventListener("click", () => selectRecord(index));
    const controls = document.createElement("span");
    controls.className = "order-controls";
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "↑";
    up.disabled = index === 0;
    up.setAttribute("aria-label", `將 NO.${work.id} 往前移`);
    up.addEventListener("click", () => moveRecord(index, -1));
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "↓";
    down.disabled = index === works.length - 1;
    down.setAttribute("aria-label", `將 NO.${work.id} 往後移`);
    down.addEventListener("click", () => moveRecord(index, 1));
    controls.append(up, down);
    row.append(button, controls);
    item.append(row);
    list.append(item);
  });
  updateCount();
}

function selectRecord(index) {
  selectedIndex = index;
  const record = works[index];
  fields.filter((field) => field !== "image").forEach((field) => { document.querySelector(`#${field === "id" ? "work-id" : field}`).value = record[field] || ""; });
  document.querySelector("#image-name").value = (record.image || "").replace(/^assets\//, "");
  renderList();
}

function moveRecord(index, direction) {
  const destination = index + direction;
  if (destination < 0 || destination >= works.length) return;
  [works[index], works[destination]] = [works[destination], works[index]];
  selectedIndex = selectedIndex === index ? destination : selectedIndex === destination ? index : selectedIndex;
  renderList();
  setDirty(true);
  setStatus("ORDER UPDATED LOCALLY · DOWNLOAD JSON TO KEEP IT", "success");
}

function nextId() {
  return String(Math.max(...works.map((work) => Number(work.id) || 0), 0) + 1).padStart(2, "0");
}

function openCollection(records, message) {
  const startedEmpty = records.length === 0;
  works = records;
  workspace.hidden = false;
  renderList();
  if (works.length) selectRecord(0);
  else addRecord();
  setDirty(startedEmpty);
  setStatus(message, "success");
}

function addRecord() {
  if (works.length >= 83) return setStatus("收藏已達 83 筆，請先刪除一筆作品。", "error");
  const id = nextId();
  works.unshift(normalise({ id, image: `assets/photo-${id}.jpg`, position: "center center", category: "COMPANION", year: String(new Date().getFullYear()), orientation: "portrait" }));
  selectRecord(0);
  setDirty(true);
  setStatus(`NEW DRAFT · NO.${id}`);
}

function saveRecord(event) {
  event.preventDefault();
  const record = Object.fromEntries(fields.filter((field) => field !== "image").map((field) => {
    const elementId = field === "id" ? "work-id" : field;
    return [field, document.querySelector(`#${elementId}`).value.trim()];
  }));
  record.image = `assets/${document.querySelector("#image-name").value.trim().replace(/^assets\//, "").replace(/^\/+/, "")}`;
  if (works.some((work, index) => work.id === record.id && index !== selectedIndex)) return setStatus(`NO.${record.id} 已經存在。`, "error");
  works[selectedIndex] = record;
  renderList();
  setDirty(true);
  setStatus(`SAVED LOCALLY · NO.${record.id} ${record.title}`, "success");
}

function parseAiRecord() {
  try {
    const raw = document.querySelector("#json-record").value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const record = normalise(JSON.parse(raw));
    const missing = fields.filter((field) => !record[field]);
    if (missing.length) throw new Error(`缺少 properties：${missing.join(", ")}`);
    if (!/^\d{2}$/.test(record.id)) throw new Error("id 必須是兩位數字。");
    const existing = works.findIndex((work) => work.id === record.id);
    if (existing >= 0) {
      works[existing] = record;
      selectRecord(existing);
      setDirty(true);
      setStatus(`AI JSON PARSED · UPDATED NO.${record.id} · REVIEW BEFORE DOWNLOAD`, "success");
    } else {
      if (works.length >= 83) throw new Error("收藏已達 83 筆，請先刪除一筆作品。");
      works.unshift(record);
      selectRecord(0);
      setDirty(true);
      setStatus(`AI JSON PARSED · ADDED NO.${record.id} · REVIEW BEFORE DOWNLOAD`, "success");
    }
  } catch (error) {
    setStatus(`JSON PARSE FAILED · ${error.message}`, "error");
  }
}

function deleteRecord() {
  if (selectedIndex < 0 || !works.length) return;
  const target = works[selectedIndex];
  if (!window.confirm(`確定要刪除 NO.${target.id} — ${target.title || "未命名作品"}？`)) return;
  const [removed] = works.splice(selectedIndex, 1);
  selectedIndex = Math.min(selectedIndex, works.length - 1);
  renderList();
  if (works.length) selectRecord(selectedIndex);
  else addRecord();
  setDirty(true);
  setStatus(`DELETED LOCALLY · NO.${removed.id}`, "success");
}

function downloadJson() {
  try {
    const output = validateCollection(works);
    const blob = new Blob([`${JSON.stringify(output, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "works.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setDirty(false);
    setStatus(`DOWNLOADED · ${output.length} WORKS · NOW UPLOAD TO data/works.json`, "success");
  } catch (error) {
    setStatus(`DOWNLOAD FAILED · ${error.message}`, "error");
  }
}

document.querySelector("#json-file").addEventListener("change", async (event) => {
  try {
    const [file] = event.target.files;
    if (!file) return;
    if (dirty && !window.confirm("目前有尚未匯出的修改。確定要匯入另一份 JSON 並捨棄這些修改嗎？")) {
      event.target.value = "";
      return;
    }
    openCollection(validateCollection(JSON.parse(await file.text())), `IMPORTED · ${file.name}`);
  } catch (error) {
    setStatus(`IMPORT FAILED · ${error.message}`, "error");
  }
});
document.querySelector("#new-collection").addEventListener("click", () => {
  if (dirty && !window.confirm("目前有尚未匯出的修改。確定要建立空白收藏嗎？")) return;
  openCollection([], "NEW EMPTY COLLECTION");
});
document.querySelector("#add-record").addEventListener("click", addRecord);
document.querySelector("#delete-record").addEventListener("click", deleteRecord);
document.querySelector("#download-json").addEventListener("click", downloadJson);
document.querySelector("#parse-record").addEventListener("click", parseAiRecord);
document.querySelector("#copy-prompt").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(promptText);
  } catch {
    const prompt = document.querySelector("#ai-prompt");
    prompt.select();
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges();
  }
  setStatus("AI PROMPT COPIED", "success");
});
form.addEventListener("submit", saveRecord);
form.addEventListener("input", () => setDirty(true));
window.addEventListener("beforeunload", (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = "";
});
