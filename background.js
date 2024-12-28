chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchEmails") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        sendResponse({ emails: [] });
        return;
      }

      // Fetch emails using Gmail API
      fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.messages) {
            sendResponse({ emails: [] });
            return;
          }

          const emailPromises = data.messages.map((message) =>
            fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then((res) => res.json())
          );

          Promise.all(emailPromises)
            .then((emails) => sendResponse({ emails }))
            .catch((error) => {
              console.error("Error fetching email details:", error);
              sendResponse({ emails: [] });
            });
        })
        .catch((error) => {
          console.error("Error fetching emails:", error);
          sendResponse({ emails: [] });
        });
    });

    return true; // Required to allow asynchronous sendResponse
  }
});
