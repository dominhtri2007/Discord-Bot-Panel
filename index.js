require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const USER_TOKEN = process.env.USER_TOKEN;
const TELE_CHANNEL_ID = BigInt(process.env.TELE_CHANNEL_ID || "0");
const RV_CHANNEL_ID = BigInt(process.env.RV_CHANNEL_ID || "0");
const ACTION_CHANNEL_ID = BigInt(process.env.ACTION_CHANNEL_ID || "0");
const app = express();
app.get("/", (req, res) => {
  res.send("Bot is running...");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(":", PORT);
});
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
async function sendUserMessage(channelId, content) {
  try {
    const res = await axios.post(
      `https://discord.com/api/v9/channels/${channelId}/messages`,
      { content },
      {
        headers: {
          "Authorization": USER_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );
    return res.status === 200 || res.status === 201;
  } catch (err) {
    if (err.response) {
      console.error(`Lỗi gửi tin nhắn: ${err.response.status}`, err.response.data);
    } else {
      console.error("Lỗi gửi:", err.message);
    }
    return false;
  }
}
client.once("ready", () => {
  console.log(`Bot đang chạy dưới tên: ${client.user.tag}`);
});
// ===== Listen message =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id === TELE_CHANNEL_ID.toString()) {
    const matches = message.content.match(/\{?(\d+)\}?/g);
    if (!matches) return;
    for (const match of matches) {
      const userId = match.replace(/[^\d]/g, "");
      const command = `!teleport ${userId} tx1`;

      const ok = await sendUserMessage(ACTION_CHANNEL_ID, command);
      console.log(ok ? "Đã gửi teleport:" : "Teleport thất bại:", command);
    }
  }
  if (message.channel.id === RV_CHANNEL_ID.toString()) {
    const matches = message.content.match(/\{?(\d+)\}?/g);
    if (!matches) return;
    for (const match of matches) {
      const userId = match.replace(/[^\d]/g, "");
      const command = `!revive ${userId}`;
      const ok = await sendUserMessage(ACTION_CHANNEL_ID, command);
      console.log(ok ? "Đã gửi revive:" : "Revive thất bại:", command);
    }
  }
});
client.login(DISCORD_TOKEN);
