# ExitGuard web app (Next.js) — Railway service `exitguard-web`.
# Own Dockerfile so the build is deterministic (Nixpacks + npm ci choked on
# cross-platform optional-dep lock drift). node:22-slim matches the asp-server base.
FROM node:22-slim

WORKDIR /app

# Install deps with `npm install` (tolerant of optional-dep lock drift, unlike npm ci).
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Build the Next.js app.
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Bind to Railway's injected $PORT on all interfaces.
CMD ["sh", "-c", "npx next start -p ${PORT:-3000} -H 0.0.0.0"]
