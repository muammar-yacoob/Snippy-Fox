import { addNote } from './noteManager.js';

let lastRightClickText = '';

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'rightClickText') {
        lastRightClickText = message.text;
    }
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ notes: [] });
  chrome.contextMenus.create({
      id: "addToNotes",
      title: "Add %s to Snippy Fox",
      contexts: ["selection", "link"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToNotes" && tab?.id) {
      const textToSave = info.selectionText || info.linkText || lastRightClickText || tab.title;
      if (textToSave) {
          await addNote(textToSave, tab.url);
          
          const { closeAfterSave = false } = await chrome.storage.sync.get(['closeAfterSave']);
          if (closeAfterSave) {
              chrome.tabs.remove(tab.id);
          }
      }
      lastRightClickText = ''; // Clear after use
  }
});