document.addEventListener("DOMContentLoaded", () => {
    if (!firebase.apps.length) {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in your HTML.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();

    const subscriptionForm = document.getElementById("subscriptionForm");
    const subscriptionMessage = document.getElementById("subscriptionMessage");

    subscriptionForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            alert("⚠️ Please enter an email.");
            return;
        }

        db.collection("subscribers").add({
            email: email || null
            subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            subscriptionMessage.style.display = "block";
            subscriptionForm.reset();
        }).catch(error => {
            console.error("❌ Error adding subscriber:", error);
        });
    });
});
