document.getElementById("btn").addEventListener("click", async () => {
  const pass = document.getElementById("password").value.trim();
  const err = document.getElementById("err");
  err.textContent = "";

  if (!pass) {
    err.textContent = "⚠️ Vui lòng nhập mật khẩu";
    return;
  }

  try {
    const r = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass })
    });

    if (r.ok) {
      window.location.href = "/";
    } else {
      const d = await r.json();
      err.textContent = d.error || "Sai mật khẩu";
    }
  } catch {
    err.textContent = "❌ Lỗi kết nối server";
  }
});
