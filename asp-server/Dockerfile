# ExitGuard ASP server — the real, x402-paid A2MCP endpoint.
# Platform-agnostic container: runs on Railway / Fly.io / Render / any Docker host.
# Serves POST /mcp (register THIS as the A2MCP endpoint), POST /exit_liquidity_check, GET /health.

FROM node:22-slim

WORKDIR /app

# Install deps first (better layer caching). npm ci needs package-lock.json.
# NOTE: tsx is a devDependency and `npm start` runs it, so do NOT set NODE_ENV=production
# before install (that would omit tsx). Set PAY_STRICT / NODE_ENV at RUNTIME via env instead.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV PORT=4000
EXPOSE 4000

# Basic container healthcheck against the server's /health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
