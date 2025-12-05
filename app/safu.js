// Normalize user input into a valid full URL
function normalizeUrl(input) {
  let url = input.trim()

  if (!url) return ""

  if (url.startsWith("www.")) {
    url = "https://" + url
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url
  }

  return url
}

// Main checker function
async function safuCheckUrl() {
  const resultBox = document.getElementById("safu-result")
  const raw = document.getElementById("safu-url").value
  const finalUrl = normalizeUrl(raw)

  if (!finalUrl) {
    resultBox.textContent = "ERROR: Please enter a valid URL."
    return
  }

  resultBox.textContent = "Checking…"

  try {
    const response = await fetch("https://safu-or-not.onrender.com/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: finalUrl }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      resultBox.textContent =
        "ERROR: SAFU service returned a problem.\n" + errorText
      return
    }

    const data = await response.json()

    const scanningLine = data.url
      ? `Scanning: ${data.url}`
      : `Scanning: ${finalUrl}`
    const verdict =
      data.status && data.status.toLowerCase() === "safe"
        ? "✅ RESULT: SAFE"
        : "⚠️ RESULT: NOT SAFE"

    const detailsLine = data.details
      ? data.details
      : "No additional threat details available."

    resultBox.textContent = `${scanningLine}\n\n` + `${verdict}\n`
  } catch (err) {
    resultBox.textContent = "ERROR: Could not reach SAFU service."
  }
}

// Attach button click handler
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("safu-check-btn")
  if (btn) btn.addEventListener("click", safuCheckUrl)
})
