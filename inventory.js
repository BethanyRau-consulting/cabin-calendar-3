document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const form = document.getElementById("inventory-form");
  const nameInput = document.getElementById("item-name");
  const quantityInput = document.getElementById("item-quantity");
  const neededInput = document.getElementById("item-needed");
  const inventoryBody = document.getElementById("inventory-body");

  function renderInventory() {
    inventoryBody.innerHTML = "";
    db.collection("inventory").orderBy("Name").get().then(snapshot => {
      snapshot.forEach(doc => {
        const item = doc.data();
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = item.Name;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = item.Quantity;

        const neededCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.Needed;
        checkbox.addEventListener("change", () => {
          db.collection("inventory").doc(doc.id).update({
            Needed: checkbox.checked
          });
        });
        neededCell.appendChild(checkbox);

        const actionsCell = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
          nameInput.value = item.Name;
          quantityInput.value = item.Quantity;
          neededInput.checked = item.Needed;
          document.getElementById("submit-item").textContent = "Update Item";
          form.dataset.editId = doc.id;
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.backgroundColor = "#dc3545";
        deleteBtn.style.color = "white";
        deleteBtn.addEventListener("click", () => {
          db.collection("inventory").doc(doc.id).delete().then(renderInventory);
        });

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);

        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(neededCell);
        row.appendChild(actionsCell);

        inventoryBody.appendChild(row);
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

  const editId = form.dataset.editId;
  if (editId) {
    db.collection("inventory").doc(editId).update(itemData).then(() => {
      form.reset();
      delete form.dataset.editId;
      document.getElementById("submit-item").textContent = "Add Item";
      renderInventory();
    });
  } else {
    db.collection("inventory").add(itemData).then(() => {
      form.reset();
      renderInventory();
    });
  }
});

const cancelButton = document.getElementById("cancel-item");
cancelButton.addEventListener("click", () => {
  document.getElementById("inventory-form").reset();
  document.getElementById("add-item").textContent = "Add Item";
});


  renderInventory();
});
