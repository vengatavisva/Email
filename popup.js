<<<<<<< HEAD
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
=======
document.addEventListener("DOMContentLoaded", () => {
  const emailList = document.getElementById("emailList");
  const searchButton = document.getElementById("searchButton");
  const organizeButton = document.getElementById("organizeButton");
  const searchInput = document.getElementById("searchInput");

  // Function to fetch emails
  const fetchEmails = () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        emailList.innerHTML = `<p style="color: red;">Error fetching emails. Please try again.</p>`;
        return;
      }

      fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          emailList.innerHTML = ""; // Clear previous content

          if (data.messages && data.messages.length > 0) {
            data.messages.forEach((message) => {
              const emailItem = document.createElement("div");
              emailItem.className = "email-item";
              emailItem.textContent = `Email ID: ${message.id}`;
              emailList.appendChild(emailItem);
            });
          } else {
            emailList.innerHTML = `<p style="color: gray;">No emails found.</p>`;
          }
        })
        .catch((error) => {
          console.error("Error fetching emails:", error);
          emailList.innerHTML = `<p style="color: red;">Failed to fetch emails. Please check your connection and try again.</p>`;
        });
    });
  };

  // Event listener for the "Search" button
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      emailList.innerHTML = `<p style="color: gray;">Searching for emails...</p>`;
      // Add Gmail search API integration here if needed
      console.log(`Search initiated for query: ${query}`);
    } else {
      emailList.innerHTML = `<p style="color: red;">Please enter a search term.</p>`;
    }
  });

  // Event listener for the "Organize Emails" button
  organizeButton.addEventListener("click", () => {
    emailList.innerHTML = `<p style="color: gray;">Organizing emails...</p>`;
    // Add email organization logic here
    console.log("Organize Emails button clicked.");
  });

  // Initial fetch to load emails
  fetchEmails();
>>>>>>> 688a0b9444ad2700f6c5bb3da4af8a88013a4b5d
});

