// Initialize Dexie.js database
const db = new Dexie("AppOfflineDatabase");
db.version(1).stores({
  userData: "++id, title, content, updatedAt"
});

// Register Service Worker for PWA / offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("PWA Service Worker Ready"))
      .catch((err) => console.error("SW Registration Failed:", err));
  });
}

// Request persistent storage so phone doesn't delete offline data
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist();
}

// UI Functions
async function saveData(title, content) {
  await db.userData.add({
    title,
    content,
    updatedAt: new Date().toLocaleDateString()
  });
  renderRecords();
}

async function deleteData(id) {
  await db.userData.delete(id);
  renderRecords();
}

async function renderRecords() {
  const records = await db.userData.toArray();
  const container = document.getElementById("recordsList");
  
  if (records.length === 0) {
    container.innerHTML = "<p style='color:#777;'>No offline records saved yet.</p>";
    return;
  }

  container.innerHTML = records.map(item => `
    <div class="record">
      <div>
        <strong>${item.title}</strong><br>
        <small style="color:#666">${item.content}</small>
      </div>
      <button class="delete-btn" onclick="deleteData(${item.id})">Delete</button>
    </div>
  `).join('');
}

document.getElementById("dataForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  await saveData(title, content);
  e.target.reset();
});

renderRecords();
