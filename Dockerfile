# Braillearn: la web compilada + el servidor de Braulio, en un solo contenedor.
# Uso: ver deploy/README.md

# ── 1. Compilar la web ───────────────────────────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: no se compilan los módulos nativos de Electron/voz local,
# que la compilación de la web no necesita.
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ── 2. Servidor (solo lo necesario) ──────────────────────────────────────────
FROM node:22-slim
ENV NODE_ENV=production \
    PORT=8787 \
    TTS_CACHE_DIR=/data/tts-cache
WORKDIR /app
COPY deploy/runtime-package.json ./package.json
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force
COPY server ./server
COPY electron/claude ./electron/claude
COPY electron/tts ./electron/tts
COPY --from=build /app/dist ./dist
# Voces ya generadas (lecciones, cuentos y frases fijas), para no gastar créditos en el servidor.
COPY deploy/tts-cache /data/tts-cache
EXPOSE 8787
USER node
CMD ["node", "server/index.cjs"]
