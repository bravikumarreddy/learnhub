# LearnHub → Claude Code bridge

This is a small WebSocket server that runs on **your laptop**. The website's
**Claude Console** page sends your instructions here, and the server runs them
through the **Claude Code CLI** inside this repo, streaming the results back to
the page.

## ⚠️ Read this first — security

This bridge runs Claude Code with `--dangerously-skip-permissions`. That means
**it can edit files and run shell commands on your laptop without asking.**
Treat the bridge like handing someone a terminal on your machine.

- Anyone with the **bridge URL + token** can control your laptop. Keep the token secret.
- The server listens on `127.0.0.1` (localhost) only. Reaching it from the
  internet requires a tunnel you run (below) — the tunnel gives you `https/wss`
  and the **token is your only authentication**.
- **Stop the server (Ctrl+C) when you are not using it.**
- The token is saved to `bridge/bridge.token` and is git-ignored — it is never
  committed or pushed.

## Prerequisites

1. **Node.js 18+** — check with `node --version`.
2. **Claude Code CLI**, installed and logged in:
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude          # run once and sign in; then Ctrl+C
   ```
   Confirm it works: `claude --version`.

## 1. Install & start the server

From the repo root (the `Practice Quiz` folder):

```bash
cd bridge
npm install          # installs the 'ws' dependency
cd ..
node bridge/server.js
```

On start it prints a **connection token** and saves it to `bridge/bridge.token`:

```
>>> Connection token (paste into the website console):
    3f9a1c...(48 chars)
```

Copy that token — you'll paste it into the website. Leave this terminal running.

### Local-only use (simplest, safest)

If you open the site **on the same laptop**, you can skip the tunnel entirely.
In the Claude Console page use:

- **Bridge URL:** `ws://localhost:8787`
- **Token:** the token printed above

Browsers allow an HTTPS page to talk to `ws://localhost`, so this just works.

## 2. Expose it to the internet (only if you need remote access)

Because your site is served over HTTPS, it can only reach the bridge over
`wss://` from anywhere but localhost. The easiest way to get a `wss` URL is a
tunnel. Pick one:

**Cloudflare (no account needed for a quick tunnel):**
```bash
brew install cloudflared          # or: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
cloudflared tunnel --url http://localhost:8787
```
It prints a URL like `https://random-words.trycloudflare.com`. In the console,
use the **same host with `wss://`**:

- **Bridge URL:** `wss://random-words.trycloudflare.com`
- **Token:** your token

**ngrok (needs a free account):**
```bash
ngrok http 8787
```
Use the `https://…ngrok-free.app` host as `wss://…ngrok-free.app`.

> The tunnel forwards public traffic to your localhost server. Your token is the
> gate. If you ever think it leaked, delete `bridge/bridge.token`, restart the
> server (it generates a new one), and reconnect.

## 3. Use it

Open your site → **Claude Console** → enter the Bridge URL and token → **Connect**.
Type an instruction like *"add 5 more C++ questions to data/cpp.js"* and press
Enter. Claude works in the repo and streams back what it does. Use **New
conversation** to clear its context, and **Log out** to leave the site.

## Configuration (optional env vars)

| Variable | Default | Purpose |
|----------|---------|---------|
| `BRIDGE_PORT` | `8787` | Port to listen on |
| `BRIDGE_HOST` | `127.0.0.1` | Bind address (leave as localhost) |
| `BRIDGE_TOKEN` | auto-generated | Set your own token instead of the file |
| `BRIDGE_REPO` | current dir | Which folder Claude works in |
| `CLAUDE_BIN` | `claude` | Path to the Claude Code CLI |

Example: `BRIDGE_PORT=9000 node bridge/server.js`

## Stopping

Press **Ctrl+C** in the server terminal (and stop the tunnel too). Nothing keeps
running in the background.
