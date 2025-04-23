document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const inventoryList = document.getElementById("inventory-list");
  const form = document.getElementById("inventory-form");
  const nameInput = document.getElementById("item-name");
  const quantityInput = document.getElementById("item-quantity");
  const neededInput = document.getElementById("item-needed");
  const submitButton = document.getElementById("submit-item");
  const cancelButton = document.getElementById("cancel-item");

  let editingItemId = null;

  function renderInventory() {
    inventoryList.innerHTML = "";
    db.collection("inventory").orderBy("Name").get().then(snapshot => {
      snapshot.forEach(doc => {
        const item = doc.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${item.Name}</td>
          <td>${item.Quantity}</td>
          <td><input type="checkbox" ${item.Needed ? "checked" : ""} data-id="${doc.id}" class="toggle-needed"/></td>
          <td>
            <button class="edit-btn" data-id="${doc.id}" data-name="${item.Name}" data-quantity="${item.Quantity}" data-needed="${item.Needed}">Edit</button>
            <button class="delete-btn" data-id="${doc.id}">Delete</button>
          </td>
        `;

        inventoryList.appendChild(row);
      });
    });
  }

  // Add or update item
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const itemData = {
      Name: nameInput.value.trim(),
      Quantity: parseInt(quantityInput.value),
      Needed: neededInput.checked
    };

    if (editingItemId) {
      db.collection("inventory").doc(editingItemId).update(itemData).then(() => {
        resetForm();
        renderInventory();
      });
    } else {
      db.collection("inventory").add(itemData).then(() => {
        resetForm();
        renderInventory();
      });
    }
  });

  // Cancel edit or entry
  cancelButton.addEventListener("click", () => {
    resetForm();
  });

  // Reset form
  function resetForm() {
    editingItemId = null;
    nameInput.value = "";
    quantityInput.value = "";
    neededInput.checked = false;
    submitButton.textContent = "Add Item";
  }

  // Delegate edit, delete, toggle
  inventoryList.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("edit-btn")) {
      nameInput.value = e.target.dataset.name;
      quantityInput.value = e.target.dataset.quantity;
      neededInput.checked = e.target.dataset.needed === "true";
      editingItemId = id;
      submitButton.textContent = "Save Item";
    }

    if (e.target.classList.contains("delete-btn")) {
      db.collection("inventory").doc(id).delete().then(renderInventory);
    }

    if (e.target.classList.contains("toggle-needed")) {
      db.collection("inventory").doc(id).update({ Needed: e.target.checked });
    }
  });

  renderInventory();
});
