import * as THREE from 'three';

export const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/** Mobile-safe surface material (Lambert). Desktop uses Standard PBR. */
export function surf(color, opts = {}) {
  if (IS_MOBILE) {
    return new THREE.MeshLambertMaterial({ color, ...opts });
  }
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0.05,
    ...opts,
  });
}

/** Skip canvas textures on mobile — they can fail on iOS WebGL. */
export function surfTex(tex, fallbackColor, opts = {}) {
  if (IS_MOBILE) {
    return new THREE.MeshLambertMaterial({ color: fallbackColor, ...opts });
  }
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.75,
    metalness: 0.05,
    ...opts,
  });
}

export function emissiveSurf(color, intensity = 0.3) {
  if (IS_MOBILE) {
    return new THREE.MeshBasicMaterial({ color });
  }
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
  });
}
