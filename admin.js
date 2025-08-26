
import { db } from './firebase-utils.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

async function setUploads(flag) {
    const configRef = doc(db, 'config', 'limits');
    await updateDoc(configRef, { allowUploads: flag });
    document.getElementById('status').innerText = 'Uploads ' + (flag ? 'enabled' : 'disabled');
}

document.getElementById('enableBtn').addEventListener('click', () => setUploads(true));
document.getElementById('disableBtn').addEventListener('click', () => setUploads(false));

// Display current status
(async () => {
    const configRef = doc(db, 'config', 'limits');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
        document.getElementById('status').innerText = 'Current status: ' + (snap.data().allowUploads ? 'enabled' : 'disabled');
    }
})();
