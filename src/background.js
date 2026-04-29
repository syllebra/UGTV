// Écoute les clics sur l'icône de l'extension
chrome.action.onClicked.addListener((tab) => {
  // Vérifie qu'on est bien sur Ultimate Guitar avant d'envoyer le message
  if (tab.url.includes("ultimate-guitar.com")) {
    chrome.tabs.sendMessage(tab.id, { action: "toggle_tv_mode" });
  }
});
