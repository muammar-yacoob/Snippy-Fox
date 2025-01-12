import { addNote } from './noteManager.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ notes: [] });
  chrome.contextMenus.create({
    id: "addToNotes",
    title: "Add to Snippy Fox",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToNotes" && tab?.id) {
    await addNote(info.selectionText, tab.url);
    
    const { closeAfterSave = false } = await chrome.storage.sync.get(['closeAfterSave']);
    if (closeAfterSave) {
      chrome.tabs.remove(tab.id);
    }
  }
});