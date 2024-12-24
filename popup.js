chrome.identity.getAuthToken({ interactive: true }, (token) => {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    document.getElementById("emailList").textContent = "Error fetching emails.";
    return;
  }

  fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      const emailList = document.getElementById("emailList");
      emailList.innerHTML = ""; // Clear previous content

      data.messages.forEach((message) => {
        const emailItem = document.createElement("div");
        emailItem.textContent = `Email ID: ${message.id}`;
        emailList.appendChild(emailItem);
      });
    })
    .catch(error => {
      console.error("Error fetching emails:", error);
      document.getElementById("emailList").textContent = "Failed to fetch emails.";
    });
});
