import { REGIONS, BUILDINGS } from './data/regions.js';
import { FACTIONS } from './data/factions.js';
import { EVENTS, EXPLORE_OUTCOMES, LORE_TEXT } from './data/events.js';

const STAT_KEYS = ['water', 'food', 'faith', 'tech', 'unity'];
const STAT_LABELS = {
  water: 'Jal — Water',
  food: 'Anna — Food',
  faith: 'Shraddha — Faith',
  tech: 'Yantra — Technology',
  unity: 'Sangha — Unity',
};
const STAT_ICONS = {
  water: '💧',
  food: '🌾',
  faith: '🪔',
  tech: '⚙️',
  unity: '🤝',
};

const MAX_TURNS = 20;
const COLLAPSE_THRESHOLD = 15;

const state = {
  region: null,
  bastionName: '',
  turn: 1,
  stats: {},
  territories: [],
  factions: {},
  buildings: [],
  chronicle: [],
  gameOver: false,
  ending: null,
};

function initStats(region) {
  const base = { water: 50, food: 50, faith: 50, tech: 50, unity: 50 };
  if (region?.bonuses) {
    for (const [k, v] of Object.entries(region.bonuses)) base[k] = Math.min(100, base[k] + v);
  }
  if (region?.penalties) {
    for (const [k, v] of Object.entries(region.penalties)) base[k] = Math.max(0, base[k] + v);
  }
  return base;
}

function clampStat(val) {
  return Math.max(0, Math.min(100, val));
}

function applyEffects(effects) {
  for (const [key, delta] of Object.entries(effects)) {
    if (STAT_KEYS.includes(key)) {
      state.stats[key] = clampStat(state.stats[key] + delta);
    }
  }
}

function modifyFaction(factionId, delta) {
  if (state.factions[factionId] !== undefined) {
    state.factions[factionId] = clampStat(state.factions[factionId] + delta);
  }
}

