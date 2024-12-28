let allEmails = [];
let selectedEmailId = null;

// Function to fetch emails
function fetchEmails() {
  const initialView = document.getElementById("initial-view");
  const loadingSpinner = document.getElementById("loading-spinner");
  const emailsView = document.getElementById("emails-view");
  const emailsDiv = document.getElementById("emails");
  const openMailBtn = document.getElementById("open-mail");

  // Show the loading spinner
  initialView.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");

  // Simulate fetch emails
  chrome.runtime.sendMessage({ action: "fetchEmails" }, (response) => {
    // Hide the loading spinner
    loadingSpinner.classList.add("hidden");

    if (response.emails.length === 0) {
      emailsDiv.innerHTML = "<p>No emails found.</p>";
    } else {
      allEmails = response.emails;
      selectedEmailId = allEmails[0].id; // Automatically select the first email
      openMailBtn.classList.add("visible");
      displayEmails(allEmails);
      emailsView.classList.remove("hidden");
    }
  });
}

// Function to display emails
function displayEmails(emails) {
  const emailsDiv = document.getElementById("emails");
  emailsDiv.innerHTML = ""; // Clear previous content

  emails.forEach((email) => {
    const emailCard = document.createElement("div");
    emailCard.classList.add("email-card");
    emailCard.innerHTML = `
      <h3>${email.payload.headers.find((header) => header.name === "Subject")?.value || "No Subject"}</h3>
      <p><strong>From:</strong> ${
        email.payload.headers.find((header) => header.name === "From")?.value || "Unknown Sender"
      }</p>
      <p>${email.snippet || "No preview available."}</p>
    `;
    emailsDiv.appendChild(emailCard);

    emailCard.addEventListener("click", () => {
      selectedEmailId = email.id;
    });
  });
}

// Function to open the selected email in Gmail
function openEmail() {
  if (selectedEmailId) {
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${selectedEmailId}`;
    chrome.tabs.create({ url: gmailUrl });
  } else {
    alert("No email selected.");
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fetch-emails").addEventListener("click", fetchEmails);
  document.getElementById("open-mail").addEventListener("click", openEmail);
});