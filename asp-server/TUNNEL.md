# Expose the ASP on `asp.mdloglabs.org` via Cloudflare Tunnel (named = stable URL)

The named tunnel gives a **permanent** `https://asp.mdloglabs.org` — safe to register on-chain. Two
things to accept: (1) `mdloglabs.org`'s nameservers must be on Cloudflare (zone shows **Active**),
and (2) this machine must stay **online 24/7** (it IS the server) — through OKX review and judging.

Register on OKX.AI as: **`https://asp.mdloglabs.org/mcp`**

---

## 1. Install cloudflared

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
sudo dpkg -i /tmp/cloudflared.deb
cloudflared --version
```

## 2. Authenticate to your Cloudflare account

```bash
cloudflared tunnel login    # opens a browser → pick the mdloglabs.org zone → authorize
# writes ~/.cloudflared/cert.pem
```

## 3. Create the named tunnel

```bash
cloudflared tunnel create exitguard-asp
# prints:  Created tunnel exitguard-asp with id <TUNNEL_UUID>
#          credentials written to /home/mdlog/.cloudflared/<TUNNEL_UUID>.json
```

## 4. Point the DNS at it (creates the CNAME automatically)

```bash
cloudflared tunnel route dns exitguard-asp asp.mdloglabs.org
```

## 5. Install the config

```bash
cp asp-server/cloudflared/config.yml ~/.cloudflared/config.yml
# edit ~/.cloudflared/config.yml → replace <TUNNEL_UUID> with the UUID from step 3
```

## 6. Run the asp-server (Docker, auto-restart, bound to localhost)

```bash
cd asp-server
cp .env.example .env          # fill OKX keys + PAY_TO_ADDRESS; keep NETWORK=eip155:1952 to start
docker build -t exitguard-asp .
docker run -d --name exitguard-asp --restart unless-stopped \
  -p 127.0.0.1:4000:4000 --env-file .env exitguard-asp
docker logs exitguard-asp --tail 5
```
Binding to `127.0.0.1` means the server is reachable ONLY through the tunnel, never directly.

## 7. Run the tunnel — test, then make it a boot service

```bash
# foreground test first:
cloudflared tunnel run exitguard-asp
#   (Ctrl-C once the smoke test below passes)

# then install as a systemd service so it survives reboots:
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/config.yml /etc/cloudflared/config.yml
sudo cp ~/.cloudflared/<TUNNEL_UUID>.json /etc/cloudflared/
# edit /etc/cloudflared/config.yml → set credentials-file: /etc/cloudflared/<TUNNEL_UUID>.json
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared --no-pager
```
Also make sure Docker restarts containers on boot: `sudo systemctl enable docker`.

## 8. Smoke test the public URL (do BEFORE registering)

```bash
BASE=https://asp.mdloglabs.org

# health — with OKX keys set expect paid:true, hasCreds:true
curl -s $BASE/health; echo

# MCP handshake (free) — expect serverInfo + the exit_liquidity_check tool
curl -s -X POST $BASE/mcp -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c","version":"1"}}}'

# visual MCP check
npx @modelcontextprotocol/inspector    # connect it to https://asp.mdloglabs.org/mcp
```
If the MCP handshake streams correctly through the tunnel, you're good. On testnet
(`NETWORK=eip155:1952`) drive one real **402 → sign → settle** before flipping to `eip155:196`.

## 9. Register (only after step 8 passes)

Endpoint = **`https://asp.mdloglabs.org/mcp`**. Use `docs/ASP_REGISTRATION.md`, then run the OKX.AI
`register` + `list` prompts. The URL is final and written on-chain — don't register until the smoke
test is green.

---

### Operational notes
- **Machine must stay up** — if it sleeps, disable sleep: `sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`.
- Update the service: `docker build -t exitguard-asp . && docker rm -f exitguard-asp && docker run -d --name exitguard-asp --restart unless-stopped -p 127.0.0.1:4000:4000 --env-file .env exitguard-asp` (the tunnel/URL stays the same).
- Logs: `docker logs -f exitguard-asp` (server) · `sudo journalctl -u cloudflared -f` (tunnel).
