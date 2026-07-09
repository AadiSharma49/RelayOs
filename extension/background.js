// RelayOS background service worker (MV3).
// - API-key auth is handled in the popup; this stays light.
// - Shows a "ready to capture" badge on the toolbar icon when a content script
//   reports a substantial conversation on the page. This is signal-only — the
//   extension never captures anything without an explicit click.

const BADGE_COLOR = "#22c55e"
const SUPPORTED = /^https:\/\/(claude\.ai|chatgpt\.com|chat\.openai\.com|gemini\.google\.com)\//

function setReadyBadge(tabId, on) {
  if (tabId == null) return
  try {
    if (on) {
      chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR })
      chrome.action.setBadgeText({ tabId, text: "●" })
      chrome.action.setTitle({ tabId, title: "Conversation ready — click to capture to RelayOS" })
    } else {
      chrome.action.setBadgeText({ tabId, text: "" })
      chrome.action.setTitle({ tabId, title: "Capture to RelayOS" })
    }
  } catch (e) {
    /* tab may have closed — ignore */
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[RelayOS] Extension installed.")
  }
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === "openKeyPage") {
    const base = (msg.apiBase || "http://localhost:3000").replace(/\/$/, "")
    chrome.tabs.create({ url: `${base}/api/user/api-key` })
    sendResponse({ ok: true })
    return true
  }
  if (msg?.action === "conversationDetected") {
    setReadyBadge(sender.tab?.id, true)
    return false
  }
  if (msg?.action === "conversationCleared") {
    setReadyBadge(sender.tab?.id, false)
    return false
  }
  if (msg?.action === "clearBadge") {
    setReadyBadge(msg.tabId, false)
    return false
  }
  return false
})

// Clear the badge when a tab navigates away from a supported site.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && !SUPPORTED.test(changeInfo.url)) {
    setReadyBadge(tabId, false)
  }
})
