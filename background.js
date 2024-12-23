const CLIENT_ID = "813615032801-t25gvba90l0s68it680bu2hh9cg2q1ns.apps.googleusercontent.com"; // Replace with your Client ID
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify"; // Read and modify Gmail

// Handle OAuth2 authentication
chrome.runtime.onInstalled.addListener(() => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.log("Error getting token: ", chrome.runtime.lastError);
    } else {
      console.log("Authenticated successfully");
      // Fetch emails after successful authentication
      fetchEmails(token);
    }
  });
});

// Fetch emails using Gmail API
function fetchEmails(token) {
  fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Send the email data to the popup script
      chrome.runtime.sendMessage({ action: "displayEmails", emails: data.messages });
    })
    .catch(error => console.error("Error fetching emails:", error));
}

// Listen for messages to trigger email fetch
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getEmails") {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      fetchEmails(token);
    });
  }
});
