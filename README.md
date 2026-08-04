<div align="center">

# Braillearn

**Digital autonomy and Braille literacy for visually impaired learners — web, desktop, and a hardware pilot in the field.**

🥇 **Gold Medal — Infomatrix México National 2026**, advancing to the Infomatrix International Final in Thailand
🥈 Silver Medal — Infomatrix 2025 Regional

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Electron](https://img.shields.io/badge/Electron-34-47848f?logo=electron&logoColor=white)](https://www.electronjs.org)

</div>

---

Braillearn is a comprehensive, multi-channel system designed to break the economic and pedagogical barriers that keep Braille literacy out of reach: a gamified learning platform (web + desktop) paired with a low-cost physical device pilot that brings the same lessons to a tactile Braille cell in a family's home.

This repository is the frontend platform — the part a student opens every day.

## Key Features

- **Interactive Simulator** — real-time Braille translation with tactile-style feedback, driven by rhythmic audio cues (Tone.js) that mirror how the physical cell renders each character.
- **Gamified Courses** — structured modules for the Braille alphabet (vowels, numbers, words), with a memory game and interactive drills.
- **Voice-Guided Onboarding** — a 5-step narrated walkthrough that spotlights the courses, simulator, progress tracker, and accessibility panel for first-time users. Fully keyboard-navigable, replayable anytime, and respects reduce-motion.
- **Accessibility-First Design** — high-contrast mode, adjustable font scale, Text-to-Speech (Web Speech API), reduce-motion, and audio cues, all from one accessibility panel. Not a bolt-on: the target user is the accessibility user.
- **Cross-Platform** — ships as a web app or a native Windows desktop app via Electron.
- **Field Pilot Tooling** — a standalone provisioning CLI for preparing the Raspberry Pi units deployed to pilot families (see below).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Audio & Accessibility | Tone.js, Web Speech API |
| Desktop | Electron + `electron-builder` (Windows installer) |
| Field hardware provisioning | Node.js CLI (`provisioning-tool/`) |

## Getting Started

**Prerequisites:** Node.js.

```bash
npm install
npm run dev              # web app — http://localhost:5173
npm run electron:dev     # desktop app (Vite dev server + Electron together)
```

**Building:**

```bash
npm run build             # production web build -> dist/
npm run electron:build    # packaged Windows installer -> dist-electron/
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` / `npm run preview` | Production web build / preview it locally |
| `npm run electron:dev` | Runs the Vite dev server and Electron together for desktop development |
| `npm run electron:build` | Builds the web app and packages it as a Windows installer via `electron-builder` |
| `npm run lint` | ESLint |

## Project Structure

```
Braillearn/
├─ src/                    the React app (components, contexts, hooks)
├─ electron/                Electron main + preload processes
├─ provisioning-tool/        standalone CLI — see below
└─ dist/, dist-electron/     build output (gitignored)
```

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
