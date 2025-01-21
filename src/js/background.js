import { addNote } from './noteManager.js';

let lastRightClickText = '';

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'rightClickText') {
        lastRightClickText = message.text;
        chrome.contextMenus.update("addToNotes", {
            title: `Add "${lastRightClickText || chrome.tabs.TAB?.title || 'page'}" to Snippy Fox`
        });
    }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ notes: [] });
  chrome.contextMenus.create({
      id: "addToNotes",
      title: "Add %s to Snippy Fox",  // Will show selected text
      contexts: ["selection", "link", "page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToNotes" && tab?.id) {
      const textToSave = info.selectionText || `${tab.title} - ${lastRightClickText}` || tab.title;
      await addNote(textToSave, tab.url);
      
      if (await chrome.storage.sync.get('closeAfterSave').then(({closeAfterSave}) => closeAfterSave)) {
          chrome.tabs.remove(tab.id);
      }
      lastRightClickText = '';
  }
});