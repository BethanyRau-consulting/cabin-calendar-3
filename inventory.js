document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const inventoryList = document.getElementById("inventory-list");
  const form = document.getElementById("inventory-form");
  const nameInput = document.getElementById("item-name");
  const quantityInput = document.getElementById("item-quantity");
  const neededInput = document.getElementById("item-needed");
  const submitButton = document.getElementById("submit-item");
  const cancelButton = document.getElementById("cancel-item");
  const filterSelect = document.getElementById("neededFilter");

  let editingItemId = null;

  function renderInventory(filter = "all") {
    inventoryList.innerHTML = "";
    db.collection("inventory").orderBy("Name").get().then(snapshot => {
      snapshot.forEach(doc => {
        const item = doc.data();

        // Apply filtering
        if (
          (filter === "needed" && !item.Needed) ||
          (filter === "not-needed" && item.Needed)
        ) {
          return; // skip this item
        }

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
        renderInventory(filterSelect.value);
      });
    } else {
      db.collection("inventory").add(itemData).then(() => {
        resetForm();
        renderInventory(filterSelect.value);
      });
    }
  });

  cancelButton.addEventListener("click", () => {
    resetForm();
  });

  function resetForm() {
    editingItemId = null;
    nameInput.value = "";
    quantityInput.value = "";
    neededInput.checked = false;
    submitButton.textContent = "Add Item";
  }

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
      db.collection("inventory").doc(id).delete().then(() => {
        renderInventory(filterSelect.value);
      });
    }

    if (e.target.classList.contains("toggle-needed")) {
      db.collection("inventory").doc(id).update({ Needed: e.target.checked });
    }
  });

  // ✅ Add event listener to filter dropdown
  filterSelect.addEventListener("change", () => {
    renderInventory(filterSelect.value);
  });

  // ✅ Initial load
  renderInventory();
});
