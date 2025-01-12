// popup.js
import { 
  getAllNotes, 
  addNote, 
  deleteNote, 
  updateNote, 
  filterNotes,
  getFaviconUrl 
} from './noteManager.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
  setupEventListeners();
});

function initializePopup() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('extensionName').textContent = manifest.name;
  document.getElementById('extensionVersion').textContent = `v${manifest.version}`;
  loadNotes();
  loadSettings();
}

function setupEventListeners() {
  document.getElementById('addNote').addEventListener('click', addManualNote);
  document.getElementById('newNote').addEventListener('keypress', e => {
    if (e.key === 'Enter') addManualNote();
  });
  
  document.getElementById('closeAfterSave').addEventListener('change', e => {
    chrome.storage.sync.set({ closeAfterSave: e.target.checked });
  });
  
  document.getElementById('searchNotes').addEventListener('input', e => {
    filterNotes(e.target.value.toLowerCase()).then(renderNotes);
  });
  
  document.getElementById('aboutLink').addEventListener('click', e => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getManifest().homepage_url });
  });
}

async function loadSettings() {
  const { closeAfterSave = false } = await chrome.storage.sync.get(['closeAfterSave']);
  document.getElementById('closeAfterSave').checked = closeAfterSave;
}

async function loadNotes() {
  const notes = await getAllNotes();
  renderNotes(notes);
}

function createNoteElement(note, index) {
  const li = document.createElement('li');
  li.className = 'note-item';
  
  // Text container with favicon and editable text
  const textContainer = document.createElement('div');
  textContainer.className = 'text-container';
  
  if (note.url) {
    const favicon = document.createElement('img');
    favicon.src = getFaviconUrl(note.url);
    favicon.className = 'favicon';
    favicon.onerror = () => favicon.style.display = 'none';
    textContainer.appendChild(favicon);
  }
  
  const textDiv = document.createElement('div');
  textDiv.className = 'note-text';
  textDiv.textContent = note.text;
  textContainer.appendChild(textDiv);

  // Make the entire note clickable to open URL
  if (note.url) {
    li.style.cursor = 'pointer';
    li.addEventListener('click', (e) => {
      // Don't open URL if clicking delete button
      if (!e.target.closest('.delete-btn')) {
        chrome.tabs.create({ url: note.url });
      }
    });
  }
  
  // Delete button
  const deleteDiv = document.createElement('div');
  deleteDiv.className = 'delete-container';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.title = 'Delete note';
  deleteBtn.onclick = (e) => {
    e.stopPropagation(); // Prevent opening URL when clicking delete
    showDeleteConfirmation(index);
  };
  deleteDiv.appendChild(deleteBtn);
  
  li.appendChild(textContainer);
  li.appendChild(deleteDiv);
  
  return li;
}

function renderNotes(notes) {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  
  if (notes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No notes found';
    notesList.appendChild(emptyState);
    return;
  }

  notes.forEach((note, idx) => {
    const index = note.originalIndex !== undefined ? note.originalIndex : idx;
    const noteElement = createNoteElement(note, index);
    notesList.appendChild(noteElement);
  });
}

async function addManualNote() {
  const input = document.getElementById('newNote');
  const text = input.value.trim();
  
  if (!text) return;
  
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  if (!currentTab?.url) return;

  await addNote(text, currentTab.url);
  input.value = '';
  loadNotes();
  
  const { closeAfterSave = false } = await chrome.storage.sync.get(['closeAfterSave']);
  if (closeAfterSave && currentTab.id) {
    chrome.tabs.remove(currentTab.id);
  }
}

function showDeleteConfirmation(index) {
  const overlay = document.createElement('div');
  overlay.className = 'delete-dialog-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'delete-dialog';
  
  getAllNotes().then(notes => {
    const note = notes[index];
    if (!note) return;
    
    const notePreview = note.text.length > 50 
      ? `${note.text.substring(0, 50)}...` 
      : note.text;
    
    dialog.innerHTML = `
      <p>Delete note "${notePreview}"?</p>
      <div class="dialog-buttons">
        <button class="dialog-btn cancel-btn">Cancel</button>
        <button class="dialog-btn confirm-btn">Delete</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    dialog.querySelector('.cancel-btn').onclick = () => overlay.remove();
    dialog.querySelector('.confirm-btn').onclick = async () => {
      await deleteNote(index);
      loadNotes();
      overlay.remove();
    };
    
    overlay.onclick = e => {
      if (e.target === overlay) overlay.remove();
    };
  });
}