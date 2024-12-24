function categorizeEmail(email) {
  const categories = {
    assignments: ["assignment", "homework", "due"],
    personal: ["hi", "hello", "meeting"],
    promotions: ["sale", "offer", "discount"]
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => email.snippet.includes(keyword))) {
      return category;
    }
  }
  return "uncategorized";
}

chrome.identity.getAuthToken({ interactive: true }, (token) => {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }

  fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log("Fetched emails:", data);
      data.messages.forEach((message) => {
        fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(response => response.json())
          .then(email => {
            const category = categorizeEmail(email);
            console.log(`Email ID: ${email.id}, Category: ${category}`);
          });
      });
    })
    .catch(error => {
      console.error("Error fetching emails:", error);
    });
});
