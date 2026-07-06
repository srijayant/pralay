# Pralay — Post-Apocalyptic India World-Building Game

**पुनर्निर्माण · Punarnirman** — Rebuild the fractured subcontinent after the Great Sundering.

A browser-based strategy game set in 2087 CE, 43 years after the collapse of old Bharat. Choose a bastion, survive monsoon cycles, and shape the future of a post-apocalyptic India.

## Play

Open `index.html` in a modern browser, or serve locally:

```bash
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

### Play on your phone

The game runs in mobile browsers (Chrome, Safari, Firefox). You need to serve it over HTTP — opening the HTML file directly on a phone often blocks ES modules.

**Same Wi‑Fi network:**

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

On your phone, open `http://<your-computer-ip>:8080` (e.g. `http://192.168.1.5:8080`). Find your IP with `ip addr` or `ifconfig`.

For play anywhere, deploy the folder to GitHub Pages, Netlify, or any static host.

## Install as an app

Pralay is a **Progressive Web App (PWA)** — you can install it on your phone or desktop and play offline.

### Android (Chrome)

1. Host the game (see [GitHub Pages](#github-pages) below) or open it on your LAN.
2. Tap **Install** when the banner appears, or use the browser menu → **Install app** / **Add to Home screen**.

### iPhone (Safari)

1. Open the game URL in Safari.
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch **Pralay** from your home screen — it runs fullscreen like a native app.

### Desktop (Chrome / Edge)

Use the install icon in the address bar, or **Install Pralay** from the in-game banner.

After the first visit, the service worker caches game files so you can play without internet.

### GitHub Pages

The deploy workflow already publishes to the `gh-pages` branch on every push to `main`. You still need to **turn Pages on** in the repo:

1. Open **https://github.com/srijayant/pralay/settings/pages**
2. Under **Build and deployment → Source**, choose **Deploy from a branch**
3. Set **Branch** to `gh-pages`, folder **/ (root)**, then **Save**
4. Wait 1–2 minutes, then open: **https://srijayant.github.io/pralay/**

#### Still seeing 404?

**Private repository:** GitHub Pages on a private repo is not publicly reachable on the free plan. Either:

- **Make the repo public** (Settings → General → Change repository visibility), then wait for Pages to update, **or**
- **Use Netlify** (drag the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop)) for a free public URL without changing repo visibility

**Wrong URL:** Use the trailing slash — `https://srijayant.github.io/pralay/` (not `/pralay` without the slash).

## Gameplay

- **Choose a region** — Ganga Basin, Deccan Plateau, Western Ghats, Thar Corridor, Himalayan Refuge, or Coastal Shores
- **Manage five vital resources** — Jal (water), Anna (food), Shraddha (faith), Yantra (technology), Sangha (unity)
- **Navigate events** — Late monsoons, refugee waves, tiger corridors, Diwali in the dark, and more
- **Build** — Monsoon cisterns, terraced fields, memory shrines, salvage workshops
- **Explore** — Expand territory across a stylized map of fractured Bharat
- **Diplomacy** — Negotiate with factions: Sangam Council, Vardhaki Engineers, Akhand Dharmic League, Vanara Tribes, Mirage Caravans
- **Multiple endings** — Federation, technocracy, spiritual renewal, agrarian rebirth, survival, or collapse

## World Lore

The **Great Sundering (2044)** ended the old union through climate collapse and water wars. Mumbai, Chennai, and Kolkata drowned. The Thar expanded. Monsoons broke. What remains are bastions — fortified towns and confederacies fighting to reclaim meaning from the wasteland.

You are a **Samskarak** (rebuilder). Twenty monsoon cycles to shape what comes next.

## Tech

Vanilla HTML, CSS, and ES modules. PWA with service worker for offline play. No build step required.

To regenerate app icons:

```bash
python3 scripts/generate-icons.py
```
