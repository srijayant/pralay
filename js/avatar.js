import * as THREE from 'three';

export const SKIN_TONES = ['#3d2314', '#6b4423', '#a67c52', '#d4a574', '#f0d5b8'];

export function buildAvatarMesh(config) {
  const group = new THREE.Group();
  const skin = new THREE.Color(SKIN_TONES[config.skin] || SKIN_TONES[2]);
  const shirt = new THREE.Color(config.shirt);
  const pants = new THREE.Color(config.pants);

  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.7 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.9 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.32), shirtMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);

  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.3), pantsMat);
  hips.position.y = 0.65;
  hips.castShadow = true;
  group.add(hips);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), skinMat);
  head.position.y = 1.72;
  head.castShadow = true;
  group.add(head);

  const legGeo = new THREE.BoxGeometry(0.18, 0.55, 0.2);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.14, 0.28, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.14, 0.28, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  const armGeo = new THREE.BoxGeometry(0.16, 0.5, 0.18);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.38, 1.15, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.38, 1.15, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  if (config.style === 'monk') {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.1, 8), shirtMat);
    robe.position.y = 0.95;
    group.add(robe);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), shirtMat);
    hood.position.y = 1.75;
    group.add(hood);
  } else if (config.style === 'scavenger') {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.25), new THREE.MeshStandardMaterial({ color: 0x4a3728 }));
    pack.position.set(0, 1.2, -0.28);
    group.add(pack);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.35), hairMat);
    cap.position.y = 1.88;
    group.add(cap);
  } else {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI * 2), hairMat);
    hair.position.y = 1.78;
    hair.scale.set(1, 0.65, 1);
    group.add(hair);
  }

  group.userData.limbs = { leftLeg, rightLeg, leftArm, rightArm };
  return group;
}

export function animateAvatarWalk(avatar, time, speed) {
  const limbs = avatar.userData.limbs;
  if (!limbs || speed < 0.5) {
    if (limbs) {
      limbs.leftLeg.rotation.x = 0;
      limbs.rightLeg.rotation.x = 0;
      limbs.leftArm.rotation.x = 0;
      limbs.rightArm.rotation.x = 0;
    }
    return;
  }
  const swing = Math.sin(time * 12) * 0.55;
  limbs.leftLeg.rotation.x = swing;
  limbs.rightLeg.rotation.x = -swing;
  limbs.leftArm.rotation.x = -swing * 0.6;
  limbs.rightArm.rotation.x = swing * 0.6;
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
