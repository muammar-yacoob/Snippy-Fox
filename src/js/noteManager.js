export async function showNotification(title, message) {
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: '/res/icons/icon48.png',  // Root relative path
    title: title,
    message: message,
    priority: 2
  });
}
  
  export async function getAllNotes() {
    const { notes = [] } = await chrome.storage.sync.get(['notes']);
    return notes;
  }
  
  export async function addNote(text, url) {
    const notes = await getAllNotes();
    const existingNoteIndex = notes.findIndex(note => note.url === url);
    
    if (existingNoteIndex !== -1) {
      notes[existingNoteIndex] = {
        text,
        url,
        timestamp: new Date().toISOString()
      };
    } else {
      notes.push({
        text,
        url,
        timestamp: new Date().toISOString()
      });
    }
  
    await chrome.storage.sync.set({ notes });
    
    // Show notification
    const notificationMessage = existingNoteIndex !== -1 ? 'Note updated!' : 'Note saved!';
    await showNotification('Snippy Fox', notificationMessage);
  
    return { existingNoteIndex, notes };
  }
  
  export async function deleteNote(index) {
    const notes = await getAllNotes();
    notes.splice(index, 1);
    await chrome.storage.sync.set({ notes });
    await showNotification('Snippy Fox', 'Note deleted');
    return notes;
  }
  
  export async function updateNote(index, text) {
    const notes = await getAllNotes();
    if (notes[index]) {
      notes[index] = {
        ...notes[index],
        text,
        timestamp: new Date().toISOString()
      };
      await chrome.storage.sync.set({ notes });
    }
    return notes;
  }
  
  export async function filterNotes(searchTerm) {
    const notes = await getAllNotes();
    if (!searchTerm) return notes;
    
    return notes
      .map((note, index) => ({ ...note, originalIndex: index }))
      .filter(note => note.text.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  
  export function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;  // Use Google favicon service
    } catch {
      return '/res/icons/icon48.png';
    }
  }