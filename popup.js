document.getElementById("openGmail").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://mail.google.com" });
  });
  