const imageInput = document.querySelector("#imageInput");
const addImageButton = document.querySelector("#addImageButton");
const fileList = document.querySelector("#fileList");
const generateButton = document.querySelector("#generateButton");
const copyButton = document.querySelector("#copyButton");
const previewText = document.querySelector("#previewText");
const statusText = document.querySelector("#statusText");
const singerName = document.querySelector("#singerName");
const passcode = document.querySelector("#passcode");

const selectedFiles = [];

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.textContent = isLoading ? "生成中..." : "生成する";
}

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

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);

    image.addEventListener("load", () => {
      const maxSize = 1600;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    });
    image.addEventListener("error", reject);

    reader.readAsDataURL(file);
  });
}

async function generatePreview() {
  if (!singerName.value.trim()) {
    statusText.textContent = "歌い手名を入力してください";
    singerName.focus();
    return;
  }

  if (!passcode.value.trim()) {
    statusText.textContent = "パスコードを入力してください";
    passcode.focus();
    return;
  }

  if (selectedFiles.length === 0) {
    statusText.textContent = "画像を追加してください";
    addImageButton.focus();
    return;
  }

  setLoading(true);
  statusText.textContent = "画像を準備しています";

  try {
    const images = await Promise.all(
      selectedFiles.map(async (file) => ({
        name: file.name,
        dataUrl: await readImageAsDataUrl(file),
      })),
    );

    statusText.textContent = "AIで読み取っています";

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        singerName: singerName.value.trim(),
        passcode: passcode.value,
        images,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "生成に失敗しました");
    }

    previewText.value = data.text;
    statusText.textContent = "生成しました";
    previewText.focus();
  } catch (error) {
    statusText.textContent = error instanceof Error ? error.message : "生成に失敗しました";
  } finally {
    setLoading(false);
  }
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
