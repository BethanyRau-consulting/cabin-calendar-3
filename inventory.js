import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const inventoryCollection = collection(db, "cabinInventory");

// DOM Elements
const addItemForm = document.getElementById("add-item-form");
const itemNameInput = document.getElementById("item-name");
const itemQuantityInput = document.getElementById("item-quantity");
const itemNeededInput = document.getElementById("item-needed");
const inventoryList = document.getElementById("inventory-list");

// Add new item
addItemForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = itemNameInput.value.trim();
  const quantity = parseInt(itemQuantityInput.value);
  const needed = itemNeededInput.checked;

  if (name && quantity > 0) {
    await addDoc(inventoryCollection, { name, quantity, needed });
    addItemForm.reset();
  }
});

// Render inventory items
const renderInventory = (snapshot) => {
  inventoryList.innerHTML = "";
  snapshot.forEach((doc) => {
    const item = doc.data();
    const li = document.createElement("li");
    li.className = "inventory-item" + (item.needed ? " needed" : "");
    li.innerHTML = `
      <div class="item-info">
        <strong>${item.name}</strong> - Qty: ${item.quantity}
      </div>
      <div class="item-actions">
        <button data-id="${doc.id}" class="toggle-needed">
          ${item.needed ? "✔️" : "❌"}
        </button>
        <button data-id="${doc.id}" class="delete-item">🗑️</button>
      </div>
    `;
    inventoryList.appendChild(li);
  });
};

// Real-time listener
onSnapshot(inventoryCollection, renderInventory);

// Handle item actions
inventoryList.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("toggle-needed")) {
    const itemDoc = doc(db, "cabinInventory", id);
    const itemSnapshot = await getDocs(itemDoc);
    const itemData = itemSnapshot.data();
    await updateDoc(itemDoc, { needed: !itemData.needed });
  } else if (e.target.classList.contains("delete-item")) {
    await deleteDoc(doc(db, "cabinInventory", id));

::contentReference[oaicite:9]{index=9}
 
