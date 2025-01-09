document.addEventListener('DOMContentLoaded', function() {
    // Load saved notes
    chrome.storage.sync.get(['notes'], function(result) {
      document.getElementById('notes').value = result.notes || '';
    });
  
    // Save notes when button is clicked
    document.getElementById('save').addEventListener('click', function() {
      const notes = document.getElementById('notes').value;
      chrome.storage.sync.set({ notes: notes }, function() {
        // Show save confirmation
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(function() {
          status.style.display = 'none';
        }, 1500);
      });
    });
  
    // Auto-save when typing stops
    let timeout = null;
    document.getElementById('notes').addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        document.getElementById('save').click();
      }, 1000);
    });
  });