document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
    loadSettings();
    
    // Add event listeners
    document.getElementById('addNote').addEventListener('click', addManualNote);
    document.getElementById('newNote').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addManualNote();
      }
    });
  
    // Settings listener
    document.getElementById('closeAfterSave').addEventListener('change', function(e) {
      chrome.storage.sync.set({ closeAfterSave: e.target.checked });
    });
  
    // Search functionality
    document.getElementById('searchNotes').addEventListener('input', function(e) {
      filterNotes(e.target.value.toLowerCase());
    });
    
    document.getElementById('aboutLink').addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://spark-games.co.uk' });
    });
  });
  
  function loadSettings() {
    chrome.storage.sync.get(['closeAfterSave'], function(result) {
      document.getElementById('closeAfterSave').checked = result.closeAfterSave || false;
    });
  }
  
  function filterNotes(searchTerm) {
    chrome.storage.sync.get(['notes'], function(result) {
      const allNotes = Array.isArray(result.notes) ? result.notes : [];
      
      if (searchTerm) {
        // Find all matching notes and their original indices
        const matches = allNotes.map((note, index) => ({note, index}))
                               .filter(item => item.note.text.toLowerCase().includes(searchTerm));
        
        // Map to the format expected by renderNotes but include original index
        const filteredNotes = matches.map(({note, index}) => ({
          text: note.text,
          url: note.url,
          timestamp: note.timestamp,
          originalIndex: index  // Keep track of where this note is in the full list
        }));
        
        renderNotes(filteredNotes);
      } else {
        renderNotes(allNotes);
      }
    });
  }
  
  function loadNotes() {
    chrome.storage.sync.get(['notes'], function(result) {
      const notes = Array.isArray(result.notes) ? result.notes : [];
      renderNotes(notes);
    });
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
  
    // Keep only the latest 10 notes
    const recentNotes = notes.slice(-10);
    recentNotes.forEach((note) => {
      // If we're filtering (note has originalIndex), use that, otherwise calculate the index
      const index = note.originalIndex !== undefined 
        ? note.originalIndex 
        : notes.length - recentNotes.length + recentNotes.indexOf(note);
      
      addNoteToList(note.text, note.url, index);
    });
  }
  
  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  }
  
  function addManualNote() {
    const input = document.getElementById('newNote');
    const text = input.value.trim();
    
    if (text) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0]?.url || '';
        const currentTabId = tabs[0]?.id;
        
        chrome.storage.sync.get(['notes', 'closeAfterSave'], function(result) {
          const notes = Array.isArray(result.notes) ? result.notes : [];
          const shouldClose = result.closeAfterSave || false;
          
          notes.push({
            text: text,
            url: currentUrl,
            timestamp: new Date().toISOString()
          });
          
          chrome.storage.sync.set({ notes: notes }, function() {
            input.value = '';
            loadNotes();
            showSaveConfirmation();
            
            if (shouldClose && currentTabId) {
              chrome.tabs.remove(currentTabId);
            }
          });
        });
      });
    }
  }
  
  function addNoteToList(text, url, index) {
    const notesList = document.getElementById('notesList');
    const li = document.createElement('li');
    li.className = 'note-item';
    
    // Favicon + Text column
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    
    if (url) {
      const favicon = document.createElement('img');
      favicon.src = getFaviconUrl(url);
      favicon.className = 'favicon';
      favicon.onerror = function() {
        this.style.display = 'none';
      };
      textContainer.appendChild(favicon);
    }
    
    const textDiv = document.createElement('div');
    textDiv.className = 'note-text';
    textDiv.textContent = text;
    textContainer.appendChild(textDiv);
    
    // URL column
    const urlDiv = document.createElement('div');
    urlDiv.className = 'note-url-container';
    if (url) {
      const urlButton = document.createElement('button');
      urlButton.className = 'url-btn';
      urlButton.title = 'Open source page';
      urlButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
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
    deleteBtn.title = 'Delete note';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>';
    deleteBtn.onclick = function() {
      showDeleteConfirmation(index);
    };
    deleteDiv.appendChild(deleteBtn);
    
    li.appendChild(textContainer);
    li.appendChild(urlDiv);
    li.appendChild(deleteDiv);
    notesList.appendChild(li);
  }
  
  function showDeleteConfirmation(index) {
    chrome.storage.sync.get(['notes'], function(result) {
      const notes = Array.isArray(result.notes) ? result.notes : [];
      const note = notes[index];
      if (!note) return;
  
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'delete-dialog-overlay';
  
      // Create dialog
      const dialog = document.createElement('div');
      dialog.className = 'delete-dialog';
      
      // Truncate note text if too long
      const notePreview = note.text.length > 50 ? note.text.substring(0, 50) + '...' : note.text;
      
      dialog.innerHTML = `
        <p>Delete note "${notePreview}"?</p>
        <div class="dialog-buttons">
          <button class="dialog-btn cancel-btn">Cancel</button>
          <button class="dialog-btn confirm-btn">Delete</button>
        </div>
      `;
  
      // Handle button clicks
      const cancelBtn = dialog.querySelector('.cancel-btn');
      const confirmBtn = dialog.querySelector('.confirm-btn');
  
      cancelBtn.onclick = () => overlay.remove();
      confirmBtn.onclick = () => {
        deleteNote(index);
        overlay.remove();
      };
  
      // Close on overlay click
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
      };
  
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
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
  
  function showSaveConfirmation() {
    let notification = document.getElementById('saveNotification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'saveNotification';
      notification.className = 'save-notification';
    }
  
    notification.textContent = 'Note saved!';
    document.body.appendChild(notification);
  
    // Force a reflow before adding the show class
    notification.offsetHeight;
    notification.classList.add('show');
  
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }