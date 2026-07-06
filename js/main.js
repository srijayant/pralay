import * as THREE from 'three';
import { createCharacter, updateCharacterAnim, readAvatarForm } from './character.js';
import { World } from './world.js';
import { getZoneAt } from './data/interactions.js';

const SCREENS = ['screen-title', 'screen-avatar', 'screen-game', 'screen-pause'];

let game = null;
let previewScene = null;

function showScreen(id) {
  SCREENS.forEach((s) => document.getElementById(s)?.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function addLog(text) {
  const log = document.getElementById('hud-log');
  if (!log) return;
  const entry = document.createElement('div');
  entry.className = 'log-line';
  entry.textContent = text;
  log.prepend(entry);
  if (log.children.length > 5) log.lastChild.remove();
}

class Game3D {
  constructor(canvas, avatarConfig, player) {
    this.config = avatarConfig;
    this.paused = false;
    this.keys = {};
    this.mobileInput = { x: 0, y: 0, run: false };
    this.yaw = Math.PI;
    this.nearby = null;
    this.dialogueQueue = [];
    this.dialogueIndex = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x8a7a6a, 0.0045);

    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
    this.world = new World(this.scene);

    this.player = player;
    this.player.position.set(-2, 0, -14);
    this.scene.add(this.player);

    this._lights();
    this._bindInput();
    this._resize();
    window.addEventListener('resize', () => this._resize());

    document.getElementById('hud-name').textContent = avatarConfig.name;
    addLog(`${avatarConfig.name} walks onto Marine Drive.`);
  }

  static async create(canvas, avatarConfig) {
    const instance = new Game3D(canvas, avatarConfig, await createCharacter(avatarConfig));
    await instance.world.build();
    return instance;
  }

  _lights() {
    this.scene.add(new THREE.HemisphereLight(0xc9b8a8, 0x3a4a5a, 0.65));
    const sun = new THREE.DirectionalLight(0xffa85a, 0.95);
    sun.position.set(-50, 45, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 180;
    const s = 70;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    this.scene.add(sun);

    [[12, 6, -8, 0xff6b6b], [-18, 5, 14, 0x48dbfb], [0, 4, -28, 0xf4c430]].forEach(([x, y, z, c]) => {
      const pl = new THREE.PointLight(c, 0.7, 45);
      pl.position.set(x, y, z);
      this.scene.add(pl);
    });
  }

  _bindInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE') this.interact();
      if (e.code === 'Escape') this.togglePause();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    let dragging = false;
    let lastX = 0;
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) { dragging = true; lastX = e.clientX; }
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!dragging || this.paused) return;
      this.yaw -= (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    });

    this._setupJoystick();
    document.getElementById('btn-interact')?.addEventListener('click', () => this.interact());
    document.getElementById('btn-run')?.addEventListener('touchstart', (e) => { e.preventDefault(); this.mobileInput.run = true; });
    document.getElementById('btn-run')?.addEventListener('touchend', () => { this.mobileInput.run = false; });
    document.getElementById('dialogue-next')?.addEventListener('click', () => this._advanceDialogue());
  }

  _setupJoystick() {
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !knob) return;

    let active = false;
    let startX = 0;
    let startY = 0;
    const maxDist = 40;

    const move = (cx, cy) => {
      let dx = cx - startX;
      let dy = cy - startY;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.mobileInput.x = dx / maxDist;
      this.mobileInput.y = dy / maxDist;
    };

    const end = () => {
      active = false;
      knob.style.transform = '';
      this.mobileInput.x = 0;
      this.mobileInput.y = 0;
    };

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      active = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      if (!active) return;
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    zone.addEventListener('touchend', end);
  }

  _resize() {
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  _getMoveInput() {
    let mx = 0;
    let mz = 0;
    if (this.keys.KeyW || this.keys.ArrowUp) mz -= 1;
    if (this.keys.KeyS || this.keys.ArrowDown) mz += 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) mx -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) mx += 1;
    if (Math.abs(this.mobileInput.x) > 0.1 || Math.abs(this.mobileInput.y) > 0.1) {
      mx = this.mobileInput.x;
      mz = this.mobileInput.y;
    }
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    return { mx, mz, running: this.keys.ShiftLeft || this.keys.ShiftRight || this.mobileInput.run };
  }

  update(dt) {
    if (this.paused) return;

    const { mx, mz, running } = this._getMoveInput();
    const speed = running ? 8 : 4.5;
    const moving = Math.hypot(mx, mz) > 0.05;

    if (moving) {
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const dir = new THREE.Vector3()
        .addScaledVector(forward, -mz)
        .addScaledVector(right, mx)
        .normalize();

      const nx = this.player.position.x + dir.x * speed * dt;
      const nz = this.player.position.z + dir.z * speed * dt;
      if (!this.world.checkCollision(nx, this.player.position.z)) this.player.position.x = nx;
      if (!this.world.checkCollision(this.player.position.x, nz)) this.player.position.z = nz;

      const targetRot = Math.atan2(dir.x, dir.z);
      this.player.rotation.y = THREE.MathUtils.lerp(this.player.rotation.y, targetRot, 0.18);
    }

    updateCharacterAnim(this.player, dt, moving ? speed : 0);

    const camDist = 6.5;
    const camH = 2.8;
    const cx = this.player.position.x + Math.sin(this.yaw) * camDist;
    const cz = this.player.position.z + Math.cos(this.yaw) * camDist;
    this.camera.position.lerp(new THREE.Vector3(cx, this.player.position.y + camH, cz), 0.1);
    this.camera.lookAt(this.player.position.x, this.player.position.y + 1.35, this.player.position.z);

    this.world.update(dt);
    this._updateInteractables();
    document.getElementById('hud-zone').textContent = getZoneAt(this.player.position.x, this.player.position.z);
  }

  _updateInteractables() {
    let closest = null;
    let closestDist = Infinity;
    for (const obj of this.world.interactables) {
      const dist = this.player.position.distanceTo(obj.position);
      const ring = obj.getObjectByName('highlight');
      if (ring) ring.visible = false;
      if (dist < 3.5 && dist < closestDist) {
        closest = obj;
        closestDist = dist;
      }
    }
    this.nearby = closest;
    const prompt = document.getElementById('hud-prompt');
    if (closest) {
      closest.getObjectByName('highlight').visible = true;
      prompt?.classList.remove('hidden');
      document.getElementById('prompt-text').textContent = closest.userData.interactable.name;
    } else {
      prompt?.classList.add('hidden');
    }
  }

  interact() {
    if (this.paused || !this.nearby) return;
    const data = this.nearby.userData.interactable;
    this.dialogueQueue = [...data.dialogue];
    this.dialogueIndex = 0;
    if (data.action) addLog(data.action.log);
    this._showDialogue(data.name, this.dialogueQueue[0]);
  }

  _showDialogue(speaker, text) {
    document.getElementById('hud-dialogue')?.classList.remove('hidden');
    document.getElementById('dialogue-speaker').textContent = speaker;
    document.getElementById('dialogue-text').textContent = text;
    this.paused = true;
  }

  _advanceDialogue() {
    this.dialogueIndex += 1;
    if (this.dialogueIndex < this.dialogueQueue.length) {
      document.getElementById('dialogue-text').textContent = this.dialogueQueue[this.dialogueIndex];
      return;
    }
    document.getElementById('hud-dialogue')?.classList.add('hidden');
    this.paused = false;
  }

  togglePause() {
    this.paused = !this.paused;
    showScreen(this.paused ? 'screen-pause' : 'screen-game');
  }

  start() {
    const loop = (t) => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min((t - (this._lastT || t)) / 1000, 0.05);
      this._lastT = t;
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    loop(0);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this.renderer.dispose();
  }
}

