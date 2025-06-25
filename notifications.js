//NOT IN USE!

document.addEventListener("DOMContentLoaded", () => {
    // Check if Firebase has been initialized
    if (!firebase.apps.length) {
        console.error("Firebase SDK not loaded. Ensure scripts are included in your HTML.");
        return;
    }

    console.log("Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore(); // Initialize Firestore database

    const subscriptionForm = document.getElementById("subscriptionForm");
    const subscriptionMessage = document.getElementById("subscriptionMessage");

    // Listen for form submission
    subscriptionForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submit behavior (page reload)

        const email = document.getElementById("email").value.trim(); // Get the email input and trim whitespace

        // Validate email input
        if (!email) {
            alert("Please enter an email.");
            return;
        }

        // Add a new subscriber document to the "subscribers" collection in Firestore
        db.collection("subscribers").add({
            email: email, // Store the entered email
            subscribedAt: firebase.firestore.FieldValue.serverTimestamp() // Store the current server timestamp
        }).then(() => {
            // Show success message and reset the form on successful write
            subscriptionMessage.style.display = "block";
            subscriptionForm.reset();
        }).catch(error => {
            // Log any errors that occur while adding the subscriber
            console.error("Error adding subscriber:", error);
        });
    });
});
