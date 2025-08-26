
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase-utils.js';

async function checkUploadsAllowed() {
    const configRef = doc(db, 'config', 'limits');
    const configSnap = await getDoc(configRef);
    return configSnap.exists() && configSnap.data().allowUploads === true;
}

// Firebase references
const storage = firebase.storage();
const firestore = firebase.firestore();

// Upload form handler
document.getElementById('photo-upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Prevent uploads if budget is exceeded
  const isFreeTierRemaining = await checkBillingStatus();
  if (!isFreeTierRemaining) {
    alert("Monthly limit reached. Uploads are temporarily disabled.");
    return;
  }

  const file = document.getElementById('photo-file').files[0];
  const description = document.getElementById('photo-description').value || "";

  if (!file) return;

  const storageRef = storage.ref().child(`photos/${Date.now()}_${file.name}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed',
    null,
    (error) => {
      document.getElementById('photo-status').innerText = `Upload failed: ${error}`;
    },
    async () => {
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      await firestore.collection("photos").add({
        url: downloadURL,
        description,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('photo-status').innerText = "Upload successful!";
      document.getElementById('photo-upload-form').reset();
    }
  );
});
