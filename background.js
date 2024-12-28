chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchEmails") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({ emails: [] });
        return;
      }

      fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.messages) {
            throw new Error("No messages found");
          }

          const emailPromises = data.messages.map((message) =>
            fetch(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ).then((res) => res.json())
          );

          return Promise.all(emailPromises);
        })
        .then((emails) => {
          sendResponse({ emails });
        })
        .catch((error) => {
          console.error("Error fetching emails:", error);
          sendResponse({ emails: [] });
        });
    });

    return true; // Keep the message channel open for asynchronous response
  }
});