/** PUBG-style HUD: minimap, compass, status bars, feed */

const MAP_SCALE = 1.8;
const MAP_SIZE = 130;
const WORLD_BOUNDS = 55;

let stamina = 100;
let health = 100;

export function initHud() {
  drawMinimap(0, 0, 0);
  updateCompass(0);
  updateBars();
}

export function updateHud(playerX, playerZ, yaw, running, moving) {
  if (running && moving) {
    stamina = Math.max(0, stamina - 0.35);
  } else {
    stamina = Math.min(100, stamina + 0.2);
  }
  updateCompass(yaw);
  drawMinimap(playerX, playerZ, yaw);
  updateBars();
  document.getElementById('hud-coords').textContent =
    `${Math.round(playerX)}, ${Math.round(playerZ)}`;
}

function updateCompass(yaw) {
  const needle = document.getElementById('compass-needle');
  if (!needle) return;
  const deg = ((-yaw * 180) / Math.PI + 360) % 360;
  needle.style.transform = `rotate(${deg}deg)`;

  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  const label = document.getElementById('compass-label');
  if (label) label.textContent = dirs[idx];
}

function updateBars() {
  const hp = document.getElementById('bar-health');
  const st = document.getElementById('bar-stamina');
  if (hp) hp.style.width = `${health}%`;
  if (st) st.style.width = `${stamina}%`;
}

function drawMinimap(px, pz, yaw) {
  const canvas = document.getElementById('minimap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = 'rgba(12, 14, 10, 0.92)';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  // Sea (north/west area)
  ctx.fillStyle = 'rgba(30, 80, 110, 0.7)';
  ctx.fillRect(0, 0, w, h * 0.35);

  // Marine Drive road
  ctx.fillStyle = 'rgba(55, 55, 60, 0.9)';
  ctx.fillRect(w * 0.38, 0, w * 0.24, h);

  // City blocks
  const blocks = [
    [0.65, 0.45, 0.2, 0.18, '#6a5040'],
    [0.7, 0.6, 0.15, 0.15, '#8a7060'],
    [0.15, 0.55, 0.22, 0.2, '#5a4035'],
    [0.1, 0.7, 0.18, 0.16, '#6a5040'],
    [0.5, 0.75, 0.12, 0.12, '#f4c430'],
  ];
  blocks.forEach(([bx, bz, bw, bh, col]) => {
    ctx.fillStyle = col;
    ctx.fillRect(bx * w, bz * h, bw * w, bh * h);
  });

  // POI markers
  const pois = [
    [10, -6, '#ff6b35'],
    [-6, -30, '#f4c430'],
    [20, 24, '#48dbfb'],
    [0, 24, '#e056fd'],
  ];
  pois.forEach(([x, z, col]) => {
    const mx = cx + x * MAP_SCALE;
    const my = cy + z * MAP_SCALE;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Player cone
  ctx.save();
  ctx.translate(cx + px * MAP_SCALE, cy + pz * MAP_SCALE);
  ctx.rotate(-yaw);
  ctx.fillStyle = '#f2c744';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(-4, 5);
  ctx.lineTo(4, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Border
  ctx.strokeStyle = 'rgba(242, 199, 68, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

export function addFeedMessage(text) {
  const feed = document.getElementById('hud-feed');
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'feed-item';
  item.textContent = text;
  feed.prepend(item);
  while (feed.children.length > 4) feed.lastChild.remove();
  setTimeout(() => item.classList.add('fade'), 3500);
  setTimeout(() => item.remove(), 4500);
}

export function showInteractPrompt(show, text = '') {
  const el = document.getElementById('hud-prompt');
  if (!el) return;
  el.classList.toggle('hidden', !show);
  if (show) document.getElementById('prompt-text').textContent = text;
}
