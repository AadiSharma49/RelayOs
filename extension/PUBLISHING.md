# Publishing the RelayOS Extension

Two ways to get the extension onto other people's browsers.

> ⚠️ **Prerequisite for both:** RelayOS must be reachable at a URL your users can
> hit. For anyone other than you, that means **RelayOS must be deployed** (e.g.
> `https://relayos.yourdomain.com`), not `localhost:3000`. Users enter that URL
> in the extension's **Connect** screen.

---

## Path A — Share a `.zip` (instant, for testers/friends)

No fee, no review. Recipients must enable Developer Mode.

### 1. Package it

From the project root, in **PowerShell**:

```powershell
Compress-Archive -Path extension\* -DestinationPath relayos-extension.zip -Force
```

This produces `relayos-extension.zip`. (You can delete `PUBLISHING.md`,
`README.md`, and `icons/generate-icons.mjs` from the zip if you want a leaner
package — they aren't needed at runtime.)

### 2. Recipient installs it

1. Unzip the folder somewhere permanent
2. Open `chrome://extensions`
3. Toggle **Developer mode** ON (top-right)
4. Click **Load unpacked** → select the unzipped folder
5. Pin the RelayOS icon, click it, enter the RelayOS URL + their API key

---

## Path B — Chrome Web Store (public, one-click install)

The real distribution channel. One-time **$5** registration.

### 1. Register as a developer

- Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Pay the one-time **$5** registration fee

### 2. Package the extension

```powershell
Compress-Archive -Path extension\* -DestinationPath relayos-extension.zip -Force
```

### 3. Create the listing

Upload `relayos-extension.zip`, then fill in the store listing. You'll need:

| Field | What to provide |
| --- | --- |
| **Name** | RelayOS — Decision Capture |
| **Summary** | Capture AI conversations to RelayOS with one click. |
| **Description** | See the suggested copy below |
| **Category** | Productivity |
| **Icon** | `icons/icon128.png` (already included) |
| **Screenshots** | 1280×800 or 640×400 — capture the popup + a capture in progress |
| **Privacy policy URL** | `https://YOUR-DEPLOYED-URL/privacy` (page already built) |
| **Permissions justification** | See below |

### 4. Permissions justification (Chrome will ask)

- **activeTab / scripting** — to read the conversation on the tab **only when the
  user clicks Capture**.
- **storage** — to save the user's RelayOS URL and API key locally.
- **host permissions (claude.ai, chatgpt.com, gemini.google.com)** — the AI sites
  the extension can capture from.
- **Data use** — captured conversation text is sent to the user's own configured
  RelayOS instance. No browsing tracking, no background collection, no ad use.
  (This matches `/privacy`.)

### 5. Submit for review

Reviews typically take **1–3 days**. Once approved, anyone can install with one
click and you get a public store URL to share.

---

## Suggested store description

> **RelayOS turns your AI chats into searchable decisions.**
>
> Stop losing track of what you and your AI assistant decided. With one click,
> RelayOS captures your Claude, ChatGPT, or Gemini conversation and automatically
> extracts the key **decisions**, **action items**, and **open questions** — then
> makes them searchable by meaning, forever.
>
> • One-click capture — no copy-paste
> • Auto-extracts decisions, to-dos and questions with AI
> • Organize captures into workspaces
> • Search your decision history semantically
> • Connect to your own RelayOS instance with a personal API key
>
> Requires a RelayOS account. The extension only reads a page when you click
> Capture — it never runs in the background or tracks your browsing.

---

## Before you publish — checklist

- [ ] RelayOS is deployed to a public URL
- [ ] `/privacy` loads on that deployed URL
- [ ] `version` in `manifest.json` is bumped for each new upload
- [ ] Tested the full connect → capture → view flow against the deployed URL
- [ ] Screenshots captured for the listing
