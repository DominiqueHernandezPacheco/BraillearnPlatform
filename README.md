# Braillearn Platform

*Silver Medalist at Infomatrix 2025 Regional* 🥈

Braillearn is a comprehensive, multi-channel system designed to promote digital autonomy and literacy for visually impaired individuals. This repository contains the frontend application — a hybrid web and desktop platform built to break economic and pedagogical barriers in inclusive education.

## Key Features

- **Interactive Simulator** — real-time Braille translation with tactile-style feedback simulation (rhythmic audio cues via Tone.js).
- **Gamified Courses** — modules to learn the Braille alphabet (vowels, numbers, words) with a memory game and interactive drills.
- **Guided Onboarding Tour** — a 5-step, voice-narrated walkthrough for first-time users, spotlighting the courses, simulator, progress card, and accessibility panel. Fully keyboard-navigable (arrows/Enter/Escape), replayable anytime from the accessibility panel, and respects the reduce-motion setting.
- **Accessibility First** — high-contrast mode, adjustable font scale, Text-to-Speech (Web Speech API), reduce-motion, and audio cues — all controllable from a dedicated accessibility panel.
- **Cross-Platform** — runs on the web or as a desktop application via Electron.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Audio & Accessibility:** Tone.js, Web Speech API
- **Desktop Environment:** Electron (`electron-builder` for Windows installers)

## Getting Started

### Prerequisites

Node.js installed on your machine.

### Installation & Development

```bash
npm install
npm run dev              # web app, http://localhost:5173
npm run electron:dev     # desktop app (Vite dev server + Electron together)
```

### Building

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

`provisioning-tool/` is a separate, standalone Node script — not part of the Electron app — used by whoever preps a Raspberry Pi unit before handing it to a pilot family. It generates a `device_id` and writes the WiFi/device config to the SD card's boot partition; it does **not** handle pairing the device to a family's account (that's self-service, already implemented on the backend). See `provisioning-tool/README.md` for full details and usage.

## Roadmap

- Move device pairing/rendering from the ESP8266 protocol to a Raspberry Pi client speaking the same `hello`/`render`/`done` WebSocket protocol (tracked in `provisioning-tool/README.md`).
