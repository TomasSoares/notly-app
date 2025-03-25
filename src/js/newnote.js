let notes = JSON.parse(localStorage.getItem("notly-notes")) || [];
let currentNoteId = null;
let formChanged = false;
// DOM elements
const noteTitle = document.querySelector(".note-title");
const noteContent = document.querySelector(".note-content");
const saveButton = document.querySelector(".btn-primary");
const clearButton = document.querySelector(".btn:not(.btn-primary)");
const notesList = document.querySelector(".notes-list");
const noteCount = document.querySelector(".note-count");
const createNewButton = document.querySelector(".create-new");
const menuButton = document.querySelector(".menu-button");
const closeButton = document.querySelector(".close-sidebar");
const sidebar = document.querySelector(".sidebar");
const sidebarTrigger = document.querySelector(".sidebar-trigger");
const overlay = document.querySelector(".overlay");
const backButton = document.querySelector(".back-button");

// Update note count
function updateNoteCount() {
  noteCount.textContent = `${notes.length} note${
    notes.length !== 1 ? "s" : ""
  }`;
}

// Render notes list
function renderNotesList() {
  notesList.innerHTML = "";
  updateNoteCount();

  if (notes.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.style.color = "rgba(255, 255, 255, 0.5)";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.padding = "20px 0";
    emptyMessage.style.fontSize = "14px";
    emptyMessage.textContent = "You don't have any notes yet.";
    notesList.appendChild(emptyMessage);
    return;
  }

  notes.sort((a, b) => b.updatedAt - a.updatedAt);

  notes.forEach((note) => {
    const noteItem = document.createElement("li");
    noteItem.className = "note-item";
    noteItem.dataset.id = note.id;

    const noteItemTitle = document.createElement("div");
    noteItemTitle.className = "note-item-title";
    noteItemTitle.textContent = note.title || "Untitled Note";

    const noteItemPreview = document.createElement("div");
    noteItemPreview.className = "note-item-preview";
    noteItemPreview.textContent = note.content.substring(0, 60) || "No content";

    const noteItemDate = document.createElement("div");
    noteItemDate.className = "note-item-date";
    noteItemDate.textContent = new Date(note.updatedAt).toLocaleDateString();

    noteItem.appendChild(noteItemTitle);
    noteItem.appendChild(noteItemPreview);
    noteItem.appendChild(noteItemDate);

    noteItem.addEventListener("click", () => {
      loadNote(note.id);
      closeSidebar();
    });

    notesList.appendChild(noteItem);
  });
}

// Save note
function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  const now = Date.now();

  if (currentNoteId) {
    // Update existing note
    const noteIndex = notes.findIndex((note) => note.id === currentNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex].title = title;
      notes[noteIndex].content = content;
      notes[noteIndex].updatedAt = now;
    }
  } else {
    // Only create a new note if there's content or a title
    if (content || title) {
      const newNote = {
        id: "note_" + now,
        title: title,
        content: content,
        createdAt: now,
        updatedAt: now,
      };
      notes.push(newNote);
      currentNoteId = newNote.id;
    }
  }

  // Always save to localStorage, even if empty
  localStorage.setItem("notly-notes", JSON.stringify(notes));

  // Set the flag that notes have been updated
  sessionStorage.setItem("notesUpdated", "true");

  renderNotesList();
}

// Load note
function loadNote(id) {
  const note = notes.find((note) => note.id === id);
  if (note) {
    // Set the values
    noteTitle.value = note.title || "";
    noteContent.value = note.content || "";
    currentNoteId = note.id;

    // Make sure the fields are editable
    noteTitle.readOnly = false;
    noteContent.readOnly = false;

    // Add these lines to ensure the DOM has time to update
    setTimeout(() => {
      // Focus on the title to ensure it's active
      noteTitle.focus();

      // Ensure content is also interactive
      noteContent.addEventListener("focus", () => {
        noteContent.selectionStart = noteContent.selectionEnd =
          noteContent.value.length;
      });
    }, 100);
  }
}

// Create new note
function createNewNote() {
  noteTitle.value = "";
  noteContent.value = "";
  currentNoteId = null;
  noteTitle.focus();
  closeSidebar();
}

