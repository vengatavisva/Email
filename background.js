function categorizeEmail(email) {
  const categories = {
    assignments: ["assignment", "homework", "due"],
    personal: ["meeting", "hello", "hi"],
    promotions: ["sale", "offer", "discount"],
    social: ["invitation", "friend", "party"]
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => email.snippet?.includes(keyword))) {
      return category;
    }
  }
  return "uncategorized";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchEmails") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }

      fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (!data.messages) {
            sendResponse({ error: "No messages found." });
            return;
          }

          const emails = [];
          const fetchEmailDetails = data.messages.map(message =>
            fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
              .then(res => res.json())
              .then(email => {
                const category = categorizeEmail(email);
                emails.push({ id: email.id, category });
              })
          );

          Promise.all(fetchEmailDetails).then(() => {
            sendResponse({ emails });
          });
        })
        .catch(error => sendResponse({ error: error.message }));
    });

    return true; // Keeps the message channel open for async response.
  }
});
