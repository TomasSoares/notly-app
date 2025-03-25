let notes = [];
const notesList = document.getElementById("notes-list");
const noteCount = document.getElementById("note-count");
const createNewButton = document.getElementById("create-new");

// Load notes from file
async function loadNotes() {
  notes = await window.notesAPI.loadNotes();
  renderNotesList();
}

// Update note count
function updateNoteCount() {
  noteCount.textContent = `${notes.length} note${
    notes.length !== 1 ? "s" : ""
  }`;
}

// Format date for display
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Render notes list
function renderNotesList() {
  notesList.innerHTML = "";
  updateNoteCount();

  if (notes.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "You don't have any notes yet. Create your first note!";
    notesList.appendChild(emptyState);
    return;
  }

  // Sort notes by update date (newest first)
  notes.sort((a, b) => b.updatedAt - a.updatedAt);

  notes.forEach((note) => {
    const noteItem = document.createElement("li");
    noteItem.className = "note-item";
    noteItem.dataset.id = note.id;

    const noteTitle = document.createElement("div");
    noteTitle.className = "note-item-title";
    noteTitle.textContent = note.title || "Untitled Note";

    const notePreview = document.createElement("div");
    notePreview.className = "note-item-preview";
    notePreview.textContent = note.content || "No content";

    const noteFooter = document.createElement("div");
    noteFooter.className = "note-item-footer";

    const noteDate = document.createElement("div");
    noteDate.className = "note-item-date";
    noteDate.textContent = formatDate(note.updatedAt);

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-note";
    deleteButton.innerHTML = "Delete"; // × symbol
    deleteButton.title = "Delete note";
    deleteButton.addEventListener("click", (e) => deleteNote(note.id, e));

    // Add date and delete button to footer
    noteFooter.appendChild(noteDate);
    noteFooter.appendChild(deleteButton);

    noteItem.appendChild(noteTitle);
    noteItem.appendChild(notePreview);
    noteItem.appendChild(noteFooter);

    // Add event listener to open note
    noteItem.addEventListener("click", () => {
      openNote(note.id);
    });

    notesList.appendChild(noteItem);
  });
}

// Open note for editing
function openNote(noteId) {
  // Store the ID in session storage to retrieve in the edit page
  sessionStorage.setItem("currentNoteId", noteId);

  // Remove the beforeunload handler to prevent the confirmation dialog
  window.onbeforeunload = null;

  window.location.href = "newnote.html";
}

// Create new note
function createNewNote() {
  // Clear any previous ID
  sessionStorage.removeItem("currentNoteId");

  // Remove the beforeunload handler
  window.onbeforeunload = null;

  window.location.href = "newnote.html";
}

function setupBeforeUnloadHandler() {
  // Remove any existing beforeunload handler
  window.onbeforeunload = null;
}
// Event listeners
createNewButton.addEventListener("click", createNewNote);

async function deleteNote(noteId, event) {
  event.stopPropagation();
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    await window.notesAPI.saveNotes(notes);
    renderNotesList();
  }
}

// Initialize
async function initApp() {
  await loadNotes();

  if (sessionStorage.getItem("notesUpdated")) {
    sessionStorage.removeItem("notesUpdated");
    setTimeout(loadNotes, 50);
  }
}

// Add page visibility handler to refresh notes when coming back to this tab
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadNotes();
  }
});

setupBeforeUnloadHandler();
initApp();
