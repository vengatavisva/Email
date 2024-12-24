document.getElementById("fetch-emails").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "fetchEmails" }, (response) => {
    const emailList = document.getElementById("email-list");
    emailList.innerHTML = ""; // Clear previous emails
    if (response.error) {
      emailList.textContent = "Error fetching emails.";
      return;
    }

    response.emails.forEach(email => {
      const div = document.createElement("div");
      div.textContent = `ID: ${email.id}, Category: ${email.category}`;
      emailList.appendChild(div);
    });
  });
});
