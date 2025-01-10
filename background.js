let currentTabId;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ notes: [] }, function() {
    console.log('Notes storage initialized');
  });

  chrome.contextMenus.create({
    id: "addToNotes",
    title: "Add to Snippy Fox",
    contexts: ["selection"]
  });
});

// Keep track of current tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
  currentTabId = activeInfo.tabId;
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "addToNotes") {
    chrome.storage.sync.get(['notes', 'closeAfterSave'], function(result) {
      let notes = Array.isArray(result.notes) ? result.notes : [];
      const shouldClose = result.closeAfterSave || false;
      
      // Check for existing note with same URL
      const existingNoteIndex = notes.findIndex(note => note.url === tab.url);
      
      if (existingNoteIndex !== -1) {
        // Update existing note
        notes[existingNoteIndex] = {
          ...notes[existingNoteIndex],
          text: notes[existingNoteIndex].text + '\n\n' + info.selectionText,
          timestamp: new Date().toISOString()
        };
      } else {
        // Add new note
        notes.push({
          text: info.selectionText,
          url: tab.url,
          timestamp: new Date().toISOString()
        });
      }
      
      // Save notes
      chrome.storage.sync.set({ notes: notes }, function() {
        // Show Chrome notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Snippy Fox',
          message: existingNoteIndex !== -1 ? 'Note updated!' : 'Note saved successfully!',
          silent: false
        });

        // Close tab if setting is enabled
        if (shouldClose && tab.id) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  }
});