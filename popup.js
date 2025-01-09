document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
    
    // Add event listeners
    document.getElementById('addNote').addEventListener('click', addManualNote);
    document.getElementById('newNote').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addManualNote();
      }
    });
    
    // About link handler
    document.getElementById('aboutLink').addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://spark-games.co.uk' });
    });
  });
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === "noteAdded") {
      loadNotes();
    }
  });
  
  function loadNotes() {
    chrome.storage.sync.get(['notes'], function(result) {
      const notesList = document.getElementById('notesList');
      notesList.innerHTML = '';
      
      // Ensure notes is an array
      const notes = Array.isArray(result.notes) ? result.notes : [];
      
      notes.forEach((note, index) => {
        addNoteToList(note.text, note.url, index);
      });
    });
  }
  
  function addManualNote() {
    const input = document.getElementById('newNote');
    const text = input.value.trim();
    
    if (text) {
      chrome.storage.sync.get(['notes'], function(result) {
        // Ensure notes is an array
        const notes = Array.isArray(result.notes) ? result.notes : [];
        
        notes.push({
          text: text,
          url: '',
          timestamp: new Date().toISOString()
        });
        
        chrome.storage.sync.set({ notes: notes }, function() {
          input.value = '';
          loadNotes();
        });
      });
    }
  }
  
  function addNoteToList(text, url, index) {
    const notesList = document.getElementById('notesList');
    const li = document.createElement('li');
    li.className = 'note-item';
    
    // Text column
    const textDiv = document.createElement('div');
    textDiv.className = 'note-text';
    textDiv.textContent = text;
    
    // URL column
    const urlDiv = document.createElement('div');
    urlDiv.className = 'note-url-container';
    if (url) {
      const urlButton = document.createElement('button');
      urlButton.className = 'url-btn';
      urlButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
      urlButton.onclick = function() {
        chrome.tabs.create({ url: url });
      };
      urlDiv.appendChild(urlButton);
    }
    
    // Delete column
    const deleteDiv = document.createElement('div');
    deleteDiv.className = 'delete-container';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function() {
      deleteNote(index);
    };
    deleteDiv.appendChild(deleteBtn);
    
    li.appendChild(textDiv);
    li.appendChild(urlDiv);
    li.appendChild(deleteDiv);
    notesList.appendChild(li);
  }
  
  function deleteNote(index) {
    chrome.storage.sync.get(['notes'], function(result) {
      const notes = Array.isArray(result.notes) ? result.notes : [];
      notes.splice(index, 1);
      chrome.storage.sync.set({ notes: notes }, function() {
        loadNotes();
      });
    });
  }