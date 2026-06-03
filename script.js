const imageInput = document.querySelector("#imageInput");
const addImageButton = document.querySelector("#addImageButton");
const fileList = document.querySelector("#fileList");
const generateButton = document.querySelector("#generateButton");
const copyButton = document.querySelector("#copyButton");
const previewText = document.querySelector("#previewText");
const statusText = document.querySelector("#statusText");
const singerName = document.querySelector("#singerName");

const selectedFiles = [];

const sampleSetlist = `[1部]
カメリア・コンプレックス / luz
初恋日記 / 香椎モイミ
バッド・ダンス・ホール / カラスヤサボウ　海凪 澪 × 氷見
君色に染まる / TOKOTOKO(西沢さんP)　海凪 澪 × あーるくん。× 氷見 × あだち酔

[2部]
ネクロの花嫁 / 奏音69
ロビンソン / スピッツ
115万キロのフィルム / Official髭男dism`;

function renderFileList() {
  fileList.replaceChildren();

  selectedFiles.forEach((file, index) => {
    const item = document.createElement("li");
    item.className = "file-row";

    const label = document.createElement("span");
    label.textContent = `${file.name}　${index + 1}部`;

    const removeButton = document.createElement("button");
    removeButton.className = "remove-file";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `${file.name}を削除`);
    removeButton.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
      </svg>
    `;
    removeButton.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      renderFileList();
    });

    item.append(label, removeButton);
    fileList.append(item);
  });
}

function addFiles(files) {
  const remainingSlots = 2 - selectedFiles.length;
  const filesToAdd = Array.from(files).slice(0, remainingSlots);

  selectedFiles.push(...filesToAdd);
  renderFileList();

  if (files.length > remainingSlots) {
    statusText.textContent = "画像は最大2枚です";
  } else {
    statusText.textContent = "編集できます";
  }
}

function generatePreview() {
  if (!singerName.value.trim()) {
    statusText.textContent = "歌い手名を入力してください";
    singerName.focus();
    return;
  }

  if (selectedFiles.length === 0) {
    statusText.textContent = "画像を追加してください";
    addImageButton.focus();
    return;
  }

  previewText.value = sampleSetlist;
  statusText.textContent = "生成しました";
  previewText.focus();
}

async function copyPreview() {
  const text = previewText.value.trim();

  if (!text) {
    statusText.textContent = "コピーする文章がありません";
    previewText.focus();
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    statusText.textContent = "コピーしました";
  } catch {
    previewText.select();
    document.execCommand("copy");
    statusText.textContent = "コピーしました";
  }
}

addImageButton.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", (event) => {
  addFiles(event.target.files);
  imageInput.value = "";
});

generateButton.addEventListener("click", generatePreview);
copyButton.addEventListener("click", copyPreview);

previewText.value = "";
