// RelayOS content script — reads the conversation from the AI tool's DOM.
// Injected on claude.ai, chatgpt.com/chat.openai.com and gemini.google.com.
// Also re-injectable on demand by the popup (guarded against double-init).

(() => {
  if (window.__relayosInjected) return
  window.__relayosInjected = true

  function detectSource() {
    const h = location.hostname
    if (h.includes("claude.ai")) return "claude"
    if (h.includes("chatgpt.com") || h.includes("chat.openai.com")) return "chatgpt"
    if (h.includes("gemini.google.com")) return "gemini"
    return "unknown"
  }

  const clean = (s) => (s || "").replace(/ /g, " ").trim()

  // ── Claude ──
  function extractClaude() {
    const parts = []
    // User turns carry data-testid="user-message"; assistant turns render in
    // .font-claude-message (and sometimes data-testid="assistant-message").
    const nodes = document.querySelectorAll(
      '[data-testid="user-message"], [data-testid="assistant-message"], .font-claude-message'
    )
    nodes.forEach((n) => {
      const isUser = n.matches('[data-testid="user-message"]')
      const text = clean(n.innerText)
      if (text) parts.push(`${isUser ? "Human" : "Assistant"}: ${text}`)
    })
    return parts.join("\n\n")
  }

  // ── ChatGPT ──
  function extractChatGPT() {
    const parts = []
    const nodes = document.querySelectorAll("[data-message-author-role]")
    nodes.forEach((n) => {
      const role = n.getAttribute("data-message-author-role")
      const label = role === "user" ? "Human" : role === "assistant" ? "Assistant" : role
      const text = clean(n.innerText)
      if (text) parts.push(`${label}: ${text}`)
    })
    return parts.join("\n\n")
  }

  // ── Gemini ──
  function extractGemini() {
    const parts = []
    const nodes = document.querySelectorAll("user-query, model-response")
    nodes.forEach((n) => {
      const isUser = n.tagName.toLowerCase() === "user-query"
      const text = clean(n.innerText)
      if (text) parts.push(`${isUser ? "Human" : "Assistant"}: ${text}`)
    })
    return parts.join("\n\n")
  }

  function extractConversation() {
    const source = detectSource()
    let text = ""
    try {
      if (source === "claude") text = extractClaude()
      else if (source === "chatgpt") text = extractChatGPT()
      else if (source === "gemini") text = extractGemini()
    } catch (e) {
      text = ""
    }
    // Fallback: if selectors found little/nothing, grab the main region text
    // so a capture is never completely empty.
    if (!text || text.trim().length < 20) {
      const main = document.querySelector("main") || document.body
      text = clean(main.innerText)
    }
    return { text, source }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.action === "ping") {
      sendResponse({ ok: true })
      return true
    }
    if (msg?.action === "extractConversation") {
      try {
        const { text, source } = extractConversation()
        if (!text || !text.trim()) {
          sendResponse({ ok: false, error: "No conversation text found on this page." })
        } else {
          sendResponse({ ok: true, text, source })
        }
      } catch (e) {
        sendResponse({ ok: false, error: e?.message || "Extraction failed" })
      }
      return true
    }
    return false
  })
})()
