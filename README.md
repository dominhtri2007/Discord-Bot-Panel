
---

```md
# Discord Control Panel

Một **bảng điều khiển quản trị Discord** cho phép admin quản lý server thông qua giao diện web.

Dự án hỗ trợ:
- Gửi tin nhắn vào channel Discord
- Gửi file / hình ảnh
- Sửa tin nhắn theo Message ID
- Đăng bài vào **Forum Channel**
- Đăng nhập admin bằng session

Phù hợp cho:
- Bot thông báo
- Quản trị server Discord
- Công cụ admin nội bộ

---

## ✨ Tính năng

- 🔐 Đăng nhập admin (session-based)
- 💬 Gửi tin nhắn Discord (text)
- 📎 Gửi file / hình ảnh
- ✏️ Sửa tin nhắn đã gửi
- 🧵 Đăng bài Forum Channel
- 🖼️ Preview markdown + hình ảnh realtime
- 🎨 Web UI hiện đại (HTML / CSS / JS)
- ⚙️ Backend Node.js + Discord API

---

## 🧱 Công nghệ sử dụng

- Node.js
- Express
- discord.js
- express-session
- multer
- node-fetch
- HTML / CSS / JavaScript (Vanilla)

---

## 📁 Cấu trúc thư mục

```

```discord-control-panel/
├─ server.js
├─ package.json
├─ .env
├─ public/
│  ├─ index.html
│  ├─ login.html
│  ├─ style.css
│  ├─ app.js
│  └─ login.js
└─ uploads/

````

---

## ⚙️ Cài đặt & chạy

### 1️⃣ Clone project
```bash
git clone https://github.com/USERNAME/discord-control-panel.git
cd discord-control-panel
````

### 2️⃣ Cài thư viện

```bash
npm install
```

### 3️⃣ Tạo file `.env`

```env
PORT=3000
BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
ADMIN_PASS=YOUR_ADMIN_PASSWORD
SESSION_SECRET=CHANGE_THIS_SECRET
```

> Bot cần các quyền:
>
> * Send Messages
> * Attach Files
> * Create Threads (Forum)

---

### 4️⃣ Chạy server

```bash
node server.js
```

Truy cập:

```
http://localhost:3000
```

---

## 🔐 Đăng nhập

* Mở `/login.html`
* Nhập mật khẩu admin (`ADMIN_PASS`)
* Sau khi đăng nhập sẽ vào trang panel chính

---

## 🧵 Forum Channel

* Chỉ hoạt động với **Discord Forum Channel**
* Bot phải có quyền:

  * View Channel
  * Send Messages
  * Create Threads
  * Attach Files

---

## 🛡️ Bảo mật

* Xác thực bằng session
* Cookie `httpOnly`
* API gửi/sửa/đăng bài yêu cầu đăng nhập
* Token Discord không lộ ra frontend

---

## 📌 Ghi chú

* Static files được serve qua `/static`
* File upload được xoá sau khi gửi
* Không dùng database (nhẹ, dễ triển khai)

---

## 🚀 Hướng phát triển

* [ ] Phân quyền nhiều admin
* [ ] Lịch sử gửi / sửa tin
* [ ] Dark / Light mode
* [ ] Rate limit / chống spam
* [ ] Docker support

---

## 📄 License

MIT License
(Có thể đổi sang private nếu dùng nội bộ)

---

## 👤 Tác giả

Developed by **tricoder_gojosama**
Discord Control Panel – 2025