function addChronicle(text) {
  state.chronicle.unshift({ turn: state.turn, text });
  if (state.chronicle.length > 30) state.chronicle.pop();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function getEra() {
  const avg = STAT_KEYS.reduce((s, k) => s + state.stats[k], 0) / STAT_KEYS.length;
  if (avg >= 75) return 'Age of Renewal';
  if (avg >= 55) return 'Age of Consolidation';
  if (avg >= 35) return 'Age of Scarcity';
  return 'Age of Desperation';
}

function checkCollapse() {
  const failed = STAT_KEYS.filter((k) => state.stats[k] < COLLAPSE_THRESHOLD);
  if (failed.length >= 2) {
    endGame('collapse', `Your bastion could not sustain itself. ${failed.map((k) => STAT_LABELS[k]).join(' and ')} fell below survival levels. The people scatter into the wasteland.`);
    return true;
  }
  return false;
}

function checkVictory() {
  if (state.turn > MAX_TURNS) {
    const s = state.stats;
    if (s.unity >= 80 && s.faith >= 60 && state.territories.length >= 3) {
      endGame('federation', 'The bastions unite under a new confederation. Rivers are shared, shrines restored, and a parliament of villages rises from the dust. Bharat is reborn — not as it was, but as it chose to become.');
    } else if (s.tech >= 85 && state.buildings.length >= 4) {
      endGame('technocracy', 'Salvaged grids hum again. The Vardhaki dream takes shape: a Bharat powered by sun and monsoon, mapped by satellites rebuilt from scrap. Progress, hard-won, lights the subcontinent.');
    } else if (s.faith >= 85 && s.unity >= 70) {
      endGame('spiritual', 'The Akhand vision prevails. Across the fractured land, bells and calls to prayer mark a moral renewal. Faith does not erase science — it gives it meaning.');
    } else if (state.territories.length >= 4 && s.food >= 70) {
      endGame('agrarian', 'Terraced fields stripe the hills. Seed vaults open. The Vanara way spreads — a Bharat rooted in soil, forest, and the patience of growers.');
    } else {
      endGame('survival', 'Twenty monsoon cycles pass. Your bastion endures — neither glorious nor fallen. In the post-Sundering world, survival itself is a kind of victory.');
    }
    return true;
  }
  return false;
}

function endGame(type, text) {
  state.gameOver = true;
  state.ending = type;
  const titles = {
    collapse: 'The Bastion Falls',
    federation: 'A New Confederation',
    technocracy: 'The Restored Grid',
    spiritual: 'The Moral Renewal',
    agrarian: 'The Green Bharat',
    survival: 'Endurance',
  };
  document.getElementById('end-title').textContent = titles[type] || 'The Cycle Ends';
  document.getElementById('end-text').textContent = text;
  document.getElementById('end-stats').innerHTML = STAT_KEYS.map((k) =>
    `<div class="end-stat"><span>${STAT_LABELS[k]}</span><span>${Math.round(state.stats[k])}</span></div>`
  ).join('');
  showScreen('screen-end');
}

function renderRegions() {
  const grid = document.getElementById('region-grid');
  grid.innerHTML = REGIONS.map((r) => `
    <button class="region-card" data-region="${r.id}">
      <span class="region-hindi">${r.hindi}</span>
      <span class="region-name">${r.name}</span>
      <span class="region-desc">${r.description}</span>
      <span class="region-bonus">${formatBonuses(r)}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.region-card').forEach((card) => {
    card.addEventListener('click', () => {
      grid.querySelectorAll('.region-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      state.region = REGIONS.find((r) => r.id === card.dataset.region);
      document.getElementById('btn-region-confirm').disabled = false;
    });
  });
}

function formatBonuses(region) {
  const parts = [];
  for (const [k, v] of Object.entries(region.bonuses || {})) parts.push(`+${v} ${k}`);
  for (const [k, v] of Object.entries(region.penalties || {})) parts.push(`${v} ${k}`);
  return parts.join(' · ');
}

function renderStats() {
  const container = document.getElementById('stats-container');
  container.innerHTML = STAT_KEYS.map((k) => {
    const val = Math.round(state.stats[k]);
    const low = val < COLLAPSE_THRESHOLD ? ' stat-low' : '';
    return `
      <div class="stat-row${low}">
        <span class="stat-label">${STAT_ICONS[k]} ${STAT_LABELS[k]}</span>
        <div class="stat-bar"><div class="stat-fill" style="width:${val}%"></div></div>
        <span class="stat-value">${val}</span>
      </div>
    `;
  }).join('');
}

function renderTerritories() {
  const list = document.getElementById('territories-list');
  const owned = [state.region, ...state.territories.filter((t) => t.id !== state.region.id)];
  list.innerHTML = owned.map((r) =>
    `<div class="territory-item" style="border-left-color:${r.color}">${r.name}</div>`
  ).join('') || '<p class="muted">Only your bastion — explore to expand.</p>';
}

function renderFactions() {
  const list = document.getElementById('factions-list');
  list.innerHTML = FACTIONS.map((f) => {
    const val = Math.round(state.factions[f.id] ?? 50);
    return `
      <div class="faction-row">
        <span class="faction-name">${f.name}</span>
        <div class="faction-bar"><div class="faction-fill" style="width:${val}%"></div></div>
        <span class="faction-val">${val}</span>
      </div>
    `;
  }).join('');
}

function renderMap() {
  const svg = document.getElementById('india-map');
  const ownedIds = new Set([state.region.id, ...state.territories.map((t) => t.id)]);

  svg.innerHTML = REGIONS.map((r) => {
    const owned = ownedIds.has(r.id);
    const isHome = r.id === state.region.id;
    return `
      <path
        d="${r.mapPath}"
        fill="${r.color}"
        opacity="${owned ? (isHome ? 1 : 0.85) : 0.25}"
        stroke="${isHome ? '#f4c430' : '#1a1a1a'}"
        stroke-width="${isHome ? 3 : 1}"
        class="map-region"
        data-region="${r.id}"
      />
    `;
  }).join('') + REGIONS.map((r) => `
    <text x="${getRegionCenter(r).x}" y="${getRegionCenter(r).y}" class="map-label" text-anchor="middle">${r.hindi}</text>
  `).join('');
}

function getRegionCenter(region) {
  const centers = {
    ganga: { x: 200, y: 140 },
    deccan: { x: 195, y: 255 },
    ghats: { x: 125, y: 280 },
    thar: { x: 115, y: 155 },
    himalaya: { x: 160, y: 55 },
    coastal: { x: 175, y: 345 },
  };
  return centers[region.id] || { x: 200, y: 240 };
}

function renderChronicle() {
  const log = document.getElementById('chronicle-log');
  log.innerHTML = state.chronicle.map((e) =>
    `<div class="log-entry"><span class="log-turn">Cycle ${e.turn}</span> ${e.text}</div>`
  ).join('') || '<p class="muted">Your story begins...</p>';
}

function renderUI() {
  document.getElementById('bastion-name').textContent = state.bastionName;
  document.getElementById('turn-display').textContent = `Monsoon Cycle ${state.turn} / ${MAX_TURNS}`;
  document.getElementById('era-label').textContent = getEra();
  renderStats();
  renderTerritories();
  renderFactions();
  renderMap();
  renderChronicle();
}

function getAvailableEvents() {
  return EVENTS.filter((ev) => {
    if (ev.requiresBuilding && !state.buildings.includes(ev.requiresBuilding)) return false;
    if (ev.requiresFactions) {
      return ev.requiresFactions.every((fid) => (state.factions[fid] ?? 0) > 30);
    }
    return true;
  });
}

function pickEvent() {
  const pool = getAvailableEvents();
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const ev of pool) {
    roll -= ev.weight;
    if (roll <= 0) return ev;
  }
  return pool[0];
}

function showEvent(event) {
  document.getElementById('event-title').textContent = event.title;
  document.getElementById('event-text').textContent = event.text;
  const container = document.getElementById('choices-container');
  container.innerHTML = event.choices.map((c, i) => `
    <button class="choice-btn" data-choice="${i}">${c.text}</button>
  `).join('');

  container.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = event.choices[Number(btn.dataset.choice)];
      applyEffects(choice.effects);
      addChronicle(choice.log);
      advanceTurn();
    });
  });
}

function advanceTurn() {
  consumeUpkeep();
  state.turn += 1;

  if (checkCollapse() || checkVictory()) return;

  renderUI();
  const event = pickEvent();
  showEvent(event);
}

function consumeUpkeep() {
  const pop = 1 + state.territories.length * 0.3 + state.buildings.length * 0.1;
  state.stats.food = clampStat(state.stats.food - 2 * pop);
  state.stats.water = clampStat(state.stats.water - 1.5 * pop);
}

function startGame() {
  state.stats = initStats(state.region);
  state.bastionName = `${state.region.name} Bastion`;
  state.turn = 1;
  state.territories = [];
  state.buildings = [];
  state.chronicle = [];
  state.gameOver = false;
  state.ending = null;
  state.factions = Object.fromEntries(FACTIONS.map((f) => [f.id, 50]));

  addChronicle(`The Samskarak established ${state.bastionName} at the edge of the ${state.region.name}.`);
  showScreen('screen-game');
  renderUI();
  showEvent(pickEvent());
}

function openBuildModal() {
  const container = document.getElementById('build-options');
  container.innerHTML = BUILDINGS.map((b) => {
    const canAfford = Object.entries(b.cost).every(([k, v]) => state.stats[k] >= v);
    const built = state.buildings.includes(b.id);
    return `
      <div class="build-card ${canAfford && !built ? '' : 'disabled'}">
        <h4>${b.name}</h4>
        <p>${b.desc}</p>
        <p class="build-cost">Cost: ${Object.entries(b.cost).map(([k, v]) => `${v} ${k}`).join(', ')}</p>
        <p class="build-effect">+${Object.entries(b.effect).map(([k, v]) => `${v} ${k}`).join(', ')}</p>
        ${built ? '<span class="built-tag">Built</span>' : `<button class="btn-primary btn-build" data-build="${b.id}" ${canAfford ? '' : 'disabled'}>Construct</button>`}
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-build').forEach((btn) => {
    btn.addEventListener('click', () => {
      const building = BUILDINGS.find((b) => b.id === btn.dataset.build);
      if (!building || state.buildings.includes(building.id)) return;
      for (const [k, v] of Object.entries(building.cost)) {
        state.stats[k] = clampStat(state.stats[k] - v);
      }
      applyEffects(building.effect);
      state.buildings.push(building.id);
      addChronicle(`Constructed ${building.name}.`);
      closeModal('modal-build');
      renderUI();
    });
  });

  document.getElementById('modal-build').classList.remove('hidden');
}

