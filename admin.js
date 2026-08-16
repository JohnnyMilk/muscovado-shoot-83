const fields = ["id", "scene", "image", "title", "alt", "excerpt", "story", "note", "position"];
const status = document.querySelector("#cms-status");
const workspace = document.querySelector("#editor-workspace");
const list = document.querySelector("#record-list");
const form = document.querySelector("#record-form");
let works = [];
let selectedIndex = -1;

const promptText = `你是一位時裝雜誌的寵物攝影編輯。請仔細觀察我上傳的作品照片，為 MUSCOVADO SHOOT⁸³ 產生一筆 JSON property 初稿。

品牌語氣：簡約、克制、有畫面感；像攝影師 portfolio 與 fashion editorial，不使用浮誇、可愛或推銷式語言。使用繁體中文，攝影術語與 scene 保留英文。

請只輸出一個 JSON object，不要 Markdown code fence，也不要補充說明。格式如下：
{
  "id": "兩位數作品編號；如果不知道請填 00",
  "title": "2 至 6 字中文標題",
  "scene": "大寫英文場景，例如 FIELD / DAYLIGHT",
  "image": "assets/photo-編號.jpg",
  "alt": "客觀、簡潔的繁體中文圖片描述，供無障礙使用",
  "excerpt": "30 至 55 字的收藏頁短句",
  "story": "80 至 150 字的完整故事；只寫照片能支持的觀察，不虛構寵物背景",
  "note": "25 至 60 字的 editorial note，可談光線、色彩、姿勢或觀看方式",
  "position": "建議的 CSS object-position，例如 center 45%"
}`;

document.querySelector("#ai-prompt").value = promptText;

function setStatus(message, type = "") {
  status.textContent = message;
  status.dataset.type = type;
}

function normalise(record = {}) {
  return Object.fromEntries(fields.map((field) => [field, String(record[field] ?? "").trim()]));
}

function validateCollection(value) {
  if (!Array.isArray(value)) throw new Error("JSON 最外層必須是一個 array。");
  if (value.length > 83) throw new Error("收藏不可超過 83 筆；請先刪除不保留的作品。");
  const records = value.map(normalise);
  const ids = records.map((record) => record.id);
  if (ids.some((id) => !/^\d{2}$/.test(id))) throw new Error("每筆作品都必須有兩位數字 id。");
  if (new Set(ids).size !== ids.length) throw new Error("作品 id 不可重複。");
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === selectedIndex ? "is-selected" : "";
    const number = document.createElement("span");
    number.textContent = `NO.${work.id || "—"}`;
    const title = document.createElement("strong");
    title.textContent = work.title || "未命名作品";
    button.append(number, title);
    button.addEventListener("click", () => selectRecord(index));
    item.append(button);
    list.append(item);
  });
  updateCount();
}

function selectRecord(index) {
  selectedIndex = index;
  const record = works[index];
  fields.forEach((field) => { document.querySelector(`#${field === "id" ? "work-id" : field}`).value = record[field] || ""; });
  renderList();
}

function nextId() {
  return String(Math.max(...works.map((work) => Number(work.id) || 0), 0) + 1).padStart(2, "0");
}

function openCollection(records, message) {
  works = records;
  workspace.hidden = false;
  renderList();
  if (works.length) selectRecord(0);
  else addRecord();
  setStatus(message, "success");
}

function addRecord() {
  if (works.length >= 83) return setStatus("收藏已達 83 筆，請先刪除一筆作品。", "error");
  const id = nextId();
  works.unshift(normalise({ id, image: `assets/photo-${id}.jpg`, position: "center center" }));
  selectRecord(0);
  setStatus(`NEW DRAFT · NO.${id}`);
}

function saveRecord(event) {
  event.preventDefault();
  const record = Object.fromEntries(fields.map((field) => {
    const elementId = field === "id" ? "work-id" : field;
    return [field, document.querySelector(`#${elementId}`).value.trim()];
  }));
  if (works.some((work, index) => work.id === record.id && index !== selectedIndex)) return setStatus(`NO.${record.id} 已經存在。`, "error");
  works[selectedIndex] = record;
  renderList();
  setStatus(`SAVED LOCALLY · NO.${record.id} ${record.title}`, "success");
}

function deleteRecord() {
  if (selectedIndex < 0 || !works.length) return;
  const [removed] = works.splice(selectedIndex, 1);
  selectedIndex = Math.min(selectedIndex, works.length - 1);
  renderList();
  if (works.length) selectRecord(selectedIndex);
  else addRecord();
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
    setStatus(`DOWNLOADED · ${output.length} WORKS · NOW UPLOAD TO data/works.json`, "success");
  } catch (error) {
    setStatus(`DOWNLOAD FAILED · ${error.message}`, "error");
  }
}

document.querySelector("#json-file").addEventListener("change", async (event) => {
  try {
    const [file] = event.target.files;
    if (!file) return;
    openCollection(validateCollection(JSON.parse(await file.text())), `IMPORTED · ${file.name}`);
  } catch (error) {
    setStatus(`IMPORT FAILED · ${error.message}`, "error");
  }
});
document.querySelector("#new-collection").addEventListener("click", () => openCollection([], "NEW EMPTY COLLECTION"));
document.querySelector("#add-record").addEventListener("click", addRecord);
document.querySelector("#delete-record").addEventListener("click", deleteRecord);
document.querySelector("#download-json").addEventListener("click", downloadJson);
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
