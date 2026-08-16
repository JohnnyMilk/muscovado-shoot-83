const API = "https://api.github.com";
const form = document.querySelector("#cms-form");
const status = document.querySelector("#cms-status");
const preview = document.querySelector("#image-preview");
let jpegBlob;
let currentWorks = [];
let manifestSha = "";

function credentials() {
  return {
    token: document.querySelector("#token").value.trim(),
    owner: document.querySelector("#owner").value.trim(),
    repo: document.querySelector("#repo").value.trim(),
    branch: document.querySelector("#branch").value.trim()
  };
}

function headers(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function setStatus(message, type = "") {
  status.textContent = message;
  status.dataset.type = type;
}

async function github(path, options = {}) {
  const { token } = credentials();
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers(token), ...(options.headers || {}) }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API ${response.status}`);
  }
  return response.json();
}

function decodeBase64(content) {
  const bytes = Uint8Array.from(atob(content.replace(/\n/g, "")), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

async function blobBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

async function loadCollection() {
  const { owner, repo, branch, token } = credentials();
  if (!token || !owner || !repo || !branch) throw new Error("請先完成 GitHub 連線欄位。");
  setStatus("CONNECTING TO THE COLLECTION…");
  const file = await github(`/repos/${owner}/${repo}/contents/data/works.json?ref=${encodeURIComponent(branch)}`);
  currentWorks = JSON.parse(decodeBase64(file.content));
  manifestSha = file.sha;
  const next = String(Math.max(...currentWorks.map((work) => Number(work.id) || 0), 0) + 1).padStart(2, "0");
  document.querySelector("#work-id").value = next;
  setStatus(`CONNECTED · ${currentWorks.length} WORKS · NEXT NO.${next}`, "success");
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const maxSize = Number(document.querySelector("#max-size").value) || 1800;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d", { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  jpegBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", Number(document.querySelector("#quality").value) || 0.82));
  bitmap.close();
  if (!jpegBlob) throw new Error("這個瀏覽器無法轉換此圖片格式。");

  const url = URL.createObjectURL(jpegBlob);
  preview.replaceChildren();
  const image = document.createElement("img");
  image.src = url;
  image.alt = "壓縮後照片預覽";
  preview.append(image);
  document.querySelector("#image-result").textContent = `${canvas.width} × ${canvas.height}px · ${(jpegBlob.size / 1024).toFixed(0)} KB · JPEG`;
}

async function publish(event) {
  event.preventDefault();
  if (!jpegBlob) return setStatus("請先選擇並完成照片處理。", "error");
  try {
    if (!manifestSha) await loadCollection();
    const { owner, repo, branch } = credentials();
    const id = document.querySelector("#work-id").value.trim().padStart(2, "0");
    if (!/^\d{2}$/.test(id)) throw new Error("作品編號必須是兩位數字。");
    if (currentWorks.some((work) => work.id === id)) throw new Error(`NO.${id} 已經存在，請使用新的作品編號。`);
    const imagePath = `assets/photo-${id}.jpg`;
    const record = {
      id,
      title: document.querySelector("#title").value.trim(),
      scene: document.querySelector("#scene").value.trim(),
      image: imagePath,
      alt: document.querySelector("#alt").value.trim(),
      excerpt: document.querySelector("#excerpt").value.trim(),
      story: document.querySelector("#story").value.trim(),
      note: document.querySelector("#note").value.trim(),
      position: document.querySelector("#position").value.trim() || "center"
    };

    setStatus("UPLOADING OPTIMISED JPEG…");
    await github(`/repos/${owner}/${repo}/contents/${imagePath}`, {
      method: "PUT",
      body: JSON.stringify({ message: `Add photography NO.${id}`, content: await blobBase64(jpegBlob), branch })
    });
    const nextWorks = [record, ...currentWorks.filter((work) => work.id !== id)].slice(0, 83);
    setStatus("UPDATING THE COLLECTION…");
    await github(`/repos/${owner}/${repo}/contents/data/works.json`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Publish photography NO.${id}: ${record.title}`,
        content: encodeBase64(`${JSON.stringify(nextWorks, null, 2)}\n`),
        sha: manifestSha,
        branch
      })
    });
    currentWorks = nextWorks;
    setStatus(`PUBLISHED · NO.${id} ${record.title} · GITHUB PAGES WILL UPDATE SHORTLY`, "success");
  } catch (error) {
    setStatus(`PUBLISH FAILED · ${error.message}`, "error");
    console.error(error);
  }
}

document.querySelector("#load-collection").addEventListener("click", () => loadCollection().catch((error) => setStatus(`CONNECTION FAILED · ${error.message}`, "error")));
document.querySelector("#photo").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) compressImage(file).catch((error) => setStatus(error.message, "error"));
});
form.addEventListener("submit", publish);
