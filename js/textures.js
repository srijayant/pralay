import * as THREE from 'three';
import { IS_MOBILE, surf } from './materials.js';

export function makeCanvasTexture(drawFn, w = 512, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawFn(canvas.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function asphaltTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8000; i++) {
      const g = 35 + Math.random() * 25;
      ctx.fillStyle = `rgb(${g},${g},${g + 5})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
    }
    ctx.strokeStyle = 'rgba(80,80,90,0.15)';
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.05) * 2);
      ctx.stroke();
    }
  }, 512, 512);
}

export function wetAsphaltTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3a3a45');
    grad.addColorStop(1, '#252530');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(180,200,220,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 4 + Math.random() * 12, 1 + Math.random() * 3);
    }
  }, 512, 512);
}

export function concreteTexture(base = '#b8a898') {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const v = Math.random() * 30 - 15;
      const r = parseInt(base.slice(1, 3), 16) + v;
      const g = parseInt(base.slice(3, 5), 16) + v;
      const b = parseInt(base.slice(5, 7), 16) + v;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, 256, 256);
}

export function artDecoFacadeTexture(seed = 0) {
  return makeCanvasTexture((ctx, w, h) => {
    const colors = ['#d4b896', '#c9a87c', '#e8d0b0', '#b89b7a', '#a08060'];
    ctx.fillStyle = colors[seed % colors.length];
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(60,45,35,0.35)';
    ctx.lineWidth = 2;
    for (let y = 40; y < h; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y + 8);
      ctx.lineTo(w, y + 8);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 64) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + 8, 16, 40, h - 32);
    }
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        if ((row + col + seed) % 4 === 0) continue;
        const lit = (row + seed) % 3 === 0;
        ctx.fillStyle = lit ? '#ffe8a0' : '#1a2535';
        ctx.fillRect(16 + col * 80, 24 + row * 58, 28, 38);
      }
    }
  }, 512, 512);
}

export function brickChawlTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(0, 0, w, h);
    const bw = 48;
    const bh = 20;
    for (let row = 0; row < h / bh; row++) {
      const off = (row % 2) * (bw / 2);
      for (let col = -1; col < w / bw + 1; col++) {
        const shade = 120 + Math.random() * 40;
        ctx.fillStyle = `rgb(${shade},${shade * 0.55},${shade * 0.35})`;
        ctx.fillRect(col * bw + off, row * bh, bw - 3, bh - 3);
      }
    }
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = (row + col) % 2 ? '#1a2030' : '#253040';
        ctx.fillRect(20 + col * 110, 20 + row * 78, 36, 52);
      }
    }
  }, 512, 512);
}

export function signageTexture(text, subtext = '', color = '#ff4757') {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = 'rgba(10,10,20,0.85)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = color;
    ctx.font = 'bold 42px Noto Sans Devanagari, Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, h * 0.45);
    if (subtext) {
      ctx.font = '24px Rajdhani, sans-serif';
      ctx.fillStyle = '#ffeaa7';
      ctx.fillText(subtext, w / 2, h * 0.75);
    }
  }, 512, 128);
}

export function matFromTexture(tex, { roughness = 0.85, metalness = 0.05, repeat = [1, 1], emissive = null, fallback = 0x908070 } = {}) {
  if (IS_MOBILE) return surf(fallback);
  tex.repeat.set(repeat[0], repeat[1]);
  const opts = { map: tex, roughness, metalness };
  if (emissive) {
    opts.emissive = new THREE.Color(emissive);
    opts.emissiveIntensity = 0.15;
  }
  return new THREE.MeshStandardMaterial(opts);
}
