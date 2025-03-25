let notes = JSON.parse(localStorage.getItem("notly-notes")) || [];
const notesList = document.getElementById("notes-list");
const noteCount = document.getElementById("note-count");
const createNewButton = document.getElementById("create-new");

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

function deleteNote(noteId, event) {
  // Stop the click event from propagating to the note item
  event.stopPropagation();

  // Find the index of the note to delete
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex !== -1) {
    // Remove the note from the array
    notes.splice(noteIndex, 1);

    // Update localStorage
    localStorage.setItem("notly-notes", JSON.stringify(notes));

    // Re-render the notes list
    renderNotesList();
  }
}
// Initialize
function initApp() {
  // Always refresh notes from localStorage to ensure we have the latest data
  notes = JSON.parse(localStorage.getItem("notly-notes")) || [];

  // Render the notes list with fresh data
  renderNotesList();

  // Check if we're returning from the note editor with updated notes
  if (sessionStorage.getItem("notesUpdated")) {
    // Clear the flag
    sessionStorage.removeItem("notesUpdated");

    // Force DOM update in case there's any caching issue
    setTimeout(() => {
      notes = JSON.parse(localStorage.getItem("notly-notes")) || [];
      renderNotesList();
    }, 50);
  }
}

// Add page visibility handler to refresh notes when coming back to this tab
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Refresh notes when the tab becomes visible again
    notes = JSON.parse(localStorage.getItem("notly-notes")) || [];
    renderNotesList();
  }
});

setupBeforeUnloadHandler();
initApp();