// Open sidebar
function openSidebar() {
  // For a sidebar that starts at left: -100%
  sidebar.style.transform = "translateX(100%)"; // This moves it right by 100% of its width
  overlay.classList.add("active");
}

// Close sidebar
function closeSidebar() {
  sidebar.style.transform = ""; // Reset the transform to use the default left position
  overlay.classList.remove("active");
}

// Event listeners
clearButton.addEventListener("click", () => {
  // Store the currentNoteId temporarily
  const savedNoteId = currentNoteId;

  // Clear the fields
  noteTitle.value = "";
  noteContent.value = "";

  // Restore the note ID
  currentNoteId = savedNoteId;

  // Explicitly mark as changed to ensure it saves
  formChanged = true;

  // Save the cleared note immediately and force the update flag
  saveNote();
  sessionStorage.setItem("notesUpdated", "true");

  // Set focus to the title field
  noteTitle.focus();

  // Since we just saved, mark as not changed
  formChanged = false;

  console.log("Note cleared and saved at " + new Date().toLocaleTimeString());
});

saveButton.addEventListener("click", () => {
  saveNote();
  // Set flag to refresh notes list when returning to yournotes.html
  sessionStorage.setItem("notesUpdated", "true");
});

createNewButton.addEventListener("click", createNewNote);

closeButton.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

sidebarTrigger.addEventListener("mouseenter", openSidebar);

backButton.addEventListener("click", (e) => {
  // Prevent the default navigation to allow our code to handle it
  e.preventDefault();

  // First save any changes
  if (formChanged) {
    saveNote();
    formChanged = false;
  }

  // Then navigate programmatically
  window.location.href = "yournotes.html";
});

// Auto-save
let autoSaveTimeout;
// Enhanced autoSave functionality
function setupAutoSave() {
  const autoSaveDelay = 2000; // 2 seconds
  let autoSaveTimeout;

  function autoSave() {
    saveNote();
    // Set flag to refresh notes list when returning to yournotes.html
    sessionStorage.setItem("notesUpdated", "true");
    formChanged = false; // Mark as not changed after saving
    console.log("Auto-saved at " + new Date().toLocaleTimeString());
  }

  // Add input listeners to both fields
  noteTitle.addEventListener("input", () => {
    formChanged = true; // Mark form as changed
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSave, autoSaveDelay);
  });

  noteContent.addEventListener("input", () => {
    formChanged = true; // Mark form as changed
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSave, autoSaveDelay);
  });

  // Handle beforeunload events
  window.onbeforeunload = function (e) {
    // If there are unsaved changes, try to save them
    if (formChanged) {
      saveNote();
      // We return null here to prevent the browser dialog,
      // but still ensure data is saved
      return null;
    }

    // No changes, no dialog needed
    return null;
  };
}

function deleteCurrentNote() {
  if (!currentNoteId) return; // Nothing to delete

  if (confirm("Are you sure you want to delete this note?")) {
    // Find index of current note
    const noteIndex = notes.findIndex((note) => note.id === currentNoteId);

    if (noteIndex !== -1) {
      // Remove note from array
      notes.splice(noteIndex, 1);

      // Update localStorage
      localStorage.setItem("notly-notes", JSON.stringify(notes));

      // Set flag to refresh notes list when returning to yournotes.html
      sessionStorage.setItem("notesUpdated", "true");

      // Clear form changes flag
      formChanged = false;

      // Redirect back to notes list
      window.location.href = "yournotes.html";
    }
  }
}

document
  .getElementById("deleteButton")
  .addEventListener("click", deleteCurrentNote);

// Initialize app
function initApp() {
  renderNotesList();
  setupAutoSave();

  // Check if there's a noteId in sessionStorage
  const noteIdFromList = sessionStorage.getItem("currentNoteId");
  if (noteIdFromList) {
    // Load the note with this ID
    loadNote(noteIdFromList);
    // Clear the sessionStorage to avoid loading the same note repeatedly
    sessionStorage.removeItem("currentNoteId");
  } else {
    // Focus title if there's no current note
    noteTitle.focus();
  }
}

initApp();
