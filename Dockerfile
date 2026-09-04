# Base Debian slim (glibc): evita el problema del binario SWC de Next en Alpine (musl).
# ---------- Dependencias ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# npm ci resiliente a redes inestables (evita ECONNRESET en el build).
# El lockfile se generó en Windows y npm no siempre instala el binario SWC de
# la libc correcta; por eso forzamos el binario glibc (gnu) para Debian.
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && npm ci --no-audit --no-fund \
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
