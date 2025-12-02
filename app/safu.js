function safuCheckUrl() {
    const url = document.getElementById("safu-url").value.trim();
    const resultBox = document.getElementById("safu-result");

    if (!url) {
        resultBox.textContent = "Please enter a website URL.";
        return;
    }

    resultBox.textContent = "Scanning…";

    fetch("https://safu-or-not.onrender.com/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    })
    .then(res => res.json())
    .then(data => {
        resultBox.textContent =
            "STATUS: " + data.status.toUpperCase() + "\n" +
            "DETAILS: " + data.details;
    })
    .catch(() => {
        resultBox.textContent = "ERROR: Could not reach SAFU service.";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("safu-check-btn");
    if (btn) {
        btn.addEventListener("click", safuCheckUrl);
    }
});
