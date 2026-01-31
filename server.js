require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const CHANNEL_ID = process.env.CHANNEL_ID;
const USER_TOKEN = process.env.USER_TOKEN;
const MAX_USES = 10;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// ===== WHITELIST IP =====
app.set("trust proxy", true);

app.use((req, res, next) => {
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;

    console.log("IP truy cập:", ip);

    if (!whitelist.includes(ip) && !whitelist.includes(`::ffff:${ip}`)) {
        return res.status(403).json({ message: "IP bị chặn" });
    }
    next();
});


// ===== LOAD ID USAGE =====
const usageFile = "id_usage.json";
let idUsage = fs.existsSync(usageFile)
    ? JSON.parse(fs.readFileSync(usageFile))
    : {};

function saveUsage() {
    fs.writeFileSync(usageFile, JSON.stringify(idUsage, null, 2));
}

// ===== SUBMIT API =====
app.post("/submit", async (req, res) => {
    const { id } = req.body;

    if (!id || !/^\d+$/.test(id)) {
        return res.json({ message: "ID không hợp lệ" });
    }

    if (!idUsage[id]) idUsage[id] = 0;

    if (idUsage[id] >= MAX_USES) {
        return res.json({
            message: `ID ${id} đã hết lượt sử dụng`
        });
    }

    // Gửi Discord
    try {
        await axios.post(
            `https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`,
            { content: `!revive ${id}` },
            {
                headers: {
                    "Authorization": USER_TOKEN,
                    "Content-Type": "application/json"
                }
            }
        );

        idUsage[id]++;
        saveUsage();

        res.json({
            message: `Đã gửi ID ${id}. Còn ${MAX_USES - idUsage[id]} lượt`
        });
    } catch (err) {
        res.json({ message: "Lỗi gửi Discord" });
    }
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
