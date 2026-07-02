// RelayOS popup controller — connect, list workspaces, capture, show result.

const DEFAULT_BASE = "http://localhost:3000"
const SUPPORTED = [
  /^https:\/\/claude\.ai\//,
  /^https:\/\/(chat\.openai\.com|chatgpt\.com)\//,
  /^https:\/\/gemini\.google\.com\//,
]
const SOURCE_NAMES = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini", unknown: "this page" }

const $ = (id) => document.getElementById(id)
const state = { apiKey: null, apiBase: DEFAULT_BASE, tab: null, workspaces: [] }

const SCREENS = [
  "loading", "connect", "unsupported", "capture", "capturing", "success", "error",
]
function show(name) {
  SCREENS.forEach((s) => $(`screen-${s}`).classList.toggle("hidden", s !== name))
}
function setConnected(on) {
  const dot = $("statusDot")
  dot.classList.toggle("on", on)
  dot.title = on ? "Connected" : "Not connected"
}
const trimBase = (b) => (b || DEFAULT_BASE).trim().replace(/\/+$/, "")

async function storageGet() {
  return chrome.storage.local.get(["relayApiKey", "relayApiBase", "lastWorkspaceId"])
}

function isSupported(url) {
  return !!url && SUPPORTED.some((re) => re.test(url))
}

// ── API ──
async function apiFetch(path, options = {}) {
  const res = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.apiKey}`,
      ...(options.headers || {}),
    },
  })
  return res
}

// ── Init ──
async function init() {
  show("loading")
  const stored = await storageGet()
  state.apiKey = stored.relayApiKey || null
  state.apiBase = trimBase(stored.relayApiBase)

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  state.tab = tab

  if (!state.apiKey) {
    $("apiBase").value = state.apiBase
    setConnected(false)
    return show("connect")
  }
  setConnected(true)

  if (!isSupported(tab?.url)) return show("unsupported")

  // Connected + on a supported site → load workspaces
  try {
    const res = await apiFetch("/api/extension/workspaces")
    if (res.status === 401) {
      showConnectError("Your API key was rejected. Please reconnect.")
      return
    }
    if (!res.ok) throw new Error(`Server error (${res.status})`)
    const data = await res.json()
    state.workspaces = data.workspaces || []
    renderCapture(stored.lastWorkspaceId)
  } catch (e) {
    showError(`Couldn't reach RelayOS at ${state.apiBase}. Is it running?`)
  }
}

function renderCapture(lastWorkspaceId) {
  const source = detectSourceFromUrl(state.tab?.url)
  $("sourceLabel").textContent = `From ${SOURCE_NAMES[source] || "this page"}`

  const select = $("workspace")
  select.innerHTML = ""
  if (state.workspaces.length === 0) {
    const opt = document.createElement("option")
    opt.textContent = "No workspaces — create one in RelayOS"
    opt.disabled = true
    select.appendChild(opt)
    $("captureBtn").disabled = true
  } else {
    state.workspaces.forEach((ws) => {
      const opt = document.createElement("option")
      opt.value = ws.id
      opt.textContent = ws.name
      if (ws.id === lastWorkspaceId) opt.selected = true
      select.appendChild(opt)
    })
    $("captureBtn").disabled = false
  }
  show("capture")
}

function detectSourceFromUrl(url = "") {
  if (url.includes("claude.ai")) return "claude"
  if (url.includes("chatgpt.com") || url.includes("chat.openai.com")) return "chatgpt"
  if (url.includes("gemini.google.com")) return "gemini"
  return "unknown"
}

// Ensure the content script is present, then ask it to extract.
async function extractFromTab(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: "ping" })
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] })
  }
  return chrome.tabs.sendMessage(tabId, { action: "extractConversation" })
}

async function capture() {
  const workspaceId = $("workspace").value
  if (!workspaceId) return
  show("capturing")
  $("capturingText").textContent = "Reading the conversation…"

  let extracted
  try {
    extracted = await extractFromTab(state.tab.id)
  } catch (e) {
    return showError("Couldn't read this page. Refresh the tab and try again.")
  }
  if (!extracted?.ok) {
    return showError(extracted?.error || "No conversation found on this page.")
  }

  $("capturingText").textContent = "Extracting decisions…"
  try {
    const res = await apiFetch("/api/extension/import", {
      method: "POST",
      body: JSON.stringify({
        workspaceId,
        text: extracted.text,
        source: extracted.source,
      }),
    })
    if (res.status === 401) return showConnectError("Your API key was rejected. Please reconnect.")
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Server error (${res.status})`)

    await chrome.storage.local.set({ lastWorkspaceId: workspaceId })
    showSuccess(data, workspaceId)
  } catch (e) {
    showError(e.message || "Capture failed. Try again.")
  }
}

function showSuccess(data, workspaceId) {
  const c = data.counts || { decisions: 0, actionItems: 0, questions: 0 }
  const total = (c.decisions || 0) + (c.actionItems || 0) + (c.questions || 0)
  let msg
  if (data.extractionError) {
    msg = "Conversation saved. AI extraction failed — you can retry it inside RelayOS."
  } else if (total === 0) {
    msg = "Conversation saved. No decisions, action items or questions were found."
  } else {
    msg = `Found ${c.decisions} decision${c.decisions === 1 ? "" : "s"}, ${c.actionItems} action item${c.actionItems === 1 ? "" : "s"}, and ${c.questions} question${c.questions === 1 ? "" : "s"}.`
  }
  $("successText").textContent = msg
  $("viewBtn").onclick = () =>
    chrome.tabs.create({ url: `${state.apiBase}/dashboard/workspaces/${workspaceId}` })
  show("success")
}

function showError(text) {
  $("errorText").textContent = text
  show("error")
}
function showConnectError(text) {
  const el = $("connectError")
  el.textContent = text
  el.classList.remove("hidden")
  $("apiBase").value = state.apiBase
  setConnected(false)
  show("connect")
}

// ── Events ──
$("saveBtn").addEventListener("click", async () => {
  const base = trimBase($("apiBase").value)
  const key = $("apiKey").value.trim()
  const err = $("connectError")
  if (!key) {
    err.textContent = "Please paste your API key."
    err.classList.remove("hidden")
    return
  }
  await chrome.storage.local.set({ relayApiKey: key, relayApiBase: base })
  err.classList.add("hidden")
  init()
})

$("getKeyBtn").addEventListener("click", () => {
  const base = trimBase($("apiBase").value)
  chrome.tabs.create({ url: `${base}/api/user/api-key` })
})

async function disconnect() {
  await chrome.storage.local.remove(["relayApiKey"])
  state.apiKey = null
  init()
}
$("disconnectBtn").addEventListener("click", disconnect)
$("disconnectBtn2").addEventListener("click", disconnect)

$("captureBtn").addEventListener("click", capture)
$("retryBtn").addEventListener("click", init)
$("againBtn").addEventListener("click", init)

init()
