chrome.runtime.onInstalled.addListener(function() {
    // Initialize empty notes array in storage
    chrome.storage.sync.set({ notes: [] }, function() {
      console.log('Notes storage initialized');
    });
  
    // Create context menu
    chrome.contextMenus.create({
      id: "addToNotes",
      title: "Add to Snippy Fox",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "addToNotes") {
      chrome.storage.sync.get(['notes', 'closeAfterSave'], function(result) {
        // Ensure notes is an array
        const notes = Array.isArray(result.notes) ? result.notes : [];
        const shouldClose = result.closeAfterSave || false;
        
        // Add new note
        notes.push({
          text: info.selectionText,
          url: tab.url,
          timestamp: new Date().toISOString()
        });
        
        // Save and show notification
        chrome.storage.sync.set({ notes: notes }, function() {
          // Show Chrome notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Snippy Fox',
            message: 'Note saved successfully!'
          });
  
          // Close tab if setting is enabled
          if (shouldClose && tab.id) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    }
  });