// Wait for the DOM to fully load before executing script
document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore(); // Connect to Firestore database
  const inventoryList = document.getElementById("inventory-list"); // Table body for inventory rows
  const form = document.getElementById("inventory-form"); // Inventory form element
  const nameInput = document.getElementById("item-name"); // Input: Item name
  const quantityInput = document.getElementById("item-quantity"); // Input: Item quantity
  const neededInput = document.getElementById("item-needed"); // Checkbox: Is item needed
  const submitButton = document.getElementById("submit-item"); // "Add Item" / "Save Item" button
  const cancelButton = document.getElementById("cancel-item"); // "Cancel" button
  const filterSelect = document.getElementById("neededFilter"); // Filter dropdown

  let editingItemId = null; // Holds ID of item being edited (if any)

  /**
   * Loads inventory items from Firestore and displays them in the table.
   * Optionally filters items by their "needed" status.
   */
  function renderInventory(filter = "all") {
    inventoryList.innerHTML = ""; // Clear existing list

    db.collection("inventory").orderBy("Name").get().then(snapshot => {
      snapshot.forEach(doc => {
        const item = doc.data();

        // Skip items based on filter criteria
        if (
          (filter === "needed" && !item.Needed) ||
          (filter === "not-needed" && item.Needed)
        ) {
          return;
        }

        // Create a new table row for the item
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
        inventoryList.appendChild(row); // Add the row to the table
      });
    });
  }

  /**
   * Handles form submission for adding or updating an item.
   * If editing, it updates the existing item. Otherwise, it adds a new one.
   */
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload

    const itemData = {
      Name: nameInput.value.trim(),
      Quantity: parseInt(quantityInput.value),
      Needed: neededInput.checked
    };

    if (editingItemId) {
      // Update existing item
      db.collection("inventory").doc(editingItemId).update(itemData).then(() => {
        resetForm();
        renderInventory(filterSelect.value);
      });
    } else {
      // Add new item
      db.collection("inventory").add(itemData).then(() => {
        resetForm();
        renderInventory(filterSelect.value);
      });
    }
  });

  /**
   * Resets the form to its default (non-editing) state.
   */
  cancelButton.addEventListener("click", () => {
    resetForm();
  });

  function resetForm() {
    editingItemId = null;
    nameInput.value = "";
    quantityInput.value = "";
    neededInput.checked = false;
    submitButton.textContent = "Add Item"; // Change button text back to default
  }

  /**
   * Handles click events on the inventory table, such as edit, delete, and toggle "needed".
   */
  inventoryList.addEventListener("click", (e) => {
    const id = e.target.dataset.id;

    // Handle edit button click
    if (e.target.classList.contains("edit-btn")) {
      nameInput.value = e.target.dataset.name;
      quantityInput.value = e.target.dataset.quantity;
      neededInput.checked = e.target.dataset.needed === "true";
      editingItemId = id;
      submitButton.textContent = "Save Item"; // Change button text to indicate edit mode
    }

    // Handle delete button click
    if (e.target.classList.contains("delete-btn")) {
      db.collection("inventory").doc(id).delete().then(() => {
        renderInventory(filterSelect.value);
      });
    }

    // Handle toggle of "needed" checkbox directly in the table
    if (e.target.classList.contains("toggle-needed")) {
      db.collection("inventory").doc(id).update({ Needed: e.target.checked });
    }
  });

  // Re-render list when filter dropdown changes
  filterSelect.addEventListener("change", () => {
    renderInventory(filterSelect.value);
  });

  // Load inventory list when the page first loads
  renderInventory();
});
