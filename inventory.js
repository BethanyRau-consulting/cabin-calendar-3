document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  const form = document.getElementById("inventory-form");
  const itemName = document.getElementById("item-name");
  const itemQuantity = document.getElementById("item-quantity");
  const itemNeeded = document.getElementById("item-needed");
  const inventoryList = document.getElementById("inventory-list");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newItem = {
      Name: itemName.value,
      Quantity: parseInt(itemQuantity.value),
      Needed: itemNeeded.checked
    };

    db.collection("inventory").add(newItem)
      .then(() => {
        form.reset();
        fetchInventory();
      })
      .catch(err => console.error("Error adding item:", err));
  });

  function fetchInventory() {
    inventoryList.innerHTML = "";
    db.collection("inventory").get().then(snapshot => {
      snapshot.forEach(doc => {
        const item = doc.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${item.Name}</td>
          <td>${item.Quantity}</td>
          <td><input type="checkbox" ${item.Needed ? "checked" : ""} disabled></td>
          <td><button onclick="deleteItem('${doc.id}')">Delete</button></td>
        `;
        inventoryList.appendChild(row);
      });
    });
  }

  window.deleteItem = function(id) {
    db.collection("inventory").doc(id).delete()
      .then(() => fetchInventory())
      .catch(err => console.error("Error deleting item:", err));
  };

  fetchInventory();
});
