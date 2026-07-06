import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = 'https://threejs.org/examples/models/gltf/Xbot.glb';

export const SKIN_TONES = ['#3d2314', '#6b4423', '#a67c52', '#d4a574', '#f0d5b8'];

const loader = new GLTFLoader();
let cachedModel = null;

async function loadRiggedModel() {
  if (cachedModel) return cachedModel;
  const gltf = await loader.loadAsync(MODEL_URL);
  cachedModel = gltf;
  return gltf;
}

function capsule(radius, length, material, axis = 'y') {
  const geo = new THREE.CapsuleGeometry(radius, length, 8, 16);
  if (axis === 'x') geo.rotateZ(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  return mesh;
}

function buildProceduralHuman(config) {
  const group = new THREE.Group();
  const skin = new THREE.Color(SKIN_TONES[config.skin] ?? SKIN_TONES[2]);
  const shirt = new THREE.Color(config.shirt);
  const pants = new THREE.Color(config.pants);

  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.55, metalness: 0.02 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.65 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.7 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x120c08, roughness: 0.95 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.8 });

  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  group.add(pelvis);

  const torso = capsule(0.2, 0.42, shirtMat);
  torso.position.y = 0.35;
  pelvis.add(torso);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), shirtMat);
  chest.scale.set(1.1, 0.85, 0.65);
  chest.position.y = 0.62;
  chest.castShadow = true;
  pelvis.add(chest);

  const neck = capsule(0.07, 0.08, skinMat);
  neck.position.y = 0.88;
  pelvis.add(neck);

  const head = new THREE.Group();
  head.position.y = 1.02;
  pelvis.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20), skinMat);
  skull.scale.set(0.95, 1.05, 0.92);
  skull.castShadow = true;
  head.add(skull);

  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  jaw.scale.set(1.1, 0.7, 0.85);
  jaw.position.set(0, -0.06, 0.02);
  head.add(jaw);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.155, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65), hairMat);
  hair.position.y = 0.04;
  hair.rotation.x = -0.15;
  head.add(hair);

  const makeLimb = (mat, x, y, upperLen, lowerLen) => {
    const limb = new THREE.Group();
    limb.position.set(x, y, 0);
    const upper = capsule(0.075, upperLen, mat, 'y');
    upper.position.y = -upperLen / 2;
    const lower = capsule(0.065, lowerLen, mat, 'y');
    lower.position.y = -upperLen - lowerLen / 2;
    limb.add(upper, lower);
    limb.userData.lower = lower;
    return limb;
  };

  const leftArm = makeLimb(shirtMat, -0.34, 0.62, 0.28, 0.26);
  const rightArm = makeLimb(shirtMat, 0.34, 0.62, 0.28, 0.26);
  pelvis.add(leftArm, rightArm);

  const leftLeg = makeLimb(pantsMat, -0.13, 0, 0.42, 0.4);
  const rightLeg = makeLimb(pantsMat, 0.13, 0, 0.42, 0.4);
  pelvis.add(leftLeg, rightLeg);

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.24), shoeMat);
  leftFoot.position.set(-0.13, 0.035, 0.04);
  leftFoot.castShadow = true;
  const rightFoot = leftFoot.clone();
  rightFoot.position.x = 0.13;
  group.add(leftFoot, rightFoot);

  if (config.style === 'monk') {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.15, 16), new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.8 }));
    robe.position.y = 0.55;
    group.add(robe);
  } else if (config.style === 'scavenger') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.5, 0.28), new THREE.MeshStandardMaterial({ color: 0x4a3728 }));
    vest.position.y = 1.2;
    group.add(vest);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x2c3e50 }));
    cap.position.y = 1.72;
    group.add(cap);
  }

  group.userData.rig = 'procedural';
  group.userData.limbs = { leftLeg, rightLeg, leftArm, rightArm, pelvis };
  group.scale.setScalar(0.95 + (config.skin % 3) * 0.03);
  return group;
}

function tintSkinnedMesh(root, config) {
  const skin = new THREE.Color(SKIN_TONES[config.skin] ?? SKIN_TONES[2]);
  const shirt = new THREE.Color(config.shirt);
  root.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((m) => {
      const clone = m.clone();
      if (child.name.toLowerCase().includes('body') || child.name.toLowerCase().includes('head')) {
        clone.color.lerp(skin, 0.55);
      } else {
        clone.color.lerp(shirt, 0.35);
      }
      clone.roughness = 0.6;
      child.material = clone;
    });
  });
}

export async function createCharacter(config) {
  try {
    const gltf = await loadRiggedModel();
    const root = gltf.scene.clone(true);
    tintSkinnedMesh(root, config);
    root.scale.setScalar(0.85 + (config.skin % 3) * 0.04);
    root.rotation.y = Math.PI;
    const box = new THREE.Box3().setFromObject(root);
    root.position.y = -box.min.y;
    root.userData.rig = 'gltf';
    root.userData.mixer = new THREE.AnimationMixer(root);
    const idle = gltf.animations.find((a) => a.name.toLowerCase().includes('idle')) || gltf.animations[0];
    const walk = gltf.animations.find((a) => a.name.toLowerCase().includes('walk')) || gltf.animations[1];
    if (idle) root.userData.idleAction = root.userData.mixer.clipAction(idle);
    if (walk) root.userData.walkAction = root.userData.mixer.clipAction(walk);
    if (root.userData.idleAction) {
      root.userData.idleAction.play();
      root.userData.activeAction = root.userData.idleAction;
    }
    return root;
  } catch {
    return buildProceduralHuman(config);
  }
}

export function updateCharacterAnim(character, dt, speed) {
  if (character.userData.rig === 'gltf' && character.userData.mixer) {
    const { mixer, idleAction, walkAction, activeAction } = character.userData;
    const target = speed > 0.5 && walkAction ? walkAction : idleAction;
    if (target && target !== activeAction) {
      if (activeAction) activeAction.fadeOut(0.2);
      target.reset().fadeIn(0.2).play();
      character.userData.activeAction = target;
    }
    mixer.update(dt);
    return;
  }

  const { leftLeg, rightLeg, leftArm, rightArm } = character.userData.limbs || {};
  if (!leftLeg) return;
  if (speed < 0.5) {
    [leftLeg, rightLeg, leftArm, rightArm].forEach((l) => { l.rotation.x = 0; });
    return;
  }
  const t = performance.now() * 0.012;
  const swing = Math.sin(t) * 0.65;
  leftLeg.rotation.x = swing;
  rightLeg.rotation.x = -swing;
  leftArm.rotation.x = -swing * 0.55;
  rightArm.rotation.x = swing * 0.55;
}

export function readAvatarForm() {
  return {
    name: document.getElementById('avatar-name')?.value?.trim() || 'Survivor',
    skin: Number(document.getElementById('avatar-skin')?.value || 2),
    shirt: document.getElementById('avatar-shirt')?.value || '#e8841a',
    pants: document.getElementById('avatar-pants')?.value || '#2d3a4a',
    style: document.getElementById('avatar-style')?.value || 'wanderer',
  };
}

// Backward compat exports
export const buildAvatarMesh = buildProceduralHuman;
export function animateAvatarWalk(avatar, time, speed) {
  updateCharacterAnim(avatar, 0.016, speed);
}
