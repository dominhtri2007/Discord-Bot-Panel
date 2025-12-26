const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const path = require("path");
const { execFile } = require("child_process");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const { Client, GatewayIntentBits, ChannelType } = require("discord.js");
dotenv.config();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.once("ready", () => console.log(`✅ Bot Forum đăng nhập: ${client.user.tag}`));
client.login(process.env.DISCORD_TOKEN || process.env.BOT_TOKEN);
app.use(session({
  name: 'thongbao_sid',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use('/static', express.static(path.join(__dirname, 'public')));
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
let currentChannel = process.env.CHANNEL_ID;
const ADMIN_PASS = process.env.ADMIN_PASS;
const upload = multer({ dest: "uploads/" });
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuth) return next();
  if (req.headers.accept && req.headers.accept.includes("application/json"))
    return res.status(401).json({ error: "Unauthorized" });
  return res.redirect("/login.html");
}
app.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASS) return res.status(403).json({ error: "Sai mật khẩu." });

  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: "Session error" });
    req.session.isAuth = true;
    return res.json({ ok: true });
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("thongbao_sid");
    return res.json({ ok: true });
  });
});
app.post("/send", requireAuth, async (req, res) => {
  try {
    const { content, channelId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Nội dung trống." });
    if (!channelId) return res.status(400).json({ error: "Thiếu Channel ID." });

    const resp = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!resp.ok) return res.status(resp.status).json({ error: await resp.text() });
    const data = await resp.json();
    res.json({ ok: true, messageId: data.id, channelId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/send-file", requireAuth, upload.array("files", 10), async (req, res) => {
  try {
    const { content, channelId } = req.body;
    if (!channelId) return res.status(400).json({ error: "Thiếu Channel ID." });
    const files = req.files;
    if (!files?.length) return res.status(400).json({ error: "Chưa chọn file." });

    const form = new FormData();
    if (content) form.append("content", content);
    files.forEach((f, i) => form.append(`files[${i}]`, fs.createReadStream(f.path), f.originalname));

    const resp = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      body: form,
    });

    files.forEach(f => fs.unlink(f.path, () => {}));

    if (!resp.ok) return res.status(resp.status).json({ error: await resp.text() });
    const data = await resp.json();
    res.json({ ok: true, messageId: data.id, channelId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/edit", requireAuth, async (req, res) => {
  try {
    const { channelId, messageId, newContent } = req.body;
    if (!channelId || !messageId || !newContent)
      return res.status(400).json({ error: "Thiếu dữ liệu." });

    const resp = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      }
    );

    if (!resp.ok) return res.status(resp.status).json({ error: await resp.text() });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/php", requireAuth, (req, res) => {
  const phpFile = req.body.file || "index.php";
  const args = req.body.args ? req.body.args.split(" ") : [];
  execFile("php", [phpFile, ...args], (error, stdout, stderr) => {
    if (error) {
      console.error("PHP error:", stderr);
      return res.status(500).json({ error: stderr || error.message });
    }
    res.type("text/plain").send(stdout);
  });
});
app.post("/forum", requireAuth, upload.array("image", 5), async (req, res) => {
  try {
    const { channelId, title, message } = req.body;
    if (!channelId)
      return res.status(400).json({ error: "Thiếu Channel ID (Forum)." });

    const forum = await client.channels.fetch(channelId);
    if (!forum || forum.type !== ChannelType.GuildForum)
      return res.status(400).json({ error: "Kênh không phải là forum hợp lệ!" });

    const options = {
      name: title || "Bài viết không tiêu đề",
      message: { content: message || "(Không có nội dung)" },
    };
    if (req.files && req.files.length > 0) {
      options.message.files = req.files.map(f => ({
        attachment: f.path,
        name: f.originalname
      }));
    }
    const thread = await forum.threads.create(options);
    req.files?.forEach(f => fs.unlinkSync(f.path));
    res.json({ ok: true, threadId: thread.id });
  } catch (err) {
    console.error("Forum error:", err);
    if (err.code === 40005)
      res.status(400).json({ error: "❌ File vượt quá giới hạn 25MB của Discord." });
    else
      res.status(500).json({ error: "Lỗi khi tạo bài đăng!" });
  }
});
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/", (req, res) => {
  if (req.session?.isAuth)
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  res.redirect("/login.html");
});
const PORT = process.env.PORT;
if (!PORT) {
  console.error("❌ Thiếu PORT trong .env");
  process.exit(1);
}
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
