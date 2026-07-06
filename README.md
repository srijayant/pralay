# Pralay — 3D Open World (Post-Apocalyptic India)

**पुनर्निर्माण · Punarnirman** — A Vice City–inspired 3D exploration game set in the ruins of Navi Mumbai, 2087 CE.

Create your survivor avatar, walk the neon-lit streets, and interact with NPCs, shrines, flooded metro tunnels, and scavenger stalls in a post-Sundering Bharat.

## Play

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) — requires a browser with WebGL.

### Controls

| Platform | Move | Run | Interact | Camera |
|----------|------|-----|----------|--------|
| Desktop | WASD / arrows | Shift | E | Drag mouse |
| Mobile | Virtual joystick | RUN button | E button | Auto-follow |

Press **Esc** to pause.

## Features

- **Avatar creator** — name, skin tone, outfit colors, survivor style (Wanderer, Scavenger, River Monk)
- **3D open world** — grid city with streets, neon signs, ruined towers, temple quarter
- **Third-person camera** — GTA / Vice City style follow cam
- **8 interactables** — chai wallah, engineer, spice vendor, metro, shrine, rickshaw, watchtower, tiger mural
- **Zone system** — location names update as you explore (Bazaar Row, Metro Sink, etc.)
- **Mobile support** — touch joystick + on-screen buttons
- **PWA** — installable as an app with offline caching

## Install as app

See [GitHub Pages setup](#github-pages) below, or use Netlify Drop. On phone: **Add to Home Screen** after opening the URL.

### GitHub Pages

1. **https://github.com/srijayant/pralay/settings/pages**
2. Source: **Deploy from branch** → `gh-pages` / root
3. Repo must be **public** for free hosting
4. Open **https://srijayant.github.io/pralay/**

## Tech

Three.js (WebGL), vanilla ES modules, no build step. Three.js loaded from CDN on first visit (cached by service worker).

## Legacy

The original 2D turn-based world-building game is preserved on the `legacy-strategy` git tag.
