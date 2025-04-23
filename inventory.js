document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const inventoryList = document.getElementById("inventory-list");
  const form = document.getElementById("add-item-form");
  const nameInput = document.getElementById("item-name");
  const qtyInput = document.getElementById("item-quantity");
  const neededInput = document.getElementById("item-needed");

  function renderItem(doc) {
    const data = doc.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.Name}</td>
      <td>${data.Quantity}</td>
      <td>
        <input type="checkbox" class="toggle-needed" data-id="${doc.id}" ${data.Needed ? "checked" : ""}>
      </td>
      <td>
        <button class="delete-item" data-id="${doc.id}">Delete</button>
      </td>
    `;

    inventoryList.appendChild(row);
  }

  function fetchInventory() {
    inventoryList.innerHTML = "";
    db.collection("inventory").orderBy("Name").onSnapshot(snapshot => {
      inventoryList.innerHTML = "";
      snapshot.forEach(doc => renderItem(doc));
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const quantity = parseInt(qtyInput.value);
    const needed = neededInput.checked;

    if (!name || quantity <= 0) {
      alert("Please enter a valid item name and quantity.");
      return;
    }

    await db.collection("inventory").add({
      Name: name,
      Quantity: quantity,
      Needed: needed,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    form.reset();
  });

  inventoryList.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    const ref = db.collection("inventory").doc(id);

    if (e.target.classList.contains("toggle-needed")) {
      const docSnap = await ref.get();
      if (docSnap.exists) {
        const current = docSnap.data().Needed;
        await ref.update({ Needed: !current });
      }
    }

    if (e.target.classList.contains("delete-item")) {
      if (confirm("Delete this item?")) {
        await ref.delete();
      }
    }
  });

  fetchInventory();
});
