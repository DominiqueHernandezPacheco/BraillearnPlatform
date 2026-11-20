# Publicar Braillearn

La web y el servidor de Braulio van en **un solo contenedor** (ver `Dockerfile`).
Lo más simple es **Render**. Hay una opción con una máquina virtual (AWS, Google
Cloud…) al final.

## Render (recomendado)

1. Sube los cambios a GitHub.
2. En [render.com](https://render.com) crea una cuenta con tu GitHub.
3. **New → Blueprint**, elige el repositorio y confirma. Render lee `render.yaml`.
4. Cuando te pida las variables, copia los **mismos valores de tu `.env`**:
   - `ANTHROPIC_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID` (debe ser la misma voz: las voces ya generadas dependen de ella)
5. Espera a que termine el primer despliegue (unos minutos).
6. La plataforma queda en `https://<tu-servicio>.onrender.com/plataforma/`.
7. En el backend del display (`braille_translate`, `main.py`), agrega esa dirección
   a los orígenes permitidos (CORS), o Mensajes y el display no podrán conectarse.

### Lo que hay que saber del plan gratis
- Se **duerme tras 15 minutos** sin visitas y tarda ~50 s en despertar. Para
  evitarlo, un servicio gratis de "ping" (UptimeRobot, cron-job.org) que abra
  `/api/health` cada 10 minutos lo mantiene despierto.
- Su disco se borra en cada reinicio. Por eso las voces ya generadas viajan
  **dentro de la imagen** (`deploy/tts-cache`).
- Cuando cambies o agregues cuentos o lecciones: `npm run tts:pregenerate` y
  luego `npm run tts:export-cache`, y súbelo.

## Protecciones (ya activas en producción)
El servidor es público, así que limita lo que cuesta dinero: texto máximo, peticiones
por minuto por IP, **voz nueva con un cupo diario** (lo ya guardado siempre suena) y
un tope diario de preguntas a Claude. Se ajustan con variables de entorno, ver la
cabecera de `server/index.cjs`.

## Opción con máquina virtual (AWS, Google Cloud, etc.)
Sirve cualquier Linux con Docker. Con una VM de 1 GB crea antes 2 GB de swap, o la
compilación se queda sin memoria.

```bash
git clone <repo> braillearn && cd braillearn
cp .env.example .env             # claves + SITE_ADDRESS=<tu-dominio>
cd deploy && docker compose --env-file ../.env up -d --build
```
`SITE_ADDRESS` es el dominio. Sin dominio, sirve `<ip-con-guiones>.sslip.io` (por
ejemplo `3-90-12-45.sslip.io`); Caddy saca el certificado HTTPS solo. El micrófono
solo funciona con HTTPS.
