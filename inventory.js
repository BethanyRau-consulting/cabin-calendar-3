document.addEventListener("DOMContentLoaded", () => {
    // Check for Firebase
    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded. Ensure scripts are included in HTML.");
        return;
    }

    console.log("✅ Firebase SDK detected. Initializing Firestore...");
    const db = firebase.firestore();
    const inventoryList = document.getElementById("inventory-list");
    const addItemForm = document.getElementById("add-item-form");
    const nameInput = document.getElementById("item-name");
    const qtyInput = document.getElementById("item-quantity");
    const neededInput = document.getElementById("item-needed");

    function renderInventoryItem(doc) {
        const data = doc.data();

        const li = document.createElement("li");
        li.className = "inventory-item";
        if (data.needed) li.classList.add("needed");

        li.innerHTML = `
            <div class="item-info"><strong>${data.name}</strong> - Qty: ${data.quantity}</div>
            <div class="item-actions">
                <button class="toggle-needed" data-id="${doc.id}">
                    ${data.needed ? "✔️" : "❌"}
                </button>
                <button class="delete-item" data-id="${doc.id}">🗑️</button>
            </div>
        `;

        inventoryList.appendChild(li);
    }

    function fetchInventory() {
        inventoryList.innerHTML = "";
        db.collection("cabinInventory").orderBy("name").onSnapshot(snapshot => {
            inventoryList.innerHTML = "";
            snapshot.forEach(doc => renderInventoryItem(doc));
        });
    }

    addItemForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const quantity = parseInt(qtyInput.value);
        const needed = neededInput.checked;

        if (!name || quantity <= 0) {
            alert("Please enter a valid item name and quantity.");
            return;
        }

        await db.collection("cabinInventory").add({
            name,
            quantity,
            needed,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        addItemForm.reset();
    });

    inventoryList.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        const itemRef = db.collection("cabinInventory").doc(id);

        if (e.target.classList.contains("toggle-needed")) {
            const docSnap = await itemRef.get();
            if (docSnap.exists) {
                const current = docSnap.data().needed;
                await itemRef.update({ needed: !current });
            }
        }

        if (e.target.classList.contains("delete-item")) {
            if (confirm("Delete this item?")) {
                await itemRef.delete();
            }
        }
    });

    fetchInventory();
});
