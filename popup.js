let emailsBySender = {};
let instagramEmails = [];

function fetchEmails() {
  const initialView = document.getElementById("initial-view");
  const loadingSpinner = document.getElementById("loading-spinner");
  const foldersView = document.getElementById("folders-view");

  // Show loading spinner and hide initial view
  initialView.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");

  // Send message to fetch emails
  chrome.runtime.sendMessage({ action: "fetchEmails" }, (response) => {
    loadingSpinner.classList.add("hidden");

    if (!response || response.emails.length === 0) {
      const foldersContainer = document.getElementById("folders-container");
      foldersContainer.innerHTML = "<p>No emails found.</p>";
    } else {
      groupEmailsBySender(response.emails);
      renderEmailFolders();
      foldersView.classList.remove("hidden");
    }
  });
}

function groupEmailsBySender(emails) {
  emailsBySender = {}; // Clear previous groupings
  instagramEmails = []; // Reset Instagram emails group

  emails.forEach((email) => {
    const sender = email.payload?.headers?.find((header) => header.name === "From")?.value || "Unknown Sender";
    const senderName = sender.split("<")[0].trim(); // Extract sender's name

    // Check if the email is from Instagram
    if (sender.includes("instagram.com")) {
      instagramEmails.push(email); // Add Instagram emails to the instagramEmails array
    } else {
      // Otherwise, group them by sender
      if (!emailsBySender[senderName]) {
        emailsBySender[senderName] = [];
      }
      emailsBySender[senderName].push(email);
    }
  });
}

function renderEmailFolders() {
  const foldersContainer = document.getElementById("folders-container");
  foldersContainer.innerHTML = ""; // Clear previous content

  // Always display Instagram emails first in a separate folder
  if (instagramEmails.length > 0) {
    const folderDiv = document.createElement("div");
    folderDiv.classList.add("email-folder");
    folderDiv.innerHTML = `
      <img src="folder-icon.png" alt="Folder Icon" class="folder-icon">
      <span class="folder-name">Instagram</span>
    `;
    foldersContainer.appendChild(folderDiv);

    folderDiv.addEventListener("dblclick", () => {
      displayEmailsFromSender("Instagram");
    });
  }

  // Now render other emails by sender
  Object.keys(emailsBySender).forEach((senderName) => {
    const folderDiv = document.createElement("div");
    folderDiv.classList.add("email-folder");
    folderDiv.innerHTML = `
      <img src="folder-icon.png" alt="Folder Icon" class="folder-icon">
      <span class="folder-name">${senderName}</span>
    `;
    foldersContainer.appendChild(folderDiv);

    folderDiv.addEventListener("dblclick", () => {
      displayEmailsFromSender(senderName);
    });
  });
}

function displayEmailsFromSender(senderName) {
  const emailsContainer = document.getElementById("emails");
  const emailsView = document.getElementById("emails-view");
  const foldersView = document.getElementById("folders-view");
  const folderNameHeading = document.getElementById("folder-name");

  // Hide folders view and show emails view
  foldersView.classList.add("hidden");
  emailsView.classList.remove("hidden");

  if (senderName === "Instagram") {
    // Show Instagram emails
    folderNameHeading.textContent = "Instagram";
    emailsContainer.innerHTML = ""; // Clear previous content

    instagramEmails.forEach((email) => {
      const subject = email.payload?.headers?.find((header) => header.name === "Subject")?.value || "No Subject";
      const snippet = email.snippet || "No preview available.";

      const emailCard = document.createElement("div");
      emailCard.classList.add("email-card");
      emailCard.innerHTML = `
        <h3>${subject}</h3>
        <p>${snippet}</p>
      `;
      emailsContainer.appendChild(emailCard);

      emailCard.addEventListener("dblclick", () => {
        openEmail(email.id);
      });
    });
  } else {
    // Show emails from other senders
    folderNameHeading.textContent = senderName;
    emailsContainer.innerHTML = ""; // Clear previous content

    emailsBySender[senderName].forEach((email) => {
      const subject = email.payload?.headers?.find((header) => header.name === "Subject")?.value || "No Subject";
      const snippet = email.snippet || "No preview available.";

      const emailCard = document.createElement("div");
      emailCard.classList.add("email-card");
      emailCard.innerHTML = `
        <h3>${subject}</h3>
        <p>${snippet}</p>
      `;
      emailsContainer.appendChild(emailCard);

      emailCard.addEventListener("dblclick", () => {
        openEmail(email.id);
      });
    });
  }
}

function openEmail(emailId) {
  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${emailId}`;
  chrome.tabs.create({ url: gmailUrl });
}

// Back to Folders Button Listener
document.getElementById("back-to-folders").addEventListener("click", () => {
  const foldersView = document.getElementById("folders-view");
  const emailsView = document.getElementById("emails-view");

  // Hide emails view and show folders view
  emailsView.classList.add("hidden");
  foldersView.classList.remove("hidden");
});

// Event Listener for Fetch Emails Button
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fetch-emails").addEventListener("click", fetchEmails);
});
