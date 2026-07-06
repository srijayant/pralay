import * as THREE from 'three';
import { INTERACTABLES } from './data/interactions.js';

const BLOCK = 24;
const STREET = 8;

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.waterMeshes = [];
  }

  build() {
    this._sky();
    this._ground();
    this._cityGrid();
    this._landmarks();
    this._props();
    this._interactables();
    this._particles();
  }

  _sky() {
    const geo = new THREE.SphereGeometry(280, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top: { value: new THREE.Color(0x2d1b69) },
        horizon: { value: new THREE.Color(0xff6b35) },
        bottom: { value: new THREE.Color(0xf4a261) },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 horizon;
        uniform vec3 bottom;
        varying vec3 vPos;
        void main() {
          float h = normalize(vPos).y * 0.5 + 0.5;
          vec3 col = h > 0.5 ? mix(horizon, top, (h - 0.5) * 2.0) : mix(bottom, horizon, h * 2.0);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(geo, mat));
  }

  _ground() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 30),
      new THREE.MeshStandardMaterial({ color: 0x1a4a5c, roughness: 0.2, metalness: 0.4, transparent: true, opacity: 0.85 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(-8, 0.05, -28);
    this.scene.add(water);
    this.waterMeshes.push(water);
  }

  _cityGrid() {
    const palette = [0xc9a87c, 0x8b7355, 0xd4a574, 0xa08060, 0x6b5b4f, 0xe8b86d, 0x9c7cb0];

    for (let gx = -3; gx <= 3; gx++) {
      for (let gz = -3; gz <= 3; gz++) {
        if (gx === 0 || gz === 0) continue;
        const seed = Math.abs(gx * 17 + gz * 31);
        const h = 4 + (seed % 18);
        const w = BLOCK - 1;
        const d = BLOCK - 1;
        const color = palette[seed % palette.length];
        const bx = gx * (BLOCK + STREET) + (gx > 0 ? STREET / 2 : -STREET / 2);
        const bz = gz * (BLOCK + STREET) + (gz > 0 ? STREET / 2 : -STREET / 2);

        if (seed % 7 === 0) {
          this._ruinedBuilding(bx, bz, w, h, d);
        } else {
          this._building(bx, bz, w, h, d, color, seed);
        }
      }
    }

    for (let i = -4; i <= 4; i++) {
      this._streetStrip(i * (BLOCK + STREET), 0, 6, 300, true);
      this._streetStrip(0, i * (BLOCK + STREET), 300, 6, false);
    }
  }

  _streetStrip(x, z, w, d, alongX) {
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.85 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.02, z);
    road.receiveShadow = true;
    this.scene.add(road);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4c430 });
    const count = alongX ? Math.floor(d / 8) : Math.floor(w / 8);
    for (let i = 0; i < count; i++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(alongX ? 0.15 : 2, alongX ? 2 : 0.15), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(
        alongX ? x : x - w / 2 + i * 8,
        0.03,
        alongX ? z - d / 2 + i * 8 : z
      );
      this.scene.add(line);
    }
  }

  _building(x, z, w, h, d, color, seed) {
    const group = new THREE.Group();
    group.position.set(x, h / 2, z);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.75 })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const winMat = new THREE.MeshStandardMaterial({
      color: seed % 3 === 0 ? 0xffeaa7 : 0x1a2530,
      emissive: seed % 3 === 0 ? 0xf39c12 : 0x000000,
      emissiveIntensity: seed % 3 === 0 ? 0.6 : 0,
    });

    const rows = Math.floor(h / 2.5);
    const cols = Math.floor(w / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c + seed) % 3 === 0) continue;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), winMat);
        win.position.set(-w / 2 + 1.2 + c * 2, -h / 2 + 2 + r * 2.5, d / 2 + 0.01);
        group.add(win);
      }
    }

    if (seed % 5 === 0) {
      const sign = this._neonSign(seed % 2 === 0 ? 'चाय' : 'BAZAAR', seed % 2 === 0 ? 0xff6b6b : 0x48dbfb);
      sign.position.set(0, h / 2 + 0.5, d / 2 + 0.3);
      group.add(sign);
    }

    this.scene.add(group);
    this.colliders.push({ x, z, hw: w / 2 + 0.5, hd: d / 2 + 0.5 });
  }

  _ruinedBuilding(x, z, w, h, d) {
    const rubbleH = h * 0.4;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, rubbleH, d),
      new THREE.MeshStandardMaterial({ color: 0x4a4035, roughness: 0.95 })
    );
    body.position.set(x, rubbleH / 2, z);
    body.castShadow = true;
    this.scene.add(body);

    for (let i = 0; i < 5; i++) {
      const chunk = new THREE.Mesh(
        new THREE.BoxGeometry(1 + Math.random() * 2, 0.5 + Math.random(), 1 + Math.random() * 2),
        new THREE.MeshStandardMaterial({ color: 0x5a5045 })
      );
      chunk.position.set(x + (Math.random() - 0.5) * w, 0.3, z + (Math.random() - 0.5) * d);
      chunk.rotation.y = Math.random() * Math.PI;
      this.scene.add(chunk);
    }
    this.colliders.push({ x, z, hw: w / 2 + 1, hd: d / 2 + 1 });
  }

  _neonSign(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.font = 'bold 36px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 44);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      emissive: color,
      emissiveIntensity: 1.2,
      transparent: true,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75), mat);
  }

  _landmarks() {
  const arch = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.35, 8, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.6 })
    );
    arch.position.set(0, 3, 22);
    arch.rotation.x = Math.PI / 2;
    this.scene.add(arch);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.5 })
    );
    dome.position.set(0, 0.1, 22);
    this.scene.add(dome);
  }

  _props() {
    this._tree(15, -12);
    this._tree(-20, 8);
    this._tree(25, 18);
    this._tree(-10, -25);
    this._rickshawProp(22, 6);
    this._barricade(-5, 0);
    this._barricade(5, 0);
  }

  _tree(x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a3728 })
    );
    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;
    this.scene.add(trunk);

    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x2d5a27 })
    );
    foliage.position.set(x, 4, z);
    foliage.castShadow = true;
    this.scene.add(foliage);
    this.colliders.push({ x, z, hw: 1.5, hd: 1.5 });
  }

  _rickshawProp(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0.5, z);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
    );
    g.add(body);
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xf1c40f })
    );
    hood.position.y = 0.55;
    g.add(hood);
    this.scene.add(g);
  }

  _barricade(x, z) {
    for (let i = 0; i < 3; i++) {
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x6b5b4f })
      );
      bag.position.set(x + i * 1.3 - 1.3, 0.3, z);
      this.scene.add(bag);
    }
  }

  _interactables() {
    for (const data of INTERACTABLES) {
      const group = new THREE.Group();
      group.position.set(data.position[0], data.position[1], data.position[2]);
      group.userData.interactable = data;

      if (data.type === 'npc') {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 1.4, 8),
          new THREE.MeshStandardMaterial({ color: data.color })
        );
        body.position.y = 0.9;
        group.add(body);
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xd4a574 })
        );
        head.position.y = 1.85;
        group.add(head);
      } else if (data.type === 'vehicle') {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 1, 2.5),
          new THREE.MeshStandardMaterial({ color: data.color })
        );
        body.position.y = 0.5;
        group.add(body);
        const hood = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.08, 2.4),
          new THREE.MeshStandardMaterial({ color: 0xf1c40f })
        );
        hood.position.y = 1.05;
        group.add(hood);
      } else {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 2, 1.2),
          new THREE.MeshStandardMaterial({ color: data.color, emissive: data.color, emissiveIntensity: 0.15 })
        );
        pillar.position.y = 1;
        group.add(pillar);
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshBasicMaterial({ color: data.color })
        );
        glow.position.y = 2.3;
        group.add(glow);
      }

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1, 24),
        new THREE.MeshBasicMaterial({ color: 0xf4c430, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      ring.visible = false;
      ring.name = 'highlight';
      group.add(ring);

      this.scene.add(group);
      this.interactables.push(group);
    }
  }

  _particles() {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 20 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd89b, size: 0.15, transparent: true, opacity: 0.4 }));
    this.scene.add(dust);
    this.dust = dust;
  }

  update(dt) {
    if (this.dust) this.dust.rotation.y += dt * 0.02;
    for (const w of this.waterMeshes) {
      w.position.y = 0.05 + Math.sin(Date.now() * 0.001) * 0.03;
    }
  }

  checkCollision(x, z, radius = 0.4) {
    for (const c of this.colliders) {
      if (Math.abs(x - c.x) < c.hw + radius && Math.abs(z - c.z) < c.hd + radius) return true;
    }
    return false;
  }
}
