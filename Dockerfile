# Base Debian slim (glibc): evita el problema del binario SWC de Next en Alpine (musl).
# ---------- Dependencias ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# npm ci resiliente a redes inestables (evita ECONNRESET en el build).
# Node >=17 prefiere IPv6: si el host tiene IPv6 roto, npm muere con
# ECONNRESET. Forzamos DNS IPv4-first y el registry oficial.
ENV NODE_OPTIONS=--dns-result-order=ipv4first
# El lockfile se generó en Windows y npm no siempre instala el binario SWC de
# la libc correcta; por eso forzamos el binario glibc (gnu) para Debian.
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 8 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000 \
 && npm config set fetch-timeout 900000 \
 && npm ci --no-audit --no-fund --prefer-offline \
 && npm install --no-save --no-audit --no-fund @next/swc-linux-x64-gnu@14.2.33

# ---------- Build ----------
FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No se necesitan las claves de Supabase para compilar (init lazy).
RUN npm run build

# ---------- Runtime ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd -g 1001 nodejs \
 && useradd -u 1001 -g nodejs -m nextjs

# Salida "standalone" de Next: server mínimo + node_modules podados
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
