marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});
const $ = id => document.getElementById(id);
const channelInput = $("channelId");
const msg = $("msg");
const fileInput = $("fileInput");
const msgPreview = $("msgPreview");
const msgImagePreview = $("msgImagePreview");
const sendBtn = $("sendBtn");
const status = $("status");
const editChannelId = $("editChannelId");
const editMessageId = $("editMessageId");
const editContent = $("editContent");
const editPreview = $("editPreview");
const editBtn = $("editBtn");
const editStatus = $("editStatus");
const forumChannelId = $("forumChannelId");
const forumTitle = $("forumTitle");
const forumContent = $("forumContent");
const forumPreview = $("forumPreview");
const forumImage = $("forumImage");
const forumImagePreview = $("forumImagePreview");
const forumBtn = $("forumBtn");
const forumStatus = $("forumStatus");
msg.addEventListener("input", () => {
  msgPreview.innerHTML = marked.parse(msg.value || "_Không có nội dung_");
});
editContent.addEventListener("input", () => {
  editPreview.innerHTML = marked.parse(editContent.value || "_Không có nội dung_");
});
forumContent.addEventListener("input", () => {
  forumPreview.innerHTML = marked.parse(forumContent.value || "_Không có nội dung_");
});
function previewImages(files, container) {
  container.innerHTML = "";
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    container.appendChild(img);
  }
}
fileInput.addEventListener("change", () =>
  previewImages(fileInput.files, msgImagePreview)
);
forumImage.addEventListener("change", () =>
  previewImages(forumImage.files, forumImagePreview)
);
sendBtn.addEventListener("click", async () => {
  const channelId = channelInput.value.trim();
  const content = msg.value.trim();
  const files = fileInput.files;
  if (!channelId)
    return showError(status, "⚠️ Nhập Channel ID!");
  if (!content && files.length === 0)
    return showError(status, "⚠️ Nhập nội dung hoặc chọn file!");

  status.textContent = "⏳ Đang gửi...";
  status.className = "statusthuky";
  try {
    let res, data;
    if (files.length) {
      const form = new FormData();
      form.append("channelId", channelId);
      if (content) form.append("content", content);
      for (const f of files) form.append("files", f);
      res = await fetch("/send-file", { method: "POST", body: form });
    } else {
      res = await fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, content })
      });
    }
    data = await res.json();
    if (!res.ok) throw data;
    status.textContent = "✅ Đã gửi!";
    status.classList.add("success");
    localStorage.setItem("channelId", channelId);
  } catch (e) {
    showError(status, "❌ " + (e.error || "Lỗi gửi tin"));
  }
});
editBtn.addEventListener("click", async () => {
  const channelId = editChannelId.value.trim();
  const messageId = editMessageId.value.trim();
  const newContent = editContent.value.trim();
  if (!channelId || !messageId || !newContent)
    return showError(editStatus, "⚠️ Điền đủ Channel ID, Message ID và nội dung!");
  editStatus.textContent = "⏳ Đang sửa...";
  editStatus.className = "statusthuky";
  try {
    const res = await fetch("/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, messageId, newContent })
    });
    const data = await res.json();
    if (!res.ok) throw data;
    editStatus.textContent = "✅ Đã sửa!";
    editStatus.classList.add("success");
  } catch (e) {
    showError(editStatus, "❌ " + (e.error || "Lỗi sửa tin"));
  }
});
forumBtn.addEventListener("click", async () => {
  const channelId = forumChannelId.value.trim();
  const title = forumTitle.value.trim();
  const message = forumContent.value.trim();
  const images = forumImage.files;
  if (!channelId || !title)
    return showError(forumStatus, "⚠️ Nhập Channel ID và tiêu đề!");
  forumStatus.textContent = "⏳ Đang đăng...";
  forumStatus.className = "statusthuky";
  try {
    const form = new FormData();
    form.append("channelId", channelId);
    form.append("title", title);
    form.append("message", message);
    for (const img of images) form.append("image", img);
    const res = await fetch("/forum", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw data;
    forumStatus.textContent = "✅ Bài đăng đã được tạo!";
    forumStatus.classList.add("success");
  } catch (e) {
    showError(forumStatus, "❌ " + (e.error || "Lỗi đăng forum"));
  }
});
function showError(el, msg) {
  el.textContent = msg;
  el.className = "statusthuky error";
}
