// RelayOS popup controller — connect, list workspaces, capture, show result.
// Once connected + a default workspace is remembered, capture is one click.

const DEFAULT_BASE = "http://localhost:3000"
const SUPPORTED = [
  /^https:\/\/claude\.ai\//,
  /^https:\/\/(chat\.openai\.com|chatgpt\.com)\//,
  /^https:\/\/gemini\.google\.com\//,
]
const SOURCE_NAMES = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini", unknown: "this page" }

const $ = (id) => document.getElementById(id)
const state = {
  apiKey: null,
  apiBase: DEFAULT_BASE,
  tab: null,
  workspaces: [],
  defaultWorkspaceId: null,
}

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
  return chrome.storage.local.get([
    "relayApiKey",
    "relayApiBase",
    "relayDefaultWorkspaceId",
    "lastWorkspaceId",
  ])
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
  // Prefer an explicit default; fall back to the last workspace used.
  state.defaultWorkspaceId = stored.relayDefaultWorkspaceId || stored.lastWorkspaceId || null

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  state.tab = tab

  // Connection is remembered — we only show "connect" when there's no key.
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
      // Only reconnect prompt is when the key is actually invalid.
      showConnectError("Your API key was rejected. Please reconnect.")
      return
    }
    if (!res.ok) throw new Error(`Server error (${res.status})`)
    const data = await res.json()
    state.workspaces = data.workspaces || []
    renderCapture()
  } catch (e) {
    showError(`Couldn't reach RelayOS at ${state.apiBase}. Is it running?`)
  }
}

function defaultWorkspace() {
  if (!state.defaultWorkspaceId) return null
  return state.workspaces.find((w) => w.id === state.defaultWorkspaceId) || null
}

function pickerVisible() {
  return !$("wsPicker").classList.contains("hidden")
}

function setMode(mode) {
  // "quick" = one-click to remembered workspace; "pick" = choose from dropdown.
  const quick = mode === "quick"
  $("targetRow").classList.toggle("hidden", !quick)
  $("wsPicker").classList.toggle("hidden", quick)
}

function renderCapture() {
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
    setMode("pick")
    return show("capture")
  }

  state.workspaces.forEach((ws) => {
    const opt = document.createElement("option")
    opt.value = ws.id
    opt.textContent = ws.name
    select.appendChild(opt)
  })
  $("captureBtn").disabled = false

  const def = defaultWorkspace()
  if (def) {
    // Remembered — one-click capture, dropdown preselected in case they Change.
    select.value = def.id
    $("targetName").textContent = def.name
    setMode("quick")
  } else {
    // First capture — let them pick; we'll remember it afterwards.
    setMode("pick")
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

function clearBadge() {
  try {
    chrome.runtime.sendMessage({ action: "clearBadge", tabId: state.tab?.id })
  } catch {
    /* ignore */
  }
}

async function capture() {
  // Target is the dropdown when picking, otherwise the remembered default.
  const workspaceId = pickerVisible() ? $("workspace").value : state.defaultWorkspaceId
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

    // Remember this workspace so future captures are one click.
    state.defaultWorkspaceId = workspaceId
    await chrome.storage.local.set({
      relayDefaultWorkspaceId: workspaceId,
      lastWorkspaceId: workspaceId,
    })
    clearBadge()
    showSuccess(data, workspaceId)
  } catch (e) {
    showError(e.message || "Capture failed. Try again.")
  }
}

// Builds "Captured — 3 decisions, 2 action items found" from the counts.
function summarize(counts) {
  const parts = []
  if (counts.decisions) parts.push(`${counts.decisions} decision${counts.decisions === 1 ? "" : "s"}`)
  if (counts.actionItems) parts.push(`${counts.actionItems} action item${counts.actionItems === 1 ? "" : "s"}`)
  if (counts.questions) parts.push(`${counts.questions} question${counts.questions === 1 ? "" : "s"}`)
  return parts
}

function showSuccess(data, workspaceId) {
  const c = data.counts || { decisions: 0, actionItems: 0, questions: 0 }
  const parts = summarize(c)
  let msg
  if (data.extractionError) {
    msg = "Conversation saved. AI extraction failed — you can retry it inside RelayOS."
  } else if (parts.length === 0) {
    msg = "Captured — no decisions, action items or questions found."
  } else {
    msg = `Captured — ${parts.join(", ")} found.`
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

// "Change" — reveal the picker for a one-off different workspace.
$("changeWsBtn").addEventListener("click", () => setMode("pick"))

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
