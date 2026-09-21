<div align="center">

# Braillearn

**Digital autonomy and Braille literacy for visually impaired learners — web, desktop, and a hardware pilot in the field.**

🥇 **Gold Medal — Infomatrix México National 2026**, advancing to PISF in Thailand.
🥈 Silver Medal — Infomatrix 2025 Regional

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Electron](https://img.shields.io/badge/Electron-34-47848f?logo=electron&logoColor=white)](https://www.electronjs.org)

</div>

---

Braillearn is a comprehensive, multi-channel system designed to break the economic and pedagogical barriers that keep Braille literacy out of reach: a gamified learning platform (web + desktop) paired with a low-cost physical device pilot that brings the same lessons to a tactile Braille cell in a family's home.

This repository holds everything the student and the public see:

- **The learning platform** — the part a student opens every day (web and Electron desktop app).
- **The landing site** — the public presentation of the project, in five languages.
- **The voice assistant backend** — a small local server that powers "Braulio" in the browser.
- **The field provisioning tool** — a standalone CLI for preparing the pilot hardware.

## Key Features

- **Messages for the display** — a parent or teacher types a short message, previews how it will look cell by cell, and sends it to the physical Braille display. Recent messages can be re-sent with one tap.
- **Guided Courses** — a Duolingo-style path of short, bite-sized steps grouped into chapters: a theory module (what Braille is, who Louis Braille was, how the cell works) with a quick check after each chapter, the vowels, and a set of random challenges with a memory game. Progress is saved per step so you resume exactly where you left off.
- **"Braulio" Voice Assistant** — hands-free control by voice: say the wake word, give a command (go to the courses or the messages area, open a module or your last lesson, change the accessibility settings) or ask an open question and get a spoken answer. See [Voice assistant](#voice-assistant-braulio).
- **Voice-Guided Onboarding** — a short narrated walkthrough that spotlights the courses, messages, progress tracker, and accessibility panel for first-time users. Fully keyboard-navigable, replayable anytime, and respects reduce-motion.
- **Accessibility-First Design** — high-contrast mode, adjustable font scale, text-to-speech, reduce-motion, and audio cues, all from one accessibility panel. Not a bolt-on: the target user is the accessibility user.
- **Multilingual Landing Site** — home, technology, history and community pages in Spanish, English, French, Italian and Korean, with interactive 3D models of the display, the Braille cell and the solenoid, and a live (non-navigable) preview of the platform.
- **Cross-Platform** — ships as a web app or a native Windows desktop app via Electron.
- **Field Pilot Tooling** — a standalone provisioning CLI for preparing the Raspberry Pi units deployed to pilot families (see below).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7 (multi-page), Tailwind CSS 4 |
| Landing site | Framer Motion, `<model-viewer>` (3D `.glb` models, self-hosted Draco decoder), custom i18n (es, en, fr, it, ko) |
| Audio & Accessibility | Tone.js, Web Speech API |
| Voice assistant | Porcupine wake word (Whisper via `@xenova/transformers` as local fallback), Piper TTS, Claude API |
| Backend for voice | Node.js + Express (`server/`), Electron main process |
| Desktop | Electron + `electron-builder` (Windows installer) |
| Field hardware provisioning | Node.js CLI (`provisioning-tool/`) |

## Site map

The landing is the root of the site and the platform lives on its own path; they don't depend on each other.

| Path | What it is |
|---|---|
| `/` | Landing home — Braillearn and the product |
| `/tecnologia.html` | Technology: hardware, software and backend architecture |
| `/historia.html` | History: the problem, the timeline and how it was built |
| `/comunidad.html` | Community: organizations and resources in Campeche |
| `/platform-demo.html` | Non-navigable preview of the platform, embedded in the home |
| `/plataforma/` | The learning platform |

## Getting Started

**Prerequisites:** Node.js 22.

```bash
npm install
npm run dev              # landing — http://localhost:5173 · platform — http://localhost:5173/plataforma/
npm run dev:web          # same, plus the voice API server on :8787 (needed for Braulio in the browser)
npm run electron:dev     # desktop app (Vite dev server + Electron together)
```

**Configuration:** copy `.env.example` to `.env` and fill in the values you need. The landing and the platform run without it; `.env` is only for the voice assistant and is never committed.

| Variable | Used for |
|---|---|
| `ANTHROPIC_API_KEY` | Open-ended questions to Braulio (Claude API) |
| `PICOVOICE_ACCESS_KEY` | Porcupine wake word (optional — falls back to local Whisper) |
| `VOICE_SERVER_PORT` | Port of the voice API server (default `8787`) |

**Building:**

```bash
npm run build             # production web build -> dist/
npm run preview           # serve the production build locally
npm run electron:build    # packaged Windows installer -> dist-electron/
```

## Voice assistant (Braulio)

Braulio listens for its wake word and then handles a command. Commands the app understands locally (see `src/utils/voiceIntents.js`) run immediately; anything else is sent to Claude, which answers out loud.

- **Wake word:** Porcupine, using a custom `Braulio.ppn` model and your Picovoice AccessKey. Those files are **not** in the repository — see the header of `electron/wakeword/wakeWordService.cjs` for what to generate and where to put it. Without them, Braulio falls back to local Whisper (`Xenova/whisper-base`, downloaded on first use), which needs no account.
- **Speech:** Piper generates the voice locally (engine and voice are downloaded on first use into `.piper/`). The bundled engine is currently **Windows x64 only**.
- **Where it runs:** in the Electron app, everything goes through the main process. In the browser, the platform calls the Express server (`npm run server`), which the Vite dev server proxies at `/api` (`/api/ask-claude`, `/api/tts`, `/api/tts/voices`, `/api/health`).
- **Secrets:** the Anthropic key lives only in the server / Electron process, never in the browser bundle.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server (landing + platform) |
| `npm run server` | Voice API server (`server/index.cjs`, port 8787) |
| `npm run dev:web` | Voice API server and Vite dev server together |
| `npm run build` / `npm run preview` | Production web build / preview it locally |
| `npm run electron:dev` | Runs the Vite dev server and Electron together for desktop development |
| `npm run electron:build` | Builds the web app and packages it as a Windows installer via `electron-builder` |
| `npm run lint` | ESLint |

## Project Structure

```
Braillearn/
├─ index.html                landing entry (site root); historia/tecnologia/comunidad/platform-demo.html sit beside it
├─ plataforma/               learning platform entry (served at /plataforma/)
├─ src/
│  ├─ components/, context/, hooks/, utils/    the platform (React app)
│  └─ landing/                                 the landing site: pages, sections, i18n dictionaries, assets
├─ public/                   3D models (.glb) and the Draco decoder
├─ electron/                 Electron main + preload, plus the voice services (wake word, Whisper, Claude, Piper)
├─ server/                   Express API that exposes the voice services to the browser
├─ provisioning-tool/        standalone CLI — see below
└─ dist/, dist-electron/     build output (gitignored)
```

## Deployment

The landing and the platform are static files: `npm run build` produces a `dist/` folder that any static host can serve (Netlify, Cloudflare Pages, Vercel). Publish `dist/` with `npm run build` as the build command; the landing is served at `/` and the platform at `/plataforma/`.

The voice assistant is the only part that needs a server. A static host does not run it, so on a static-only deploy the landing and the platform work but Braulio's spoken answers do not. Run `server/index.cjs` on a Node host (Windows x64 for Piper), keep the API keys in that host's environment, and serve the site over HTTPS — browsers only allow microphone access on secure origins.

## Raspberry Pi provisioning tool

`provisioning-tool/` is a separate, standalone Node script — intentionally outside `src/`, since it's run by whoever preps a Raspberry Pi unit before it reaches a pilot family, never by the app itself. It generates a `device_id` and writes the WiFi/device config to the SD card's boot partition. It deliberately does **not** handle pairing the device to a family's account — that's already self-service on the backend. See [`provisioning-tool/README.md`](./provisioning-tool/README.md) for the full flow.

## Roadmap

- Move device pairing/rendering from the ESP8266 protocol to a Raspberry Pi client speaking the same `hello`/`render`/`done` WebSocket protocol (tracked in `provisioning-tool/README.md`).

## Team

Built by the Braillearn team, Facultad de Ingeniería, Universidad Autónoma de Campeche:

- Valeria de los Ángeles Lee Almeyda
- Christian Dominique Hernández Pacheco
- María Fernanda Rincón Chan

**Advisor:** Joel Cristopher Flores Escalante
