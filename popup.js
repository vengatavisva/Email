const categories = {
  assignments: ["assignment", "homework", "due"],
  personal: ["hi", "hello", "meeting"],
  promotions: ["sale", "offer", "discount"],
  social: ["follow", "like", "comment"]
};

let categorizedEmails = {
  assignments: [],
  personal: [],
  promotions: [],
  social: [],
  uncategorized: []
};

function categorizeEmail(email) {
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => email.snippet?.toLowerCase().includes(keyword))) {
      return category;
    }
  }
  return "uncategorized";
}

function fetchEmails() {
  chrome.runtime.sendMessage({ action: "fetchEmails" }, (response) => {
    const emails = response.emails;
    categorizedEmails = {
      assignments: [],
      personal: [],
      promotions: [],
      social: [],
      uncategorized: []
    };

    emails.forEach((email) => {
      const category = categorizeEmail(email);
      categorizedEmails[category].push(email);
    });

    displayCategories();
  });
}

function displayCategories() {
  const categoriesDiv = document.getElementById("categories");
  categoriesDiv.innerHTML = Object.keys(categorizedEmails)
    .map(
      (category) =>
        `<button data-category="${category}">${category} (${categorizedEmails[category].length})</button>`
    )
    .join("");

  document.querySelectorAll("#categories button").forEach((button) => {
    button.addEventListener("click", () => {
      displayEmails(button.dataset.category);
    });
  });
}

function displayEmails(category) {
  const emailsDiv = document.getElementById("emails");
  emailsDiv.innerHTML = categorizedEmails[category]
    .map(
      (email) =>
        `<div class="email-item" data-id="${email.id}">
           <p><strong>Snippet:</strong> ${email.snippet}</p>
           <button onclick="openEmail('${email.id}')">Open Email</button>
         </div>`
    )
    .join("");
}

function openEmail(emailId) {
  // Use Gmail's format to open the specific email
  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${emailId}`;
  window.open(gmailUrl, "_blank");
}

document.getElementById("fetch-emails").addEventListener("click", fetchEmails);
