chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNotification") {
    if (Notification.permission === "granted") {
      new Notification(request.title, {
        body: request.message,
        icon: 'icon48.png'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(request.title, {
            body: request.message,
            icon: 'icon48.png'
          });
        }
      });
    }
  }
});