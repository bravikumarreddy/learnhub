#!/usr/bin/env node
/* ============================================================================
 * LearnHub → Claude Code bridge
 * ----------------------------------------------------------------------------
 * A WebSocket server that runs on YOUR laptop. It takes prompts from the
 * website console and runs them through the Claude Code CLI in THIS repo,
 * streaming the output back to the browser.
 *
 * ⚠️  SECURITY: This executes Claude Code with permissions bypassed, meaning
 *     it can edit files and run shell commands on this machine WITHOUT asking.
 *     Anyone who has the bridge URL AND the token can control your laptop.
 *     - The token below is strong and random. Keep it secret.
 *     - The server binds to 127.0.0.1 (localhost) only. To reach it from the
 *       internet, run a tunnel in front of it (see bridge/README.md) — the
 *       tunnel gives you https/wss and the token is your auth.
 *     - Stop the server (Ctrl+C) when you're not using it.
 * ==========================================================================*/

"use strict";

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

let WebSocketServer;
try {
  ({ WebSocketServer } = require("ws"));
} catch (e) {
  console.error("\n[bridge] Missing dependency 'ws'. Run:  npm install\n");
  process.exit(1);
}

// ---- Config (override with env vars) --------------------------------------
const PORT = parseInt(process.env.BRIDGE_PORT || "8787", 10);
const HOST = process.env.BRIDGE_HOST || "127.0.0.1"; // localhost only by default
const REPO_DIR = process.env.BRIDGE_REPO || process.cwd();
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
const TOKEN_FILE = path.join(__dirname, "bridge.token");

// ---- Token: load or generate ----------------------------------------------
function loadOrCreateToken() {
  if (process.env.BRIDGE_TOKEN) return process.env.BRIDGE_TOKEN.trim();
  try {
    const t = fs.readFileSync(TOKEN_FILE, "utf8").trim();
    if (t) return t;
  } catch (e) {}
  const t = crypto.randomBytes(24).toString("hex"); // 48 hex chars
  fs.writeFileSync(TOKEN_FILE, t + "\n", { mode: 0o600 });
  return t;
}
const TOKEN = loadOrCreateToken();

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ---- HTTP server (health check) + WS --------------------------------------
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, repo: REPO_DIR }));
    return;
  }
  res.writeHead(426, { "content-type": "text/plain" });
  res.end("This is a WebSocket bridge. Connect via ws/wss.\n");
});

const wss = new WebSocketServer({ server });
let busy = false;         // one Claude job at a time
let started = false;      // use --continue after the first turn

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  let authed = false;

  const send = (obj) => {
    try { ws.send(JSON.stringify(obj)); } catch (e) {}
  };

  send({ type: "hello", message: "Send { type:'auth', token:'...' } to authenticate." });

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); }
    catch (e) { return send({ type: "error", message: "Invalid JSON." }); }

    // --- auth gate ---
    if (!authed) {
      if (msg.type === "auth" && safeEqual(msg.token || "", TOKEN)) {
        authed = true;
        console.log(`[bridge] client authenticated from ${ip}`);
        return send({ type: "ready", repo: REPO_DIR });
      }
      console.log(`[bridge] rejected client from ${ip} (bad/no token)`);
      send({ type: "error", message: "Authentication required or failed." });
      return ws.close(1008, "unauthorized");
    }

    // --- prompt ---
    if (msg.type === "prompt") {
      const text = (msg.text || "").toString().trim();
      if (!text) return send({ type: "error", message: "Empty prompt." });
      if (busy) return send({ type: "error", message: "Bridge is busy with another request." });
      runClaude(text, ws, send);
      return;
    }

    if (msg.type === "reset") {           // start a fresh Claude conversation
      started = false;
      return send({ type: "notice", message: "Conversation context reset." });
    }

    send({ type: "error", message: "Unknown message type: " + msg.type });
  });

  ws.on("close", () => {});
});

// ---- Run the Claude Code CLI and stream its output ------------------------
function runClaude(prompt, ws, send) {
  busy = true;
  console.log(`[bridge] > ${prompt.replace(/\s+/g, " ").slice(0, 200)}`);

  const args = [
    "--print",
    "--output-format", "stream-json",
    "--verbose",
    "--dangerously-skip-permissions",
  ];
  if (started) args.unshift("--continue");

  send({ type: "start", prompt });

  let child;
  try {
    child = spawn(CLAUDE_BIN, args, {
      cwd: REPO_DIR,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (e) {
    busy = false;
    return send({ type: "error", message: "Could not launch claude: " + e.message });
  }

  // feed the prompt on stdin
  child.stdin.write(prompt);
  child.stdin.end();

  let buf = "";
  child.stdout.on("data", (chunk) => {
    buf += chunk.toString();
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) forwardEvent(line, send);
    }
  });

  child.stderr.on("data", (chunk) => {
    send({ type: "stderr", data: chunk.toString() });
  });

  child.on("error", (e) => {
    busy = false;
    send({ type: "error", message: "claude process error: " + e.message +
      (e.code === "ENOENT" ? " (is the Claude Code CLI installed and on PATH?)" : "") });
    send({ type: "done", ok: false });
  });

  child.on("close", (code) => {
    if (buf.trim()) forwardEvent(buf.trim(), send);
    busy = false;
    started = true;
    send({ type: "done", ok: code === 0, code });
    console.log(`[bridge] < done (exit ${code})`);
  });
}

// Translate a stream-json line into a friendly event for the browser.
function forwardEvent(line, send) {
  let ev;
  try { ev = JSON.parse(line); }
  catch (e) { return send({ type: "text", data: line }); } // fallback: raw

  try {
    if (ev.type === "assistant" && ev.message && Array.isArray(ev.message.content)) {
      for (const block of ev.message.content) {
        if (block.type === "text" && block.text) {
          send({ type: "text", data: block.text });
        } else if (block.type === "tool_use") {
          const summary = summarizeTool(block);
          send({ type: "tool", name: block.name, summary });
        }
      }
    } else if (ev.type === "result") {
      // The assistant text has already been streamed above; the result event's
      // text duplicates it, so we only forward the summary/metadata here.
      send({ type: "result", subtype: ev.subtype, cost: ev.total_cost_usd });
    } else if (ev.type === "system" && ev.subtype === "init") {
      send({ type: "notice", message: "Claude session started." });
    }
  } catch (e) {
    send({ type: "text", data: line });
  }
}

function summarizeTool(block) {
  const inp = block.input || {};
  if (block.name === "Bash" && inp.command) return "$ " + inp.command;
  if ((block.name === "Edit" || block.name === "Write") && inp.file_path) return block.name + " " + inp.file_path;
  if (block.name === "Read" && inp.file_path) return "Read " + inp.file_path;
  return block.name;
}

server.listen(PORT, HOST, () => {
  console.log("\n==================================================================");
  console.log("  LearnHub → Claude Code bridge is running");
  console.log("------------------------------------------------------------------");
  console.log(`  Listening:  ws://${HOST}:${PORT}`);
  console.log(`  Repo:       ${REPO_DIR}`);
  console.log(`  Claude bin: ${CLAUDE_BIN}`);
  console.log("");
  console.log("  >>> Connection token (paste into the website console):");
  console.log("      " + TOKEN);
  console.log("");
  console.log("  Saved to bridge/bridge.token (keep this secret; it is gitignored).");
  console.log("  This bridge runs Claude with permissions bypassed. Stop it (Ctrl+C)");
  console.log("  when you're done. For internet access, run a tunnel — see README.");
  console.log("==================================================================\n");
});
