import * as THREE from 'three';
import { INTERACTABLES } from './data/interactions.js';
import { createCharacter } from './character.js';
import { IS_MOBILE, surf, emissiveSurf } from './materials.js';
import {
  asphaltTexture, wetAsphaltTexture, concreteTexture,
  artDecoFacadeTexture, brickChawlTexture, signageTexture, matFromTexture,
} from './textures.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.waterMeshes = [];
    this.npcs = [];
  }

  build() {
    this._baseGround();
    this._sky();
    this._arabianSea();
    this._marineDrive();
    this._cityDistricts();
    this._landmarks();
    this._streetNetwork();
    this._overheadDetails();
    this._interactables();
    this._atmosphere();
  }

  _baseGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      surf(0x4a4540)
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.scene.add(ground);
  }

  _sky() {
    if (IS_MOBILE) return;
    const geo = new THREE.SphereGeometry(320, 48, 24);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x5a6a7a) },
        midColor: { value: new THREE.Color(0xc97b5c) },
        lowColor: { value: new THREE.Color(0xe8a87c) },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 lowColor;
        varying vec3 vWorld;
        void main() {
          float h = normalize(vWorld).y * 0.5 + 0.5;
          vec3 col = h > 0.55 ? mix(midColor, topColor, (h - 0.55) * 2.2) : mix(lowColor, midColor, h * 1.8);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(geo, mat));
  }

  _arabianSea() {
    const sea = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 120, 32, 16),
      surf({
        color: 0x1a4a6a,
        roughness: 0.15,
        metalness: 0.55,
        transparent: true,
        opacity: 0.92,
      })
    );
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, -0.1, -75);
    sea.receiveShadow = true;
    this.scene.add(sea);
    this.waterMeshes.push(sea);

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(90, 1.2, 0.8),
      matFromTexture(concreteTexture('#c8b8a8'), { roughness: 0.9, repeat: [8, 1] })
    );
    wall.position.set(0, 0.6, -32);
    wall.receiveShadow = true;
    this.scene.add(wall);

    for (let i = 0; i < (IS_MOBILE ? 7 : 14); i++) {
      this._palmTree(-38 + i * 5.5, -28 + Math.sin(i * 0.4) * 2);
    }
  }

  _marineDrive() {
    const wet = matFromTexture(wetAsphaltTexture(), { roughness: 0.25, metalness: 0.35, repeat: [6, 20] });
    const curve = new THREE.Mesh(new THREE.PlaneGeometry(14, 110), wet);
    curve.rotation.x = -Math.PI / 2;
    curve.position.set(0, 0.03, -18);
    curve.receiveShadow = true;
    this.scene.add(curve);

    const promenade = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 110),
      matFromTexture(concreteTexture('#b0a090'), { repeat: [2, 20] })
    );
    promenade.rotation.x = -Math.PI / 2;
    promenade.position.set(-9.5, 0.04, -18);
    this.scene.add(promenade);

    const railMat = surf({ color: 0x888890, metalness: 0.7, roughness: 0.35 });
    for (let z = -60; z < 25; z += 4) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), railMat);
      post.position.set(-7.2, 0.55, z);
      this.scene.add(post);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 85), railMat);
    rail.position.set(-7.2, 0.95, -18);
    this.scene.add(rail);
  }

  _cityDistricts() {
    this._artDecoBlock(18, -12, 14, 22, 12, 0);
    this._artDecoBlock(28, -8, 12, 28, 11, 1);
    this._artDecoBlock(22, 4, 16, 18, 14, 2);
    this._artDecoBlock(32, 10, 11, 24, 10, 3);

    this._chawlBlock(-22, 8, 20, 8, 16);
    this._chawlBlock(-30, 16, 18, 7, 14);
    this._chawlBlock(-18, 22, 16, 6, 12);
    this._chawlBlock(-35, 4, 14, 9, 13);

    this._officeTower(8, 18, 10, 35);
    this._ruinedTower(-8, -8, 12, 20);

    this._marketStalls(10, -6);
    this._marketStalls(14, -10);
  }

  _artDecoBlock(x, z, w, h, d, seed) {
    const group = new THREE.Group();
    group.position.set(x, h / 2, z);

    const tex = artDecoFacadeTexture(seed);
    const mat = matFromTexture(tex, { repeat: [1, h / 8] });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const cornerR = 1.2;
    const corner = new THREE.Mesh(
      new THREE.CylinderGeometry(cornerR, cornerR, h, 8),
      matFromTexture(artDecoFacadeTexture(seed + 1), { repeat: [1, h / 8] })
    );
    corner.position.set(w / 2 - 0.3, 0, d / 2 - 0.3);
    group.add(corner);

    if (seed % 2 === 0) {
      const sign = this._signMesh('होटेल', 'ART DECO INN', 0xff4757);
      sign.position.set(0, h / 2 + 1.2, d / 2 + 0.2);
      group.add(sign);
    }

    this.scene.add(group);
    this.colliders.push({ x, z, hw: w / 2 + 0.8, hd: d / 2 + 0.8 });
  }

  _chawlBlock(x, z, w, floors, d) {
    const h = floors * 2.8;
    const group = new THREE.Group();
    group.position.set(x, h / 2, z);
    const mat = matFromTexture(brickChawlTexture(), { repeat: [w / 6, h / 6] });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    for (let f = 0; f < floors; f++) {
      const balcony = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.85, 0.12, 1.2),
        surf({ color: 0x6a5a4a })
      );
      balcony.position.set(0, -h / 2 + 2.2 + f * 2.8, d / 2 + 0.5);
      group.add(balcony);
    }

    this._clothesLine(x, z + d / 2 + 1, w * 0.7);
    this.scene.add(group);
    this.colliders.push({ x, z, hw: w / 2 + 0.5, hd: d / 2 + 1.5 });
  }

  _officeTower(x, z, w, h) {
    const group = new THREE.Group();
    group.position.set(x, h / 2, z);
    const mat = matFromTexture(concreteTexture('#9aa8b8'), { repeat: [2, h / 10], metalness: 0.15 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
    body.castShadow = true;
    group.add(body);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.35, w * 0.5, 3, 6),
      surf({ color: 0x708090, metalness: 0.4, roughness: 0.4 })
    );
    crown.position.y = h / 2 + 1.5;
    group.add(crown);
    this.scene.add(group);
    this.colliders.push({ x, z, hw: w / 2 + 1, hd: w / 2 + 1 });
  }

  _ruinedTower(x, z, w, h) {
    const rubbleH = h * 0.45;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, rubbleH, w),
      matFromTexture(concreteTexture('#6a5a50'), { repeat: [2, 2] })
    );
    body.position.set(x, rubbleH / 2, z);
    body.castShadow = true;
    this.scene.add(body);
    for (let i = 0; i < 8; i++) {
      const chunk = new THREE.Mesh(
        new THREE.BoxGeometry(1 + Math.random() * 2.5, 0.4 + Math.random() * 1.2, 1 + Math.random() * 2),
        surf({ color: 0x5a5048 })
      );
      chunk.position.set(x + (Math.random() - 0.5) * w * 1.2, 0.25, z + (Math.random() - 0.5) * w);
      chunk.rotation.y = Math.random() * Math.PI;
      this.scene.add(chunk);
    }
    this.colliders.push({ x, z, hw: w / 2 + 2, hd: w / 2 + 2 });
  }

  _marketStalls(x, z) {
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.08, 2.5),
      surf({ color: 0xff6b35 })
    );
    awning.position.set(x, 2.4, z);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6),
      surf({ color: 0x4a4a4a })
    );
    pole.position.set(x - 1.5, 1.2, z);
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.9, 1.2),
      surf({ color: 0x5a4030 })
    );
    counter.position.set(x, 0.45, z);
    this.scene.add(awning, pole, counter);
  }

  _landmarks() {
    this._gatewayOfIndia(-6, -30);
    this._cstStation(20, 24);
    this._templeShikhara(0, 24);
    this._flyover(-15, -5);
    this._localTrain(25, 14);
  }

  _gatewayOfIndia(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const stone = matFromTexture(concreteTexture('#c9b89a'), { repeat: [2, 4] });

    const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 4), stone);
    base.position.y = 0.75;
    group.add(base);

    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.45, 12, 32, Math.PI), stone);
    arch.position.set(0, 4.5, 0);
    arch.rotation.y = Math.PI / 2;
    group.add(arch);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      surf({ color: 0xf4c430, roughness: 0.45 })
    );
    dome.position.set(0, 6.8, 0);
    group.add(dome);

    const min1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 7, 8), stone);
    min1.position.set(-2.8, 3.5, 0);
    const min2 = min1.clone();
    min2.position.x = 2.8;
    group.add(min1, min2);
    this.scene.add(group);
    this.colliders.push({ x, z, hw: 5, hd: 3 });
  }

  _cstStation(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const gothic = matFromTexture(concreteTexture('#8a7a6a'), { repeat: [4, 2] });
    const facade = new THREE.Mesh(new THREE.BoxGeometry(22, 12, 6), gothic);
    facade.position.y = 6;
    facade.castShadow = true;
    group.add(facade);

    for (let i = -4; i <= 4; i++) {
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 3.5, 6),
        surf({ color: 0x6a5a4a })
      );
      spire.position.set(i * 2.2, 13.5, 2);
      group.add(spire);
    }

    const clock = new THREE.Mesh(
      new THREE.CircleGeometry(1.2, 24),
      surf({ color: 0xf4c430, emissive: 0xf4c430, emissiveIntensity: 0.2 })
    );
    clock.position.set(0, 9, 3.05);
    group.add(clock);

    const sign = this._signMesh('सीएसटी', 'CST RUINS', 0x48dbfb);
    sign.position.set(0, 14, 3.2);
    sign.scale.set(1.4, 1, 1);
    group.add(sign);

    this.scene.add(group);
    this.colliders.push({ x, z, hw: 12, hd: 4 });
  }

  _templeShikhara(x, z) {
    const tiers = [3.5, 2.8, 2, 1.2];
    let y = 0;
    tiers.forEach((r, i) => {
      const dome = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r + 0.4, 1.8, 8),
        surf({ color: i === 0 ? 0xf4c430 : 0xd4a030 - i * 0x101010, roughness: 0.5 })
      );
      dome.position.set(x, y + 0.9, z);
      this.scene.add(dome);
      y += 1.6;
    });
    const kalash = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      surf({ color: 0xffd700, metalness: 0.6, roughness: 0.3 })
    );
    kalash.position.set(x, y + 0.5, z);
    this.scene.add(kalash);
  }

  _flyover(x, z) {
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(50, 0.6, 5),
      matFromTexture(concreteTexture('#909090'), { repeat: [10, 1] })
    );
    deck.position.set(x, 6, z);
    deck.rotation.y = 0.15;
    deck.castShadow = true;
    this.scene.add(deck);

    for (let i = 0; i < 6; i++) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.65, 6, 8),
        surf({ color: 0x707070 })
      );
      pillar.position.set(-20 + i * 8, 3, z + i * 0.3);
      this.scene.add(pillar);
      this.colliders.push({ x: pillar.position.x, z: pillar.position.z, hw: 1.5, hd: 1.5 });
    }
  }

  _localTrain(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const purple = surf({ color: 0x6a0dad, roughness: 0.5 });
    for (let c = 0; c < 3; c++) {
      const coach = new THREE.Mesh(new THREE.BoxGeometry(4, 2.8, 2.4), purple);
      coach.position.set(c * 4.2, 1.6, 0);
      coach.castShadow = true;
      group.add(coach);
      const windowRow = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.8, 0.05),
        surf({ color: 0x87ceeb, emissive: 0x4488aa, emissiveIntensity: 0.15 })
      );
      windowRow.position.set(c * 4.2, 2, 1.22);
      group.add(windowRow);
    }
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.15, 0.3),
      surf({ color: 0x4a4a4a, metalness: 0.8 })
    );
    track.position.set(4, 0.08, 0);
    group.add(track);
    this.scene.add(group);
    this.colliders.push({ x: x + 4, z, hw: 8, hd: 2 });
  }

  _streetNetwork() {
    const asphalt = matFromTexture(asphaltTexture(), { repeat: [4, 12] });
    const roads = [
      [0, 5, 12, 90, 0],
      [5, 0, 90, 12, 0],
      [-20, 12, 10, 50, 0.1],
      [15, -18, 50, 10, 0],
    ];
    roads.forEach(([x, z, w, d, rot]) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), asphalt);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = rot;
      road.position.set(x, 0.02, z);
      road.receiveShadow = true;
      this.scene.add(road);
    });
  }

  _overheadDetails() {
    for (let i = 0; i < 20; i++) {
      const x1 = -30 + Math.random() * 60;
      const z1 = -10 + Math.random() * 40;
      const x2 = x1 + (Math.random() - 0.5) * 15;
      const z2 = z1 + (Math.random() - 0.5) * 10;
      const wire = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, 5 + Math.random() * 3, z1),
          new THREE.Vector3(x2, 4 + Math.random() * 2, z2),
        ]),
        new THREE.LineBasicMaterial({ color: 0x222222 })
      );
      this.scene.add(wire);
    }
  }

  _clothesLine(x, z, span) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x - span / 2, 5, z),
        new THREE.Vector3(x + span / 2, 5, z),
      ]),
      new THREE.LineBasicMaterial({ color: 0xcccccc })
    );
    this.scene.add(line);
    const colors = [0xff6b6b, 0x48dbfb, 0xfeca57, 0xff9ff3, 0xffffff];
    for (let i = 0; i < 5; i++) {
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8 + Math.random() * 0.5, 1 + Math.random()),
        surf({ color: colors[i % colors.length], side: THREE.DoubleSide })
      );
      cloth.position.set(x - span / 2 + i * (span / 5), 4.5 - Math.random() * 0.3, z);
      this.scene.add(cloth);
    }
  }

  _palmTree(x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.28, 5, 8),
      surf({ color: 0x6a5030 })
    );
    trunk.position.set(x, 2.5, z);
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    this.scene.add(trunk);

    for (let f = 0; f < 7; f++) {
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 3.5, 4),
        surf({ color: 0x2d6a30 })
      );
      leaf.position.set(x, 5.2, z);
      leaf.rotation.x = 1.2;
      leaf.rotation.y = (f / 7) * Math.PI * 2;
      this.scene.add(leaf);
    }
  }

  _signMesh(main, sub, color) {
    const tex = signageTexture(main, sub, `#${color.toString(16).padStart(6, '0')}`);
    const mat = IS_MOBILE
      ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          map: tex,
          emissive: color,
          emissiveIntensity: 0.35,
          transparent: true,
          side: THREE.DoubleSide,
        });
    return new THREE.Mesh(new THREE.PlaneGeometry(4, 1.1), mat);
  }

  _detailedRickshaw(x, z, rot = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    const metal = surf({ color: 0x2ecc71, roughness: 0.45 });
    const yellow = surf({ color: 0xf1c40f });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 2.2), metal);
    body.position.y = 0.65;
    g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 2.1), yellow);
    roof.position.y = 1.15;
    g.add(roof);
    const wheelMat = surf({ color: 0x111111 });
    [[-0.7, 0.3], [0.7, 0.3], [0, -0.9]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.32, wz);
      g.add(wheel);
    });
    this.scene.add(g);
  }

  _kaaliPeeliTaxi(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.1, 4.2),
      surf({ color: 0x1a1a1a })
    );
    body.position.y = 0.7;
    g.add(body);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.02, 0.25, 4.22),
      surf({ color: 0xf4c430 })
    );
    stripe.position.y = 0.55;
    g.add(stripe);
    this.scene.add(g);
  }

  _interactables() {
    const npcConfigs = {
      'chai-wallah': { skin: 2, shirt: '#ffffff', pants: '#2c3e50', style: 'wanderer' },
      engineer: { skin: 3, shirt: '#48dbfb', pants: '#2d3436', style: 'scavenger' },
      vendor: { skin: 2, shirt: '#e056fd', pants: '#6c3483', style: 'wanderer' },
    };

    for (const data of INTERACTABLES) {
      const group = new THREE.Group();
      group.position.set(data.position[0], data.position[1], data.position[2]);
      group.userData.interactable = data;

      if (data.type === 'npc') {
        const cfg = npcConfigs[data.id] || { skin: 2, shirt: '#e8841a', pants: '#2d3a4a', style: 'wanderer' };
        const npc = createCharacter(cfg);
        group.add(npc);
        this.npcs.push(npc);
      } else if (data.type === 'vehicle') {
        const g = new THREE.Group();
        const metal = surf({ color: 0x2ecc71, roughness: 0.45 });
        const yellow = surf({ color: 0xf1c40f });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 2.2), metal);
        body.position.y = 0.65;
        g.add(body);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 2.1), yellow);
        roof.position.y = 1.15;
        g.add(roof);
        [[-0.7, 0.3], [0.7, 0.3], [0, -0.9]].forEach(([wx, wz]) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16), surf({ color: 0x111111 }));
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.32, wz);
          g.add(wheel);
        });
        group.add(g);
      } else if (data.id === 'metro') {
        const entrance = new THREE.Mesh(
          new THREE.BoxGeometry(4, 0.5, 6),
          matFromTexture(concreteTexture('#707880'), { repeat: [2, 1] })
        );
        entrance.position.y = 0.25;
        group.add(entrance);
        const stairs = new THREE.Mesh(
          new THREE.BoxGeometry(3, 2, 4),
          surf({ color: 0x3a3a40 })
        );
        stairs.position.set(0, -0.5, 1);
        group.add(stairs);
        const water = new THREE.Mesh(
          new THREE.PlaneGeometry(3, 3),
          surf({ color: 0x1a5a6a, transparent: true, opacity: 0.8, metalness: 0.4 })
        );
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 0.1, 2);
        group.add(water);
      } else if (data.id === 'shrine') {
        const plinth = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.8, 0.6, 8),
          surf({ color: 0xc9a87c })
        );
        plinth.position.y = 0.3;
        group.add(plinth);
        const idol = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1.2, 0.6),
          surf({ color: 0xf4c430, emissive: 0xf4c430, emissiveIntensity: 0.15 })
        );
        idol.position.y = 1.2;
        group.add(idol);
      } else if (data.id === 'tiger-mural') {
        const muralTex = signageTexture('TIGER', 'CORRIDOR', '#e67e22');
        const muralMat = IS_MOBILE
          ? new THREE.MeshBasicMaterial({ map: muralTex })
          : new THREE.MeshStandardMaterial({ map: muralTex, emissive: 0xe67e22, emissiveIntensity: 0.2 });
        const mural = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), muralMat);
        mural.position.set(0, 2.5, 0);
        group.add(mural);
      } else {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.5, 4, 8),
          surf({ color: data.color, emissive: data.color, emissiveIntensity: 0.12 })
        );
        pillar.position.y = 2;
        group.add(pillar);
      }

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.15, 32),
        new THREE.MeshBasicMaterial({ color: 0xf4c430, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06;
      ring.visible = false;
      ring.name = 'highlight';
      group.add(ring);

      this.scene.add(group);
      this.interactables.push(group);
    }

    this._detailedRickshaw(18, 2, 0.5);
    this._kaaliPeeliTaxi(-10, -12);
    this._kaaliPeeliTaxi(6, 8);
  }

  _atmosphere() {
    const rainCount = IS_MOBILE ? 120 : 300;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 30 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rain = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xaaccff, size: 0.08, transparent: true, opacity: 0.35 })
    );
    this.scene.add(this.rain);
  }

  update(dt) {
    if (this.rain) {
      const pos = this.rain.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] -= dt * 12;
        if (pos.array[i * 3 + 1] < 0) pos.array[i * 3 + 1] = 20 + Math.random() * 10;
      }
      pos.needsUpdate = true;
    }
    for (const w of this.waterMeshes) {
      w.position.y = -0.1 + Math.sin(Date.now() * 0.0008) * 0.08;
    }
  }

  checkCollision(x, z, radius = 0.35) {
    if (z < -34) return true;
    for (const c of this.colliders) {
      if (Math.abs(x - c.x) < c.hw + radius && Math.abs(z - c.z) < c.hd + radius) return true;
    }
    return false;
  }
}