export async function initAvatarPreview() {
  const container = document.getElementById('avatar-preview');
  if (!container) return;

  const w = container.clientWidth || 320;
  const h = container.clientHeight || 280;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a2038);
  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
  camera.position.set(0, 1.5, 3.8);
  camera.lookAt(0, 1.1, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const light = new THREE.DirectionalLight(0xffa85a, 1.1);
  light.position.set(2, 4, 3);
  scene.add(light);

  let avatar = await createCharacter(readAvatarForm());
  scene.add(avatar);

  const refresh = async () => {
    scene.remove(avatar);
    avatar = await createCharacter(readAvatarForm());
    scene.add(avatar);
    if (previewScene) previewScene.avatar = avatar;
  };

  ['avatar-skin', 'avatar-shirt', 'avatar-pants', 'avatar-style'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => refresh());
    document.getElementById(id)?.addEventListener('change', () => refresh());
  });

  previewScene = { renderer, scene, camera, avatar, t: 0 };
  const spin = (time) => {
    if (!previewScene) return;
    previewScene.avatar.rotation.y = time * 0.0008;
    updateCharacterAnim(previewScene.avatar, 0.016, 2);
    previewScene.renderer.render(previewScene.scene, previewScene.camera);
    previewScene.raf = requestAnimationFrame(spin);
  };
  spin(0);
}

export function stopPreview() {
  if (previewScene) {
    cancelAnimationFrame(previewScene.raf);
    previewScene.renderer.dispose();
    document.getElementById('avatar-preview')?.replaceChildren();
    previewScene = null;
  }
}

export async function startGame() {
  const config = readAvatarForm();
  showScreen('screen-game');
  const canvas = document.getElementById('game-canvas');
  game = await Game3D.create(canvas, config);
  game.start();
}

export function bindPauseUI() {
  document.getElementById('btn-resume')?.addEventListener('click', () => {
    if (game) { game.paused = false; showScreen('screen-game'); }
  });
  document.getElementById('btn-quit')?.addEventListener('click', () => {
    game?.dispose();
    game = null;
    showScreen('screen-title');
  });
}