function openDiplomacyModal() {
  const container = document.getElementById('diplomacy-options');
  container.innerHTML = FACTIONS.map((f) => {
    const standing = Math.round(state.factions[f.id]);
    return `
      <div class="diplomacy-card">
        <h4>${f.name}</h4>
        <p>${f.desc}</p>
        <p>Standing: ${standing}</p>
        <div class="diplo-actions">
          <button class="btn-small" data-faction="${f.id}" data-action="gift">Send Gift (-5 food)</button>
          <button class="btn-small" data-faction="${f.id}" data-action="envoy">Send Envoy (-3 unity)</button>
          <button class="btn-small" data-faction="${f.id}" data-action="trade">Trade Pact (-3 tech, +standing)</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-small').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { faction, action } = btn.dataset;
      if (action === 'gift' && state.stats.food >= 5) {
        state.stats.food -= 5;
        modifyFaction(faction, 12);
        addChronicle(`Sent gifts to the ${FACTIONS.find((f) => f.id === faction).name}.`);
      } else if (action === 'envoy' && state.stats.unity >= 3) {
        state.stats.unity -= 3;
        modifyFaction(faction, 8);
        addChronicle(`An envoy returned with warmer relations.`);
      } else if (action === 'trade' && state.stats.tech >= 3) {
        state.stats.tech -= 3;
        modifyFaction(faction, 15);
        state.stats.food = clampStat(state.stats.food + 5);
        addChronicle(`Trade pact signed with ${FACTIONS.find((f) => f.id === faction).name}.`);
      }
      renderUI();
      openDiplomacyModal();
    });
  });

  document.getElementById('modal-diplomacy').classList.remove('hidden');
}

function doExplore() {
  if (state.stats.food < 5 || state.stats.water < 3) {
    addChronicle('Exploration postponed — not enough supplies.');
    renderChronicle();
    return;
  }
  state.stats.food = clampStat(state.stats.food - 5);
  state.stats.water = clampStat(state.stats.water - 3);

  const outcome = EXPLORE_OUTCOMES[Math.floor(Math.random() * EXPLORE_OUTCOMES.length)];
  applyEffects(outcome.effects);
  addChronicle(outcome.text);

  const unclaimed = REGIONS.filter(
    (r) => r.id !== state.region.id && !state.territories.some((t) => t.id === r.id)
  );
  const adjacent = unclaimed.filter((r) =>
    state.region.neighbors.includes(r.id) ||
    state.territories.some((t) => t.neighbors.includes(r.id))
  );

  if (adjacent.length > 0 && Math.random() < 0.35) {
    const gained = adjacent[Math.floor(Math.random() * adjacent.length)];
    state.territories.push(gained);
    addChronicle(`Claimed territory: ${gained.name}!`);
    state.stats.unity = clampStat(state.stats.unity + 5);
  }

  advanceTurn();
}

function doRest() {
  state.stats.water = clampStat(state.stats.water + 5);
  state.stats.food = clampStat(state.stats.food + 5);
  state.stats.unity = clampStat(state.stats.unity + 3);
  addChronicle('The bastion rested. Stores recovered slightly.');
  advanceTurn();
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function bindUI() {
  document.getElementById('btn-start').addEventListener('click', () => {
    renderRegions();
    showScreen('screen-region');
  });

  document.getElementById('btn-lore').addEventListener('click', () => {
    document.getElementById('lore-content').innerHTML = LORE_TEXT;
    showScreen('screen-lore');
  });

  document.getElementById('btn-lore-back').addEventListener('click', () => showScreen('screen-title'));

  document.getElementById('btn-region-confirm').addEventListener('click', startGame);

  document.getElementById('btn-build').addEventListener('click', openBuildModal);
  document.getElementById('btn-explore').addEventListener('click', doExplore);
  document.getElementById('btn-diplomacy').addEventListener('click', openDiplomacyModal);
  document.getElementById('btn-rest').addEventListener('click', doRest);

  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    state.region = null;
    showScreen('screen-title');
  });
}

bindUI();
