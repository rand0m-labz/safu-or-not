function normalizeUrl(input) {
  let url = input.trim()
  if (!url) return ""
  if (url.startsWith("www.")) url = "https://" + url
  if (!url.startsWith("http://") && !url.startsWith("https://"))
    url = "https://" + url
  return url
}

async function safuCheckUrl() {
  const resultBox = document.getElementById("safu-result")
  const raw = document.getElementById("safu-url").value
  const finalUrl = normalizeUrl(raw)

  if (!finalUrl) {
    resultBox.textContent = "❌ ERROR: Please enter a valid URL."
    return
  }

  resultBox.classList.add("safu-loading-text")
  resultBox.textContent = "🔎 Checking…"

  try {
    const response = await fetch("https://safu-or-not.onrender.com/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: finalUrl }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      resultBox.textContent =
        "❌ ERROR: SAFU service returned a problem.\n" + errorText
      return
    }

    const data = await response.json()

    const scanningLine = `🔍 Scanning: ${data.url || finalUrl}`

    const verdict =
      data.status && data.status.toLowerCase() === "safe"
        ? "✅ RESULT: SAFU"
        : "🚨 RESULT: NOT SAFU"

    const detailsLine = data.details || "No known threats detected."

    const domain = data.domain_age || "Unknown"
    const ssl = data.ssl_status || "Unknown"
    const wallet =
      data.wallet_required === "yes"
        ? "👛 Wallet Connection: Required"
        : data.wallet_required === "no"
        ? "👛 Wallet Connection: Not Required"
        : "👛 Wallet Connection: Unknown"
    resultBox.classList.remove("safu-loading-text")
    resultBox.textContent =
      `${scanningLine}\n` +
      `${verdict}\n\n` +
      `${detailsLine}\n\n` +
      `🕒 Domain age: ${domain}\n` +
      `🔐 SSL: ${ssl}\n` +
      `${wallet}`
  } catch (err) {
    resultBox.classList.remove("safu-loading-text")
    resultBox.textContent = "❌ ERROR: Could not reach SAFU service."
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("safu-check-btn")
  if (btn) btn.addEventListener("click", safuCheckUrl)

  document.getElementById("safu-url").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault()
      safuCheckUrl()
    }
  })
})
