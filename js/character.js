import * as THREE from 'three';
import { IS_MOBILE, surf } from './materials.js';

export const SKIN_TONES = ['#3d2314', '#6b4423', '#a67c52', '#d4a574', '#f0d5b8'];

function capsule(radius, length, material) {
  const geo = new THREE.CapsuleGeometry(radius, length, 6, 12);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = !IS_MOBILE;
  return mesh;
}

function buildProceduralHuman(config) {
  const group = new THREE.Group();
  const skin = new THREE.Color(SKIN_TONES[config.skin] ?? SKIN_TONES[2]);
  const shirt = new THREE.Color(config.shirt);
  const pants = new THREE.Color(config.pants);

  const skinMat = surf(skin);
  const shirtMat = surf(shirt);
  const pantsMat = surf(pants);
  const hairMat = surf(0x120c08);
  const shoeMat = surf(0x1a1410);

  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  group.add(pelvis);

  const torso = capsule(0.2, 0.42, shirtMat);
  torso.position.y = 0.35;
  pelvis.add(torso);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), shirtMat);
  chest.scale.set(1.1, 0.85, 0.65);
  chest.position.y = 0.62;
  pelvis.add(chest);

  const neck = capsule(0.07, 0.08, skinMat);
  neck.position.y = 0.88;
  pelvis.add(neck);

  const head = new THREE.Group();
  head.position.y = 1.02;
  pelvis.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), skinMat);
  skull.scale.set(0.95, 1.05, 0.92);
  head.add(skull);

  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), skinMat);
  jaw.scale.set(1.1, 0.7, 0.85);
  jaw.position.set(0, -0.06, 0.02);
  head.add(jaw);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
    hairMat
  );
  hair.position.y = 0.04;
  hair.rotation.x = -0.15;
  head.add(hair);

  const makeLimb = (mat, x, y, upperLen, lowerLen) => {
    const limb = new THREE.Group();
    limb.position.set(x, y, 0);
    const upper = capsule(0.075, upperLen, mat);
    upper.position.y = -upperLen / 2;
    const lower = capsule(0.065, lowerLen, mat);
    lower.position.y = -upperLen - lowerLen / 2;
    limb.add(upper, lower);
    return limb;
  };

  const leftArm = makeLimb(shirtMat, -0.34, 0.62, 0.28, 0.26);
  const rightArm = makeLimb(shirtMat, 0.34, 0.62, 0.28, 0.26);
  const leftLeg = makeLimb(pantsMat, -0.13, 0, 0.42, 0.4);
  const rightLeg = makeLimb(pantsMat, 0.13, 0, 0.42, 0.4);
  pelvis.add(leftArm, rightArm, leftLeg, rightLeg);

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.24), shoeMat);
  leftFoot.position.set(-0.13, 0.035, 0.04);
  const rightFoot = leftFoot.clone();
  rightFoot.position.x = 0.13;
  group.add(leftFoot, rightFoot);

  if (config.style === 'monk') {
    const robe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.38, 1.15, 12),
      surf(0xf4c430)
    );
    robe.position.y = 0.55;
    group.add(robe);
  } else if (config.style === 'scavenger') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.5, 0.28), surf(0x4a3728));
    vest.position.y = 1.2;
    group.add(vest);
  }

  group.userData.rig = 'procedural';
  group.userData.limbs = { leftLeg, rightLeg, leftArm, rightArm };
  return group;
}

export function createCharacter(config) {
  return buildProceduralHuman(config);
}

export function updateCharacterAnim(character, dt, speed) {
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
