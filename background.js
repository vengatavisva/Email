let mails={};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchEmails") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error("Error in getting token:", chrome.runtime.lastError);
        sendResponse({ emails: [] });
        return;
      }

      fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.messages) {
            throw new Error("No messages found");
          }

          const emailPromises = data.messages.map((message) =>
            fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json())
          );

          return Promise.all(emailPromises);
        })
        .then((emails) => sendResponse({ emails }))
        .catch((error) => {
          console.error("Error fetching emails:", error);
          sendResponse({ emails: [] });
        });
    });

    return true; // Keep the message channel open for asynchronous response
  } else if (request.action === "changeAccount") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error("Error in getting token:", chrome.runtime.lastError);
        sendResponse({ success: false });
        return;
      }

      chrome.identity.removeCachedAuthToken({ token: token }, () => {
        chrome.identity.getAuthToken({ interactive: true }, (newToken) => {
          if (chrome.runtime.lastError || !newToken) {
            console.error("Error in getting new token:", chrome.runtime.lastError);
            sendResponse({ success: false });
            return;
          }

          sendResponse({ success: true });
        });
      });
    });

    return true; // Keep the message channel open for asynchronous response
  } else if (request.action === "summarizeEmail") {
    const { emailContent, apiKey } = request;

    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003", // Ensure you are using the correct model
        prompt: `Summarize the following email:\n\n${emailContent}`,
        max_tokens: 150,
        temperature: 0.7,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.choices && data.choices.length > 0) {
          sendResponse({ summary: data.choices[0].text.trim() });
        } else {
          console.error("Unexpected API response:", data);
          sendResponse({ error: "Failed to fetch email summary" });
        }
      })
      .catch((error) => {
        console.error("Error summarizing email:", error);
        sendResponse({ error: "Failed to summarize email" });
      });

    return true; // Keep the message channel open for asynchronous response
  }
});
