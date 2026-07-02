// RelayOS background service worker (MV3).
// v1 uses API-key auth (pasted in the popup), so this stays minimal. It logs
// installs and can open the RelayOS API-key page when the popup asks.
// A real OAuth connect flow can replace this in v2.

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[RelayOS] Extension installed.")
  }
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.action === "openKeyPage") {
    const base = (msg.apiBase || "http://localhost:3000").replace(/\/$/, "")
    chrome.tabs.create({ url: `${base}/api/user/api-key` })
    sendResponse({ ok: true })
    return true
  }
  return false
})
