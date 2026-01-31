require("dotenv").config();
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 2007;
const CHANNEL_ID = process.env.CHANNEL_ID;
const USER_TOKEN = process.env.USER_TOKEN;
const MAX_USES = 10;

// ==================
// TRUST PROXY (VPS)
// ==================
app.set("trust proxy", true);

// ==================
// BODY PARSER
// ==================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================
// LOAD WHITELIST IP
// ==================
const WHITELIST_FILE = "ip.txt";
let whitelist = [];

function loadWhitelist() {
    try {
        whitelist = fs
            .readFileSync(WHITELIST_FILE, "utf-8")
            .split("\n")
            .map(ip => ip.trim())
            .filter(Boolean);
        console.log("Whitelist IP:", whitelist);
    } catch (err) {
        console.error("Không đọc được ip.txt");
        whitelist = [];
    }
}
loadWhitelist();

// ==================
// WHITELIST MIDDLEWARE
// ==================
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

// ==================
// STATIC FILE
// ==================
app.use(express.static("public"));

// ==================
// LOAD ID USAGE (SAFE)
// ==================
const USAGE_FILE = "id_usage.json";
let idUsage = {};

function loadUsage() {
    try {
        if (fs.existsSync(USAGE_FILE)) {
            const data = fs.readFileSync(USAGE_FILE, "utf-8").trim();
            idUsage = data ? JSON.parse(data) : {};
        } else {
            idUsage = {};
        }
    } catch (err) {
        console.error("Lỗi đọc id_usage.json, reset");
        idUsage = {};
    }
}
loadUsage();

function saveUsage() {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(idUsage, null, 2));
}

// ==================
// SUBMIT API
// ==================
app.post("/submit", async (req, res) => {
    console.log("BODY:", req.body);

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

    try {
        await axios.post(
            `https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`,
            { content: `!revive ${id}` },
            {
                headers: {
                    Authorization: USER_TOKEN,
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
        console.error(err.response?.data || err.message);
        res.json({ message: "Lỗi gửi Discord" });
    }
});

// ==================
// START SERVER
// ==================
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
